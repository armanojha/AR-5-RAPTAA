from __future__ import annotations

import csv
import json
import tempfile
import unittest
from pathlib import Path

from drishti.layers.project_registry import ProjectRegistry, RegistryValidationError
from drishti.models.project import ProjectRecord


VALID_ROW = {
    "project_id": "P-001",
    "name": "Test Corridor",
    "sector": "railway",
    "ministry": "Test Agency",
    "sanctioned_cost_inr": "1000",
    "latest_cost_inr": "1200",
    "start_date": "2024-01-01",
    "planned_end_date": "2026-01-01",
    "revised_end_date": "2026-06-01",
    "reported_progress_pct": "50",
    "spend_to_date_inr": "600",
    "source_url": "https://example.invalid/source",
    "source_as_of": "2026-11-25",
    "data_classification": "synthetic",
}


class ProjectRecordTests(unittest.TestCase):
    def test_derives_cost_and_expenditure_percentages(self) -> None:
        record = ProjectRecord.from_mapping(VALID_ROW)
        self.assertEqual(record.cost_overrun_pct, 20.0)
        self.assertEqual(record.expenditure_pct, 50.0)

    def test_rejects_progress_outside_percentage_range(self) -> None:
        row = dict(VALID_ROW, reported_progress_pct="101")
        with self.assertRaisesRegex(ValueError, "between 0 and 100"):
            ProjectRecord.from_mapping(row)

    def test_rejects_invalid_date_order(self) -> None:
        row = dict(VALID_ROW, planned_end_date="2023-12-31")
        with self.assertRaisesRegex(ValueError, "before start_date"):
            ProjectRecord.from_mapping(row)


class ProjectRegistryTests(unittest.TestCase):
    def _write_csv(self, directory: Path, rows: list[dict[str, str]]) -> Path:
        path = directory / "projects.csv"
        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(VALID_ROW))
            writer.writeheader()
            writer.writerows(rows)
        return path

    def test_loads_and_exports_normalized_json(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            registry = ProjectRegistry.from_csv(self._write_csv(directory, [VALID_ROW]))
            output = directory / "projects.json"
            registry.to_json(output)
            payload = json.loads(output.read_text(encoding="utf-8"))

        self.assertEqual(payload["record_count"], 1)
        self.assertEqual(payload["projects"][0]["data_classification"], "synthetic")
        self.assertEqual(payload["projects"][0]["cost_overrun_pct"], 20.0)

    def test_reports_source_row_for_invalid_record(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            path = self._write_csv(directory, [dict(VALID_ROW, sanctioned_cost_inr="0")])
            with self.assertRaises(RegistryValidationError) as context:
                ProjectRegistry.from_csv(path)

        self.assertEqual(context.exception.errors[0].row_number, 2)

    def test_rejects_duplicate_ids(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            path = self._write_csv(directory, [VALID_ROW, VALID_ROW])
            with self.assertRaisesRegex(ValueError, "duplicate project_id"):
                ProjectRegistry.from_csv(path)


if __name__ == "__main__":
    unittest.main()

