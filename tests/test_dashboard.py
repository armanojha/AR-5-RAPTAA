from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from drishti.dashboard import build_dashboard
from pipeline_fixture import build_sample_pipeline


class DashboardTests(unittest.TestCase):
    def test_builds_offline_judge_dashboard(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            paths = build_sample_pipeline(repository, root)
            output = build_dashboard(
                evidence_directory=paths["evidence"],
                segments_path=paths["segments"],
                activity_path=paths["activity"],
                analysis_path=paths["analysis"],
                backtest_path=paths["backtest"],
                output_directory=root / "dashboard",
            )
            document = output.read_text(encoding="utf-8")

        self.assertIn("See activity", document)
        self.assertIn("45<small> days", document)
        self.assertIn("DEMO-001-S0002", document)
        self.assertIn("synthetic demo", document)
        self.assertIn("Open evidence package", document)
        self.assertNotIn("cdn.", document.lower())


if __name__ == "__main__":
    unittest.main()

