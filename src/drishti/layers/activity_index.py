from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from drishti.layers.features import FeatureRecord


DEFAULT_WEIGHTS = {
    "vegetation_clearance": 0.15,
    "bare_soil_activity": 0.20,
    "built_up_activity": 0.20,
    "brightness_activity": 0.10,
    "vv_activity": 0.10,
    "vh_activity": 0.10,
    "linear_continuity": 0.15,
}

OBSERVABILITY_FACTORS = {"high": 1.0, "medium": 0.75, "low": 0.40}


def _clip(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def _positive_scaled(value: float | None, scale: float) -> float | None:
    return _clip(value / scale) if value is not None else None


def _absolute_scaled(value: float | None, scale: float) -> float | None:
    return _clip(abs(value) / scale) if value is not None else None


@dataclass(frozen=True, slots=True)
class ActivityComponent:
    name: str
    raw_value: float
    normalized_value: float
    configured_weight: float
    effective_weight: float
    contribution: float

    def to_dict(self) -> dict[str, float | str]:
        return {
            "name": self.name,
            "raw_value": round(self.raw_value, 6),
            "normalized_value": round(self.normalized_value, 6),
            "configured_weight": round(self.configured_weight, 6),
            "effective_weight": round(self.effective_weight, 6),
            "contribution": round(self.contribution, 6),
        }


@dataclass(frozen=True, slots=True)
class ActivityRecord:
    segment_id: str
    observed_at: str
    activity_index: float
    confidence: float
    observability: str
    available_weight_fraction: float
    components: tuple[ActivityComponent, ...]
    model_version: str = "sai-v1"

    def to_dict(self) -> dict[str, Any]:
        return {
            "segment_id": self.segment_id,
            "observed_at": self.observed_at,
            "activity_index": round(self.activity_index, 4),
            "confidence": round(self.confidence, 4),
            "observability": self.observability,
            "available_weight_fraction": round(self.available_weight_fraction, 4),
            "components": [component.to_dict() for component in self.components],
            "model_version": self.model_version,
        }


class ActivityIndexModel:
    def __init__(self, weights: dict[str, float] | None = None) -> None:
        self.weights = dict(weights or DEFAULT_WEIGHTS)
        if set(self.weights) != set(DEFAULT_WEIGHTS):
            raise ValueError("activity weights must define every SAI component exactly once")
        if any(not math.isfinite(value) or value < 0 for value in self.weights.values()):
            raise ValueError("activity weights must be finite and non-negative")
        if not math.isclose(sum(self.weights.values()), 1.0, abs_tol=1e-9):
            raise ValueError("activity weights must sum to 1.0")

    def _signals(self, record: FeatureRecord) -> dict[str, tuple[float | None, float | None]]:
        vegetation_raw = -record.ndvi_change if record.ndvi_change is not None else None
        return {
            "vegetation_clearance": (vegetation_raw, _positive_scaled(vegetation_raw, 0.25)),
            "bare_soil_activity": (record.bsi_change, _positive_scaled(record.bsi_change, 0.25)),
            "built_up_activity": (record.ndbi_change, _positive_scaled(record.ndbi_change, 0.20)),
            "brightness_activity": (
                record.brightness_change,
                _absolute_scaled(record.brightness_change, 0.15),
            ),
            "vv_activity": (record.vv_change_db, _absolute_scaled(record.vv_change_db, 3.0)),
            "vh_activity": (record.vh_change_db, _absolute_scaled(record.vh_change_db, 3.0)),
            "linear_continuity": (
                record.linear_continuity,
                _clip(record.linear_continuity) if record.linear_continuity is not None else None,
            ),
        }

    def score(self, record: FeatureRecord, *, observability: str) -> ActivityRecord:
        if observability not in OBSERVABILITY_FACTORS:
            raise ValueError("observability must be high, medium or low")
        if not 0 <= record.valid_pixel_fraction <= 1:
            raise ValueError("valid_pixel_fraction must be between 0 and 1")
        if record.linear_continuity is not None and not 0 <= record.linear_continuity <= 1:
            raise ValueError("linear_continuity must be between 0 and 1")
        signals = self._signals(record)
        available_names = [name for name, (_, normalized) in signals.items() if normalized is not None]
        available_weight = sum(self.weights[name] for name in available_names)
        if available_weight <= 0:
            raise ValueError("feature record has no activity signals")

        components: list[ActivityComponent] = []
        score = 0.0
        for name in available_names:
            raw_value, normalized_value = signals[name]
            assert raw_value is not None and normalized_value is not None
            effective_weight = self.weights[name] / available_weight
            contribution = normalized_value * effective_weight
            score += contribution
            components.append(
                ActivityComponent(
                    name=name,
                    raw_value=raw_value,
                    normalized_value=normalized_value,
                    configured_weight=self.weights[name],
                    effective_weight=effective_weight,
                    contribution=contribution,
                )
            )

        completeness_factor = 0.5 + (0.5 * available_weight)
        confidence = _clip(
            record.valid_pixel_fraction * OBSERVABILITY_FACTORS[observability] * completeness_factor
        )
        return ActivityRecord(
            segment_id=record.segment_id,
            observed_at=record.observed_at.isoformat(),
            activity_index=score * 100,
            confidence=confidence,
            observability=observability,
            available_weight_fraction=available_weight,
            components=tuple(components),
        )


def _observability_map(segments_path: str | Path) -> dict[str, str]:
    payload = json.loads(Path(segments_path).read_text(encoding="utf-8"))
    result = {
        str((feature.get("properties") or {}).get("segment_id") or feature.get("id")): str(
            (feature.get("properties") or {}).get("observability", "")
        )
        for feature in payload.get("features", [])
    }
    if not result:
        raise ValueError("segments GeoJSON contains no segments")
    return result


def score_feature_manifest(
    features_path: str | Path,
    segments_path: str | Path,
    output_path: str | Path,
    *,
    model: ActivityIndexModel | None = None,
) -> list[ActivityRecord]:
    feature_payload = json.loads(Path(features_path).read_text(encoding="utf-8"))
    observability = _observability_map(segments_path)
    scorer = model or ActivityIndexModel()
    results: list[ActivityRecord] = []
    for payload in feature_payload.get("records", []):
        record = FeatureRecord.from_dict(payload)
        if record.segment_id not in observability:
            raise ValueError(f"segment {record.segment_id} is missing from segments GeoJSON")
        results.append(scorer.score(record, observability=observability[record.segment_id]))
    if not results:
        raise ValueError("feature manifest contains no records")

    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "schema_version": "1.0",
        "model_version": "sai-v1",
        "interpretation": "relative observable surface activity, not engineering completion percentage",
        "weights": scorer.weights,
        "normalization_scales": {
            "vegetation_clearance": 0.25,
            "bare_soil_activity": 0.25,
            "built_up_activity": 0.20,
            "brightness_activity": 0.15,
            "vv_activity_db": 3.0,
            "vh_activity_db": 3.0,
            "linear_continuity": 1.0,
        },
        "record_count": len(results),
        "records": [result.to_dict() for result in results],
    }
    destination.write_text(json.dumps(output, indent=2), encoding="utf-8")
    return results

