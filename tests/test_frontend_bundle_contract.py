from __future__ import annotations

import json
import unittest
from pathlib import Path


class FrontendBundleContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        bundle_path = Path(__file__).resolve().parents[1] / "frontend" / "public" / "drishti_bundle.json"
        cls.bundle = json.loads(bundle_path.read_text(encoding="utf-8"))

    def test_cusum_payload_is_a_summary_object(self) -> None:
        cusum = self.bundle["ml_summary"]["cusum_nh544g_bsi_breaks"]
        self.assertIsInstance(cusum, dict)
        self.assertIn("upward_break_index", cusum)
        self.assertIn("downward_break_index", cusum)
        self.assertIsInstance(cusum["cusum_pos"], list)
        self.assertIsInstance(cusum["cusum_neg"], list)

    def test_timeline_activity_index_is_already_percentage_scaled(self) -> None:
        values = [
            segment["activity_index"]
            for frame in self.bundle["timeline_frames"]
            for segment in frame["segments"]
            if segment["activity_index"] is not None
        ]
        self.assertTrue(values)
        self.assertGreaterEqual(min(values), 0)
        self.assertLessEqual(max(values), 100)


if __name__ == "__main__":
    unittest.main()
