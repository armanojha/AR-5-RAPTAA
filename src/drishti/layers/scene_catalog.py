from __future__ import annotations

import hashlib
import json
import re
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any


def _parse_datetime(value: str) -> datetime:
    if not value:
        raise ValueError("STAC item datetime is required")
    normalized = value.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError as exc:
        raise ValueError(f"invalid STAC datetime: {value}") from exc


def _geometry_coordinates(value: Any) -> list[tuple[float, float]]:
    coordinates: list[tuple[float, float]] = []
    if isinstance(value, list):
        if len(value) >= 2 and all(isinstance(item, (int, float)) for item in value[:2]):
            coordinates.append((float(value[0]), float(value[1])))
        else:
            for child in value:
                coordinates.extend(_geometry_coordinates(child))
    return coordinates


def _item_bbox(item: dict[str, Any]) -> tuple[float, float, float, float]:
    bbox = item.get("bbox")
    if isinstance(bbox, list) and len(bbox) >= 4:
        result = tuple(float(value) for value in (bbox[0], bbox[1], bbox[-2], bbox[-1]))
    else:
        coordinates = _geometry_coordinates((item.get("geometry") or {}).get("coordinates"))
        if not coordinates:
            raise ValueError("STAC item requires bbox or geometry coordinates")
        longitudes = [coordinate[0] for coordinate in coordinates]
        latitudes = [coordinate[1] for coordinate in coordinates]
        result = min(longitudes), min(latitudes), max(longitudes), max(latitudes)
    if result[0] > result[2] or result[1] > result[3]:
        raise ValueError("STAC item bbox is invalid")
    return result


def _intersects(a: tuple[float, float, float, float], b: tuple[float, float, float, float]) -> bool:
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])


@dataclass(frozen=True, slots=True)
class AssetRecord:
    key: str
    href: str
    media_type: str | None = None
    roles: tuple[str, ...] = ()
    title: str | None = None

    @classmethod
    def from_stac(cls, key: str, payload: dict[str, Any]) -> "AssetRecord":
        href = str(payload.get("href", "")).strip()
        if not href:
            raise ValueError(f"STAC asset {key} is missing href")
        return cls(
            key=key,
            href=href,
            media_type=payload.get("type"),
            roles=tuple(str(role) for role in payload.get("roles", [])),
            title=payload.get("title"),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "href": self.href,
            "media_type": self.media_type,
            "roles": list(self.roles),
            "title": self.title,
        }


