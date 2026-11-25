from __future__ import annotations

import unittest

from drishti.layers.stall_divergence import StallDivergenceDetector


def _activity(date: str, score: float, *, confidence: float = 1.0, observability: str = "high") -> dict:
    return {
        "segment_id": "P-001-S0001",
        "observed_at": date,
        "activity_index": score,
        "confidence": confidence,
        "observability": observability,
    }


def _feature(date: str, rainfall: float = 0.0) -> dict:
    return {"segment_id": "P-001-S0001", "observed_at": date, "rainfall_mm": rainfall}


def _reporting(date: str, expected: float, reported: float = 50.0) -> dict:
    return {
        "segment_id": "P-001-S0001",
        "observed_at": date,
        "expected_activity_percentile": expected,
        "reported_progress_pct": reported,
    }


class StallDivergenceTests(unittest.TestCase):
    def test_three_clear_low_observations_create_stall_candidate(self) -> None:
        dates = ["2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", "2026-03-01T00:00:00Z"]
        results = StallDivergenceDetector().detect(
            [_activity(value, 10.0) for value in dates],
            [_feature(value) for value in dates],
            [_reporting(value, 0.60) for value in dates],
        )
        self.assertEqual([result.state for result in results], ["slowing", "slowing", "stall_candidate"])
        self.assertEqual(results[-1].low_activity_streak, 3)

    def test_heavy_rainfall_breaks_low_activity_streak(self) -> None:
        dates = ["2026-01-01T00:00:00Z", "2026-02-01T00:00:00Z", "2026-03-01T00:00:00Z"]
        results = StallDivergenceDetector().detect(
            [_activity(value, 10.0) for value in dates],
            [_feature(dates[0]), _feature(dates[1], rainfall=50.0), _feature(dates[2])],
            [_reporting(value, 0.60) for value in dates],
        )
        self.assertEqual(results[-1].low_activity_streak, 1)
        self.assertNotEqual(results[-1].state, "stall_candidate")
        self.assertTrue(results[1].rainfall_confounded)

    def test_low_confidence_is_not_assessable(self) -> None:
        date = "2026-01-01T00:00:00Z"
        result = StallDivergenceDetector().detect(
            [_activity(date, 10.0, confidence=0.2)],
            [_feature(date)],
            [_reporting(date, 0.80)],
        )[0]
        self.assertEqual(result.state, "not_assessable")

    def test_divergence_uses_activity_percentiles_not_reported_completion(self) -> None:
        date = "2026-01-01T00:00:00Z"
        result = StallDivergenceDetector().detect(
            [_activity(date, 20.0)],
            [_feature(date)],
            [_reporting(date, expected=0.70, reported=99.0)],
        )[0]
        self.assertAlmostEqual(result.activity_reporting_divergence, 0.50)


if __name__ == "__main__":
    unittest.main()

