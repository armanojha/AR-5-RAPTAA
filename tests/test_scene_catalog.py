from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from drishti.layers.scene_catalog import SceneAssetCache, SceneCatalog, stac_search


def _item(scene_id: str, href: str = "https://example.invalid/asset.tif") -> dict:
    return {
        "type": "Feature",
        "id": scene_id,
        "collection": "sentinel-2-l2a",
        "bbox": [77.0, 13.0, 77.1, 13.1],
        "geometry": None,
        "properties": {
            "datetime": "2026-10-15T05:10:00Z",
            "platform": "sentinel-2a",
            "eo:cloud_cover": 10,
        },
        "assets": {"blue": {"href": href}},
    }


class SceneCatalogTests(unittest.TestCase):
    def test_parses_stac_and_attaches_segment_coverage(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            stac_path = directory / "items.json"
            segment_path = directory / "segments.geojson"
            stac_path.write_text(json.dumps({"type": "FeatureCollection", "features": [_item("SCENE-1")]}), encoding="utf-8")
            segment_path.write_text(
                json.dumps(
                    {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "id": "P-001-S0001",
                                "properties": {"segment_id": "P-001-S0001"},
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[[77.02, 13.02], [77.03, 13.02], [77.03, 13.03], [77.02, 13.02]]],
                                },
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )
            catalog = SceneCatalog.from_stac_file(stac_path).attach_segment_coverage(segment_path)

        self.assertEqual(catalog.scenes[0].covered_segment_ids, ("P-001-S0001",))
        self.assertEqual(catalog.scenes[0].sensor_kind, "optical")

    def test_rejects_duplicate_scene_ids(self) -> None:
        payload = {"type": "FeatureCollection", "features": [_item("DUPLICATE"), _item("DUPLICATE")]}
        with self.assertRaisesRegex(ValueError, "duplicate scene ids"):
            SceneCatalog.from_stac_payload(payload)

    def test_stac_search_posts_standard_search_body(self) -> None:
        response_payload = json.dumps({"type": "FeatureCollection", "features": [_item("SCENE-1")]}).encode()

        class FakeResponse:
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

            def read(self):
                return response_payload

        with patch("urllib.request.urlopen", return_value=FakeResponse()) as urlopen:
            catalog = stac_search(
                "https://example.invalid/v1/search",
                collections=["sentinel-2-l2a"],
                bbox=(77.0, 13.0, 77.1, 13.1),
                datetime_range="2026-01-01/2026-12-31",
                limit=25,
            )

        request = urlopen.call_args.args[0]
        request_body = json.loads(request.data)
        self.assertEqual(len(catalog.scenes), 1)
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request_body["collections"], ["sentinel-2-l2a"])
        self.assertEqual(request_body["bbox"], [77.0, 13.0, 77.1, 13.1])

    def test_caches_local_asset_with_checksum(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            source = directory / "source.bin"
            source.write_bytes(b"drishti-scene")
            catalog = SceneCatalog.from_stac_payload(
                {"type": "FeatureCollection", "features": [_item("SCENE-1", str(source))]}
            )
            cached = SceneAssetCache(directory / "cache").cache(catalog.scenes[0], "blue")

            self.assertEqual(cached.path.read_bytes(), b"drishti-scene")
            self.assertEqual(cached.byte_count, len(b"drishti-scene"))
            self.assertEqual(len(cached.sha256), 64)


if __name__ == "__main__":
    unittest.main()

