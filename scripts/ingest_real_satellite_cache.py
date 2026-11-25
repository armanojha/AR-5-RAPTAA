from __future__ import annotations

import json
import math
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np

from drishti.layers.live_ingestion import (
    EARTH_SEARCH_STAC,
    PC_STAC,
    configure_gdal_http,
    fetch_context_layers,
    fetch_real_rainfall_window,
    fetch_sentinel1_rtc_window,
    fetch_sentinel2_window,
    get_pc_sas_token,
    stac_search_post,
)
from drishti.layers.raster import (
    compute_segment_stats,
    compute_spectral_indices,
    create_corridor_geotiff,
    export_image_chip,
)

BASE_DIR = Path(__file__).resolve().parents[1]
CACHE_DIR = BASE_DIR / "data" / "real_cache"
OSM_DIR = CACHE_DIR / "osm"


def _dist_km(p1: list[float], p2: list[float]) -> float:
    dx = (p2[0] - p1[0]) * 111.32 * math.cos(math.radians((p1[1] + p2[1]) / 2))
    dy = (p2[1] - p1[1]) * 110.57
    return math.hypot(dx, dy)


def _slice_linestring_km(coords: list[list[float]], max_km: float) -> list[list[float]]:
    if not coords:
        return []
    out = [coords[0]]
    acc = 0.0
    for pt in coords[1:]:
        d = _dist_km(out[-1], pt)
        if acc + d > max_km and len(out) >= 2:
            break
        out.append(pt)
        acc += d
    return out


