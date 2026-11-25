from __future__ import annotations

import json
import math
import statistics
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Sequence

from drishti.layers.scene_catalog import AssetRecord, SceneRecord


SCL_INVALID_CLASSES = frozenset({0, 1, 3, 8, 9, 10, 11})

OPTICAL_ASSET_GROUPS = {
    "blue": {"blue", "b02", "b2"},
    "green": {"green", "b03", "b3"},
    "red": {"red", "b04", "b4"},
    "nir": {"nir", "b08", "b8"},
    "swir16": {"swir16", "b11"},
    "scl": {"scl"},
}

SAR_ASSET_GROUPS = {
    "vv": {"vv"},
    "vh": {"vh"},
}


@dataclass(frozen=True, slots=True)
class SceneQualityResult:
    scene_id: str
    status: str
    reasons: tuple[str, ...]
    cloud_cover_pct: float | None
    valid_pixel_fraction: float | None
    covered_segment_count: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "scene_id": self.scene_id,
            "status": self.status,
            "reasons": list(self.reasons),
            "cloud_cover_pct": self.cloud_cover_pct,
            "valid_pixel_fraction": self.valid_pixel_fraction,
            "covered_segment_count": self.covered_segment_count,
        }


def _normalized_asset_keys(scene: SceneRecord) -> set[str]:
    return {key.lower() for key in scene.assets}


def _missing_groups(scene: SceneRecord, groups: dict[str, set[str]]) -> list[str]:
    keys = _normalized_asset_keys(scene)
    return [group for group, aliases in groups.items() if not keys.intersection(aliases)]


def evaluate_scene(
    scene: SceneRecord,
    *,
    max_cloud_pct: float = 40.0,
    min_valid_pixel_fraction: float = 0.60,
) -> SceneQualityResult:
    if not 0 <= max_cloud_pct <= 100:
        raise ValueError("max_cloud_pct must be between 0 and 100")
    if not 0 <= min_valid_pixel_fraction <= 1:
        raise ValueError("min_valid_pixel_fraction must be between 0 and 1")

    reject_reasons: list[str] = []
    review_reasons: list[str] = []
    valid_value = scene.properties.get("drishti:valid_pixel_fraction")
    valid_fraction = float(valid_value) if valid_value is not None else None
    if valid_fraction is not None and not 0 <= valid_fraction <= 1:
        raise ValueError("drishti:valid_pixel_fraction must be between 0 and 1")

    if not scene.covered_segment_ids:
        reject_reasons.append("scene does not intersect any corridor segment")

    if scene.sensor_kind == "optical":
        missing = _missing_groups(scene, OPTICAL_ASSET_GROUPS)
        if missing:
            reject_reasons.append(f"missing optical assets: {', '.join(missing)}")
        if scene.cloud_cover_pct is None:
            review_reasons.append("cloud cover metadata is missing")
        elif scene.cloud_cover_pct > max_cloud_pct:
            reject_reasons.append(f"cloud cover exceeds {max_cloud_pct:g}%")
    elif scene.sensor_kind == "sar":
        missing = _missing_groups(scene, SAR_ASSET_GROUPS)
        if missing:
            reject_reasons.append(f"missing SAR assets: {', '.join(missing)}")
        identity = f"{scene.collection} {scene.properties.get('sar:product_type', '')} {scene.properties.get('processing:level', '')}".lower()
        if "rtc" not in identity:
            review_reasons.append("SAR scene is not identified as terrain-corrected RTC")
    else:
        review_reasons.append("sensor-specific quality policy is not defined")

    if valid_fraction is None:
        review_reasons.append("valid-pixel fraction is not yet computed")
    elif valid_fraction < min_valid_pixel_fraction:
        reject_reasons.append(f"valid-pixel fraction is below {min_valid_pixel_fraction:g}")

    if reject_reasons:
        status = "rejected"
        reasons = tuple(reject_reasons + review_reasons)
    elif review_reasons:
        status = "review"
        reasons = tuple(review_reasons)
    else:
        status = "accepted"
        reasons = ("quality policy passed",)
    return SceneQualityResult(
        scene_id=scene.scene_id,
        status=status,
        reasons=reasons,
        cloud_cover_pct=scene.cloud_cover_pct,
        valid_pixel_fraction=valid_fraction,
        covered_segment_count=len(scene.covered_segment_ids),
    )


