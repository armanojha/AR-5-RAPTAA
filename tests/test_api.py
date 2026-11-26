from __future__ import annotations

import tempfile
import unittest
import json
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

    def test_optional_bundle_endpoint_uses_the_generated_frontend_source(self) -> None:
        repository_root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            paths = build_sample_pipeline(repository_root, root)
            bundle = root / "drishti_bundle.json"
            bundle.write_text(json.dumps({"schema_version": "contract-test", "projects": []}), encoding="utf-8")
            application = AlertApplication(AlertRepository(paths["evidence"], bundle_path=bundle))
            health_status, health = application.dispatch("/health")
            status, payload = application.dispatch("/bundle")
            self.assertEqual(health_status, 200)
            self.assertTrue(health["bundle_available"])
            self.assertEqual(status, 200)
            self.assertEqual(payload["schema_version"], "contract-test")


if __name__ == "__main__":
    unittest.main()

