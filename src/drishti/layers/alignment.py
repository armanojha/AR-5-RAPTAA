from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Iterable


EARTH_RADIUS_M = 6_371_008.8


def _parse_date(value: str | date, field_name: str) -> date:
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be an ISO date") from exc


def _validate_lon_lat(coordinate: Iterable[Any]) -> tuple[float, float]:
    values = list(coordinate)
    if len(values) < 2:
        raise ValueError("each alignment coordinate requires longitude and latitude")
    try:
        longitude, latitude = float(values[0]), float(values[1])
    except (TypeError, ValueError) as exc:
        raise ValueError("alignment coordinates must be numeric") from exc
    if not -180 <= longitude <= 180 or not -90 <= latitude <= 90:
        raise ValueError("alignment coordinate is outside valid longitude/latitude bounds")
    return longitude, latitude


@dataclass(frozen=True, slots=True)
class LocalMetricProjection:
    """Dependency-free local projection for short hackathon corridors."""

    longitude_origin: float
    latitude_origin: float

    @property
    def _cos_latitude_origin(self) -> float:
        return math.cos(math.radians(self.latitude_origin))

    def forward(self, coordinate: tuple[float, float]) -> tuple[float, float]:
        longitude, latitude = coordinate
        x = EARTH_RADIUS_M * math.radians(longitude - self.longitude_origin) * self._cos_latitude_origin
        y = EARTH_RADIUS_M * math.radians(latitude - self.latitude_origin)
        return x, y

    def inverse(self, point: tuple[float, float]) -> tuple[float, float]:
        x, y = point
        longitude = self.longitude_origin + math.degrees(x / (EARTH_RADIUS_M * self._cos_latitude_origin))
        latitude = self.latitude_origin + math.degrees(y / EARTH_RADIUS_M)
        return round(longitude, 8), round(latitude, 8)


@dataclass(frozen=True, slots=True)
class AlignmentInput:
    alignment_id: str
    coordinates: tuple[tuple[float, float], ...]
    source_properties: dict[str, Any]

    @classmethod
    def from_geojson(cls, path: str | Path) -> "AlignmentInput":
        payload = json.loads(Path(path).read_text(encoding="utf-8"))
        if payload.get("type") == "FeatureCollection":
            features = payload.get("features", [])
            if len(features) != 1:
                raise ValueError("alignment GeoJSON must contain exactly one feature")
            feature = features[0]
        elif payload.get("type") == "Feature":
            feature = payload
        else:
            raise ValueError("alignment input must be a GeoJSON Feature or FeatureCollection")

        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "LineString":
            raise ValueError("alignment geometry must be one continuous LineString")
        coordinates = tuple(_validate_lon_lat(value) for value in geometry.get("coordinates", []))
        if len(coordinates) < 2:
            raise ValueError("alignment LineString requires at least two coordinates")
        if all(coordinate == coordinates[0] for coordinate in coordinates[1:]):
            raise ValueError("alignment LineString has zero length")

        properties = dict(feature.get("properties") or {})
        alignment_id = str(properties.get("alignment_id") or feature.get("id") or "").strip()
        if not alignment_id:
            raise ValueError("alignment_id is required in feature properties or feature id")
        return cls(alignment_id=alignment_id, coordinates=coordinates, source_properties=properties)


@dataclass(frozen=True, slots=True)
class CorridorSegment:
    segment_id: str
    sequence: int
    project_id: str
    alignment_id: str
    centerline: tuple[tuple[float, float], ...]
    buffer_ring: tuple[tuple[float, float], ...]
    start_m: float
    end_m: float
    baseline_start: date
    baseline_end: date
    observability: str
    buffer_m: float

    @property
    def length_m(self) -> float:
        return self.end_m - self.start_m

    def to_feature(self) -> dict[str, Any]:
        return {
            "type": "Feature",
            "id": self.segment_id,
            "properties": {
                "segment_id": self.segment_id,
                "sequence": self.sequence,
                "project_id": self.project_id,
                "alignment_id": self.alignment_id,
                "start_m": round(self.start_m, 3),
                "end_m": round(self.end_m, 3),
                "length_m": round(self.length_m, 3),
                "buffer_m": self.buffer_m,
                "baseline_start": self.baseline_start.isoformat(),
                "baseline_end": self.baseline_end.isoformat(),
                "observability": self.observability,
                "centerline": {
                    "type": "LineString",
                    "coordinates": [list(coordinate) for coordinate in self.centerline],
                },
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[list(coordinate) for coordinate in self.buffer_ring]],
            },
        }


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.hypot(b[0] - a[0], b[1] - a[1])


def _interpolate(a: tuple[float, float], b: tuple[float, float], fraction: float) -> tuple[float, float]:
    return a[0] + ((b[0] - a[0]) * fraction), a[1] + ((b[1] - a[1]) * fraction)


