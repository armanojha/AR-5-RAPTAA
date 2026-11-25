from __future__ import annotations

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import requests
from rasterio.enums import Resampling

from drishti.layers.raster import (
    SCL_INVALID_CLASSES,
    compute_slope_degrees,
    compute_spectral_indices,
    compute_water_and_sand_indices,
    create_corridor_geotiff,
    export_image_chip,
    lee_speckle_filter,
    read_cog_window_wgs84,
    sigma_to_db,
    summarize_worldcover,
)

EARTH_SEARCH_STAC = "https://earth-search.aws.element84.com/v1/search"
PC_STAC = "https://planetarycomputer.microsoft.com/api/stac/v1/search"
PC_SAS_TOKEN = "https://planetarycomputer.microsoft.com/api/sas/v1/token"
OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"
NASA_POWER_DAILY = "https://power.larc.nasa.gov/api/temporal/daily/point"


def configure_gdal_http() -> None:
    os.environ["GDAL_HTTP_MULTIRANGE"] = "NO"
    os.environ["GDAL_HTTP_MERGE_CONSECUTIVE_RANGES"] = "NO"
    os.environ["GDAL_DISABLE_READDIR_ON_OPEN"] = "EMPTY_DIR"


def get_pc_sas_token(collection: str) -> str:
    r = requests.get(f"{PC_SAS_TOKEN}/{collection}", timeout=20)
    r.raise_for_status()
    return str(r.json()["token"])


def sign_pc_href(href: str, token: str) -> str:
    sep = "&" if "?" in href else "?"
    return f"{href}{sep}{token}"


def stac_search_post(
    endpoint: str,
    *,
    collections: list[str],
    bbox: list[float],
    datetime_range: str | None = None,
    query: dict[str, Any] | None = None,
    limit: int = 10,
) -> list[dict[str, Any]]:
    payload: dict[str, Any] = {
        "collections": collections,
        "bbox": bbox,
        "limit": limit,
    }
    if datetime_range:
        payload["datetime"] = datetime_range
    if query:
        payload["query"] = query
    r = requests.post(endpoint, json=payload, timeout=25)
    r.raise_for_status()
    return list(r.json().get("features", []))


def fetch_real_rainfall_window(
    lat: float,
    lon: float,
    start_date: str,
    end_date: str,
) -> dict[str, Any]:
    """Fetch real historical daily precipitation from Open-Meteo and NASA POWER (GPM IMERG calibrated)."""
    om_total = None
    np_total = None
    om_days: list[float] = []
    np_days: list[float] = []

    try:
        r = requests.get(
            OPEN_METEO_ARCHIVE,
            params={
                "latitude": round(lat, 4),
                "longitude": round(lon, 4),
                "start_date": start_date,
                "end_date": end_date,
                "daily": "precipitation_sum",
                "timezone": "UTC",
            },
            timeout=20,
        )
        if r.status_code == 200:
            vals = r.json().get("daily", {}).get("precipitation_sum", [])
            om_days = [float(v) for v in vals if v is not None]
            om_total = round(sum(om_days), 2)
    except Exception:
        pass

    try:
        s_ymd = start_date.replace("-", "")
        e_ymd = end_date.replace("-", "")
        r = requests.get(
            NASA_POWER_DAILY,
            params={
                "parameters": "PRECTOTCORR",
                "community": "RE",
                "longitude": round(lon, 4),
                "latitude": round(lat, 4),
                "start": s_ymd,
                "end": e_ymd,
                "format": "JSON",
            },
            timeout=20,
        )
        if r.status_code == 200:
            pdict = r.json().get("properties", {}).get("parameter", {}).get("PRECTOTCORR", {})
            np_days = [float(v) for v in pdict.values() if v is not None and float(v) >= 0]
            np_total = round(sum(np_days), 2)
    except Exception:
        pass

    best_mm = np_total if np_total is not None else (om_total if om_total is not None else 0.0)
    return {
        "start_date": start_date,
        "end_date": end_date,
        "rainfall_mm": best_mm,
        "nasa_power_imerg_mm": np_total,
        "open_meteo_mm": om_total,
        "sources": ["NASA POWER PRECTOTCORR (GPM IMERG)", "Open-Meteo ERA5/CHIRPS Archive"],
    }


