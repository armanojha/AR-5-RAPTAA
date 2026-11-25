from __future__ import annotations

from pathlib import Path

from drishti.layers.activity_index import score_feature_manifest
from drishti.layers.alignment import AlignmentInput, build_segments, export_segments
from drishti.layers.backtest import run_backtest
from drishti.layers.evidence import build_evidence_packages
from drishti.layers.features import build_feature_manifest
from drishti.layers.stall_divergence import run_stall_divergence


def build_sample_pipeline(repository: Path, output: Path) -> dict[str, Path]:
    paths = {
        "segments": output / "segments.geojson",
        "features": output / "features.json",
        "activity": output / "activity.json",
        "analysis": output / "analysis.json",
        "backtest": output / "backtest.json",
        "evidence": output / "evidence",
    }
    alignment = AlignmentInput.from_geojson(repository / "data" / "sample_alignment.geojson")
    export_segments(
        build_segments(
            alignment,
            project_id="DEMO-001",
            baseline_start="2023-01-15",
            baseline_end="2024-01-14",
        ),
        paths["segments"],
        source_properties=alignment.source_properties,
    )
    build_feature_manifest(repository / "data" / "sample_observations.json", paths["features"])
    score_feature_manifest(paths["features"], paths["segments"], paths["activity"])
    run_stall_divergence(
        paths["activity"],
        paths["features"],
        repository / "data" / "sample_reporting.json",
        paths["analysis"],
    )
    run_backtest(
        paths["analysis"],
        repository / "data" / "sample_delay_labels.json",
        paths["backtest"],
    )
    build_evidence_packages(
        analysis_path=paths["analysis"],
        backtest_path=paths["backtest"],
        activity_path=paths["activity"],
        features_path=paths["features"],
        segments_path=paths["segments"],
        output_directory=paths["evidence"],
    )
    return paths

