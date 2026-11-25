from __future__ import annotations

import argparse
import json
from pathlib import Path

from drishti.api import serve_alert_api
from drishti.dashboard import build_dashboard
from drishti.layers.activity_index import score_feature_manifest
from drishti.layers.alignment import AlignmentInput, build_segments, export_segments
from drishti.layers.backtest import DelayRiskScorer, run_backtest
from drishti.layers.evidence import build_evidence_packages, verify_evidence_manifest
from drishti.layers.features import build_feature_manifest
from drishti.layers.project_registry import ProjectRegistry, RegistryValidationError
from drishti.layers.quality import evaluate_manifest
from drishti.layers.scene_catalog import SceneCatalog, stac_search
from drishti.layers.stall_divergence import StallDivergenceDetector, run_stall_divergence


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="drishti", description="Drishti data pipeline")
    commands = parser.add_subparsers(dest="command", required=True)

    registry = commands.add_parser("registry", help="Project registry operations")
    registry_commands = registry.add_subparsers(dest="registry_command", required=True)

    validate = registry_commands.add_parser("validate", help="Validate a project registry CSV")
    validate.add_argument("--input", required=True, type=Path)

    export = registry_commands.add_parser("export", help="Validate and export normalized JSON")
    export.add_argument("--input", required=True, type=Path)
    export.add_argument("--output", required=True, type=Path)

    alignment = commands.add_parser("alignment", help="Alignment and segmentation operations")
    alignment_commands = alignment.add_subparsers(dest="alignment_command", required=True)
    build = alignment_commands.add_parser("build", help="Build buffered corridor segments from GeoJSON")
    build.add_argument("--input", required=True, type=Path)
    build.add_argument("--project-id", required=True)
    build.add_argument("--baseline-start", required=True)
    build.add_argument("--baseline-end", required=True)
    build.add_argument("--observability", choices=("high", "medium", "low"), default="high")
    build.add_argument("--segment-meters", type=float, default=1000.0)
    build.add_argument("--buffer-meters", type=float, default=300.0)
    build.add_argument("--output", required=True, type=Path)

    scenes = commands.add_parser("scenes", help="STAC scene catalogue operations")
    scene_commands = scenes.add_subparsers(dest="scene_command", required=True)
    ingest = scene_commands.add_parser("ingest", help="Ingest a saved STAC FeatureCollection")
    ingest.add_argument("--input", required=True, type=Path)
    ingest.add_argument("--segments", type=Path)
    ingest.add_argument("--provider")
    ingest.add_argument("--output", required=True, type=Path)

    search = scene_commands.add_parser("search", help="Search a STAC API")
    search.add_argument("--endpoint", required=True)
    search.add_argument("--collection", required=True, action="append")
    search.add_argument("--bbox", required=True, type=float, nargs=4, metavar=("WEST", "SOUTH", "EAST", "NORTH"))
    search.add_argument("--datetime", required=True, dest="datetime_range")
    search.add_argument("--limit", type=int, default=100)
    search.add_argument("--segments", type=Path)
    search.add_argument("--provider")
    search.add_argument("--output", required=True, type=Path)

    quality = commands.add_parser("quality", help="Scene preprocessing and quality operations")
    quality_commands = quality.add_subparsers(dest="quality_command", required=True)
    evaluate = quality_commands.add_parser("evaluate", help="Evaluate a scene manifest")
    evaluate.add_argument("--manifest", required=True, type=Path)
    evaluate.add_argument("--max-cloud", type=float, default=40.0)
    evaluate.add_argument("--min-valid", type=float, default=0.60)
    evaluate.add_argument("--output", required=True, type=Path)

    features = commands.add_parser("features", help="Segment feature extraction operations")
    feature_commands = features.add_subparsers(dest="feature_command", required=True)
    feature_build = feature_commands.add_parser("build", help="Build optical and SAR segment features")
    feature_build.add_argument("--input", required=True, type=Path)
    feature_build.add_argument("--output", required=True, type=Path)

    activity = commands.add_parser("activity", help="Satellite Activity Index operations")
    activity_commands = activity.add_subparsers(dest="activity_command", required=True)
    activity_score = activity_commands.add_parser("score", help="Score a feature manifest")
    activity_score.add_argument("--features", required=True, type=Path)
    activity_score.add_argument("--segments", required=True, type=Path)
    activity_score.add_argument("--output", required=True, type=Path)

    analysis = commands.add_parser("analysis", help="Stall and divergence analysis")
    analysis_commands = analysis.add_subparsers(dest="analysis_command", required=True)
    detect = analysis_commands.add_parser("detect", help="Detect stalls and activity-reporting divergence")
    detect.add_argument("--activity", required=True, type=Path)
    detect.add_argument("--features", required=True, type=Path)
    detect.add_argument("--reporting", required=True, type=Path)
    detect.add_argument("--low-activity", type=float, default=25.0)
    detect.add_argument("--consecutive", type=int, default=3)
    detect.add_argument("--heavy-rainfall", type=float, default=30.0)
    detect.add_argument("--min-confidence", type=float, default=0.40)
    detect.add_argument("--output", required=True, type=Path)

    backtest = commands.add_parser("backtest", help="Chronological delay-risk case-study back-test")
    backtest_commands = backtest.add_subparsers(dest="backtest_command", required=True)
    backtest_run = backtest_commands.add_parser("run", help="Run a no-future-leakage back-test")
    backtest_run.add_argument("--analysis", required=True, type=Path)
    backtest_run.add_argument("--labels", required=True, type=Path)
    backtest_run.add_argument("--alert-threshold", type=float, default=0.65)
    backtest_run.add_argument("--output", required=True, type=Path)

    alerts = commands.add_parser("alerts", help="Evidence package and alert API operations")
    alert_commands = alerts.add_subparsers(dest="alert_command", required=True)
    alert_build = alert_commands.add_parser("build", help="Build tamper-evident alert packages")
    alert_build.add_argument("--analysis", required=True, type=Path)
    alert_build.add_argument("--backtest", required=True, type=Path)
    alert_build.add_argument("--activity", required=True, type=Path)
    alert_build.add_argument("--features", required=True, type=Path)
    alert_build.add_argument("--segments", required=True, type=Path)
    alert_build.add_argument("--scenes", type=Path)
    alert_build.add_argument("--output-dir", required=True, type=Path)
    alert_verify = alert_commands.add_parser("verify", help="Verify an evidence manifest hash")
    alert_verify.add_argument("--manifest", required=True, type=Path)
    alert_serve = alert_commands.add_parser("serve", help="Serve the local alert JSON API")
    alert_serve.add_argument("--evidence-dir", required=True, type=Path)
    alert_serve.add_argument("--host", default="127.0.0.1")
    alert_serve.add_argument("--port", type=int, default=8765)

    dashboard = commands.add_parser("dashboard", help="Offline judge dashboard operations")
    dashboard_commands = dashboard.add_subparsers(dest="dashboard_command", required=True)
    dashboard_build = dashboard_commands.add_parser("build", help="Build the self-contained dashboard")
    dashboard_build.add_argument("--evidence-dir", required=True, type=Path)
    dashboard_build.add_argument("--segments", required=True, type=Path)
    dashboard_build.add_argument("--activity", required=True, type=Path)
    dashboard_build.add_argument("--analysis", required=True, type=Path)
    dashboard_build.add_argument("--backtest", required=True, type=Path)
    dashboard_build.add_argument("--output-dir", required=True, type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    if args.command == "alerts":
        if args.alert_command == "serve":
            serve_alert_api(args.evidence_dir, host=args.host, port=args.port)
            return 0
        if args.alert_command == "verify":
            valid = verify_evidence_manifest(args.manifest)
            print("evidence manifest verified" if valid else "evidence manifest verification failed")
            return 0 if valid else 1
        try:
            records = build_evidence_packages(
                analysis_path=args.analysis,
                backtest_path=args.backtest,
                activity_path=args.activity,
                features_path=args.features,
                segments_path=args.segments,
                scenes_path=args.scenes,
                output_directory=args.output_dir,
            )
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"alert evidence build failed: {exc}")
            return 1
        print(f"built {len(records)} evidence package(s) in {args.output_dir}")
        return 0

    if args.command == "dashboard":
        try:
            output = build_dashboard(
                evidence_directory=args.evidence_dir,
                segments_path=args.segments,
                activity_path=args.activity,
                analysis_path=args.analysis,
                backtest_path=args.backtest,
                output_directory=args.output_dir,
            )
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"dashboard build failed: {exc}")
            return 1
        print(f"built offline dashboard at {output}")
        return 0

    if args.command == "analysis":
        try:
            detector = StallDivergenceDetector(
                low_activity_threshold=args.low_activity,
                consecutive_observations=args.consecutive,
                heavy_rainfall_mm=args.heavy_rainfall,
                minimum_confidence=args.min_confidence,
            )
            records = run_stall_divergence(
                args.activity,
                args.features,
                args.reporting,
                args.output,
                detector=detector,
            )
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"stall and divergence analysis failed: {exc}")
            return 1
        stalls = sum(record.state == "stall_candidate" for record in records)
        print(f"exported {len(records)} analysis record(s) with {stalls} stall candidate(s) to {args.output}")
        return 0

    if args.command == "backtest":
        try:
            risk_records, cases = run_backtest(
                args.analysis,
                args.labels,
                args.output,
                scorer=DelayRiskScorer(alert_threshold=args.alert_threshold),
            )
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"back-test failed: {exc}")
            return 1
        detected = sum(case.outcome == "detected_before_official_flag" for case in cases)
        print(
            f"exported {len(risk_records)} risk record(s); detected {detected}/{len(cases)} "
            f"case(s) before the official flag"
        )
        return 0

    if args.command == "features":
        try:
            records = build_feature_manifest(args.input, args.output)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"feature extraction failed: {exc}")
            return 1
        print(f"exported {len(records)} feature record(s) to {args.output}")
        return 0

    if args.command == "activity":
        try:
            records = score_feature_manifest(args.features, args.segments, args.output)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"activity scoring failed: {exc}")
            return 1
        print(f"exported {len(records)} activity record(s) to {args.output}")
        return 0

    if args.command == "scenes":
        try:
            if args.scene_command == "ingest":
                catalog = SceneCatalog.from_stac_file(args.input)
            else:
                catalog = stac_search(
                    args.endpoint,
                    collections=args.collection,
                    bbox=tuple(args.bbox),
                    datetime_range=args.datetime_range,
                    limit=args.limit,
                )
            if args.segments:
                catalog = catalog.attach_segment_coverage(args.segments)
            catalog.export_manifest(args.output, provider=args.provider)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"scene catalogue operation failed: {exc}")
            return 1
        print(f"exported {len(catalog.scenes)} scene(s) to {args.output}")
        return 0

    if args.command == "quality":
        try:
            results = evaluate_manifest(
                args.manifest,
                args.output,
                max_cloud_pct=args.max_cloud,
                min_valid_pixel_fraction=args.min_valid,
            )
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"quality evaluation failed: {exc}")
            return 1
        accepted = sum(result.status == "accepted" for result in results)
        review = sum(result.status == "review" for result in results)
        rejected = sum(result.status == "rejected" for result in results)
        print(f"evaluated {len(results)} scene(s): {accepted} accepted, {review} review, {rejected} rejected")
        return 0

    if args.command == "alignment":
        try:
            alignment = AlignmentInput.from_geojson(args.input)
            segments = build_segments(
                alignment,
                project_id=args.project_id,
                baseline_start=args.baseline_start,
                baseline_end=args.baseline_end,
                observability=args.observability,
                segment_length_m=args.segment_meters,
                buffer_m=args.buffer_meters,
            )
            export_segments(segments, args.output, source_properties=alignment.source_properties)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"alignment build failed: {exc}")
            return 1
        print(f"exported {len(segments)} segment(s) to {args.output}")
        return 0

    try:
        registry = ProjectRegistry.from_csv(args.input)
    except (OSError, ValueError, RegistryValidationError) as exc:
        print(f"registry validation failed: {exc}")
        return 1

    if args.registry_command == "validate":
        print(f"validated {len(registry.records)} project record(s)")
        return 0

    registry.to_json(args.output)
    print(f"exported {len(registry.records)} project record(s) to {args.output}")
    return 0

