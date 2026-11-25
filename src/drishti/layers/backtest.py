from __future__ import annotations

import json
import statistics
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any


def _datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _clip(value: float) -> float:
    return max(0.0, min(1.0, value))


@dataclass(frozen=True, slots=True)
class RiskRecord:
    segment_id: str
    observed_at: datetime
    risk_score: float
    alert: bool
    divergence_component: float
    stall_component: float
    inactivity_component: float
    confidence: float
    state: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "segment_id": self.segment_id,
            "observed_at": self.observed_at.isoformat(),
            "risk_score": round(self.risk_score, 6),
            "alert": self.alert,
            "divergence_component": round(self.divergence_component, 6),
            "stall_component": round(self.stall_component, 6),
            "inactivity_component": round(self.inactivity_component, 6),
            "confidence": round(self.confidence, 4),
            "state": self.state,
        }


@dataclass(frozen=True, slots=True)
class BacktestCase:
    case_id: str
    segment_id: str
    official_delay_date: date
    first_alert_date: date | None
    lead_time_days: int | None
    outcome: str
    eligible_observation_count: int
    source_url: str
    data_classification: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "case_id": self.case_id,
            "segment_id": self.segment_id,
            "official_delay_date": self.official_delay_date.isoformat(),
            "first_alert_date": self.first_alert_date.isoformat() if self.first_alert_date else None,
            "lead_time_days": self.lead_time_days,
            "outcome": self.outcome,
            "eligible_observation_count": self.eligible_observation_count,
            "source_url": self.source_url,
            "data_classification": self.data_classification,
        }


class DelayRiskScorer:
    def __init__(self, *, alert_threshold: float = 0.65) -> None:
        if not 0 <= alert_threshold <= 1:
            raise ValueError("alert_threshold must be between 0 and 1")
        self.alert_threshold = alert_threshold

    def score(self, record: dict[str, Any]) -> RiskRecord:
        divergence = record.get("activity_reporting_divergence")
        divergence_component = _clip(max(float(divergence or 0.0), 0.0) / 0.50)
        state = str(record["state"])
        stall_component = {
            "stall_candidate": 1.0,
            "slowing": 0.5,
            "active": 0.0,
            "accelerating": 0.0,
            "not_assessable": 0.0,
        }.get(state, 0.0)
        inactivity_component = _clip(1.0 - float(record["observed_activity_percentile"]))
        confidence = _clip(float(record["confidence"]))
        risk_score = (
            (0.45 * divergence_component)
            + (0.35 * stall_component)
            + (0.20 * inactivity_component)
        ) * confidence
        alert = state != "not_assessable" and risk_score >= self.alert_threshold
        return RiskRecord(
            segment_id=str(record["segment_id"]),
            observed_at=_datetime(str(record["observed_at"])),
            risk_score=risk_score,
            alert=alert,
            divergence_component=divergence_component,
            stall_component=stall_component,
            inactivity_component=inactivity_component,
            confidence=confidence,
            state=state,
        )


def run_backtest(
    analysis_path: str | Path,
    labels_path: str | Path,
    output_path: str | Path,
    *,
    scorer: DelayRiskScorer | None = None,
) -> tuple[list[RiskRecord], list[BacktestCase]]:
    analysis = json.loads(Path(analysis_path).read_text(encoding="utf-8"))
    labels = json.loads(Path(labels_path).read_text(encoding="utf-8"))
    engine = scorer or DelayRiskScorer()
    risk_records = [engine.score(record) for record in analysis.get("records", [])]
    by_segment: dict[str, list[RiskRecord]] = {}
    for record in risk_records:
        by_segment.setdefault(record.segment_id, []).append(record)

    cases: list[BacktestCase] = []
    for label in labels.get("cases", []):
        case_id = str(label.get("case_id", "")).strip()
        segment_id = str(label.get("segment_id", "")).strip()
        if not case_id or not segment_id:
            raise ValueError("each back-test case requires case_id and segment_id")
        official_date = date.fromisoformat(str(label["official_delay_date"]))
        eligible = sorted(
            [record for record in by_segment.get(segment_id, []) if record.observed_at.date() < official_date],
            key=lambda record: record.observed_at,
        )
        first_alert = next((record for record in eligible if record.alert), None)
        if first_alert:
            first_alert_date = first_alert.observed_at.date()
            lead_time_days = (official_date - first_alert_date).days
            outcome = "detected_before_official_flag"
        elif eligible:
            first_alert_date = None
            lead_time_days = None
            outcome = "missed"
        else:
            first_alert_date = None
            lead_time_days = None
            outcome = "no_eligible_observations"
        cases.append(
            BacktestCase(
                case_id=case_id,
                segment_id=segment_id,
                official_delay_date=official_date,
                first_alert_date=first_alert_date,
                lead_time_days=lead_time_days,
                outcome=outcome,
                eligible_observation_count=len(eligible),
                source_url=str(label.get("source_url", "")),
                data_classification=str(label.get("data_classification", "unknown")),
            )
        )

    if not cases:
        raise ValueError("back-test labels contain no cases")
    detected = [case for case in cases if case.outcome == "detected_before_official_flag"]
    lead_times = [case.lead_time_days for case in detected if case.lead_time_days is not None]
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "schema_version": "1.0",
        "method": "chronological-case-study-v1",
        "interpretation": "explainable risk score for case-study validation, not a calibrated probability",
        "alert_threshold": engine.alert_threshold,
        "score_weights": {"divergence": 0.45, "stall_state": 0.35, "inactivity": 0.20},
        "risk_records": [record.to_dict() for record in risk_records],
        "cases": [case.to_dict() for case in cases],
        "summary": {
            "case_count": len(cases),
            "detected_count": len(detected),
            "detection_rate": len(detected) / len(cases),
            "median_lead_time_days": statistics.median(lead_times) if lead_times else None,
        },
    }
    destination.write_text(json.dumps(output, indent=2), encoding="utf-8")
    return risk_records, cases

