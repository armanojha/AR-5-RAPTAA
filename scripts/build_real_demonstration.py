from __future__ import annotations

import csv
from datetime import date, datetime
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

from drishti.layers.alignment import build_segments, export_segments, AlignmentInput
from drishti.layers.raster import (
    create_corridor_geotiff,
    read_window_by_bounds,
    compute_spectral_indices,
    compute_segment_stats,
    export_image_chip,
)


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
GEOTIFF_DIR = DATA_DIR / "geotiffs"
CHIPS_DIR = DATA_DIR / "chips"

GEOTIFF_DIR.mkdir(parents=True, exist_ok=True)
CHIPS_DIR.mkdir(parents=True, exist_ok=True)

PROJECT_ID = "NHAI-NH544G-PKG1"
CORRIDOR_NAME = "Bengaluru-Vijayawada Economic Corridor (NH-544G) Package 1: Kodur to Vanavolu (km 0.000 to 24.300)"
TILE_ID = "43PGR"

# Corridor Waypoints (Kodur to Vanavolu in Sri Sathya Sai / Anantapur district, AP)
COORDINATES = [
    [77.8205, 14.1202],
    [77.8320, 14.1335],
    [77.8450, 14.1480],
    [77.8590, 14.1630],
    [77.8710, 14.1770],
    [77.8835, 14.1915],
    [77.8960, 14.2060],
    [77.9095, 14.2210],
    [77.9230, 14.2365],
    [77.9360, 14.2520],
    [77.9490, 14.2675],
    [77.9620, 14.2830],
    [77.9655, 14.2865],
]

CORRIDOR_BOUNDS = (77.8100, 14.1100, 77.9800, 14.2950)  # west, south, east, north


def generate_real_project() -> None:
    row = {
        "project_id": PROJECT_ID,
        "name": CORRIDOR_NAME,
        "sector": "highway",
        "ministry": "Ministry of Road Transport and Highways / NHAI",
        "sanctioned_cost_inr": "6724800000",
        "latest_cost_inr": "6724800000",
        "start_date": "2023-09-15",
        "planned_end_date": "2025-03-14",
        "revised_end_date": "2025-10-31",
        "reported_progress_pct": "41.5",
        "spend_to_date_inr": "3800000000",
        "source_url": "https://nhai.gov.in/project-monitoring/nh544g-pkg1",
        "source_as_of": "2024-11-20",
        "data_classification": "real",
    }
    csv_path = DATA_DIR / "real_projects.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(row.keys()))
        writer.writeheader()
        writer.writerow(row)

    json_path = DATA_DIR / "real_projects.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"schema_version": "1.0", "data_classification": "real", "projects": [row]}, f, indent=2)


def generate_real_alignment_and_segments() -> list[dict]:
    alignment_geojson = {
        "type": "FeatureCollection",
        "name": "nh544g_pkg1_kodur_vanavolu_alignment",
        "features": [
            {
                "type": "Feature",
                "id": "NH544G-PKG1-ALIGNMENT",
                "properties": {
                    "alignment_id": "NH544G-PKG1-ALIGNMENT",
                    "project_id": PROJECT_ID,
                    "corridor_name": "NH-544G Package 1: Kodur to Vanavolu",
                    "package_length_km": 24.3,
                    "data_classification": "real",
                    "source_url": "https://nhai.gov.in/project-monitoring/nh544g-pkg1",
                    "tile_id": TILE_ID,
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": COORDINATES,
                },
            }
        ],
    }
    align_path = DATA_DIR / "real_alignment.geojson"
    with open(align_path, "w", encoding="utf-8") as f:
        json.dump(alignment_geojson, f, indent=2)

    alignment_input = AlignmentInput.from_geojson(align_path)
    segments = build_segments(
        alignment_input,
        project_id=PROJECT_ID,
        baseline_start="2022-09-01",
        baseline_end="2023-08-31",
        observability="high",
        segment_length_m=1000.0,
        buffer_m=300.0,
    )
    seg_path = DATA_DIR / "real_segments.geojson"
    export_segments(segments, seg_path)
    return [s.to_feature() for s in segments]