def _split_line(points: tuple[tuple[float, float], ...], segment_length_m: float) -> list[tuple[tuple[float, float], ...]]:
    segments: list[tuple[tuple[float, float], ...]] = []
    current: list[tuple[float, float]] = [points[0]]
    current_length = 0.0

    for endpoint in points[1:]:
        leg_start = current[-1]
        leg_remaining = _distance(leg_start, endpoint)
        if leg_remaining == 0:
            continue

        while current_length + leg_remaining >= segment_length_m:
            needed = segment_length_m - current_length
            cut = _interpolate(leg_start, endpoint, needed / leg_remaining)
            current.append(cut)
            segments.append(tuple(current))
            current = [cut]
            leg_start = cut
            leg_remaining = _distance(leg_start, endpoint)
            current_length = 0.0
            if leg_remaining == 0:
                break

        if leg_remaining > 0:
            current.append(endpoint)
            current_length += leg_remaining

    if len(current) > 1 and current_length > 0.001:
        segments.append(tuple(current))
    return segments


def _cross(origin: tuple[float, float], a: tuple[float, float], b: tuple[float, float]) -> float:
    return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0])


def _convex_hull(points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    unique = sorted(set(points))
    if len(unique) < 3:
        raise ValueError("buffer geometry requires at least three distinct points")
    lower: list[tuple[float, float]] = []
    for point in unique:
        while len(lower) >= 2 and _cross(lower[-2], lower[-1], point) <= 0:
            lower.pop()
        lower.append(point)
    upper: list[tuple[float, float]] = []
    for point in reversed(unique):
        while len(upper) >= 2 and _cross(upper[-2], upper[-1], point) <= 0:
            upper.pop()
        upper.append(point)
    return lower[:-1] + upper[:-1]


def _buffer_ring(points: tuple[tuple[float, float], ...], buffer_m: float) -> tuple[tuple[float, float], ...]:
    samples: list[tuple[float, float]] = []
    for x, y in points:
        for step in range(16):
            angle = (2 * math.pi * step) / 16
            samples.append((x + buffer_m * math.cos(angle), y + buffer_m * math.sin(angle)))
    hull = _convex_hull(samples)
    hull.append(hull[0])
    return tuple(hull)


def build_segments(
    alignment: AlignmentInput,
    *,
    project_id: str,
    baseline_start: str | date,
    baseline_end: str | date,
    observability: str = "high",
    segment_length_m: float = 1_000.0,
    buffer_m: float = 300.0,
) -> list[CorridorSegment]:
    project_id = project_id.strip()
    if not project_id:
        raise ValueError("project_id is required")
    if observability not in {"high", "medium", "low"}:
        raise ValueError("observability must be high, medium or low")
    if segment_length_m <= 0:
        raise ValueError("segment_length_m must be greater than zero")
    if not 50 <= buffer_m <= 2_000:
        raise ValueError("buffer_m must be between 50 and 2000 metres")

    parsed_baseline_start = _parse_date(baseline_start, "baseline_start")
    parsed_baseline_end = _parse_date(baseline_end, "baseline_end")
    if parsed_baseline_end < parsed_baseline_start:
        raise ValueError("baseline_end cannot be before baseline_start")

    longitude_origin = sum(coordinate[0] for coordinate in alignment.coordinates) / len(alignment.coordinates)
    latitude_origin = sum(coordinate[1] for coordinate in alignment.coordinates) / len(alignment.coordinates)
    projection = LocalMetricProjection(longitude_origin, latitude_origin)
    metric_line = tuple(projection.forward(coordinate) for coordinate in alignment.coordinates)
    split_lines = _split_line(metric_line, segment_length_m)

    result: list[CorridorSegment] = []
    start_m = 0.0
    for sequence, metric_segment in enumerate(split_lines, start=1):
        length_m = sum(_distance(a, b) for a, b in zip(metric_segment, metric_segment[1:]))
        end_m = start_m + length_m
        result.append(
            CorridorSegment(
                segment_id=f"{project_id}-S{sequence:04d}",
                sequence=sequence,
                project_id=project_id,
                alignment_id=alignment.alignment_id,
                centerline=tuple(projection.inverse(point) for point in metric_segment),
                buffer_ring=tuple(projection.inverse(point) for point in _buffer_ring(metric_segment, buffer_m)),
                start_m=start_m,
                end_m=end_m,
                baseline_start=parsed_baseline_start,
                baseline_end=parsed_baseline_end,
                observability=observability,
                buffer_m=buffer_m,
            )
        )
        start_m = end_m
    return result


def export_segments(
    segments: list[CorridorSegment],
    path: str | Path,
    *,
    source_properties: dict[str, Any] | None = None,
) -> None:
    if not segments:
        raise ValueError("at least one segment is required")
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "type": "FeatureCollection",
        "name": "drishti_corridor_segments",
        "metadata": {
            "schema_version": "1.0",
            "segment_count": len(segments),
            "metric_method": "local_equirectangular",
            "buffer_method": "convex_hull_of_16_point_vertex_buffers",
            "source_properties": source_properties or {},
        },
        "features": [segment.to_feature() for segment in segments],
    }
    destination.write_text(json.dumps(payload, indent=2), encoding="utf-8")

