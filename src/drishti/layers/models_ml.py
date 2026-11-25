from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Sequence

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import brier_score_loss


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


def _ts(v: Any) -> str:
    return str(v).replace("Z", "+00:00")


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
    Train a monotonic-constrained HistGradientBoostingClassifier wrapped in
    CalibratedClassifierCV (Platt / sigmoid probability calibration) on strictly
    pre-cutoff observations. Missing optical/SAR sensors are passed as native NaNs
    for HistGradientBoosting's native missing-value split routing.
    """
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
    # Domain-physics monotonic constraints:
    # -1 = higher value lowers stall risk (activity_index, rainfall confounder, bsi_change earthworks)
    # +1 = higher value increases stall risk (divergence, streak, ndvi regrowth/non-clearing, spend ratio)
    #  0 = unconstrained
    monotonic_cst = [-1, 1, 1, -1, 0, 0, -1, 1, 0, 1]

    def _opt_float(val: Any) -> float:
        return float(val) if val is not None else float("nan")

    def _vectorize(rec: dict[str, Any]) -> list[float]:
        f = feat_lookup.get((rec["segment_id"], _ts(rec["observed_at"])), {})
        return [
            float(rec.get("activity_index", 0.0)),
            _opt_float(rec.get("activity_reporting_divergence")),
            float(rec.get("low_activity_streak", 0)),
            float(rec.get("rainfall_mm", 0.0)),
            float(rec.get("confidence", 0.5)),
            _obs_to_num(str(rec.get("observability", "medium"))),
            _opt_float(f.get("bsi_change")),
            _opt_float(f.get("ndvi_change")),
            _opt_float(f.get("vv_change_db")),
            _opt_float(rec.get("spend_vs_activity_ratio")),
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
        return {
            "model_type": "HistGradientBoostingClassifier + CalibratedClassifierCV (insufficient split labels fallback)",
            "training_samples": len(X_train),
            "monotonic_constraints": dict(zip(feature_names, monotonic_cst)),
            "calibration_method": None,
            "brier_score": None,
            "feature_importances": {},
            "probability_map": {},
            "predictions": [],
        }

    X_train_np = np.asarray(X_train, dtype=np.float64)
    y_cls_np = np.asarray(y_cls, dtype=np.int64)
    y_reg_np = np.asarray(y_reg, dtype=np.float64)
    X_all_np = np.asarray(X_all, dtype=np.float64)

    base_clf = HistGradientBoostingClassifier(
        max_iter=80,
        max_depth=3,
        min_samples_leaf=3,
        l2_regularization=1.0,
        monotonic_cst=monotonic_cst,
        early_stopping=False,
        random_state=42,
    )

    min_class_count = min(int(np.sum(y_cls_np == 0)), int(np.sum(y_cls_np == 1)))
    if min_class_count >= 3:
        cal_cv = 3
        cal_method = "sigmoid (Platt 3-fold CV)"
        clf = CalibratedClassifierCV(estimator=base_clf, method="sigmoid", cv=cal_cv)
        clf.fit(X_train_np, y_cls_np)
    elif min_class_count >= 2:
        cal_cv = 2
        cal_method = "sigmoid (Platt 2-fold CV)"
        clf = CalibratedClassifierCV(estimator=base_clf, method="sigmoid", cv=cal_cv)
        clf.fit(X_train_np, y_cls_np)
    else:
        cal_method = "uncalibrated (single-minority-sample fallback)"
        clf = base_clf
        clf.fit(X_train_np, y_cls_np)

    reg = HistGradientBoostingRegressor(
        max_iter=80,
        max_depth=3,
        min_samples_leaf=3,
        l2_regularization=1.0,
        early_stopping=False,
        random_state=42,
    )
    reg.fit(X_train_np, y_reg_np)

    train_probs = clf.predict_proba(X_train_np)[:, 1]
    brier = round(float(brier_score_loss(y_cls_np, train_probs)), 4)

    probs = clf.predict_proba(X_all_np)[:, 1]
    pred_sai = reg.predict(X_all_np)

    perm = permutation_importance(clf, X_train_np, y_cls_np, n_repeats=5, random_state=42)
    raw_imp = np.maximum(perm.importances_mean, 0.0)
    imp_sum = float(np.sum(raw_imp))
    norm_imp = (raw_imp / imp_sum) if imp_sum > 0 else raw_imp
    importances = {
        name: round(float(imp), 4)
        for name, imp in sorted(zip(feature_names, norm_imp), key=lambda kv: kv[1], reverse=True)
    }

    probability_map: dict[tuple[str, str], float] = {}
    predictions: list[dict[str, Any]] = []
    for rec, p, ps in zip(meta_all, probs, pred_sai):
        prob_val = round(float(p), 4)
        probability_map[(rec["segment_id"], _ts(rec["observed_at"]))] = prob_val
        predictions.append(
            {
                "segment_id": rec["segment_id"],
                "observed_at": rec["observed_at"],
                "calibrated_delay_probability": prob_val,
                "gbdt_predicted_sai": round(float(np.clip(ps, 0.0, 100.0)), 2),
            }
        )

    return {
        "model_type": "HistGradientBoostingClassifier (monotonic_cst + native NaN) + CalibratedClassifierCV",
        "training_samples": len(X_train),
        "positive_samples": int(np.sum(y_cls_np)),
        "cutoff_date": cutoff_date,
        "calibration_method": cal_method,
        "brier_score": brier,
        "monotonic_constraints": dict(zip(feature_names, monotonic_cst)),
        "feature_importances": importances,
        "probability_map": probability_map,
        "predictions": predictions,
    }
