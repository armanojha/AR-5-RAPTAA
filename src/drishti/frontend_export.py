from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _copy_if_exists(src: Path, dst: Path) -> bool:
    if not src.exists():
        return False
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    return True


def export_frontend_bundle(
    output_dir: Path,
    frontend_public_dir: Path,
    real_cache_dir: Path | None = None,
    portfolio_projects: list[dict[str, Any]] | None = None,
) -> Path:
    """Export real_case outputs and local satellite/evidence assets for the React frontend.

    Generates ``<frontend_public_dir>/drishti_bundle.json`` and copies local PNG chips,
    ReportLab PDFs, HTML reports, and SHA-256 manifests under
    ``<frontend_public_dir>/drishti_assets/`` so the React UI runs 100% offline with
    zero external URLs.
    """
    frontend_public_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = frontend_public_dir / "drishti_assets"
    if assets_dir.exists():
        shutil.rmtree(assets_dir)
    assets_dir.mkdir(parents=True, exist_ok=True)

    projects_raw = _read_json(output_dir / "data" / "projects.json")
    segments_geo = _read_json(output_dir / "data" / "segments.geojson")
    alerts_raw = _read_json(output_dir / "evidence" / "alerts.json")
    track_c_raw = _read_json(output_dir / "track_c" / "track_c_events.json")
    ml_summary = _read_json(output_dir / "ml_risk_summary.json")
    eval_metrics = _read_json(output_dir / "evaluation_metrics.json")
    weight_sens = _read_json(output_dir / "weight_sensitivity.json")
    backtest_raw = _read_json(output_dir / "backtest.json")
    analysis_raw = _read_json(output_dir / "analysis.json")
    activity_raw = _read_json(output_dir / "activity.json")
    quality_raw = _read_json(output_dir / "quality.json")
    scenes_raw = _read_json(output_dir / "scenes.json")

    # 1. Copy real Sentinel-2 chips from real_cache_dir if present
    chips_by_project: dict[str, list[dict[str, str]]] = {}
    if real_cache_dir and real_cache_dir.exists():
        for proj_dir in sorted(real_cache_dir.iterdir()):
            chips_src = proj_dir / "chips"
            if not chips_src.is_dir():
                continue
            by_date: dict[str, dict[str, str]] = {}
            for png in sorted(chips_src.glob("chip_*.png")):
                dst = assets_dir / "chips" / proj_dir.name / png.name
                _copy_if_exists(png, dst)
                stem = png.stem  # chip_YYYY-MM-DD_rgb or chip_YYYY-MM-DD_falsecolor
                parts = stem.split("_")
                if len(parts) >= 3:
                    date_str = parts[1]
                    kind = parts[2]
                    entry = by_date.setdefault(date_str, {"date": date_str})
                    url = f"/drishti_assets/chips/{proj_dir.name}/{png.name}"
                    if kind == "rgb":
                        entry["rgb_url"] = url
                    elif kind == "falsecolor":
                        entry["falsecolor_url"] = url
            if by_date:
                chips_by_project[proj_dir.name] = [by_date[d] for d in sorted(by_date)]

    # 2. Copy Track C chips and enrich events
    track_c_events: list[dict[str, Any]] = []
    for ev in track_c_raw.get("events", []):
        ev_copy = dict(ev)
        rel_chip = str(ev.get("evidence_chip_path", "")).replace("\\", "/")
        if rel_chip:
            src_chip = output_dir / "track_c" / rel_chip
            chip_name = Path(rel_chip).name
            dst_chip = assets_dir / "track_c" / chip_name
            if _copy_if_exists(src_chip, dst_chip):
                ev_copy["chip_url"] = f"/drishti_assets/track_c/{chip_name}"
        track_c_events.append(ev_copy)

    # 3. Copy alert evidence bundles (PDF, HTML, manifest, chips)
    alerts_dir = output_dir / "evidence" / "alerts"
    enriched_alerts: list[dict[str, Any]] = []
    for alert in alerts_raw.get("alerts", []):
        al_copy = dict(alert)
        aid = str(alert.get("alert_id", ""))
        src_al_dir = alerts_dir / aid
        dst_al_dir = assets_dir / "alerts" / aid
        if src_al_dir.is_dir():
            if _copy_if_exists(src_al_dir / "report.pdf", dst_al_dir / "report.pdf"):
                al_copy["pdf_url"] = f"/drishti_assets/alerts/{aid}/report.pdf"
            if _copy_if_exists(src_al_dir / "report.html", dst_al_dir / "report.html"):
                al_copy["html_url"] = f"/drishti_assets/alerts/{aid}/report.html"
            if _copy_if_exists(src_al_dir / "manifest.json", dst_al_dir / "manifest.json"):
                al_copy["manifest_url"] = f"/drishti_assets/alerts/{aid}/manifest.json"
            chip_urls: list[str] = []
            chips_subdir = src_al_dir / "chips"
            if chips_subdir.is_dir():
                for png in sorted(chips_subdir.glob("*.png")):
                    if _copy_if_exists(png, dst_al_dir / "chips" / png.name):
                        chip_urls.append(f"/drishti_assets/alerts/{aid}/chips/{png.name}")
            al_copy["chip_urls"] = chip_urls
        enriched_alerts.append(al_copy)

    # 4. Copy top-level audit JSONs for direct download
    audit_files: dict[str, str] = {}
    for fname in [
        "evaluation_metrics.json",
        "weight_sensitivity.json",
        "ml_risk_summary.json",
        "backtest.json",
    ]:
        if _copy_if_exists(output_dir / fname, assets_dir / "audit" / fname):
            audit_files[fname] = f"/drishti_assets/audit/{fname}"
    if _copy_if_exists(
        output_dir / "track_c" / "track_c_events.json",
        assets_dir / "audit" / "track_c_events.json",
    ):
        audit_files["track_c_events.json"] = "/drishti_assets/audit/track_c_events.json"

    # 5. Build per-segment latest state + per-date timeline frames
    activity_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    latest_act_by_seg: dict[str, dict[str, Any]] = {}
    for rec in sorted(activity_raw.get("records", []), key=lambda r: r["observed_at"]):
        activity_by_key[(rec["segment_id"], rec["observed_at"])] = rec
        latest_act_by_seg[rec["segment_id"]] = rec

    analysis_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    latest_an_by_seg: dict[str, dict[str, Any]] = {}
    for rec in sorted(analysis_raw.get("records", []), key=lambda r: r["observed_at"]):
        analysis_by_key[(rec["segment_id"], rec["observed_at"])] = rec
        latest_an_by_seg[rec["segment_id"]] = rec

    risk_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    latest_rk_by_seg: dict[str, dict[str, Any]] = {}
    for rec in sorted(backtest_raw.get("risk_records", []), key=lambda r: r["observed_at"]):
        risk_by_key[(rec["segment_id"], rec["observed_at"])] = rec
        latest_rk_by_seg[rec["segment_id"]] = rec

    ml_pred_by_seg = {p["segment_id"]: p for p in ml_summary.get("predictions", [])}

    all_dates = sorted({r["observed_at"] for r in analysis_raw.get("records", [])})
    latest_date = all_dates[-1] if all_dates else ""

    segments_out: list[dict[str, Any]] = []
    for feat in segments_geo.get("features", []):
        props = dict(feat.get("properties", {}))
        sid = props["segment_id"]
        latest_an = latest_an_by_seg.get(sid, {})
        latest_act = latest_act_by_seg.get(sid, {})
        latest_rk = latest_rk_by_seg.get(sid, {})
        ml_p = ml_pred_by_seg.get(sid, {})
        seg_state = latest_an.get("state", "unknown")
        is_assess = seg_state != "not_assessable" and props.get("observability", "high") != "none"
        segments_out.append(
            {
                **props,
                "geometry": feat.get("geometry", {}),
                "latest_observed_at": latest_an.get("observed_at", latest_date),
                "activity_index": latest_act.get("activity_index"),
                "activity_confidence": latest_act.get("confidence"),
                "spend_to_date_pct": latest_an.get("spend_to_date_pct"),
                "reported_progress_pct": latest_an.get("reported_progress_pct"),
                "spend_vs_activity_ratio": latest_an.get("spend_vs_activity_ratio"),
                "activity_reporting_divergence": latest_an.get("activity_reporting_divergence"),
                "is_assessable": is_assess,
                "analysis_status": seg_state,
                "delay_risk_score": latest_rk.get("delay_risk_score", 0.0),
                "ml_delay_probability": ml_p.get("ml_delay_probability", 0.0),
                "alert_triggered": latest_rk.get("alert_triggered", False),
            }
        )

    timeline_frames: list[dict[str, Any]] = []
    for dt in all_dates:
        seg_snaps = []
        for feat in segments_geo.get("features", []):
            props = feat.get("properties", {})
            sid = props["segment_id"]
            an = analysis_by_key.get((sid, dt), {})
            act = activity_by_key.get((sid, dt), {})
            rk = risk_by_key.get((sid, dt), {})
            snap_state = an.get("state", "unknown")
            snap_assess = snap_state != "not_assessable" and props.get("observability", "high") != "none"
            seg_snaps.append(
                {
                    "segment_id": sid,
                    "project_id": props.get("project_id"),
                    "activity_index": act.get("activity_index"),
                    "spend_to_date_pct": an.get("spend_to_date_pct"),
                    "reported_progress_pct": an.get("reported_progress_pct"),
                    "spend_vs_activity_ratio": an.get("spend_vs_activity_ratio"),
                    "divergence": an.get("activity_reporting_divergence"),
                    "is_assessable": snap_assess,
                    "status": snap_state,
                    "delay_risk_score": rk.get("delay_risk_score", 0.0),
                    "alert_triggered": rk.get("alert_triggered", False),
                }
            )
        timeline_frames.append({"observed_at": dt, "segments": seg_snaps})

    # 6. Build portfolio projects list (3 real + 2 synthetic if provided)
    seg_to_proj = {s["segment_id"]: s.get("project_id", "") for s in segments_out}
    bt_cases_enriched: list[dict[str, Any]] = []
    bt_by_proj: dict[str, dict[str, Any]] = {}
    for c in backtest_raw.get("cases", []):
        sid = str(c.get("segment_id", ""))
        pid = c.get("project_id") or seg_to_proj.get(sid) or sid.rsplit("-S", 1)[0]
        enriched = {**c, "project_id": pid}
        bt_cases_enriched.append(enriched)
        if pid:
            bt_by_proj[pid] = enriched
    projects_out: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for p in projects_raw.get("projects", []):
        pid = p["project_id"]
        seen_ids.add(pid)
        proj_segs = [s for s in segments_out if s.get("project_id") == pid]
        assessable_segs = [s for s in proj_segs if s.get("is_assessable", True)]
        avg_sai = (
            round(
                sum(s["activity_index"] or 0.0 for s in assessable_segs)
                / len(assessable_segs),
                3,
            )
            if assessable_segs
            else 0.0
        )
        avg_spend = (
            round(
                sum(s["spend_to_date_pct"] or 0.0 for s in proj_segs) / len(proj_segs),
                1,
            )
            if proj_segs
            else 0.0
        )
        avg_rep = (
            round(
                sum(s["reported_progress_pct"] or 0.0 for s in proj_segs)
                / len(proj_segs),
                1,
            )
            if proj_segs
            else 0.0
        )
        avg_ratio = (
            round(
                sum(s["spend_vs_activity_ratio"] or 0.0 for s in assessable_segs)
                / len(assessable_segs),
                2,
            )
            if assessable_segs
            else 0.0
        )
        bt_case = bt_by_proj.get(pid, {})
        is_synth = p.get("data_classification", "real") != "real" or str(pid).startswith("SYNTH-")
        projects_out.append(
            {
                **p,
                "data_classification": "synthetic" if is_synth else "real",
                "is_synthetic": is_synth,
                "segment_count": len(proj_segs),
                "not_assessable_count": len(proj_segs) - len(assessable_segs),
                "avg_activity_index": avg_sai,
                "avg_spend_pct": avg_spend,
                "avg_reported_pct": avg_rep,
                "avg_spend_vs_activity_ratio": avg_ratio,
                "backtest_outcome": bt_case.get("outcome"),
                "lead_time_days": bt_case.get("lead_time_days"),
            }
        )

    for extra in portfolio_projects or []:
        pid = extra.get("project_id")
        if pid and pid not in seen_ids:
            projects_out.append(
                {
                    **extra,
                    "is_synthetic": extra.get("data_classification", "synthetic")
                    == "synthetic",
                }
            )

    bundle = {
        "schema_version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "data_classification": "real_plus_labelled_synthetic_portfolio",
        "latest_observed_at": latest_date,
        "timeline_dates": all_dates,
        "projects": projects_out,
        "segments": segments_out,
        "timeline_frames": timeline_frames,
        "alerts": enriched_alerts,
        "alerts_summary": alerts_raw.get("summary", {}),
        "track_c_events": track_c_events,
        "ml_summary": ml_summary,
        "backtest": {
            "method": backtest_raw.get("method"),
            "alert_threshold": backtest_raw.get("alert_threshold"),
            "cases": bt_cases_enriched,
            "summary": backtest_raw.get("summary", {}),
        },
        "evaluation_metrics": eval_metrics,
        "weight_sensitivity": weight_sens,
        "quality_summary": quality_raw.get("summary", {}),
        "scenes": scenes_raw.get("scenes", []),
        "chips_by_project": chips_by_project,
        "audit_files": audit_files,
        "layer12_roi": {
            "is_illustrative": True,
            "assumption_note": (
                "Illustrative national portfolio scenario based on static inputs; "
                "revalidate against the current official portfolio before using it in a decision."
            ),
            "addressable_projects": 1862,
            "capex_lakh_cr": 38.11,
            "cost_overrun_lakh_cr": 5.79,
            "delayed_projects": 794,
            "annual_platform_cost_cr": 56.0,
            "roi_multiple": "180x",
            "value_drivers": [
                "Early stall intervention (3-12 months ahead of official DPR flags)",
                "Verification-triggered spend alignment on high spend-vs-activity gaps",
                "Track C RoW encroachment & illegal river sand-mining protection",
            ],
            "target_agencies": [
                "NHAI / MoRTH",
                "Indian Railways / RVNL",
                "MoSPI / PM Gati Shakti",
                "State Bridge & PWD Corps",
                "C&AG / Vigilance Audit",
            ],
        },
    }

    bundle_path = frontend_public_dir / "drishti_bundle.json"
    bundle_path.write_text(json.dumps(bundle, indent=2), encoding="utf-8")
    return bundle_path