def scl_valid_mask(scl: Sequence[Sequence[int]]) -> list[list[bool]]:
    if not scl or not scl[0]:
        raise ValueError("SCL grid cannot be empty")
    width = len(scl[0])
    if any(len(row) != width for row in scl):
        raise ValueError("SCL grid rows must have equal length")
    return [[int(value) not in SCL_INVALID_CLASSES for value in row] for row in scl]


def valid_fraction(mask: Sequence[Sequence[bool]]) -> float:
    values = [bool(value) for row in mask for value in row]
    if not values:
        raise ValueError("mask cannot be empty")
    return sum(values) / len(values)


def apply_mask(
    values: Sequence[Sequence[float | int]],
    mask: Sequence[Sequence[bool]],
) -> list[list[float | None]]:
    if len(values) != len(mask) or any(len(value_row) != len(mask_row) for value_row, mask_row in zip(values, mask)):
        raise ValueError("value and mask grids must have the same shape")
    return [
        [float(value) if keep else None for value, keep in zip(value_row, mask_row)]
        for value_row, mask_row in zip(values, mask)
    ]


def median_composite(grids: Sequence[Sequence[Sequence[float | None]]]) -> list[list[float | None]]:
    if not grids or not grids[0] or not grids[0][0]:
        raise ValueError("at least one non-empty grid is required")
    height = len(grids[0])
    width = len(grids[0][0])
    for grid in grids:
        if len(grid) != height or any(len(row) != width for row in grid):
            raise ValueError("all grids must have the same shape")

    result: list[list[float | None]] = []
    for row_index in range(height):
        row: list[float | None] = []
        for column_index in range(width):
            observations = [
                float(grid[row_index][column_index])
                for grid in grids
                if grid[row_index][column_index] is not None
            ]
            row.append(statistics.median(observations) if observations else None)
        result.append(row)
    return result


def sigma0_to_db(grid: Sequence[Sequence[float | None]]) -> list[list[float | None]]:
    return [
        [10 * math.log10(value) if value is not None and value > 0 else None for value in row]
        for row in grid
    ]


def _scene_from_manifest(payload: dict[str, Any]) -> SceneRecord:
    assets = {
        key: AssetRecord(
            key=key,
            href=value["href"],
            media_type=value.get("media_type"),
            roles=tuple(value.get("roles", [])),
            title=value.get("title"),
        )
        for key, value in payload.get("assets", {}).items()
    }
    return SceneRecord(
        scene_id=payload["scene_id"],
        collection=payload["collection"],
        acquired_at=datetime.fromisoformat(payload["acquired_at"]),
        platform=payload.get("platform", "unknown"),
        sensor_kind=payload.get("sensor_kind", "other"),
        bbox=tuple(payload["bbox"]),
        cloud_cover_pct=payload.get("cloud_cover_pct"),
        assets=assets,
        source_href=payload.get("source_href"),
        license=payload.get("license"),
        properties=dict(payload.get("properties", {})),
        covered_segment_ids=tuple(payload.get("covered_segment_ids", [])),
    )


def evaluate_manifest(
    manifest_path: str | Path,
    output_path: str | Path,
    *,
    max_cloud_pct: float = 40.0,
    min_valid_pixel_fraction: float = 0.60,
) -> list[SceneQualityResult]:
    payload = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
    results = [
        evaluate_scene(
            _scene_from_manifest(scene),
            max_cloud_pct=max_cloud_pct,
            min_valid_pixel_fraction=min_valid_pixel_fraction,
        )
        for scene in payload.get("scenes", [])
    ]
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "schema_version": "1.0",
        "policy": {
            "max_cloud_pct": max_cloud_pct,
            "min_valid_pixel_fraction": min_valid_pixel_fraction,
            "scl_invalid_classes": sorted(SCL_INVALID_CLASSES),
        },
        "summary": {
            status: sum(result.status == status for result in results)
            for status in ("accepted", "review", "rejected")
        },
        "results": [result.to_dict() for result in results],
    }
    destination.write_text(json.dumps(output, indent=2), encoding="utf-8")
    return results