@dataclass(frozen=True, slots=True)
class SceneRecord:
    scene_id: str
    collection: str
    acquired_at: datetime
    platform: str
    sensor_kind: str
    bbox: tuple[float, float, float, float]
    cloud_cover_pct: float | None
    assets: dict[str, AssetRecord]
    source_href: str | None
    license: str | None
    properties: dict[str, Any] = field(default_factory=dict)
    covered_segment_ids: tuple[str, ...] = ()

    @classmethod
    def from_stac_item(cls, item: dict[str, Any]) -> "SceneRecord":
        if item.get("type") != "Feature":
            raise ValueError("each STAC item must be a GeoJSON Feature")
        scene_id = str(item.get("id", "")).strip()
        collection = str(item.get("collection", "")).strip()
        if not scene_id or not collection:
            raise ValueError("STAC item id and collection are required")
        properties = dict(item.get("properties") or {})
        acquired_at = _parse_datetime(str(properties.get("datetime") or properties.get("start_datetime") or ""))
        platform = str(properties.get("platform") or "unknown")
        identity = f"{collection} {platform}".lower()
        if "sentinel-2" in identity or "sentinel_2" in identity:
            sensor_kind = "optical"
        elif "sentinel-1" in identity or "sentinel_1" in identity:
            sensor_kind = "sar"
        else:
            sensor_kind = "other"

        cloud_value = properties.get("eo:cloud_cover")
        cloud_cover = float(cloud_value) if cloud_value is not None else None
        if cloud_cover is not None and not 0 <= cloud_cover <= 100:
            raise ValueError("eo:cloud_cover must be between 0 and 100")

        assets = {
            str(key): AssetRecord.from_stac(str(key), value)
            for key, value in (item.get("assets") or {}).items()
        }
        if not assets:
            raise ValueError(f"STAC item {scene_id} has no assets")
        source_href = next(
            (str(link.get("href")) for link in item.get("links", []) if link.get("rel") in {"self", "canonical"}),
            None,
        )
        return cls(
            scene_id=scene_id,
            collection=collection,
            acquired_at=acquired_at,
            platform=platform,
            sensor_kind=sensor_kind,
            bbox=_item_bbox(item),
            cloud_cover_pct=cloud_cover,
            assets=assets,
            source_href=source_href,
            license=properties.get("license"),
            properties=properties,
        )

    def with_coverage(self, segment_ids: list[str]) -> "SceneRecord":
        return SceneRecord(
            scene_id=self.scene_id,
            collection=self.collection,
            acquired_at=self.acquired_at,
            platform=self.platform,
            sensor_kind=self.sensor_kind,
            bbox=self.bbox,
            cloud_cover_pct=self.cloud_cover_pct,
            assets=self.assets,
            source_href=self.source_href,
            license=self.license,
            properties=self.properties,
            covered_segment_ids=tuple(segment_ids),
        )

    def to_dict(self) -> dict[str, Any]:
        retained_properties = {
            key: self.properties[key]
            for key in (
                "constellation",
                "instruments",
                "sar:product_type",
                "sar:polarizations",
                "processing:level",
                "drishti:valid_pixel_fraction",
            )
            if key in self.properties
        }
        return {
            "scene_id": self.scene_id,
            "collection": self.collection,
            "acquired_at": self.acquired_at.isoformat(),
            "platform": self.platform,
            "sensor_kind": self.sensor_kind,
            "bbox": list(self.bbox),
            "cloud_cover_pct": self.cloud_cover_pct,
            "source_href": self.source_href,
            "license": self.license,
            "covered_segment_ids": list(self.covered_segment_ids),
            "properties": retained_properties,
            "assets": {key: asset.to_dict() for key, asset in self.assets.items()},
        }


class SceneCatalog:
    def __init__(self, scenes: list[SceneRecord]) -> None:
        ids = [scene.scene_id for scene in scenes]
        duplicates = sorted({scene_id for scene_id in ids if ids.count(scene_id) > 1})
        if duplicates:
            raise ValueError(f"duplicate scene ids: {', '.join(duplicates)}")
        self.scenes = tuple(sorted(scenes, key=lambda scene: (scene.acquired_at, scene.scene_id)))

    @classmethod
    def from_stac_payload(cls, payload: dict[str, Any]) -> "SceneCatalog":
        if payload.get("type") == "FeatureCollection":
            items = payload.get("features", [])
        elif payload.get("type") == "Feature":
            items = [payload]
        else:
            raise ValueError("STAC input must be a Feature or FeatureCollection")
        return cls([SceneRecord.from_stac_item(item) for item in items])

    @classmethod
    def from_stac_file(cls, path: str | Path) -> "SceneCatalog":
        return cls.from_stac_payload(json.loads(Path(path).read_text(encoding="utf-8")))

    def attach_segment_coverage(self, segments_path: str | Path) -> "SceneCatalog":
        payload = json.loads(Path(segments_path).read_text(encoding="utf-8"))
        segments: list[tuple[str, tuple[float, float, float, float]]] = []
        for feature in payload.get("features", []):
            segment_id = str((feature.get("properties") or {}).get("segment_id") or feature.get("id") or "")
            if not segment_id:
                raise ValueError("segment feature is missing segment_id")
            segments.append((segment_id, _item_bbox(feature)))
        if not segments:
            raise ValueError("segments GeoJSON contains no features")
        return SceneCatalog(
            [
                scene.with_coverage([segment_id for segment_id, bbox in segments if _intersects(scene.bbox, bbox)])
                for scene in self.scenes
            ]
        )

    def export_manifest(self, path: str | Path, *, provider: str | None = None) -> None:
        destination = Path(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema_version": "1.0",
            "provider": provider,
            "scene_count": len(self.scenes),
            "scenes": [scene.to_dict() for scene in self.scenes],
        }
        destination.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def stac_search(
    endpoint: str,
    *,
    collections: list[str],
    bbox: tuple[float, float, float, float],
    datetime_range: str,
    limit: int = 100,
    timeout_seconds: int = 30,
) -> SceneCatalog:
    if not endpoint.startswith(("https://", "http://")):
        raise ValueError("STAC endpoint must use http or https")
    if not collections:
        raise ValueError("at least one STAC collection is required")
    if limit < 1 or limit > 1000:
        raise ValueError("STAC search limit must be between 1 and 1000")
    request_url = endpoint
    request_method = "POST"
    request_body: dict[str, Any] | None = {
        "collections": collections,
        "bbox": list(bbox),
        "datetime": datetime_range,
        "limit": limit,
    }
    features: list[dict[str, Any]] = []

    while len(features) < limit:
        encoded_body = json.dumps(request_body).encode("utf-8") if request_body is not None else None
        request = urllib.request.Request(
            request_url,
            data=encoded_body,
            headers={"Content-Type": "application/json", "Accept": "application/geo+json, application/json"},
            method=request_method,
        )
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
        features.extend(payload.get("features", []))
        next_link = next((link for link in payload.get("links", []) if link.get("rel") == "next"), None)
        if not next_link or len(features) >= limit:
            break
        next_href = str(next_link.get("href") or "").strip()
        if not next_href:
            break
        request_url = urllib.parse.urljoin(request_url, next_href)
        request_method = str(next_link.get("method") or "GET").upper()
        request_body = next_link.get("body") if request_method == "POST" else None

    return SceneCatalog.from_stac_payload({"type": "FeatureCollection", "features": features[:limit]})


