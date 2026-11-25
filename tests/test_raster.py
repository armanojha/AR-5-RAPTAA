from __future__ import annotations

import tempfile
from pathlib import Path
import numpy as np

from drishti.layers.raster import (
    create_corridor_geotiff,
    read_window_by_bounds,
    resample_band,
    compute_spectral_indices,
    compute_segment_stats,
    export_image_chip,
)


def test_raster_pipeline() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        tif_path = tmp_path / "test_corridor.tif"
        bounds = (77.82, 14.12, 77.96, 14.28)

        # Create synthetic test arrays
        shape = (100, 100)
        blue = np.full(shape, 0.10, dtype=np.float32)
        green = np.full(shape, 0.12, dtype=np.float32)
        red = np.full(shape, 0.11, dtype=np.float32)
        nir = np.full(shape, 0.35, dtype=np.float32)
        swir = np.full(shape, 0.15, dtype=np.float32)
        scl = np.full(shape, 4, dtype=np.uint8)  # Class 4 = vegetation

        bands = {
            "blue": blue,
            "green": green,
            "red": red,
            "nir": nir,
            "swir": swir,
            "scl": scl,
        }

        # 1. Create GeoTIFF
        created = create_corridor_geotiff(tif_path, bounds, bands)
        assert created.exists()

        # 2. Window read
        seg_bounds = (77.82, 14.12, 77.85, 14.15)
        window_bands = read_window_by_bounds(tif_path, seg_bounds)
        assert "red" in window_bands
        assert window_bands["red"].shape[0] > 0
        assert window_bands["red"].shape[1] > 0

        # 3. Resample
        resampled = resample_band(swir, (50, 50))
        assert resampled.shape == (50, 50)

        # 4. Spectral indices
        indices = compute_spectral_indices(blue, green, red, nir, swir, scl)
        assert "ndvi" in indices
        assert np.all(np.isfinite(indices["ndvi"]))

        # 5. Segment stats
        stats = compute_segment_stats(indices)
        assert stats["valid_pixel_fraction"] == 1.0
        assert stats["ndvi_median"] > 0.4

        # 6. Export chip
        chip_path = tmp_path / "test_chip.png"
        out_chip = export_image_chip(bands, chip_path, mode="true_color")
        assert out_chip.exists()
