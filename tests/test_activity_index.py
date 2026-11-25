from __future__ import annotations

import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from drishti.layers.activity_index import ActivityIndexModel, score_feature_manifest
from drishti.layers.features import FeatureRecord, build_feature_manifest


def _feature(*, active: bool, valid_fraction: float = 1.0) -> FeatureRecord:
    return FeatureRecord(
        segment_id="P-001-S0001",
        observed_at=datetime(2026, 1, 1, tzinfo=timezone.utc),
        optical_scene_ids=("S2",),
        sar_scene_ids=("S1",),
        ndvi_mean=0.2,
        ndvi_change=-0.25 if active else 0.02,
        bsi_mean=0.2,
        bsi_change=0.25 if active else 0.0,
        ndbi_mean=0.2,
        ndbi_change=0.20 if active else 0.0,
        brightness_mean=0.2,
        brightness_change=0.15 if active else 0.0,
        vv_mean_db=-9.0,
        vv_change_db=3.0 if active else 0.0,
        vh_mean_db=-15.0,
        vh_change_db=3.0 if active else 0.0,
        linear_continuity=1.0 if active else 0.05,
        rainfall_mm=0.0,
        valid_pixel_fraction=valid_fraction,
    )


class ActivityIndexTests(unittest.TestCase):
    def test_active_observation_scores_higher_than_quiet_observation(self) -> None:
        model = ActivityIndexModel()
        active = model.score(_feature(active=True), observability="high")
        quiet = model.score(_feature(active=False), observability="high")
        self.assertGreater(active.activity_index, 95)
        self.assertLess(quiet.activity_index, 5)

    def test_component_contributions_reconstruct_score(self) -> None:
        result = ActivityIndexModel().score(_feature(active=True), observability="high")
        self.assertAlmostEqual(sum(component.contribution for component in result.components) * 100, result.activity_index)

    def test_confidence_reflects_observability_and_valid_pixels(self) -> None:
        model = ActivityIndexModel()
        high = model.score(_feature(active=True, valid_fraction=1.0), observability="high")
        medium = model.score(_feature(active=True, valid_fraction=0.8), observability="medium")
        self.assertEqual(high.confidence, 1.0)
        self.assertLess(medium.confidence, high.confidence)

    def test_rejects_weights_that_do_not_sum_to_one(self) -> None:
        with self.assertRaisesRegex(ValueError, "sum to 1.0"):
            ActivityIndexModel(
                {
                    "vegetation_clearance": 1.0,
                    "bare_soil_activity": 1.0,
                    "built_up_activity": 1.0,
                    "brightness_activity": 1.0,
                    "vv_activity": 1.0,
                    "vh_activity": 1.0,
                    "linear_continuity": 1.0,
                }
            )

    def test_scores_sample_feature_manifest_with_segment_observability(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            features = directory / "features.json"
            segments = directory / "segments.geojson"
            activity = directory / "activity.json"
            build_feature_manifest(repository / "data" / "sample_observations.json", features)
            segments.write_text(
                json.dumps(
                    {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "id": "DEMO-001-S0001",
                                "properties": {
                                    "segment_id": "DEMO-001-S0001",
                                    "observability": "high"
                                },
                                "geometry": None
                            },
                            {
                                "type": "Feature",
                                "id": "DEMO-001-S0002",
                                "properties": {
                                    "segment_id": "DEMO-001-S0002",
                                    "observability": "high"
                                },
                                "geometry": None
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            results = score_feature_manifest(features, segments, activity)
            payload = json.loads(activity.read_text(encoding="utf-8"))

        self.assertEqual(len(results), 6)
        self.assertEqual(payload["model_version"], "sai-v1")
        self.assertIn("not engineering completion percentage", payload["interpretation"])
        self.assertGreater(results[2].activity_index, results[0].activity_index)


if __name__ == "__main__":
    unittest.main()

