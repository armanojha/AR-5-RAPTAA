from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor


def detect_cusum_breaks(
    values: Sequence[float],
    *,
    baseline_count: int = 3,
    drift_sigma: float = 0.5,
    threshold_sigma: float = 2.0,
) -> dict[str, Any]:
    """CUSUM structural break detector on BSI / NDBI / SAR time series."""
    arr = np.asarray(values, dtype=np.float64)
    if len(arr) < max(baseline_count + 1, 3):
        return {"upward_break_index": None, "downward_break_index": None, "cusum_pos": [], "cusum_neg": []}

    base = arr[:baseline_count]
    mu = float(np.mean(base))
    sigma = max(float(np.std(base)), 0.02)
    k = drift_sigma * sigma
    h = threshold_sigma * sigma

    s_pos = 0.0
    s_neg = 0.0
    pos_series: list[float] = []
    neg_series: list[float] = []
    up_idx: int | None = None
    down_idx: int | None = None

    for idx, val in enumerate(arr):
        s_pos = max(0.0, s_pos + (float(val) - mu) - k)
        s_neg = max(0.0, s_neg + (mu - float(val)) - k)
        pos_series.append(round(s_pos, 4))
        neg_series.append(round(s_neg, 4))
        if idx >= baseline_count:
            if up_idx is None and s_pos > h:
                up_idx = idx
            if down_idx is None and s_neg > h:
                down_idx = idx

    return {
        "baseline_mean": round(mu, 4),
        "baseline_std": round(sigma, 4),
        "upward_break_index": up_idx,
        "downward_break_index": down_idx,
        "cusum_pos": pos_series,
        "cusum_neg": neg_series,
    }


def _obs_to_num(obs: str) -> float:
    return {"high": 1.0, "medium": 0.65, "low": 0.25}.get(obs, 0.5)


@dataclass
class LearnedDelayRiskResult:
    segment_id: str
    observed_at: str
    delay_probability: float
    predicted_completion_days_delta: float
    feature_importances: dict[str, float]


def train_and_predict_delay_risk(
    analysis_records: list[dict[str, Any]],
    feature_records: list[dict[str, Any]],
    ground_truth_labels: list[dict[str, Any]],
    *,
    cutoff_date: str | None = None,
) -> dict[str, Any]:
    """
    Train a GradientBoostingClassifier on chronological pre-cutoff observations to estimate
    calibrated delay/stall probability, and GradientBoostingRegressor for SAI activity calibration.
    Strictly excludes observations on or after cutoff_date from training to prevent leakage.
    """
    def _ts(v: Any) -> str:
        return str(v).replace("Z", "+00:00")

    feat_lookup = {(r["segment_id"], _ts(r["observed_at"])): r for r in feature_records}
    gt_lookup = {(r["segment_id"], _ts(r["observed_at"])): r["true_label"] for r in ground_truth_labels}

    feature_names = [
        "activity_index",
        "divergence",
        "low_activity_streak",
        "rainfall_mm",
        "confidence",
        "observability_score",
        "bsi_change",
        "ndvi_change",
        "vv_change_db",
        "spend_vs_activity_ratio",
    ]

    def _vectorize(rec: dict[str, Any]) -> list[float]:
        f = feat_lookup.get((rec["segment_id"], _ts(rec["observed_at"])), {})
        return [
            float(rec.get("activity_index", 0.0)),
            float(rec.get("activity_reporting_divergence") or 0.0),
            float(rec.get("low_activity_streak", 0)),
            float(rec.get("rainfall_mm", 0.0)),
            float(rec.get("confidence", 0.5)),
            _obs_to_num(str(rec.get("observability", "medium"))),
            float(f.get("bsi_change") or 0.0),
            float(f.get("ndvi_change") or 0.0),
            float(f.get("vv_change_db") or 0.0),
            float(rec.get("spend_vs_activity_ratio") or 1.0),
        ]

    X_train, y_cls, y_reg = [], [], []
    X_all, meta_all = [], []

    for rec in analysis_records:
        vec = _vectorize(rec)
        X_all.append(vec)
        meta_all.append(rec)

        key = (rec["segment_id"], _ts(rec["observed_at"]))
        label = gt_lookup.get(key)
        is_before_cutoff = cutoff_date is None or str(rec["observed_at"])[:10] < cutoff_date
        if label is not None and is_before_cutoff:
            X_train.append(vec)
            y_cls.append(1 if label == "stalled" else 0)
            y_reg.append(float(rec.get("activity_index", 0.0)))

    if len(X_train) < 6 or len(set(y_cls)) < 2:
        # Fallback if labels don't cover both classes before cutoff
        return {
            "model_type": "GradientBoostingClassifier+Regressor (insufficient split labels fallback)",
            "training_samples": len(X_train),
            "feature_importances": {},
            "predictions": [],
        }

    clf = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)
    clf.fit(np.asarray(X_train), np.asarray(y_cls))

    reg = GradientBoostingRegressor(n_estimators=50, max_depth=3, random_state=42)
    reg.fit(np.asarray(X_train), np.asarray(y_reg))

    probs = clf.predict_proba(np.asarray(X_all))[:, 1]
    pred_sai = reg.predict(np.asarray(X_all))
    importances = {
        name: round(float(imp), 4)
        for name, imp in sorted(zip(feature_names, clf.feature_importances_), key=lambda kv: kv[1], reverse=True)
    }

    predictions = [
        {
            "segment_id": rec["segment_id"],
            "observed_at": rec["observed_at"],
            "delay_probability": round(float(p), 4),
            "gbdt_predicted_sai": round(float(np.clip(ps, 0.0, 100.0)), 2),
        }
        for rec, p, ps in zip(meta_all, probs, pred_sai)
    ]

    return {
        "model_type": "scikit-learn GradientBoostingClassifier + GradientBoostingRegressor",
        "training_samples": len(X_train),
        "positive_samples": int(sum(y_cls)),
        "cutoff_date": cutoff_date,
        "feature_importances": importances,
        "predictions": predictions,
    }
