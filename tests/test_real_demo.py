from __future__ import annotations

import io
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from drishti.layers.calibration import run_weight_sensitivity_analysis
from drishti.layers.evaluation import evaluate_stall_performance
from drishti.layers.track_c import detect_track_c_events
from drishti.real_case import build_real_corridor_demonstration


class RealDemoTests(unittest.TestCase):
    def test_full_real_pipeline(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            out_root = Path(tmpdir)
            with redirect_stdout(io.StringIO()):
                result = build_real_corridor_demonstration(out_root, export_frontend=False)
            self.assertEqual(result["status"], "success")
            self.assertEqual(result["corridors"], 3)
            self.assertGreaterEqual(result["segments"], 10)
            self.assertGreater(result["alerts_count"], 0)
            self.assertEqual(result["track_c_count"], 2)
            self.assertEqual(result["total_cases"], 3)
            self.assertGreater(result["lead_time_days"], 0)
            self.assertEqual(result["precision"], 1.0)
            self.assertEqual(result["recall"], 1.0)
            self.assertTrue(Path(result["dashboard_path"]).exists())


if __name__ == "__main__":
    unittest.main()
