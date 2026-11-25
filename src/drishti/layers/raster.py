from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Sequence

import numpy as np
from PIL import Image
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.windows import from_bounds as window_from_bounds


# SCL classes to mask out: 0=No Data, 1=Saturated/Defective, 3=Cloud Shadow, 8=Cloud Medium Prob, 9=Cloud High Prob, 10=Cirrus, 11=Snow
SCL_INVALID_CLASSES = frozenset({0, 1, 3, 8, 9, 10, 11})


def create_corridor_geotiff(
    path: str | Path,
    bounds: tuple[float, float, float, float],
    bands: dict[str, np.ndarray],
    crs: str = "EPSG:4326",
) -> Path:
    """Create a multi-band GeoTIFF covering the corridor bounding box."""
    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    west, south, east, north = bounds
    first_band = next(iter(bands.values()))
    height, width = first_band.shape

    transform = from_bounds(west, south, east, north, width, height)
    band_names = list(bands.keys())
    count = len(band_names)

    with rasterio.open(
        out_path,
        "w",
        driver="GTiff",
        height=height,
        width=width,
        count=count,
        dtype=first_band.dtype,
        crs=crs,
        transform=transform,
        compress="lzw",
    ) as dst:
        for idx, (name, arr) in enumerate(bands.items(), start=1):
            dst.write(arr, idx)
            dst.set_band_description(idx, name)

    return out_path


def read_window_by_bounds(
    geotiff_path: str | Path,
    bounds: tuple[float, float, float, float],
) -> dict[str, np.ndarray]:
    """Read a bounded window from a GeoTIFF using geospatial coordinates."""
    west, south, east, north = bounds
    result: dict[str, np.ndarray] = {}

    with rasterio.open(geotiff_path) as src:
        window = window_from_bounds(west, south, east, north, src.transform)
        for idx in range(1, src.count + 1):
            name = src.descriptions[idx - 1] if src.descriptions and src.descriptions[idx - 1] else f"band_{idx}"
            data = src.read(idx, window=window, boundless=True, fill_value=0)
            result[name] = data

    return result


def resample_band(
    array: np.ndarray,
    target_shape: tuple[int, int],
    resampling: Resampling = Resampling.bilinear,
) -> np.ndarray:
    """Resample band (e.g. 20m SWIR to 10m grid) to match optical resolution."""
    if array.shape == target_shape:
        return array
    img = Image.fromarray(array.astype(np.float32))
    resampled = img.resize((target_shape[1], target_shape[0]), Image.Resampling.BILINEAR)
    return np.array(resampled, dtype=array.dtype)


def compute_spectral_indices(
    blue: np.ndarray,
    green: np.ndarray,
    red: np.ndarray,
    nir: np.ndarray,
    swir: np.ndarray,
    scl: np.ndarray | None = None,
) -> dict[str, np.ndarray]:
    """Compute NDVI, BSI, NDBI, and optical brightness with SCL masking."""
    eps = 1e-6
    # Valid mask based on SCL
    if scl is not None:
        valid_mask = ~np.isin(scl, list(SCL_INVALID_CLASSES))
    else:
        valid_mask = np.ones_like(red, dtype=bool)

    # NDVI = (NIR - Red) / (NIR + Red)
    ndvi_denom = nir + red + eps
    ndvi = np.where(valid_mask, (nir - red) / ndvi_denom, np.nan)

    # BSI = ((SWIR + Red) - (NIR + Blue)) / ((SWIR + Red) + (NIR + Blue))
    bsi_num = (swir + red) - (nir + blue)
    bsi_denom = (swir + red) + (nir + blue) + eps
    bsi = np.where(valid_mask, bsi_num / bsi_denom, np.nan)

    # NDBI = (SWIR - NIR) / (SWIR + NIR)
    ndbi_denom = swir + nir + eps
    ndbi = np.where(valid_mask, (swir - nir) / ndbi_denom, np.nan)

    # Optical Brightness = mean(Blue, Green, Red)
    brightness = np.where(valid_mask, (blue + green + red) / 3.0, np.nan)

    return {
        "ndvi": ndvi,
        "bsi": bsi,
        "ndbi": ndbi,
        "brightness": brightness,
        "valid_mask": valid_mask,
    }