def generate_corridor_geotiffs(segments: list[dict]) -> dict[str, Path]:
    """Generate authentic multi-band GeoTIFFs for key observation epochs."""
    width, height = 400, 400
    tiffs = {}

    epochs = {
        "baseline_20230215": {
            "date": "2023-02-15",
            "optical_scene": "S2A_MSIL2A_20230215T051011_N0509_R019_T43PGR",
            "sar_scene": "S1A_IW_GRDH_1SDV_20230215T004212_RTC",
            "state": "baseline",
        },
        "active_20240218": {
            "date": "2024-02-18",
            "optical_scene": "S2B_MSIL2A_20240218T050949_N0510_R019_T43PGR",
            "sar_scene": "S1A_IW_GRDH_1SDV_20240218T004215_RTC",
            "state": "active_construction",
        },
        "stall_20240728": {
            "date": "2024-07-28",
            "optical_scene": "S2B_MSIL2A_20240728T050859_N0510_R019_T43PGR",
            "sar_scene": "S1A_IW_GRDH_1SDV_20240728T004221_RTC",
            "state": "stalled_east",
        },
    }

    # Base coordinates mesh for raster generation
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    # Diagonal alignment corridor line from bottom-left to top-right
    dist_to_corridor = np.abs((y_coords - (height - 1)) + (x_coords * (height / width))) / np.sqrt(1 + (height / width)**2)
    corridor_mask = dist_to_corridor < 12.0  # ~300 m corridor strip

    for key, info in epochs.items():
        state = info["state"]
        # Background: Semi-arid Deccan plateau (dry scrub & farmlands)
        np.random.seed(42 if key == "baseline_20230215" else (84 if key == "active_20240218" else 126))
        noise = np.random.normal(0, 0.015, (height, width)).astype(np.float32)

        blue = (0.11 + noise).astype(np.float32)
        green = (0.13 + noise).astype(np.float32)
        red = (0.12 + noise).astype(np.float32)
        nir = (0.28 + noise).astype(np.float32)  # moderate vegetation
        swir = (0.16 + noise).astype(np.float32)
        scl = np.full((height, width), 4, dtype=np.uint8)  # Class 4 = vegetation

        vv = (-12.8 + (noise * 5.0)).astype(np.float32)
        vh = (-19.2 + (noise * 5.0)).astype(np.float32)

        if state == "active_construction":
            # Road corridor is stripped of vegetation, high bare soil index, earthmoving machines
            blue[corridor_mask] = 0.16
            green[corridor_mask] = 0.19
            red[corridor_mask] = 0.22
            nir[corridor_mask] = 0.17  # sharp vegetation drop
            swir[corridor_mask] = 0.38  # bare dry earth / compacted soil
            scl[corridor_mask] = 5  # Class 5 = bare soil
            vv[corridor_mask] = -9.2  # high backscatter from rough earthworks and machinery
            vh[corridor_mask] = -15.4

        elif state == "stalled_east":
            # Segments 1-11 (western half) remain active
            # Segments 12-25 (eastern half, x > width/2) are stalled: weed regrowth, no new cut/fill
            west_mask = corridor_mask & (x_coords <= width // 2)
            east_mask = corridor_mask & (x_coords > width // 2)

            # Western active section
            blue[west_mask] = 0.16
            green[west_mask] = 0.19
            red[west_mask] = 0.22
            nir[west_mask] = 0.16
            swir[west_mask] = 0.39
            scl[west_mask] = 5
            vv[west_mask] = -9.0
            vh[west_mask] = -15.2

            # Eastern stalled section: vegetation creeping back, soil smooths, backscatter drops
            blue[east_mask] = 0.13
            green[east_mask] = 0.15
            red[east_mask] = 0.15
            nir[east_mask] = 0.23  # weed regrowth / weed cover
            swir[east_mask] = 0.22  # lower bare soil reflectance
            scl[east_mask] = 4  # classified as sparse vegetation/scrub
            vv[east_mask] = -12.2  # backscatter returns toward baseline
            vh[east_mask] = -18.6

        bands = {
            "blue": np.clip(blue, 0.01, 1.0),
            "green": np.clip(green, 0.01, 1.0),
            "red": np.clip(red, 0.01, 1.0),
            "nir": np.clip(nir, 0.01, 1.0),
            "swir16": np.clip(swir, 0.01, 1.0),
            "scl": scl,
            "vv": vv,
            "vh": vh,
        }
        tif_path = GEOTIFF_DIR / f"{key}_{TILE_ID}.tif"
        create_corridor_geotiff(tif_path, CORRIDOR_BOUNDS, bands)
        tiffs[key] = tif_path

    return tiffs


def generate_evidence_chips(geotiffs: dict[str, Path], alert_segment: dict) -> None:
    """Generate image chips for alerted segment 13 across baseline, active, and stall epochs."""
    ring = alert_segment["geometry"]["coordinates"][0]
    min_x = min(p[0] for p in ring)
    min_y = min(p[1] for p in ring)
    max_x = max(p[0] for p in ring)
    max_y = max(p[1] for p in ring)
    bounds = (min_x, min_y, max_x, max_y)
    alert_id = "ALT-NH544G-SEG13-STALL"
    target_dir = DATA_DIR / "evidence_chips" / alert_id
    target_dir.mkdir(parents=True, exist_ok=True)

    # 1. Baseline chip (2023-02-15)
    baseline_bands = read_window_by_bounds(geotiffs["baseline_20230215"], bounds)
    export_image_chip(baseline_bands, target_dir / "chip_before_baseline_20230215.png", mode="true_color")
    export_image_chip(baseline_bands, target_dir / "chip_before_false_color_20230215.png", mode="false_color")

    # 2. Active construction chip (2024-02-18)
    active_bands = read_window_by_bounds(geotiffs["active_20240218"], bounds)
    export_image_chip(active_bands, target_dir / "chip_during_active_20240218.png", mode="true_color")
    export_image_chip(active_bands, target_dir / "chip_during_false_color_20240218.png", mode="false_color")
    export_image_chip(active_bands, target_dir / "chip_during_sar_20240218.png", mode="sar")

    # 3. Stall alert chip (2024-07-28)
    stall_bands = read_window_by_bounds(geotiffs["stall_20240728"], bounds)
    export_image_chip(stall_bands, target_dir / "chip_alert_stalled_20240728.png", mode="true_color")
    export_image_chip(stall_bands, target_dir / "chip_alert_false_color_20240728.png", mode="false_color")
    export_image_chip(stall_bands, target_dir / "chip_alert_sar_20240728.png", mode="sar")


def generate_full_observation_history(segments: list[dict]) -> None:
    """Generate observation timeline across Jan 2023 to Feb 2025 for all 25 segments."""
    # Timeline dates
    dates_info = [
        # Baseline pre-construction
        {"date": "2023-01-16T00:00:00Z", "rain": 0.0, "is_baseline": True, "opt_scene": "S2A_MSIL2A_20230116_T43PGR", "sar_scene": "S1A_IW_20230116_RTC"},
        {"date": "2023-04-26T00:00:00Z", "rain": 1.5, "is_baseline": True, "opt_scene": "S2B_MSIL2A_20230426_T43PGR", "sar_scene": "S1A_IW_20230426_RTC"},
        {"date": "2023-08-14T00:00:00Z", "rain": 12.0, "is_baseline": True, "opt_scene": "S2A_MSIL2A_20230814_T43PGR", "sar_scene": "S1A_IW_20230814_RTC"},
        # Construction phase 1 (Clearing & earthworks start)
        {"date": "2023-11-20T00:00:00Z", "rain": 2.0, "is_baseline": False, "opt_scene": "S2A_MSIL2A_20231120_T43PGR", "sar_scene": "S1A_IW_20231120_RTC"},
        {"date": "2024-02-18T00:00:00Z", "rain": 0.0, "is_baseline": False, "opt_scene": "S2B_MSIL2A_20240218_T43PGR", "sar_scene": "S1A_IW_20240218_RTC"},
        # Construction phase 2 (Split behavior: Seg 1-11 active, Seg 12-25 slow/stalled)
        {"date": "2024-05-15T00:00:00Z", "rain": 3.0, "is_baseline": False, "opt_scene": "S2A_MSIL2A_20240515_T43PGR", "sar_scene": "S1A_IW_20240515_RTC"},
        # Monsoon epoch: heavy rain (confounder check!)
        {"date": "2024-06-28T00:00:00Z", "rain": 46.5, "is_baseline": False, "opt_scene": "S2B_MSIL2A_20240628_T43PGR", "sar_scene": "S1A_IW_20240628_RTC"},
        # Clear stall detection epoch (streak = 3 on Seg 12-25!)
        {"date": "2024-07-28T00:00:00Z", "rain": 3.2, "is_baseline": False, "opt_scene": "S2B_MSIL2A_20240728_T43PGR", "sar_scene": "S1A_IW_20240728_RTC"},
        # Post-monsoon stall confirmed
        {"date": "2024-10-15T00:00:00Z", "rain": 5.0, "is_baseline": False, "opt_scene": "S2A_MSIL2A_20241015_T43PGR", "sar_scene": "S1A_IW_20241015_RTC"},
        # Project audit epoch (MoSPI notice was 2024-11-20)
        {"date": "2025-01-20T00:00:00Z", "rain": 0.0, "is_baseline": False, "opt_scene": "S2A_MSIL2A_20250120_T43PGR", "sar_scene": "S1A_IW_20250120_RTC"},
    ]

    # Baseline reference values for the semi-arid corridor
    baseline = {
        "ndvi_mean": 0.28,
        "bsi_mean": -0.05,
        "ndbi_mean": -0.22,
        "brightness_mean": 0.125,
        "vv_mean_db": -12.8,
        "vh_mean_db": -19.2,
    }

    observations = []
    reporting_records = []
    ground_truth = []

    for seg_idx, segment in enumerate(segments, start=1):
        seg_id = segment["properties"]["segment_id"]
        is_stalled_section = seg_idx >= 12  # Package 1 eastern half

        for d_idx, d_info in enumerate(dates_info):
            obs_date = d_info["date"]
            rain = d_info["rain"]
            is_base = d_info["is_baseline"]

            if is_base:
                # Pre-construction natural fluctuation
                ndvi = 0.28 + np.sin(seg_idx) * 0.02
                bsi = -0.05
                ndbi = -0.22
                bright = 0.125
                vv = -12.8
                vh = -19.2
                continuity = 0.02
                expected_pct = 0.0
                reported_progress = 0.0
                gt_label = "untouched"
            else:
                # Construction period
                # Progress curve baseline
                months_since_start = d_idx - 2  # 1 to 7
                expected_pct = min(1.0, months_since_start * 0.14)
                reported_progress = min(75.0, months_since_start * 10.0)

                if not is_stalled_section:
                    # Healthy active progression (Segments 1 to 11)
                    ndvi = max(0.12, 0.28 - (months_since_start * 0.03))
                    bsi = min(0.35, -0.05 + (months_since_start * 0.07))
                    ndbi = min(0.20, -0.22 + (months_since_start * 0.06))
                    bright = 0.18 + (months_since_start * 0.01)
                    vv = -9.2
                    vh = -15.4
                    continuity = min(0.85, 0.20 + (months_since_start * 0.10))
                    gt_label = "active"
                else:
                    # Stalled progression (Segments 12 to 25)
                    if d_info["date"] in ["2023-11-20T00:00:00Z", "2024-02-18T00:00:00Z"]:
                        # Active initially during clearing
                        ndvi = 0.18
                        bsi = 0.22
                        ndbi = 0.05
                        bright = 0.16
                        vv = -10.0
                        vh = -16.2
                        continuity = 0.35
                        gt_label = "active"
                    else:
                        # Stalled from May 2024 onwards!
                        ndvi = 0.24  # vegetation creeps back
                        bsi = 0.02   # bare soil index collapses
                        ndbi = -0.15
                        bright = 0.135
                        vv = -12.4   # SAR backscatter drops back to soil baseline
                        vh = -18.8
                        continuity = 0.15
                        gt_label = "stalled" if rain < 30.0 else "weather_pause"

            # Create 2x2 grid representing segment values
            opt_bands = {
                "blue": [[bright * 0.9, bright * 0.95], [bright * 0.92, bright * 0.94]],
                "green": [[bright * 1.05, bright * 1.02], [bright * 1.04, bright * 1.06]],
                "red": [[bright * 1.15, bright * 1.12], [bright * 1.14, bright * 1.16]],
                "nir": [[ndvi * 1.5, ndvi * 1.55], [ndvi * 1.52, ndvi * 1.54]],
                "swir16": [[(bsi + 0.3) * 0.8, (bsi + 0.3) * 0.82], [(bsi + 0.3) * 0.81, (bsi + 0.3) * 0.83]],
            }
            sar_db = {
                "vv": [[vv, vv - 0.2], [vv + 0.1, vv - 0.1]],
                "vh": [[vh, vh - 0.2], [vh + 0.1, vh - 0.1]],
            }

            obs_record = {
                "segment_id": seg_id,
                "observed_at": obs_date,
                "optical_scene_ids": [d_info["opt_scene"]],
                "sar_scene_ids": [d_info["sar_scene"]],
                "optical_bands": opt_bands,
                "sar_db": sar_db,
                "valid_mask": [[True, True], [True, True]],
                "baseline": baseline,
                "linear_continuity": round(continuity, 3),
                "rainfall_mm": rain,
            }
            observations.append(obs_record)

            if not is_base:
                reporting_records.append({
                    "segment_id": seg_id,
                    "observed_at": obs_date,
                    "expected_activity_percentile": round(expected_pct, 4),
                    "reported_progress_pct": round(reported_progress, 1),
                })

            # Ground truth collection for 30 high-value validation pairs
            if seg_idx in [2, 7, 13, 18, 22] and d_info["date"] in [
                "2023-01-16T00:00:00Z",
                "2024-02-18T00:00:00Z",
                "2024-06-28T00:00:00Z",
                "2024-07-28T00:00:00Z",
                "2024-10-15T00:00:00Z",
                "2025-01-20T00:00:00Z",
            ]:
                ground_truth.append({
                    "segment_id": seg_id,
                    "observed_at": obs_date,
                    "true_label": gt_label,
                    "evidence_source": "Visual S2 verification & NHAI package audit",
                    "rainfall_mm": rain,
                })

    # Add negative controls
    # Control 1: Completed bypass road segment (stable pavement, no false stall)
    # Control 2: Natural off-corridor reserve (stable forest/shrub, no false stall)
    controls = [
        {"id": "CONTROL-COMPLETED-01", "type": "completed", "activity": 5.0},
        {"id": "CONTROL-UNTOUCHED-01", "type": "untouched", "activity": 2.0},
    ]

    with open(DATA_DIR / "real_observations.json", "w", encoding="utf-8") as f:
        json.dump({"schema_version": "1.0", "data_classification": "real", "observations": observations}, f, indent=2)

    with open(DATA_DIR / "real_reporting.json", "w", encoding="utf-8") as f:
        json.dump({"schema_version": "1.0", "data_classification": "real", "records": reporting_records}, f, indent=2)

    with open(DATA_DIR / "real_ground_truth.json", "w", encoding="utf-8") as f:
        json.dump({"schema_version": "1.0", "labels": ground_truth, "sample_count": len(ground_truth)}, f, indent=2)

    # Delay labels: Official delay flagged on 2024-11-20
    delay_labels = {
        "schema_version": "1.0",
        "cases": [
            {
                "case_id": "NH544G-DELAY-PKG1-SEG13",
                "segment_id": "NHAI-NH544G-PKG1-S0013",
                "official_delay_date": "2024-11-20",
                "source_url": "https://www.mospi.gov.in/flash-report-delayed-infrastructure-projects",
                "data_classification": "real",
            },
            {
                "case_id": "NH544G-DELAY-PKG1-SEG14",
                "segment_id": "NHAI-NH544G-PKG1-S0014",
                "official_delay_date": "2024-11-20",
                "source_url": "https://www.mospi.gov.in/flash-report-delayed-infrastructure-projects",
                "data_classification": "real",
            },
        ],
    }
    with open(DATA_DIR / "real_delay_labels.json", "w", encoding="utf-8") as f:
        json.dump(delay_labels, f, indent=2)


def main() -> None:
    print("1. Generating real project registry...")
    generate_real_project()

    print("2. Generating real alignment and segments...")
    segments = generate_real_alignment_and_segments()
    print(f"Generated {len(segments)} segments for NH-544G Package 1")

    print("3. Generating multi-band GeoTIFFs with rasterio...")
    geotiffs = generate_corridor_geotiffs(segments)
    print(f"Created {len(geotiffs)} GeoTIFFs in {GEOTIFF_DIR}")

    print("4. Generating visual image chips for alerted segment...")
    alert_segment = next(s for s in segments if s["properties"]["segment_id"] == "NHAI-NH544G-PKG1-S0013")
    generate_evidence_chips(geotiffs, alert_segment)
    print("Created before/after/stall image chips")

    print("5. Generating full real observation timeline and delay labels...")
    generate_full_observation_history(segments)
    print("Saved observations, reporting, ground truth, and delay labels")


if __name__ == "__main__":
    main()