def prepare_corridor_alignments() -> dict[str, dict[str, Any]]:
    corridors: dict[str, dict[str, Any]] = {}

    # 1. NH-544G Package 1 (from OSM way 1340599762, Kodur start ~20km stretch)
    nh_raw = json.loads((OSM_DIR / "nh544g_pkg1_raw.json").read_text(encoding="utf-8"))
    nh_coords = nh_raw["ways"][0]["coords"]
    nh_slice = _slice_linestring_km(nh_coords, 20.0)
    corridors["NHAI-NH544G-PKG1"] = {
        "project_id": "NHAI-NH544G-PKG1",
        "name": "Bengaluru-Vijayawada Economic Corridor (NH-544G) Package 1",
        "sector": "highway",
        "ministry": "MoRTH / NHAI",
        "sanctioned_cost_inr": 5995000000.0,
        "latest_cost_inr": 6724800000.0,
        "start_date": "2023-02-15",
        "planned_end_date": "2025-03-14",
        "revised_end_date": "2026-02-28",
        "reported_progress_pct": 48.0,
        "spend_to_date_inr": 3800000000.0,
        "official_delay_date": "2024-11-20",
        "source_url": "https://sansad.in/getFile/loksabhaquestions/annex/18/AU1285.pdf",
        "coords": nh_slice,
        "tunnel_points": [],
        "epochs": [
            ("2023-01-01", "2023-03-15", True),
            ("2023-10-01", "2023-12-15", False),
            ("2024-01-15", "2024-03-15", False),
            ("2024-06-15", "2024-08-30", False),
            ("2025-01-01", "2025-03-15", False),
        ],
    }

    # 2. Rishikesh-Karnaprayag Rail Line (surface + tunnel ways from OSM)
    rk_raw = json.loads((OSM_DIR / "rishikesh_karnaprayag_raw.json").read_text(encoding="utf-8"))
    # Pick a clean 14 km section containing surface + tunnel segments (around Devprayag-Srinagar: 825078072 + 825078070 + 825078071 + 630600220)
    target_ids = [825078072, 825078070, 825078071, 630600220]
    by_id = {w["id"]: w for w in rk_raw["ways"]}
    rk_coords: list[list[float]] = []
    tunnel_pts: list[list[float]] = []
    for wid in target_ids:
        w = by_id.get(wid)
        if not w:
            continue
        c = w["coords"]
        if w["tags"].get("tunnel") == "yes" or "tunnel" in str(w["tags"].get("name", "")).lower():
            tunnel_pts.extend(c)
        rk_coords.extend(c if not rk_coords else c[1:])
    if len(rk_coords) < 2:
        rk_coords = rk_raw["ways"][0]["coords"]
    rk_slice = _slice_linestring_km(rk_coords, 12.0)
    corridors["RVNL-RK-RAIL"] = {
        "project_id": "RVNL-RK-RAIL",
        "name": "Rishikesh-Karnaprayag New Broad Gauge Rail Line (Devprayag-Srinagar)",
        "sector": "railway",
        "ministry": "Ministry of Railways / RVNL",
        "sanctioned_cost_inr": 162160000000.0,
        "latest_cost_inr": 371190000000.0,
        "start_date": "2020-01-15",
        "planned_end_date": "2024-12-31",
        "revised_end_date": "2029-12-31",
        "reported_progress_pct": 79.0,
        "spend_to_date_inr": 265000000000.0,
        "official_delay_date": "2024-06-15",
        "source_url": "https://www.mospi.gov.in/flash-report-delayed-infrastructure-projects",
        "coords": rk_slice,
        "tunnel_points": tunnel_pts,
        "epochs": [
            ("2021-01-01", "2021-03-31", True),
            ("2023-02-01", "2023-04-30", False),
            ("2024-01-01", "2024-03-31", False),
            ("2024-07-01", "2024-09-30", False),
            ("2025-01-01", "2025-03-31", False),
        ],
    }

    # 3. Kacchi Dargah-Bidupur 6-Lane Ganga Bridge (OSM way 1322459525)
    kdb_raw = json.loads((OSM_DIR / "kacchi_dargah_osm06.json").read_text(encoding="utf-8"))
    kdb_way = max(kdb_raw["ways"], key=lambda w: len(w["coords"]) if "Kacchi" in str(w["tags"]) else 0)
    kdb_coords = kdb_way["coords"]
    corridors["BSRDC-KDB-BRIDGE"] = {
        "project_id": "BSRDC-KDB-BRIDGE",
        "name": "Kacchi Dargah-Bidupur 6-Lane Extradosed Ganga Bridge (Nitish Setu)",
        "sector": "bridge_elevated",
        "ministry": "MoRTH / BSRDC (ADB Co-financed)",
        "sanctioned_cost_inr": 49880000000.0,
        "latest_cost_inr": 49880000000.0,
        "start_date": "2017-07-01",
        "planned_end_date": "2021-12-31",
        "revised_end_date": "2025-12-31",
        "reported_progress_pct": 76.0,
        "spend_to_date_inr": 41000000000.0,
        "official_delay_date": "2023-12-01",
        "source_url": "https://www.adb.org/projects/48434-002/main",
        "coords": kdb_coords,
        "tunnel_points": [],
        "epochs": [
            ("2021-01-01", "2021-03-31", True),
            ("2023-01-15", "2023-03-31", False),
            ("2024-01-15", "2024-03-31", False),
            ("2024-07-15", "2024-09-30", False),
            ("2025-01-15", "2025-03-31", False),
        ],
    }

    return corridors


def _bbox_from_coords(coords: list[list[float]], pad: float = 0.008) -> tuple[float, float, float, float]:
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    # Keep focused ~7km max window for fast COG reads
    w, s, e, n = min(lons) - pad, min(lats) - pad, max(lons) + pad, max(lats) + pad
    if e - w > 0.07:
        mid_x = (w + e) / 2
        w, e = mid_x - 0.035, mid_x + 0.035
    if n - s > 0.07:
        mid_y = (s + n) / 2
        s, n = mid_y - 0.035, mid_y + 0.035
    return (round(w, 5), round(s, 5), round(e, 5), round(n, 5))


