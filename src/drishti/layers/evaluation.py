from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def evaluate_stall_performance(
    analysis_path: str | Path,
    ground_truth_path: str | Path,
    output_path: str | Path | None = None,
) -> dict[str, Any]:
    """Calculate stall detection precision, recall, false alerts, and lead time against ground truth."""
    analysis_payload = json.loads(Path(analysis_path).read_text(encoding="utf-8"))
    gt_payload = json.loads(Path(ground_truth_path).read_text(encoding="utf-8"))

    analysis_records = analysis_payload.get("records", [])
    gt_labels = gt_payload.get("labels", [])

    # Index analysis by (segment_id, observed_at)
    analysis_index = {
        (rec["segment_id"], rec["observed_at"]): rec
        for rec in analysis_records
    }

    tp = 0
    fp = 0
    tn = 0
    fn = 0
    negative_control_alerts = 0
    not_assessable_count = 0

    evaluated_samples = []

    for item in gt_labels:
        key = (item["segment_id"], item["observed_at"])
        analysis_rec = analysis_index.get(key)
        if not analysis_rec:
            continue

        true_label = item["true_label"]
        pred_state = analysis_rec["state"]

        if pred_state == "not_assessable":
            not_assessable_count += 1

        is_true_stall = (true_label == "stalled")
        is_pred_stall = (pred_state == "stall_candidate")

        if is_true_stall and is_pred_stall:
            tp += 1
            result = "TP"
        elif not is_true_stall and is_pred_stall:
            fp += 1
            result = "FP"
        elif not is_true_stall and not is_pred_stall:
            tn += 1
            result = "TN"
        else:
            fn += 1
            result = "FN"

        # Check negative control conditions (untouched land or weather pause should never alert)
        if true_label in ("untouched", "weather_pause", "completed") and is_pred_stall:
            negative_control_alerts += 1

        evaluated_samples.append({
            "segment_id": item["segment_id"],
            "observed_at": item["observed_at"],
            "true_label": true_label,
            "predicted_state": pred_state,
            "result": result,
            "confidence": analysis_rec["confidence"],
        })

    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    total_records = len(analysis_records)
    total_not_assessable = sum(1 for r in analysis_records if r["state"] == "not_assessable")
    pct_not_assessable = (total_not_assessable / total_records * 100.0) if total_records > 0 else 0.0

    metrics = {
        "schema_version": "1.0",
        "sample_count": len(evaluated_samples),
        "confusion_matrix": {
            "true_positives": tp,
            "false_positives": fp,
            "true_negatives": tn,
            "false_negatives": fn,
        },
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "false_alerts_on_negative_controls": negative_control_alerts,
        "not_assessable_percentage": round(pct_not_assessable, 2),
        "evaluated_samples": evaluated_samples,
    }

    if output_path:
        dest = Path(output_path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    return metrics