@dataclass(frozen=True, slots=True)
class CachedAsset:
    scene_id: str
    asset_key: str
    path: Path
    byte_count: int
    sha256: str


class SceneAssetCache:
    def __init__(self, cache_directory: str | Path, *, max_bytes: int = 2_000_000_000) -> None:
        self.cache_directory = Path(cache_directory)
        self.max_bytes = max_bytes
        if max_bytes <= 0:
            raise ValueError("max_bytes must be greater than zero")

    def cache(self, scene: SceneRecord, asset_key: str) -> CachedAsset:
        if asset_key not in scene.assets:
            raise ValueError(f"scene {scene.scene_id} has no asset named {asset_key}")
        asset = scene.assets[asset_key]
        parsed = urllib.parse.urlparse(asset.href)
        windows_path = bool(re.match(r"^[A-Za-z]:[\\/]", asset.href))
        effective_scheme = "" if windows_path else parsed.scheme
        if effective_scheme not in {"", "file", "http", "https"}:
            raise ValueError(f"unsupported asset URL scheme: {parsed.scheme}")

        suffix = Path(asset.href if windows_path else parsed.path).suffix[:12]
        safe_scene = re.sub(r"[^A-Za-z0-9_.-]+", "_", scene.scene_id)
        safe_asset = re.sub(r"[^A-Za-z0-9_.-]+", "_", asset_key)
        destination = self.cache_directory / f"{safe_scene}__{safe_asset}{suffix}"
        self.cache_directory.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix(destination.suffix + ".part")

        digest = hashlib.sha256()
        byte_count = 0
        if effective_scheme in {"", "file"}:
            if effective_scheme == "file":
                local_path = urllib.request.url2pathname(parsed.path)
                if re.match(r"^/[A-Za-z]:", local_path):
                    local_path = local_path[1:]
                source = Path(local_path)
            else:
                source = Path(asset.href)
            source_handle = source.open("rb")
        else:
            source_handle = urllib.request.urlopen(asset.href, timeout=60)
        try:
            with source_handle, temporary.open("wb") as output:
                while chunk := source_handle.read(1024 * 1024):
                    byte_count += len(chunk)
                    if byte_count > self.max_bytes:
                        raise ValueError(f"asset exceeds cache limit of {self.max_bytes} bytes")
                    digest.update(chunk)
                    output.write(chunk)
            temporary.replace(destination)
        except Exception:
            temporary.unlink(missing_ok=True)
            raise
        return CachedAsset(scene.scene_id, asset_key, destination, byte_count, digest.hexdigest())

