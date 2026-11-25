from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from drishti.layers.alignment import AlignmentInput, build_segments, export_segments


def _alignment(path: Path, coordinates: list[list[float]], geometry_type: str = "LineString") -> AlignmentInput:
    payload = {
        "type": "Feature",
        "id": "A-001",
        "properties": {"alignment_id": "A-001", "data_classification": "synthetic"},
        "geometry": {"type": geometry_type, "coordinates": coordinates},
    }
    path.write_text(json.dumps(payload), encoding="utf-8")
    return AlignmentInput.from_geojson(path)


class AlignmentInputTests(unittest.TestCase):
    def test_rejects_non_line_geometry(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "alignment.geojson"
            with self.assertRaisesRegex(ValueError, "continuous LineString"):
                _alignment(path, [[77.0, 13.0]], geometry_type="Point")

    def test_rejects_multiple_features(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "alignment.geojson"
            path.write_text(json.dumps({"type": "FeatureCollection", "features": [{}, {}]}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "exactly one feature"):
                AlignmentInput.from_geojson(path)


class SegmentBuilderTests(unittest.TestCase):
    def test_splits_alignment_into_stable_one_kilometre_segments(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "alignment.geojson"
            alignment = _alignment(path, [[77.0, 13.0], [77.0231, 13.0]])
            segments = build_segments(
                alignment,
                project_id="P-001",
                baseline_start="2023-01-01",
                baseline_end="2023-12-31",
            )

        self.assertEqual([segment.segment_id for segment in segments], ["P-001-S0001", "P-001-S0002", "P-001-S0003"])
        self.assertAlmostEqual(segments[0].length_m, 1000.0, places=5)
        self.assertAlmostEqual(segments[1].length_m, 1000.0, places=5)
        self.assertGreater(segments[2].length_m, 400.0)
        self.assertLess(segments[2].length_m, 600.0)

    def test_exports_closed_buffer_polygons_and_centerlines(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            alignment = _alignment(directory / "alignment.geojson", [[77.0, 13.0], [77.01, 13.0]])
            segments = build_segments(
                alignment,
                project_id="P-001",
                baseline_start="2023-01-01",
                baseline_end="2023-12-31",
                observability="medium",
                buffer_m=250,
            )
            output = directory / "segments.geojson"
            export_segments(segments, output, source_properties=alignment.source_properties)
            payload = json.loads(output.read_text(encoding="utf-8"))

        feature = payload["features"][0]
        ring = feature["geometry"]["coordinates"][0]
        self.assertEqual(feature["geometry"]["type"], "Polygon")
        self.assertEqual(ring[0], ring[-1])
        self.assertEqual(feature["properties"]["centerline"]["type"], "LineString")
        self.assertEqual(feature["properties"]["observability"], "medium")
        self.assertEqual(payload["metadata"]["metric_method"], "local_equirectangular")

    def test_rejects_invalid_baseline_order(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            alignment = _alignment(Path(temporary_directory) / "alignment.geojson", [[77.0, 13.0], [77.01, 13.0]])
            with self.assertRaisesRegex(ValueError, "baseline_end"):
                build_segments(
                    alignment,
                    project_id="P-001",
                    baseline_start="2024-01-01",
                    baseline_end="2023-01-01",
                )

    def test_rejects_invalid_buffer_size(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            alignment = _alignment(Path(temporary_directory) / "alignment.geojson", [[77.0, 13.0], [77.01, 13.0]])
            with self.assertRaisesRegex(ValueError, "between 50 and 2000"):
                build_segments(
                    alignment,
                    project_id="P-001",
                    baseline_start="2023-01-01",
                    baseline_end="2023-12-31",
                    buffer_m=10,
                )


if __name__ == "__main__":
    unittest.main()

