from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


def _datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _key(segment_id: str, observed_at: str) -> tuple[str, datetime]:
    return segment_id, _datetime(observed_at)


@dataclass(frozen=True, slots=True)
class AnalysisRecord:
    segment_id: str
    observed_at: datetime
    activity_index: float
    observed_activity_percentile: float
    expected_activity_percentile: float | None
    activity_reporting_divergence: float | None
    reported_progress_pct: float | None
    confidence: float
    observability: str
    rainfall_mm: float
    rainfall_confounded: bool
    low_activity_streak: int
    state: str
    reasons: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "segment_id": self.segment_id,
            "observed_at": self.observed_at.isoformat(),
            "activity_index": round(self.activity_index, 4),
            "observed_activity_percentile": round(self.observed_activity_percentile, 6),
            "expected_activity_percentile": (
                round(self.expected_activity_percentile, 6)
                if self.expected_activity_percentile is not None
                else None
            ),
            "activity_reporting_divergence": (
                round(self.activity_reporting_divergence, 6)
                if self.activity_reporting_divergence is not None
                else None
            ),
            "reported_progress_pct": self.reported_progress_pct,
            "confidence": round(self.confidence, 4),
            "observability": self.observability,
            "rainfall_mm": round(self.rainfall_mm, 4),
            "rainfall_confounded": self.rainfall_confounded,
            "low_activity_streak": self.low_activity_streak,
            "state": self.state,
            "reasons": list(self.reasons),
        }


