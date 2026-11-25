from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from drishti.layers.track_c import detect_track_c_events
from drishti.layers.evaluation import evaluate_stall_performance
from drishti.layers.calibration import run_weight_sensitivity_analysis


class TrackCAndCalibrationTests(unittest.TestCase):
    def test_track_c_detection(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            out_dir = Path(tmpdir)
            events = detect_track_c_events("data/real_segments.geojson", out_dir)
            self.assertEqual(len(events), 2)
            self.assertEqual(events[0]["event_type"], "right_of_way_encroachment")
            self.assertEqual(events[1]["event_type"], "illegal_sand_mining_near_piers")
            self.assertTrue((out_dir / "chips" / f"{events[0]['event_id']}_evidence.png").exists())
            self.assertTrue((out_dir / "track_c_events.json").exists())

    def test_calibration_and_evaluation(self) -> None:
        eval_metrics = evaluate_stall_performance("output/real_case/analysis.json", "output/real_case/data/ground_truth.json")
        self.assertEqual(eval_metrics["precision"], 1.0)
        self.assertEqual(eval_metrics["recall"], 1.0)
        self.assertEqual(eval_metrics["false_alerts_on_negative_controls"], 0)

        calib = run_weight_sensitivity_analysis("output/real_case/features.json")
        self.assertEqual(calib["overall_stability"], "highly_robust")


if __name__ == "__main__":
    unittest.main()
