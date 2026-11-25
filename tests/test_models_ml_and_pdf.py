from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np
from rasterio.transform import from_bounds

from drishti.layers.backtest import DelayRiskScorer
from drishti.layers.live_ingestion import build_sentinel2_median_composite
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
from drishti.layers.track_c import _rasterize_corridor_polygons


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

    def test_cusum_monotonic_calibrated_histgbdt_and_nan_handling(self) -> None:
        breaks = detect_cusum_breaks([0.1, 0.11, 0.09, 0.35, 0.38, 0.40], baseline_count=3)
        self.assertEqual(breaks["upward_break_index"], 3)

        det = StallDivergenceDetector(low_activity_threshold=30.0, consecutive_observations=2)
        act = [
            {"segment_id": "S1", "observed_at": "2024-01-01T00:00:00Z", "activity_index": 20.0, "confidence": 0.9, "observability": "high"},
            {"segment_id": "S1", "observed_at": "2024-02-01T00:00:00Z", "activity_index": 15.0, "confidence": 0.9, "observability": "high"},
            {"segment_id": "S1", "observed_at": "2024-03-01T00:00:00Z", "activity_index": 55.0, "confidence": 0.9, "observability": "high"},
        ]
        # Include missing optical (None -> native NaN in HistGradientBoostingClassifier) on one observation
        feat = [
            {"segment_id": "S1", "observed_at": "2024-01-01T00:00:00Z", "rainfall_mm": 0.0, "bsi_change": None, "ndvi_change": None, "vv_change_db": 0.1},
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

        # Build >=3 samples per class so CalibratedClassifierCV runs 3-fold Platt calibration
        an_multi, feat_multi, gt_multi = [], [], []
        for idx in range(4):
            sid = f"S{idx + 1}"
            for a_row, f_row in zip(an, feat):
                a_copy = dict(a_row, segment_id=sid)
                f_copy = dict(f_row, segment_id=sid)
                an_multi.append(a_copy)
                feat_multi.append(f_copy)
            gt_multi.extend([
                {"segment_id": sid, "observed_at": "2024-01-01T00:00:00Z", "true_label": "stalled"},
                {"segment_id": sid, "observed_at": "2024-02-01T00:00:00Z", "true_label": "stalled"},
                {"segment_id": sid, "observed_at": "2024-03-01T00:00:00Z", "true_label": "active"},
            ])

        ml = train_and_predict_delay_risk(an_multi, feat_multi, gt_multi, cutoff_date="2024-04-01")
        self.assertIn("HistGradientBoostingClassifier", ml["model_type"])
        self.assertIn("CalibratedClassifierCV", ml["model_type"])
        self.assertIn("Platt", str(ml["calibration_method"]))
        self.assertIsNotNone(ml["brier_score"])
        self.assertEqual(ml["monotonic_constraints"]["low_activity_streak"], 1)
        self.assertEqual(ml["monotonic_constraints"]["activity_index"], -1)
        self.assertGreater(len(ml["predictions"]), 0)

        # Verify DelayRiskScorer integrates calibrated ML probability & spend ratio
        scorer = DelayRiskScorer(alert_threshold=0.50)
        risk = scorer.score(an[1], ml_probability=0.90)
        self.assertEqual(risk.ml_delay_probability, 0.90)
        self.assertGreater(risk.spend_ratio_component, 0.5)
        self.assertTrue(risk.alert)

    def test_sentinel2_median_composite_and_polygon_rasterize(self) -> None:
        # Scene 1 has clouds (SCL=9) in top half; Scene 2 is clear everywhere
        s1_bands = {
            "blue": np.full((8, 8), 0.1, dtype=np.float32),
            "green": np.full((8, 8), 0.1, dtype=np.float32),
            "red": np.full((8, 8), 0.9, dtype=np.float32),
            "nir": np.full((8, 8), 0.1, dtype=np.float32),
            "swir16": np.full((8, 8), 0.1, dtype=np.float32),
            "scl": np.vstack([np.full((4, 8), 9, dtype=np.uint8), np.full((4, 8), 4, dtype=np.uint8)]),
        }
        s2_bands = {
            "blue": np.full((8, 8), 0.2, dtype=np.float32),
            "green": np.full((8, 8), 0.2, dtype=np.float32),
            "red": np.full((8, 8), 0.2, dtype=np.float32),
            "nir": np.full((8, 8), 0.4, dtype=np.float32),
            "swir16": np.full((8, 8), 0.3, dtype=np.float32),
            "scl": np.full((8, 8), 4, dtype=np.uint8),
        }
        fake_items = [
            {"id": "S2_CLOUDY", "properties": {"eo:cloud_cover": 40.0, "datetime": "2024-07-01T00:00:00Z"}},
            {"id": "S2_CLEAR", "properties": {"eo:cloud_cover": 5.0, "datetime": "2024-07-10T00:00:00Z"}},
        ]
        with patch(
            "drishti.layers.live_ingestion.fetch_sentinel2_window",
            side_effect=[
                {"scene_id": "S2_CLEAR", "datetime": "2024-07-10T00:00:00Z", "cloud_cover_pct": 5.0, "crs": "EPSG:4326", "bands": s2_bands},
                {"scene_id": "S2_CLOUDY", "datetime": "2024-07-01T00:00:00Z", "cloud_cover_pct": 40.0, "crs": "EPSG:4326", "bands": s1_bands},
            ],
        ):
            comp = build_sentinel2_median_composite(fake_items, (77.0, 14.0, 77.1, 14.1), max_scenes=2)
        self.assertEqual(comp["composite_scene_count"], 2)
        # Top half (cloudy in scene 2) should take Scene 1's clean 0.2 value instead of 0.9 cloud!
        self.assertAlmostEqual(float(comp["bands"]["red"][1, 1]), 0.2, places=4)

        # Test OSM polygon rasterization onto GeoTIFF grid
        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"project_id": "P1"},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[77.02, 14.02], [77.08, 14.02], [77.08, 14.08], [77.02, 14.08], [77.02, 14.02]]],
                    },
                }
            ],
        }
        tr = from_bounds(77.0, 14.0, 77.1, 14.1, 20, 20)
        mask = _rasterize_corridor_polygons(geojson, "P1", (20, 20), tr)
        self.assertIsNotNone(mask)
        assert mask is not None
        self.assertGreater(int(np.sum(mask)), 50)
        self.assertFalse(bool(mask[0, 0]))  # corner outside polygon

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
                "risk": {"risk_score": 0.78, "ml_delay_probability": 0.84},
                "features": {"rainfall_mm": 1.2, "optical_scene_ids": ["S2A_TEST"], "sar_scene_ids": ["S1A_TEST"]},
                "activity": {"components": [{"name": "bare_soil_activity", "raw_value": 0.1, "normalized_value": 0.4, "effective_weight": 0.2, "contribution": 0.08}]},
            }
            pdf = export_alert_pdf(alert, out_pdf)
            self.assertTrue(pdf.exists())
            self.assertGreater(pdf.stat().st_size, 1000)


if __name__ == "__main__":
    unittest.main()