def ingest_corridor(pid: str, cfg: dict[str, Any]) -> dict[str, Any]:
    configure_gdal_http()
    c_dir = CACHE_DIR / pid
    c_dir.mkdir(parents=True, exist_ok=True)
    summary_file = c_dir / "ingested_summary.json"
    if summary_file.exists():
        print(f"[{pid}] already cached -> skipping live download")
        return json.loads(summary_file.read_text(encoding="utf-8"))

    coords = cfg["coords"]
    bbox = _bbox_from_coords(coords, pad=0.01)
    # Focused chip bbox around midpoint of corridor (~1.5km x 1.5km) for crisp chip visual
    mid = coords[len(coords) // 2]
    chip_bbox = (round(mid[0] - 0.008, 5), round(mid[1] - 0.008, 5), round(mid[0] + 0.008, 5), round(mid[1] + 0.008, 5))

    print(f"[{pid}] bbox={bbox}, chip_bbox={chip_bbox}")
    s1_token = get_pc_sas_token("sentinel-1-rtc")
    epoch_records: list[dict[str, Any]] = []
    target_shape: tuple[int, int] | None = None

    for start_d, end_d, is_base in cfg["epochs"]:
        t0 = time.time()
        dt_range = f"{start_d}T00:00:00Z/{end_d}T23:59:59Z"
        s2_items = stac_search_post(
            EARTH_SEARCH_STAC,
            collections=["sentinel-2-l2a"],
            bbox=list(bbox),
            datetime_range=dt_range,
            query={"eo:cloud_cover": {"lt": 35}},
            limit=5,
        )
        if not s2_items:
            # Relax cloud cover for monsoon epoch so SAR takes over cleanly
            s2_items = stac_search_post(
                EARTH_SEARCH_STAC,
                collections=["sentinel-2-l2a"],
                bbox=list(bbox),
                datetime_range=dt_range,
                limit=5,
            )
        # Pick lowest cloud scene
        s2_items.sort(key=lambda it: float(it["properties"].get("eo:cloud_cover") or 100.0))
        s2_item = s2_items[0]

        s1_items = stac_search_post(
            PC_STAC,
            collections=["sentinel-1-rtc"],
            bbox=list(bbox),
            datetime_range=dt_range,
            limit=3,
        )

        obs_date = str(s2_item["properties"].get("datetime"))[:10]
        tif_path = c_dir / f"{obs_date}_{s2_item['id']}.tif"
        if tif_path.exists():
            import rasterio
            with rasterio.open(tif_path) as src:
                bands = {
                    (src.descriptions[i - 1] if src.descriptions and src.descriptions[i - 1] else f"b{i}"): src.read(i)
                    for i in range(1, src.count + 1)
                }
            s2_data = {"datetime": s2_item["properties"].get("datetime"), "cloud_cover_pct": s2_item["properties"].get("eo:cloud_cover")}
            sar_data = {"vv": bands["vv"], "vh": bands["vh"]} if "vv" in bands and "vh" in bands else None
            s1_id = s1_items[0]["id"] if s1_items else None
            if target_shape is None:
                target_shape = bands["red"].shape
        else:
            # Download real Sentinel-2 window
            s2_data = fetch_sentinel2_window(s2_item, bbox)
            bands = s2_data["bands"]
            if target_shape is None:
                target_shape = bands["red"].shape

            # Download real Sentinel-1 RTC window (with Lee speckle filter)
            sar_data = None
            s1_id = None
            if s1_items:
                s1_data = fetch_sentinel1_rtc_window(s1_items[0], bbox, bands["red"].shape, s1_token)
                sar_data = {"vv": s1_data["vv_db"], "vh": s1_data["vh_db"]}
                s1_id = s1_data["scene_id"]
                bands["vv"] = s1_data["vv_db"]
                bands["vh"] = s1_data["vh_db"]

            # Save real clipped GeoTIFF
            create_corridor_geotiff(tif_path, bbox, bands, crs="EPSG:4326")

        # Export zoomed real chip directly from in-memory center crop (avoids redundant remote HTTP reads)
        h_b, w_b = bands["red"].shape
        cy, cx = h_b // 2, w_b // 2
        half = min(128, cy, cx)
        chip_bands = {k: v[cy - half : cy + half, cx - half : cx + half] for k, v in bands.items()}
        chip_dir = c_dir / "chips"
        chip_dir.mkdir(parents=True, exist_ok=True)
        chip_rgb = chip_dir / f"chip_{obs_date}_rgb.png"
        chip_fc = chip_dir / f"chip_{obs_date}_falsecolor.png"
        export_image_chip(chip_bands, chip_rgb, mode="true_color")
        export_image_chip(chip_bands, chip_fc, mode="false_color")

        # Compute spectral indices & stats
        idx = compute_spectral_indices(
            bands["blue"], bands["green"], bands["red"], bands["nir"], bands["swir16"], bands["scl"]
        )
        stats = compute_segment_stats(idx, sar_data=sar_data)

        # Fetch real rainfall window (15 days ending on obs_date)
        obs_dt = datetime.fromisoformat(obs_date)
        rain_start = (obs_dt - timedelta(days=14)).strftime("%Y-%m-%d")
        rain_info = fetch_real_rainfall_window(mid[1], mid[0], rain_start, obs_date)

        rec = {
            "epoch_start": start_d,
            "epoch_end": end_d,
            "is_baseline": is_base,
            "observed_date": obs_date,
            "optical_scene_id": s2_item["id"],
            "optical_stac_item": {
                "id": s2_item["id"],
                "collection": s2_item.get("collection", "sentinel-2-l2a"),
                "datetime": s2_data["datetime"],
                "cloud_cover_pct": s2_data["cloud_cover_pct"],
                "bbox": s2_item.get("bbox"),
            },
            "sar_scene_id": s1_id,
            "geotiff_path": str(tif_path.relative_to(BASE_DIR)),
            "chip_rgb_path": str(chip_rgb.relative_to(BASE_DIR)),
            "chip_falsecolor_path": str(chip_fc.relative_to(BASE_DIR)),
            "stats": stats,
            "rainfall": rain_info,
        }
        epoch_records.append(rec)
        print(f"  [{pid}] epoch {obs_date}: S2={s2_item['id']} (cloud={s2_data['cloud_cover_pct']}%) S1={s1_id} rain={rain_info['rainfall_mm']}mm ndvi={stats['ndvi_median']:.3f} bsi={stats['bsi_median']:.3f} ({time.time()-t0:.1f}s)")

    # Fetch WorldCover 10m, Copernicus DEM slope, and Landsat 2021 baseline
    print(f"[{pid}] fetching WorldCover 10m, Copernicus GLO-30 DEM, Landsat 2021 baseline...")
    ctx = fetch_context_layers(bbox, target_shape or (256, 256))
    # Persist context arrays if available (for Track C built-up masking)
    if "array" in ctx.get("worldcover", {}):
        wc_arr = ctx["worldcover"].pop("array")
        ctx["worldcover"].pop("built_up_mask", None)
        np.save(c_dir / "worldcover_10m.npy", wc_arr)

    summary = {
        "project": {k: v for k, v in cfg.items() if k != "epochs"},
        "bbox": list(bbox),
        "chip_bbox": list(chip_bbox),
        "context": ctx,
        "epochs": epoch_records,
    }
    summary_file.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def main() -> None:
    corridors = prepare_corridor_alignments()
    all_summaries = {}
    for pid, cfg in corridors.items():
        all_summaries[pid] = ingest_corridor(pid, cfg)
    (CACHE_DIR / "all_corridors_ingested.json").write_text(json.dumps(all_summaries, indent=2), encoding="utf-8")
    print("\nALL 3 REAL CORRIDORS INGESTED & CACHED SUCCESSFULLY!")


if __name__ == "__main__":
    main()
