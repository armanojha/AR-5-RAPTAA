from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Sequence


Grid = Sequence[Sequence[float | int | None]]
Mask = Sequence[Sequence[bool]]


def _validate_grid(grid: Grid, name: str) -> tuple[int, int]:
    if not grid or not grid[0]:
        raise ValueError(f"{name} grid cannot be empty")
    width = len(grid[0])
    if any(len(row) != width for row in grid):
        raise ValueError(f"{name} grid rows must have equal length")
    return len(grid), width


def _validate_same_shape(grids: dict[str, Grid]) -> tuple[int, int]:
    shapes = {name: _validate_grid(grid, name) for name, grid in grids.items()}
    if len(set(shapes.values())) != 1:
        raise ValueError("all feature grids must have the same shape")
    return next(iter(shapes.values()))


def _safe_ratio(numerator: float, denominator: float) -> float | None:
    return numerator / denominator if abs(denominator) > 1e-12 else None


def normalized_difference(first: Grid, second: Grid) -> list[list[float | None]]:
    _validate_same_shape({"first": first, "second": second})
    result: list[list[float | None]] = []
    for first_row, second_row in zip(first, second):
        row: list[float | None] = []
        for first_value, second_value in zip(first_row, second_row):
            if first_value is None or second_value is None:
                row.append(None)
            else:
                row.append(_safe_ratio(float(first_value) - float(second_value), float(first_value) + float(second_value)))
        result.append(row)
    return result


def bare_soil_index(blue: Grid, red: Grid, nir: Grid, swir16: Grid) -> list[list[float | None]]:
    _validate_same_shape({"blue": blue, "red": red, "nir": nir, "swir16": swir16})
    result: list[list[float | None]] = []
    for blue_row, red_row, nir_row, swir_row in zip(blue, red, nir, swir16):
        row: list[float | None] = []
        for blue_value, red_value, nir_value, swir_value in zip(blue_row, red_row, nir_row, swir_row):
            if None in {blue_value, red_value, nir_value, swir_value}:
                row.append(None)
                continue
            numerator = (float(swir_value) + float(red_value)) - (float(nir_value) + float(blue_value))
            denominator = (float(swir_value) + float(red_value)) + (float(nir_value) + float(blue_value))
            row.append(_safe_ratio(numerator, denominator))
        result.append(row)
    return result


def grid_mean(grid: Grid, mask: Mask | None = None) -> float | None:
    height, width = _validate_grid(grid, "value")
    if mask is not None:
        mask_height, mask_width = _validate_grid(mask, "mask")
        if (height, width) != (mask_height, mask_width):
            raise ValueError("value and mask grids must have the same shape")
    values = [
        float(value)
        for row_index, row in enumerate(grid)
        for column_index, value in enumerate(row)
        if value is not None and (mask is None or bool(mask[row_index][column_index]))
    ]
    return sum(values) / len(values) if values else None


def _difference(value: float | None, baseline: Any) -> float | None:
    if value is None or baseline is None:
        return None
    return value - float(baseline)


def _mean_brightness(blue: Grid, green: Grid, red: Grid, mask: Mask | None) -> float | None:
    means = [grid_mean(grid, mask) for grid in (blue, green, red)]
    valid = [value for value in means if value is not None]
    return sum(valid) / len(valid) if len(valid) == 3 else None


@dataclass(frozen=True, slots=True)
class FeatureRecord:
    segment_id: str
    observed_at: datetime
    optical_scene_ids: tuple[str, ...]
    sar_scene_ids: tuple[str, ...]
    ndvi_mean: float | None
    ndvi_change: float | None
    bsi_mean: float | None
    bsi_change: float | None
    ndbi_mean: float | None
    ndbi_change: float | None
    brightness_mean: float | None
    brightness_change: float | None
    vv_mean_db: float | None
    vv_change_db: float | None
    vh_mean_db: float | None
    vh_change_db: float | None
    linear_continuity: float | None
    rainfall_mm: float
    valid_pixel_fraction: float

    def to_dict(self) -> dict[str, Any]:
        result = {
            field: getattr(self, field)
            for field in (
                "segment_id",
                "ndvi_mean",
                "ndvi_change",
                "bsi_mean",
                "bsi_change",
                "ndbi_mean",
                "ndbi_change",
                "brightness_mean",
                "brightness_change",
                "vv_mean_db",
                "vv_change_db",
                "vh_mean_db",
                "vh_change_db",
                "linear_continuity",
                "rainfall_mm",
                "valid_pixel_fraction",
            )
        }
        result["observed_at"] = self.observed_at.isoformat()
        result["optical_scene_ids"] = list(self.optical_scene_ids)
        result["sar_scene_ids"] = list(self.sar_scene_ids)
        return result

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "FeatureRecord":
        return cls(
            segment_id=str(payload["segment_id"]),
            observed_at=datetime.fromisoformat(str(payload["observed_at"]).replace("Z", "+00:00")),
            optical_scene_ids=tuple(payload.get("optical_scene_ids", [])),
            sar_scene_ids=tuple(payload.get("sar_scene_ids", [])),
            ndvi_mean=payload.get("ndvi_mean"),
            ndvi_change=payload.get("ndvi_change"),
            bsi_mean=payload.get("bsi_mean"),
            bsi_change=payload.get("bsi_change"),
            ndbi_mean=payload.get("ndbi_mean"),
            ndbi_change=payload.get("ndbi_change"),
            brightness_mean=payload.get("brightness_mean"),
            brightness_change=payload.get("brightness_change"),
            vv_mean_db=payload.get("vv_mean_db"),
            vv_change_db=payload.get("vv_change_db"),
            vh_mean_db=payload.get("vh_mean_db"),
            vh_change_db=payload.get("vh_change_db"),
            linear_continuity=payload.get("linear_continuity"),
            rainfall_mm=float(payload.get("rainfall_mm", 0)),
            valid_pixel_fraction=float(payload["valid_pixel_fraction"]),
        )


