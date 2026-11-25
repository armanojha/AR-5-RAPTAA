from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from pathlib import Path

from drishti.models.project import ProjectRecord


@dataclass(frozen=True, slots=True)
class RowError:
    row_number: int
    message: str


class RegistryValidationError(ValueError):
    def __init__(self, errors: list[RowError]) -> None:
        self.errors = errors
        super().__init__("; ".join(f"row {error.row_number}: {error.message}" for error in errors))


class ProjectRegistry:
    def __init__(self, records: list[ProjectRecord]) -> None:
        project_ids = [record.project_id for record in records]
        duplicates = sorted({project_id for project_id in project_ids if project_ids.count(project_id) > 1})
        if duplicates:
            raise ValueError(f"duplicate project_id values: {', '.join(duplicates)}")
        self._records = tuple(records)

    @property
    def records(self) -> tuple[ProjectRecord, ...]:
        return self._records

    @classmethod
    def from_csv(cls, path: str | Path) -> "ProjectRegistry":
        source = Path(path)
        errors: list[RowError] = []
        records: list[ProjectRecord] = []

        with source.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            if reader.fieldnames is None:
                raise ValueError("CSV header is required")
            for row_number, row in enumerate(reader, start=2):
                try:
                    records.append(ProjectRecord.from_mapping(row))
                except (KeyError, ValueError) as exc:
                    errors.append(RowError(row_number=row_number, message=str(exc)))

        if errors:
            raise RegistryValidationError(errors)
        return cls(records)

    def to_json(self, path: str | Path) -> None:
        destination = Path(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema_version": "1.0",
            "record_count": len(self.records),
            "projects": [record.to_dict() for record in self.records],
        }
        destination.write_text(json.dumps(payload, indent=2), encoding="utf-8")

