from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date
from enum import Enum
from typing import Any


class DataClassification(str, Enum):
    REAL = "real"
    SYNTHETIC = "synthetic"
    MIXED = "mixed"


def _required_text(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError(f"{field_name} is required")
    return cleaned


def _optional_date(value: str | date | None) -> date | None:
    if value is None or value == "":
        return None
    return value if isinstance(value, date) else date.fromisoformat(value)


def _required_date(value: str | date, field_name: str) -> date:
    parsed = _optional_date(value)
    if parsed is None:
        raise ValueError(f"{field_name} is required")
    return parsed


def _number(value: str | int | float, field_name: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be numeric") from exc


@dataclass(frozen=True, slots=True)
class ProjectRecord:
    project_id: str
    name: str
    sector: str
    ministry: str
    sanctioned_cost_inr: float
    latest_cost_inr: float
    start_date: date
    planned_end_date: date
    revised_end_date: date | None
    reported_progress_pct: float
    spend_to_date_inr: float
    source_url: str
    source_as_of: date
    data_classification: DataClassification

    def __post_init__(self) -> None:
        for field_name in ("project_id", "name", "sector", "ministry", "source_url"):
            object.__setattr__(self, field_name, _required_text(getattr(self, field_name), field_name))

        if self.sanctioned_cost_inr <= 0:
            raise ValueError("sanctioned_cost_inr must be greater than zero")
        if self.latest_cost_inr < 0 or self.spend_to_date_inr < 0:
            raise ValueError("cost and spending values cannot be negative")
        if not 0 <= self.reported_progress_pct <= 100:
            raise ValueError("reported_progress_pct must be between 0 and 100")
        if self.planned_end_date < self.start_date:
            raise ValueError("planned_end_date cannot be before start_date")
        if self.revised_end_date is not None and self.revised_end_date < self.start_date:
            raise ValueError("revised_end_date cannot be before start_date")

    @classmethod
    def from_mapping(cls, row: dict[str, Any]) -> "ProjectRecord":
        try:
            classification = DataClassification(str(row["data_classification"]).strip().lower())
        except KeyError as exc:
            raise ValueError("data_classification is required") from exc
        except ValueError as exc:
            raise ValueError("data_classification must be real, synthetic or mixed") from exc

        return cls(
            project_id=str(row.get("project_id", "")),
            name=str(row.get("name", "")),
            sector=str(row.get("sector", "")),
            ministry=str(row.get("ministry", "")),
            sanctioned_cost_inr=_number(row.get("sanctioned_cost_inr", ""), "sanctioned_cost_inr"),
            latest_cost_inr=_number(row.get("latest_cost_inr", ""), "latest_cost_inr"),
            start_date=_required_date(row.get("start_date", ""), "start_date"),
            planned_end_date=_required_date(row.get("planned_end_date", ""), "planned_end_date"),
            revised_end_date=_optional_date(row.get("revised_end_date")),
            reported_progress_pct=_number(row.get("reported_progress_pct", ""), "reported_progress_pct"),
            spend_to_date_inr=_number(row.get("spend_to_date_inr", ""), "spend_to_date_inr"),
            source_url=str(row.get("source_url", "")),
            source_as_of=_required_date(row.get("source_as_of", ""), "source_as_of"),
            data_classification=classification,
        )

    @property
    def cost_overrun_pct(self) -> float:
        return ((self.latest_cost_inr - self.sanctioned_cost_inr) / self.sanctioned_cost_inr) * 100

    @property
    def expenditure_pct(self) -> float:
        return (self.spend_to_date_inr / self.latest_cost_inr) * 100 if self.latest_cost_inr else 0.0

    def to_dict(self) -> dict[str, Any]:
        result = asdict(self)
        result["start_date"] = self.start_date.isoformat()
        result["planned_end_date"] = self.planned_end_date.isoformat()
        result["revised_end_date"] = self.revised_end_date.isoformat() if self.revised_end_date else None
        result["source_as_of"] = self.source_as_of.isoformat()
        result["data_classification"] = self.data_classification.value
        result["cost_overrun_pct"] = round(self.cost_overrun_pct, 4)
        result["expenditure_pct"] = round(self.expenditure_pct, 4)
        return result

