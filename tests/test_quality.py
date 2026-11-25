from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from drishti.layers.quality import (
    apply_mask,
    evaluate_manifest,
    median_composite,
    scl_valid_mask,
    sigma0_to_db,
    valid_fraction,
)
from drishti.layers.scene_catalog import SceneCatalog


class PixelQualityTests(unittest.TestCase):
    def test_scl_mask_removes_cloud_shadow_cloud_cirrus_snow_and_invalid_pixels(self) -> None:
        mask = scl_valid_mask([[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]])
        self.assertEqual(mask[0], [False, False, True, False, True, True])
        self.assertEqual(mask[1], [True, True, False, False, False, False])
        self.assertAlmostEqual(valid_fraction(mask), 5 / 12)

    def test_applies_mask_and_builds_temporal_median(self) -> None:
        first = apply_mask([[1, 2], [3, 4]], [[True, False], [True, True]])
        second = [[3.0, 6.0], [None, 8.0]]
        self.assertEqual(first, [[1.0, None], [3.0, 4.0]])
        self.assertEqual(median_composite([first, second]), [[2.0, 6.0], [3.0, 6.0]])

    def test_converts_positive_sigma0_to_db(self) -> None:
        result = sigma0_to_db([[1.0, 0.1, 0.0, None]])
        self.assertAlmostEqual(result[0][0], 0.0)
        self.assertAlmostEqual(result[0][1], -10.0)
        self.assertIsNone(result[0][2])
        self.assertIsNone(result[0][3])


class QualityManifestTests(unittest.TestCase):
    def test_evaluates_clear_cloudy_and_rtc_scenes(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        catalog = SceneCatalog.from_stac_file(repository / "data" / "sample_stac_items.json")
        catalog = SceneCatalog([scene.with_coverage(["DEMO-001-S0001"]) for scene in catalog.scenes])

        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            manifest = directory / "scenes.json"
            output = directory / "quality.json"
            catalog.export_manifest(manifest, provider="synthetic")
            results = evaluate_manifest(manifest, output)
            payload = json.loads(output.read_text(encoding="utf-8"))

        statuses = {result.scene_id: result.status for result in results}
        self.assertEqual(statuses["S2-DEMO-CLEAR"], "accepted")
        self.assertEqual(statuses["S2-DEMO-CLOUDY"], "rejected")
        self.assertEqual(statuses["S1-DEMO-RTC"], "accepted")
        self.assertEqual(payload["summary"], {"accepted": 2, "review": 0, "rejected": 1})


if __name__ == "__main__":
    unittest.main()