def fetch_sentinel2_window(
    item: dict[str, Any],
    wgs84_bounds: tuple[float, float, float, float],
) -> dict[str, Any]:
    """Fetch real Sentinel-2 L2A 10m/20m COG windows in parallel, resample 20m SWIR/SCL to 10m, apply SCL mask."""
    from concurrent.futures import ThreadPoolExecutor

    configure_gdal_http()
    assets = item.get("assets", {})
    red_dn, meta = read_cog_window_wgs84(assets["red"]["href"], wgs84_bounds)
    target_shape = red_dn.shape

    def _fetch_band(key: str, resamp: Resampling) -> tuple[str, np.ndarray]:
        arr, _ = read_cog_window_wgs84(assets[key]["href"], wgs84_bounds, target_shape=target_shape, resampling=resamp)
        return key, arr

    band_specs = [
        ("green", Resampling.bilinear),
        ("blue", Resampling.bilinear),
        ("nir", Resampling.bilinear),
        ("swir16", Resampling.bilinear),
        ("scl", Resampling.nearest),
    ]
    fetched: dict[str, np.ndarray] = {"red": red_dn}
    with ThreadPoolExecutor(max_workers=5) as pool:
        for k, arr in pool.map(lambda spec: _fetch_band(*spec), band_specs):
            fetched[k] = arr

    scale = 10000.0
    blue = np.clip(fetched["blue"].astype(np.float32) / scale, 0.001, 1.0)
    green = np.clip(fetched["green"].astype(np.float32) / scale, 0.001, 1.0)
    red = np.clip(fetched["red"].astype(np.float32) / scale, 0.001, 1.0)
    nir = np.clip(fetched["nir"].astype(np.float32) / scale, 0.001, 1.0)
    swir = np.clip(fetched["swir16"].astype(np.float32) / scale, 0.001, 1.0)
    scl_u8 = fetched["scl"].astype(np.uint8)

    return {
        "scene_id": item["id"],
        "datetime": item["properties"].get("datetime"),
        "cloud_cover_pct": item["properties"].get("eo:cloud_cover"),
        "crs": meta["crs"],
        "bands": {
            "blue": blue,
            "green": green,
            "red": red,
            "nir": nir,
            "swir16": swir,
            "scl": scl_u8,
        },
    }


def build_sentinel2_median_composite(
    items: list[dict[str, Any]],
    wgs84_bounds: tuple[float, float, float, float],
    *,
    max_scenes: int = 3,
) -> dict[str, Any]:
    """
    Fetch up to `max_scenes` Sentinel-2 L2A scenes in an observation window,
    apply SCL cloud/shadow masking per scene, align grids, and compute a pixel-wise
    temporal median composite (Layer 4 spec).
    """
    selected = sorted(
        items,
        key=lambda it: float(it.get("properties", {}).get("eo:cloud_cover") or 100.0),
    )[:max_scenes]
    if not selected:
        raise ValueError("build_sentinel2_median_composite requires at least one STAC item")

    scene_windows = [fetch_sentinel2_window(it, wgs84_bounds) for it in selected]
    if len(scene_windows) == 1:
        only = scene_windows[0]
        only["optical_scene_ids"] = [only["scene_id"]]
        only["composite_scene_count"] = 1
        return only

    target_shape = scene_windows[0]["bands"]["red"].shape
    band_keys = ("blue", "green", "red", "nir", "swir16")
    stacks: dict[str, list[np.ndarray]] = {k: [] for k in band_keys}
    any_valid = np.zeros(target_shape, dtype=bool)
    fallback_sums: dict[str, np.ndarray] = {k: np.zeros(target_shape, dtype=np.float32) for k in band_keys}

    for win in scene_windows:
        b = win["bands"]
        scl = b["scl"]
        if scl.shape != target_shape:
            from drishti.layers.raster import resample_band
            scl = resample_band(scl, target_shape, resampling=Resampling.nearest).astype(np.uint8)
        valid = ~np.isin(scl, list(SCL_INVALID_CLASSES))
        any_valid |= valid
        for k in band_keys:
            arr = b[k]
            if arr.shape != target_shape:
                from drishti.layers.raster import resample_band
                arr = resample_band(arr, target_shape, resampling=Resampling.bilinear)
            fallback_sums[k] += arr
            stacks[k].append(np.where(valid, arr, np.nan))

    composite_bands: dict[str, np.ndarray] = {}
    for k in band_keys:
        stacked = np.stack(stacks[k], axis=0)
        with np.errstate(all="ignore"):
            med = np.nanmedian(stacked, axis=0)
        fallback_avg = fallback_sums[k] / len(scene_windows)
        composite_bands[k] = np.where(any_valid & np.isfinite(med), med, fallback_avg).astype(np.float32)

    # Composite SCL: 4 (clear vegetation/surface) where at least one scene was cloud-free, 9 (cloud) otherwise
    composite_bands["scl"] = np.where(any_valid, 4, 9).astype(np.uint8)
    clouds = [float(w["cloud_cover_pct"]) for w in scene_windows if w.get("cloud_cover_pct") is not None]

    return {
        "scene_id": scene_windows[0]["scene_id"],
        "optical_scene_ids": [w["scene_id"] for w in scene_windows],
        "composite_scene_count": len(scene_windows),
        "datetime": scene_windows[0]["datetime"],
        "cloud_cover_pct": min(clouds) if clouds else None,
        "crs": scene_windows[0]["crs"],
        "bands": composite_bands,
    }


