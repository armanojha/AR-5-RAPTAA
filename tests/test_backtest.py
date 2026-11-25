from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from drishti.layers.backtest import DelayRiskScorer, run_backtest


def _analysis(date: str, *, state: str, divergence: float, activity: float, confidence: float = 1.0) -> dict:
    return {
        "segment_id": "P-001-S0001",
        "observed_at": date,
        "state": state,
        "activity_reporting_divergence": divergence,
        "observed_activity_percentile": activity,
        "confidence": confidence,
    }


class DelayRiskTests(unittest.TestCase):
    def test_stall_and_large_divergence_raise_alert(self) -> None:
        risk = DelayRiskScorer().score(
            _analysis(
                "2026-01-01T00:00:00Z",
                state="stall_candidate",
                divergence=0.60,
                activity=0.05,
            )
        )
        self.assertTrue(risk.alert)
        self.assertGreater(risk.risk_score, 0.9)

    def test_backtest_ignores_observations_on_or_after_official_date(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            analysis_path = directory / "analysis.json"
            labels_path = directory / "labels.json"
            output_path = directory / "backtest.json"
            analysis_path.write_text(
                json.dumps(
                    {
                        "records": [
                            _analysis("2026-01-15T00:00:00Z", state="stall_candidate", divergence=0.60, activity=0.05),
                            _analysis("2026-03-01T00:00:00Z", state="stall_candidate", divergence=0.60, activity=0.05),
                        ]
                    }
                ),
                encoding="utf-8",
            )
            labels_path.write_text(
                json.dumps(
                    {
                        "cases": [
                            {
                                "case_id": "CASE-1",
                                "segment_id": "P-001-S0001",
                                "official_delay_date": "2026-02-15",
                                "source_url": "https://example.invalid/label",
                                "data_classification": "synthetic",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )
            _, cases = run_backtest(analysis_path, labels_path, output_path)

        self.assertEqual(cases[0].first_alert_date.isoformat(), "2026-01-15")
        self.assertEqual(cases[0].lead_time_days, 31)
        self.assertEqual(cases[0].eligible_observation_count, 1)


if __name__ == "__main__":
    unittest.main()

