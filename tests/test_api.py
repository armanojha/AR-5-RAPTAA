from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from drishti.api import AlertApplication, AlertRepository
from pipeline_fixture import build_sample_pipeline


class AlertApiTests(unittest.TestCase):
    def test_repository_and_route_dispatch_return_alerts(self) -> None:
        repository_root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = build_sample_pipeline(repository_root, Path(temporary_directory))
            repository = AlertRepository(paths["evidence"])
            alert = repository.list_alerts()[0]
            self.assertEqual(repository.get_alert(alert["alert_id"])["segment_id"], "DEMO-001-S0002")
            application = AlertApplication(repository)
            status, payload = application.dispatch("/alerts?severity=medium")
            self.assertEqual(status, 200)
            self.assertEqual(payload["count"], 1)
            self.assertEqual(payload["alerts"][0]["alert_id"], alert["alert_id"])


if __name__ == "__main__":
    unittest.main()