def fetch_sentinel1_rtc_window(
    item: dict[str, Any],
    wgs84_bounds: tuple[float, float, float, float],
    target_shape: tuple[int, int],
    sas_token: str,
) -> dict[str, Any]:
    """Fetch real Planetary Computer Sentinel-1 RTC VV & VH windows in parallel, apply Lee speckle filter & convert to dB."""
    from concurrent.futures import ThreadPoolExecutor

    configure_gdal_http()
    assets = item.get("assets", {})
    vv_href = sign_pc_href(assets["vv"]["href"], sas_token)
    vh_href = sign_pc_href(assets["vh"]["href"], sas_token)

    with ThreadPoolExecutor(max_workers=2) as pool:
        f_vv = pool.submit(read_cog_window_wgs84, vv_href, wgs84_bounds, target_shape=target_shape, resampling=Resampling.bilinear)
        f_vh = pool.submit(read_cog_window_wgs84, vh_href, wgs84_bounds, target_shape=target_shape, resampling=Resampling.bilinear)
        vv_lin, _ = f_vv.result()
        vh_lin, _ = f_vh.result()

    vv_filtered = lee_speckle_filter(vv_lin, window_size=5, is_db=False)
    vh_filtered = lee_speckle_filter(vh_lin, window_size=5, is_db=False)

    return {
        "scene_id": item["id"],
        "datetime": item["properties"].get("datetime"),
        "vv_db": sigma_to_db(vv_filtered),
        "vh_db": sigma_to_db(vh_filtered),
    }


def fetch_context_layers(
    wgs84_bounds: tuple[float, float, float, float],
    target_shape: tuple[int, int],
) -> dict[str, Any]:
    """Fetch real ESA WorldCover 10m, Copernicus GLO-30 DEM slope, and Landsat pre-project baseline."""
    configure_gdal_http()
    bbox = list(wgs84_bounds)
    result: dict[str, Any] = {"worldcover": {}, "dem": {}, "landsat_baseline": {}}

    # 1. ESA WorldCover 10m (also provides built-up settlement baseline mask class 50)
    try:
        wc_items = stac_search_post(PC_STAC, collections=["esa-worldcover"], bbox=bbox, limit=1)
        if wc_items:
            wc_tok = get_pc_sas_token("esa-worldcover")
            wc_href = sign_pc_href(wc_items[0]["assets"]["map"]["href"], wc_tok)
            wc_arr, _ = read_cog_window_wgs84(wc_href, wgs84_bounds, target_shape=target_shape, resampling=Resampling.nearest)
            result["worldcover"] = {
                "scene_id": wc_items[0]["id"],
                "summary": summarize_worldcover(wc_arr),
                "built_up_mask": wc_arr == 50,
                "array": wc_arr,
            }
    except Exception as exc:
        result["worldcover"] = {"error": str(exc)}

    # 2. Copernicus GLO-30 DEM
    try:
        dem_items = stac_search_post(PC_STAC, collections=["cop-dem-glo-30"], bbox=bbox, limit=1)
        if dem_items:
            dem_tok = get_pc_sas_token("cop-dem-glo-30")
            dem_href = sign_pc_href(dem_items[0]["assets"]["data"]["href"], dem_tok)
            dem_arr, _ = read_cog_window_wgs84(dem_href, wgs84_bounds, target_shape=target_shape, resampling=Resampling.bilinear)
            slope_arr = compute_slope_degrees(dem_arr, pixel_size_m=15.0)
            result["dem"] = {
                "scene_id": dem_items[0]["id"],
                "elevation_min_m": round(float(np.nanmin(dem_arr)), 1),
                "elevation_max_m": round(float(np.nanmax(dem_arr)), 1),
                "mean_slope_deg": round(float(np.nanmean(slope_arr)), 2),
                "max_slope_deg": round(float(np.nanmax(slope_arr)), 2),
            }
    except Exception as exc:
        result["dem"] = {"error": str(exc)}

    # 3. Landsat 8/9 C2 L2 long pre-project baseline (2021)
    try:
        ls_items = stac_search_post(
            EARTH_SEARCH_STAC,
            collections=["landsat-c2-l2"],
            bbox=bbox,
            datetime_range="2021-01-01T00:00:00Z/2021-06-01T00:00:00Z",
            query={"eo:cloud_cover": {"lt": 25}},
            limit=1,
        )
        if ls_items:
            it = ls_items[0]
            assets = it["assets"]
            red_key = "red" if "red" in assets else "SR_B4"
            nir_key = "nir08" if "nir08" in assets else "SR_B5"
            r_dn, _ = read_cog_window_wgs84(assets[red_key]["href"], wgs84_bounds, target_shape=target_shape)
            n_dn, _ = read_cog_window_wgs84(assets[nir_key]["href"], wgs84_bounds, target_shape=target_shape)
            r_ref = np.clip(r_dn.astype(np.float32) * 0.0000275 - 0.2, 0.001, 1.0)
            n_ref = np.clip(n_dn.astype(np.float32) * 0.0000275 - 0.2, 0.001, 1.0)
            ndvi = (n_ref - r_ref) / (n_ref + r_ref + 1e-6)
            result["landsat_baseline"] = {
                "scene_id": it["id"],
                "datetime": it["properties"].get("datetime"),
                "landsat_2021_ndvi_median": round(float(np.nanmedian(ndvi)), 4),
            }
    except Exception as exc:
        result["landsat_baseline"] = {"error": str(exc)}

    return result