class StallDivergenceDetector:
    def __init__(
        self,
        *,
        low_activity_threshold: float = 25.0,
        consecutive_observations: int = 3,
        heavy_rainfall_mm: float = 30.0,
        minimum_confidence: float = 0.40,
        acceleration_delta: float = 10.0,
    ) -> None:
        if not 0 <= low_activity_threshold <= 100:
            raise ValueError("low_activity_threshold must be between 0 and 100")
        if consecutive_observations < 1:
            raise ValueError("consecutive_observations must be at least one")
        if heavy_rainfall_mm < 0:
            raise ValueError("heavy_rainfall_mm cannot be negative")
        if not 0 <= minimum_confidence <= 1:
            raise ValueError("minimum_confidence must be between 0 and 1")
        self.low_activity_threshold = low_activity_threshold
        self.consecutive_observations = consecutive_observations
        self.heavy_rainfall_mm = heavy_rainfall_mm
        self.minimum_confidence = minimum_confidence
        self.acceleration_delta = acceleration_delta

    def detect(
        self,
        activity_records: list[dict[str, Any]],
        feature_records: list[dict[str, Any]],
        reporting_records: list[dict[str, Any]],
    ) -> list[AnalysisRecord]:
        feature_lookup = {
            _key(str(record["segment_id"]), str(record["observed_at"])): record
            for record in feature_records
        }
        reporting_lookup = {
            _key(str(record["segment_id"]), str(record["observed_at"])): record
            for record in reporting_records
        }
        by_segment: dict[str, list[dict[str, Any]]] = {}
        for record in activity_records:
            by_segment.setdefault(str(record["segment_id"]), []).append(record)

        results: list[AnalysisRecord] = []
        for segment_id, records in sorted(by_segment.items()):
            low_streak = 0
            previous_activity: float | None = None
            for record in sorted(records, key=lambda item: _datetime(str(item["observed_at"]))):
                observed_at = _datetime(str(record["observed_at"]))
                lookup_key = (segment_id, observed_at)
                feature = feature_lookup.get(lookup_key, {})
                reporting = reporting_lookup.get(lookup_key, {})
                rainfall = float(feature.get("rainfall_mm", 0.0))
                activity_index = float(record["activity_index"])
                confidence = float(record["confidence"])
                observability = str(record["observability"])
                rainfall_confounded = rainfall >= self.heavy_rainfall_mm
                reasons: list[str] = []

                if observability == "low" or confidence < self.minimum_confidence:
                    state = "not_assessable"
                    low_streak = 0
                    reasons.append("observability or confidence is below the assessment threshold")
                elif activity_index < self.low_activity_threshold:
                    if rainfall_confounded:
                        state = "slowing"
                        low_streak = 0
                        reasons.append("low activity coincides with heavy rainfall")
                    else:
                        low_streak += 1
                        if low_streak >= self.consecutive_observations:
                            state = "stall_candidate"
                            reasons.append(
                                f"activity remained below {self.low_activity_threshold:g} for "
                                f"{low_streak} consecutive clear observations"
                            )
                        else:
                            state = "slowing"
                            reasons.append(
                                f"low activity streak {low_streak}/{self.consecutive_observations}"
                            )
                else:
                    low_streak = 0
                    delta = activity_index - previous_activity if previous_activity is not None else 0.0
                    if delta >= self.acceleration_delta:
                        state = "accelerating"
                        reasons.append(f"activity increased by {delta:.1f} points")
                    elif delta <= -self.acceleration_delta:
                        state = "slowing"
                        reasons.append(f"activity decreased by {abs(delta):.1f} points")
                    else:
                        state = "active"
                        reasons.append("activity is above the low-activity threshold")

                expected_value = reporting.get("expected_activity_percentile")
                expected = float(expected_value) if expected_value is not None else None
                if expected is not None and not 0 <= expected <= 1:
                    raise ValueError("expected_activity_percentile must be between 0 and 1")
                observed_percentile = activity_index / 100.0
                divergence = expected - observed_percentile if expected is not None else None
                reported_value = reporting.get("reported_progress_pct")
                reported_progress = float(reported_value) if reported_value is not None else None
                if reported_progress is not None and not 0 <= reported_progress <= 100:
                    raise ValueError("reported_progress_pct must be between 0 and 100")

                results.append(
                    AnalysisRecord(
                        segment_id=segment_id,
                        observed_at=observed_at,
                        activity_index=activity_index,
                        observed_activity_percentile=observed_percentile,
                        expected_activity_percentile=expected,
                        activity_reporting_divergence=divergence,
                        reported_progress_pct=reported_progress,
                        confidence=confidence,
                        observability=observability,
                        rainfall_mm=rainfall,
                        rainfall_confounded=rainfall_confounded,
                        low_activity_streak=low_streak,
                        state=state,
                        reasons=tuple(reasons),
                    )
                )
                previous_activity = activity_index
        return results


def run_stall_divergence(
    activity_path: str | Path,
    features_path: str | Path,
    reporting_path: str | Path,
    output_path: str | Path,
    *,
    detector: StallDivergenceDetector | None = None,
) -> list[AnalysisRecord]:
    activity = json.loads(Path(activity_path).read_text(encoding="utf-8"))
    features = json.loads(Path(features_path).read_text(encoding="utf-8"))
    reporting = json.loads(Path(reporting_path).read_text(encoding="utf-8"))
    engine = detector or StallDivergenceDetector()
    results = engine.detect(
        activity_records=list(activity.get("records", [])),
        feature_records=list(features.get("records", [])),
        reporting_records=list(reporting.get("records", [])),
    )
    if not results:
        raise ValueError("no activity records were available for analysis")
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "schema_version": "1.0",
        "method": "chronological-rule-v1",
        "interpretation": (
            "divergence compares expected and observed activity percentiles; "
            "it does not subtract reported completion from the Satellite Activity Index"
        ),
        "policy": {
            "low_activity_threshold": engine.low_activity_threshold,
            "consecutive_observations": engine.consecutive_observations,
            "heavy_rainfall_mm": engine.heavy_rainfall_mm,
            "minimum_confidence": engine.minimum_confidence,
        },
        "record_count": len(results),
        "records": [record.to_dict() for record in results],
    }
    destination.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return results

