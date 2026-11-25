from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from drishti.layers.evidence import verify_evidence_manifest
from pipeline_fixture import build_sample_pipeline


class EvidencePackageTests(unittest.TestCase):
    def test_builds_hashed_alert_manifest_and_human_report(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = build_sample_pipeline(repository, Path(temporary_directory))
            index = json.loads((paths["evidence"] / "alerts.json").read_text(encoding="utf-8"))
            alert = index["alerts"][0]
            package = paths["evidence"] / "alerts" / alert["alert_id"]
            report = (package / "report.html").read_text(encoding="utf-8")

            self.assertEqual(index["alert_count"], 1)
            self.assertTrue(verify_evidence_manifest(package / "manifest.json"))
            self.assertIn("Field verification", report)
            self.assertIn("not an allegation", report)
            self.assertEqual(alert["data_classification"], "synthetic")

    def test_manifest_verification_detects_tampering(self) -> None:
        repository = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = build_sample_pipeline(repository, Path(temporary_directory))
            alert = json.loads((paths["evidence"] / "alerts.json").read_text(encoding="utf-8"))["alerts"][0]
            manifest = paths["evidence"] / "alerts" / alert["alert_id"] / "manifest.json"
            payload = json.loads(manifest.read_text(encoding="utf-8"))
            payload["risk"]["risk_score"] = 0.01
            manifest.write_text(json.dumps(payload), encoding="utf-8")
            self.assertFalse(verify_evidence_manifest(manifest))


if __name__ == "__main__":
    unittest.main()

