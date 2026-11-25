from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from drishti.layers.features import (
    bare_soil_index,
    build_feature_manifest,
    grid_mean,
    normalized_difference,
)


class SpectralIndexTests(unittest.TestCase):
    def test_normalized_difference_handles_zero_denominator(self) -> None:
        result = normalized_difference([[3.0, 0.0]], [[1.0, 0.0]])
        self.assertEqual(result[0][0], 0.5)
        self.assertIsNone(result[0][1])

    def test_bare_soil_index_uses_blue_red_nir_and_swir(self) -> None:
        result = bare_soil_index([[1.0]], [[2.0]], [[3.0]], [[4.0]])
        self.assertAlmostEqual(result[0][0], 0.2)

    def test_grid_mean_applies_valid_mask(self) -> None:
        result = grid_mean([[1.0, 100.0], [3.0, 5.0]], [[True, False], [True, True]])
        self.assertEqual(result, 3.0)


class FeatureManifestTests(unittest.TestCase):
    def test_builds_versioned_features_from_sample_observations(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "features.json"
            records = build_feature_manifest(repository / "data" / "sample_observations.json", output)
            payload = json.loads(output.read_text(encoding="utf-8"))

        self.assertEqual(len(records), 6)
        self.assertEqual(payload["record_count"], 6)
        self.assertIn("ndvi", payload["feature_definition"])
        self.assertLess(records[1].ndvi_change, records[0].ndvi_change)
        self.assertGreater(records[2].vv_change_db, records[0].vv_change_db)


if __name__ == "__main__":
    unittest.main()