def extract_observation(payload: dict[str, Any]) -> FeatureRecord:
    segment_id = str(payload.get("segment_id", "")).strip()
    if not segment_id:
        raise ValueError("segment_id is required")
    observed_at = datetime.fromisoformat(str(payload["observed_at"]).replace("Z", "+00:00"))
    baseline = dict(payload.get("baseline") or {})
    mask = payload.get("valid_mask")

    optical = dict(payload.get("optical_bands") or {})
    optical_values: dict[str, float | None] = {
        "ndvi_mean": None,
        "bsi_mean": None,
        "ndbi_mean": None,
        "brightness_mean": None,
    }
    if optical:
        required = {"blue", "green", "red", "nir", "swir16"}
        missing = sorted(required - set(optical))
        if missing:
            raise ValueError(f"missing optical grids: {', '.join(missing)}")
        _validate_same_shape({name: optical[name] for name in required})
        if mask is not None:
            _validate_grid(mask, "valid_mask")
        optical_values = {
            "ndvi_mean": grid_mean(normalized_difference(optical["nir"], optical["red"]), mask),
            "bsi_mean": grid_mean(
                bare_soil_index(optical["blue"], optical["red"], optical["nir"], optical["swir16"]),
                mask,
            ),
            "ndbi_mean": grid_mean(normalized_difference(optical["swir16"], optical["nir"]), mask),
            "brightness_mean": _mean_brightness(optical["blue"], optical["green"], optical["red"], mask),
        }

    sar = dict(payload.get("sar_db") or {})
    vv_mean = grid_mean(sar["vv"], mask=None) if "vv" in sar else None
    vh_mean = grid_mean(sar["vh"], mask=None) if "vh" in sar else None
    if not optical and not sar:
        raise ValueError("at least one optical or SAR grid is required")

    if mask is not None:
        flattened = [bool(value) for row in mask for value in row]
        valid_pixel_fraction = sum(flattened) / len(flattened) if flattened else 0.0
    else:
        valid_pixel_fraction = float(payload.get("valid_pixel_fraction", 1.0))
    if not 0 <= valid_pixel_fraction <= 1:
        raise ValueError("valid_pixel_fraction must be between 0 and 1")

    continuity = payload.get("linear_continuity")
    if continuity is not None and not 0 <= float(continuity) <= 1:
        raise ValueError("linear_continuity must be between 0 and 1")
    rainfall = float(payload.get("rainfall_mm", 0))
    if rainfall < 0 or not math.isfinite(rainfall):
        raise ValueError("rainfall_mm must be a finite non-negative number")

    return FeatureRecord(
        segment_id=segment_id,
        observed_at=observed_at,
        optical_scene_ids=tuple(str(value) for value in payload.get("optical_scene_ids", [])),
        sar_scene_ids=tuple(str(value) for value in payload.get("sar_scene_ids", [])),
        ndvi_mean=optical_values["ndvi_mean"],
        ndvi_change=_difference(optical_values["ndvi_mean"], baseline.get("ndvi_mean")),
        bsi_mean=optical_values["bsi_mean"],
        bsi_change=_difference(optical_values["bsi_mean"], baseline.get("bsi_mean")),
        ndbi_mean=optical_values["ndbi_mean"],
        ndbi_change=_difference(optical_values["ndbi_mean"], baseline.get("ndbi_mean")),
        brightness_mean=optical_values["brightness_mean"],
        brightness_change=_difference(optical_values["brightness_mean"], baseline.get("brightness_mean")),
        vv_mean_db=vv_mean,
        vv_change_db=_difference(vv_mean, baseline.get("vv_mean_db")),
        vh_mean_db=vh_mean,
        vh_change_db=_difference(vh_mean, baseline.get("vh_mean_db")),
        linear_continuity=float(continuity) if continuity is not None else None,
        rainfall_mm=rainfall,
        valid_pixel_fraction=valid_pixel_fraction,
    )


def build_feature_manifest(input_path: str | Path, output_path: str | Path) -> list[FeatureRecord]:
    payload = json.loads(Path(input_path).read_text(encoding="utf-8"))
    records = [extract_observation(observation) for observation in payload.get("observations", [])]
    if not records:
        raise ValueError("feature input contains no observations")
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "schema_version": "1.0",
        "feature_definition": {
            "ndvi": "(nir - red) / (nir + red)",
            "ndbi": "(swir16 - nir) / (swir16 + nir)",
            "bsi": "((swir16 + red) - (nir + blue)) / ((swir16 + red) + (nir + blue))",
            "change": "current segment mean minus baseline segment mean",
        },
        "record_count": len(records),
        "records": [record.to_dict() for record in records],
    }
    destination.write_text(json.dumps(output, indent=2), encoding="utf-8")
    return records

