from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import numpy as np

from drishti.layers.models_ml import detect_cusum_breaks, train_and_predict_delay_risk
from drishti.layers.pdf_report import export_alert_pdf
from drishti.layers.raster import (
    compute_slope_degrees,
    compute_water_and_sand_indices,
    lee_speckle_filter,
    sigma_to_db,
    summarize_worldcover,
)
from drishti.layers.stall_divergence import StallDivergenceDetector


class UpgradesTests(unittest.TestCase):
    def test_sar_lee_speckle_and_context_helpers(self) -> None:
        rng = np.random.default_rng(7)
        sar_lin = np.clip(0.1 + rng.normal(0, 0.03, (32, 32)), 0.001, 1.0).astype(np.float32)
        filtered = lee_speckle_filter(sar_lin, window_size=5, is_db=False)
        self.assertEqual(filtered.shape, sar_lin.shape)
        self.assertLessEqual(float(np.std(filtered)), float(np.std(sar_lin)))

        db = sigma_to_db(filtered)
        self.assertTrue(np.all(db < 0))

        dem = np.tile(np.arange(32, dtype=np.float32), (32, 1)) * 5.0
        slope = compute_slope_degrees(dem, pixel_size_m=10.0)
        self.assertGreater(float(np.mean(slope)), 20.0)

        wc = np.array([[10, 50], [40, 80]], dtype=np.uint8)
        wc_sum = summarize_worldcover(wc)
        self.assertEqual(wc_sum["tree_cover_frac"], 0.25)
        self.assertEqual(wc_sum["built_up_baseline_frac"], 0.25)

        ws = compute_water_and_sand_indices(
            np.full((4, 4), 0.2, dtype=np.float32),
            np.full((4, 4), 0.15, dtype=np.float32),
            np.full((4, 4), 0.05, dtype=np.float32),
            np.full((4, 4), 0.25, dtype=np.float32),
        )
        self.assertGreater(float(np.mean(ws["ndwi"])), 0.0)

    def test_cusum_ml_and_spend_ratio(self) -> None:
        breaks = detect_cusum_breaks([0.1, 0.11, 0.09, 0.35, 0.38, 0.40], baseline_count=3)
        self.assertEqual(breaks["upward_break_index"], 3)

        det = StallDivergenceDetector(low_activity_threshold=30.0, consecutive_observations=2)
        act = [
            {"segment_id": "S1", "observed_at": "2024-01-01T00:00:00Z", "activity_index": 20.0, "confidence": 0.9, "observability": "high"},
            {"segment_id": "S1", "observed_at": "2024-02-01T00:00:00Z", "activity_index": 15.0, "confidence": 0.9, "observability": "high"},
            {"segment_id": "S1", "observed_at": "2024-03-01T00:00:00Z", "activity_index": 55.0, "confidence": 0.9, "observability": "high"},
        ]
        feat = [
            {"segment_id": "S1", "observed_at": "2024-01-01T00:00:00Z", "rainfall_mm": 0.0, "bsi_change": 0.01, "ndvi_change": 0.0, "vv_change_db": 0.1},
            {"segment_id": "S1", "observed_at": "2024-02-01T00:00:00Z", "rainfall_mm": 0.0, "bsi_change": 0.01, "ndvi_change": 0.0, "vv_change_db": 0.1},
            {"segment_id": "S1", "observed_at": "2024-03-01T00:00:00Z", "rainfall_mm": 0.0, "bsi_change": 0.20, "ndvi_change": -0.15, "vv_change_db": 2.0},
        ]
        rep = [
            {"segment_id": "S1", "observed_at": "2024-01-01T00:00:00Z", "expected_activity_percentile": 0.5, "reported_progress_pct": 40.0, "spend_to_date_pct": 60.0},
            {"segment_id": "S1", "observed_at": "2024-02-01T00:00:00Z", "expected_activity_percentile": 0.6, "reported_progress_pct": 50.0, "spend_to_date_pct": 75.0},
            {"segment_id": "S1", "observed_at": "2024-03-01T00:00:00Z", "expected_activity_percentile": 0.7, "reported_progress_pct": 60.0, "spend_to_date_pct": 75.0},
        ]
        an = [r.to_dict() for r in det.detect(act, feat, rep)]
        self.assertEqual(an[1]["state"], "stall_candidate")
        self.assertEqual(an[1]["spend_vs_activity_ratio"], 5.0)

        # Duplicate samples so GBDT has >=6 training points across both classes
        gt = [
            {"segment_id": "S1", "observed_at": "2024-01-01T00:00:00Z", "true_label": "stalled"},
            {"segment_id": "S1", "observed_at": "2024-02-01T00:00:00Z", "true_label": "stalled"},
            {"segment_id": "S1", "observed_at": "2024-03-01T00:00:00Z", "true_label": "active"},
        ]
        ml = train_and_predict_delay_risk(an * 3, feat * 3, gt, cutoff_date="2024-04-01")
        self.assertIn("GradientBoosting", ml["model_type"])
        self.assertGreater(len(ml["predictions"]), 0)

    def test_reportlab_pdf_export(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            out_pdf = Path(tmpdir) / "report.pdf"
            alert = {
                "alert_id": "ALT-TEST-01",
                "segment_id": "NHAI-NH544G-PKG1-S0001",
                "severity": "high",
                "observed_at": "2024-07-28T00:00:00Z",
                "data_classification": "real",
                "evidence_sha256": "abc123",
                "analysis": {"state": "stall_candidate", "activity_index": 22.0, "confidence": 0.9, "observability": "high", "reasons": ["test"]},
                "risk": {"risk_score": 0.78},
                "features": {"rainfall_mm": 1.2, "optical_scene_ids": ["S2A_TEST"], "sar_scene_ids": ["S1A_TEST"]},
                "activity": {"components": [{"name": "bare_soil_activity", "raw_value": 0.1, "normalized_value": 0.4, "effective_weight": 0.2, "contribution": 0.08}]},
            }
            pdf = export_alert_pdf(alert, out_pdf)
            self.assertTrue(pdf.exists())
            self.assertGreater(pdf.stat().st_size, 1000)


if __name__ == "__main__":
    unittest.main()