def compute_segment_stats(
    indices: dict[str, np.ndarray],
    sar_data: dict[str, np.ndarray] | None = None,
) -> dict[str, float]:
    """Compute summary statistics for a segment window."""
    valid = indices["valid_mask"]
    valid_count = int(np.sum(valid))
    total_count = valid.size
    valid_fraction = valid_count / total_count if total_count > 0 else 0.0

    def _nan_safe_stat(arr: np.ndarray) -> tuple[float, float]:
        v = arr[valid] if np.any(valid) else np.array([])
        if len(v) == 0 or np.all(np.isnan(v)):
            return 0.0, 0.0
        finite = v[np.isfinite(v)]
        if len(finite) == 0:
            return 0.0, 0.0
        return float(np.nanmedian(finite)), float(np.nanstd(finite))

    ndvi_med, ndvi_std = _nan_safe_stat(indices["ndvi"])
    bsi_med, bsi_std = _nan_safe_stat(indices["bsi"])
    ndbi_med, ndbi_std = _nan_safe_stat(indices["ndbi"])
    bright_med, bright_std = _nan_safe_stat(indices["brightness"])

    vv_med, vv_std = 0.0, 0.0
    vh_med, vh_std = 0.0, 0.0
    if sar_data:
        if "vv" in sar_data:
            vv_med, vv_std = _nan_safe_stat(sar_data["vv"])
        if "vh" in sar_data:
            vh_med, vh_std = _nan_safe_stat(sar_data["vh"])

    return {
        "valid_pixel_fraction": valid_fraction,
        "valid_pixels": valid_count,
        "total_pixels": total_count,
        "ndvi_median": ndvi_med,
        "ndvi_std": ndvi_std,
        "bsi_median": bsi_med,
        "bsi_std": bsi_std,
        "ndbi_median": ndbi_med,
        "ndbi_std": ndbi_std,
        "brightness_median": bright_med,
        "brightness_std": bright_std,
        "vv_median_db": vv_med,
        "vv_std_db": vv_std,
        "vh_median_db": vh_med,
        "vh_std_db": vh_std,
    }


def export_image_chip(
    bands: dict[str, np.ndarray],
    output_path: str | Path,
    mode: str = "true_color",
    target_size: tuple[int, int] = (256, 256),
) -> Path:
    """Generate high-contrast visual image chip (PNG) for evidence reporting."""
    out_path = Path(output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    def _normalize(arr: np.ndarray, p_min: float = 2.0, p_max: float = 98.0) -> np.ndarray:
        valid_vals = arr[np.isfinite(arr)]
        if len(valid_vals) == 0:
            return np.zeros_like(arr, dtype=np.uint8)
        low, high = np.percentile(valid_vals, p_min), np.percentile(valid_vals, p_max)
        if high <= low:
            high = low + 1e-4
        scaled = np.clip((arr - low) / (high - low), 0.0, 1.0) * 255.0
        return scaled.astype(np.uint8)

    if mode == "true_color":
        r = _normalize(bands.get("red", np.zeros(target_size)))
        g = _normalize(bands.get("green", np.zeros(target_size)))
        b = _normalize(bands.get("blue", np.zeros(target_size)))
        rgb = np.stack([r, g, b], axis=-1)
    elif mode == "false_color":
        # NIR (vegetation bright red), Red (bare soil cyan), Green
        r = _normalize(bands.get("nir", np.zeros(target_size)))
        g = _normalize(bands.get("red", np.zeros(target_size)))
        b = _normalize(bands.get("green", np.zeros(target_size)))
        rgb = np.stack([r, g, b], axis=-1)
    elif mode == "sar":
        # VV, VH, VV/VH ratio
        vv = bands.get("vv", np.zeros(target_size))
        vh = bands.get("vh", np.zeros(target_size))
        r = _normalize(vv)
        g = _normalize(vh)
        ratio = np.where(np.abs(vh) > 1e-6, vv / (vh + 1e-6), 0.0)
        b = _normalize(ratio)
        rgb = np.stack([r, g, b], axis=-1)
    else:
        raise ValueError(f"Unknown mode: {mode}")

    img = Image.fromarray(rgb)
    if img.size != target_size:
        img = img.resize(target_size, Image.Resampling.BILINEAR)

    img.save(out_path, format="PNG")
    return out_path
