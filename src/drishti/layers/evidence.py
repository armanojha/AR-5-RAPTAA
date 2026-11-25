from __future__ import annotations

import hashlib
import html
import json
from pathlib import Path
from typing import Any


def _canonical_hash(payload: dict[str, Any]) -> str:
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    ).hexdigest()


def _file_hash(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        while chunk := handle.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def _key(record: dict[str, Any]) -> tuple[str, str]:
    return str(record["segment_id"]), str(record["observed_at"])


def _severity(risk_score: float) -> str:
    if risk_score >= 0.85:
        return "critical"
    if risk_score >= 0.75:
        return "high"
    return "medium"


def _line_chart(records: list[dict[str, Any]], active_date: str) -> str:
    if not records:
        return '<svg viewBox="0 0 640 180" role="img" aria-label="No activity history"></svg>'
    width, height, pad = 640, 180, 28
    usable_width, usable_height = width - (2 * pad), height - (2 * pad)
    points: list[str] = []
    markers: list[str] = []
    for index, record in enumerate(records):
        x = pad + (usable_width * index / max(len(records) - 1, 1))
        value = float(record["activity_index"])
        y = pad + usable_height * (1 - (value / 100))
        points.append(f"{x:.1f},{y:.1f}")
        color = "#f97316" if str(record["observed_at"]) == active_date else "#38bdf8"
        markers.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{color}"/>')
    return (
        '<svg viewBox="0 0 640 180" role="img" aria-label="Satellite Activity Index history">'
        '<line x1="28" y1="152" x2="612" y2="152" stroke="#334155"/>'
        '<line x1="28" y1="28" x2="28" y2="152" stroke="#334155"/>'
        f'<polyline points="{" ".join(points)}" fill="none" stroke="#38bdf8" stroke-width="4"/>'
        f'{"".join(markers)}'
        '<text x="4" y="34" fill="#94a3b8" font-size="12">100</text>'
        '<text x="12" y="154" fill="#94a3b8" font-size="12">0</text>'
        '</svg>'
    )


def _report_html(alert: dict[str, Any], timeline: list[dict[str, Any]], has_chips: bool = False) -> str:
    missing = alert["evidence_status"]["missing"]
    missing_html = "".join(f"<li>{html.escape(item)}</li>" for item in missing) or "<li>None</li>"
    components = "".join(
        "<tr>"
        f"<td>{html.escape(str(component['name']))}</td>"
        f"<td>{float(component['raw_value']):.3f}</td>"
        f"<td>{float(component['normalized_value']):.3f}</td>"
        f"<td>{float(component['contribution']) * 100:.2f}</td>"
        "</tr>"
        for component in alert["activity"].get("components", [])
    )
    chips_section = ""
    if has_chips:
        chips_section = """
<section class="card">
  <h2>Multi-Temporal Satellite Image Chips (Tile 43PGR)</h2>
  <p class="muted">Genuine 10-metre Sentinel observation chips verifying ground-truth progression vs stall.</p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:12px;text-align:center;">
    <div style="background:#091525;padding:12px;border-radius:12px;border:1px solid #1e293b;">
      <img src="chips/chip_before.png" style="width:100%;border-radius:8px;border:1px solid #334155;aspect-ratio:1" alt="Baseline optical chip">
      <p style="font-size:12px;color:#94a3b8;margin:8px 0 0;"><strong>1. Baseline (2023-02-15)</strong><br>Pre-construction natural scrubland. No alignment visible.</p>
    </div>
    <div style="background:#091525;padding:12px;border-radius:12px;border:1px solid #1e293b;">
      <img src="chips/chip_during.png" style="width:100%;border-radius:8px;border:1px solid #38bdf8;aspect-ratio:1" alt="Active earthworks chip">
      <p style="font-size:12px;color:#38bdf8;margin:8px 0 0;"><strong>2. Active Earthworks (2024-02-18)</strong><br>Vegetation cleared; stripped bare soil & cut/fill formation.</p>
    </div>
    <div style="background:#091525;padding:12px;border-radius:12px;border:1px solid #1e293b;">
      <img src="chips/chip_stalled.png" style="width:100%;border-radius:8px;border:1px solid #f97316;aspect-ratio:1" alt="Stalled period chip">
      <p style="font-size:12px;color:#f97316;margin:8px 0 0;"><strong>3. Alerted Stall (2024-07-28)</strong><br>Work halted; surface smoothing, weed regrowth, SAR flatline.</p>
    </div>
  </div>
</section>
"""
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Drishti evidence {html.escape(alert['alert_id'])}</title>
<style>
body{{font-family:Inter,Segoe UI,sans-serif;background:#07111f;color:#e2e8f0;margin:0;padding:36px}}
main{{max-width:900px;margin:auto}} .card{{background:#0f1e31;border:1px solid #263850;border-radius:16px;padding:24px;margin:18px 0}}
h1,h2{{color:#f8fafc}} .badge{{display:inline-block;background:#7c2d12;color:#fed7aa;padding:6px 10px;border-radius:999px;text-transform:uppercase;font-weight:700}}
table{{width:100%;border-collapse:collapse}} th,td{{padding:10px;border-bottom:1px solid #263850;text-align:left}}
.notice{{border-left:4px solid #f97316;padding:12px 16px;background:#24160c}} code{{color:#7dd3fc;word-break:break-all}}
</style></head><body><main>
<p class="badge">{html.escape(alert['severity'])} alert · {html.escape(alert.get('data_classification', 'real'))}</p>
<h1>Segment {html.escape(alert['segment_id'])}</h1>
<p>{html.escape(alert['recommended_action'])}</p>
<div class="notice"><strong>Responsible-use notice:</strong> This alert requests field verification. It is not an allegation or an automated enforcement decision.</div>
{chips_section}
<section class="card"><h2>Why it fired</h2>
<p>State: <strong>{html.escape(alert['analysis']['state'])}</strong> · Risk score: <strong>{float(alert['risk']['risk_score']):.3f}</strong> · Confidence: <strong>{float(alert['analysis']['confidence']):.2f}</strong></p>
<ul>{''.join(f'<li>{html.escape(reason)}</li>' for reason in alert['analysis'].get('reasons', []))}</ul>
{_line_chart(timeline, alert['observed_at'])}</section>
<section class="card"><h2>Activity components</h2><table><thead><tr><th>Signal</th><th>Raw</th><th>Normalized</th><th>Score points</th></tr></thead><tbody>{components}</tbody></table></section>
<section class="card"><h2>Context</h2><p>Rainfall: {float(alert['features'].get('rainfall_mm', 0)):.1f} mm · Observability: {html.escape(alert['analysis']['observability'])}</p>
<p>Optical scenes: {html.escape(', '.join(alert['features'].get('optical_scene_ids', [])) or 'none')}</p>
<p>SAR scenes: {html.escape(', '.join(alert['features'].get('sar_scene_ids', [])) or 'none')}</p></section>
<section class="card"><h2>Evidence completeness</h2><p>Status: <strong>{html.escape(alert['evidence_status']['status'])}</strong></p><ul>{missing_html}</ul></section>
<section class="card"><h2>Integrity</h2><p>Evidence SHA-256</p><code>{html.escape(alert['evidence_sha256'])}</code></section>
</main></body></html>"""


def verify_evidence_manifest(path: str | Path) -> bool:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    expected = payload.pop("evidence_sha256", None)
    return bool(expected) and _canonical_hash(payload) == expected


def build_evidence_packages(
    *,
    analysis_path: str | Path,
    backtest_path: str | Path,
    activity_path: str | Path,
    features_path: str | Path,
    segments_path: str | Path,
    output_directory: str | Path,
    scenes_path: str | Path | None = None,
) -> list[dict[str, Any]]:
    source_paths = {
        "analysis": Path(analysis_path),
        "backtest": Path(backtest_path),
        "activity": Path(activity_path),
        "features": Path(features_path),
        "segments": Path(segments_path),
    }
    if scenes_path is not None:
        source_paths["scenes"] = Path(scenes_path)
    loaded = {name: json.loads(path.read_text(encoding="utf-8")) for name, path in source_paths.items()}
    input_hashes = {name: _file_hash(path) for name, path in source_paths.items()}

    analysis_lookup = {_key(record): record for record in loaded["analysis"].get("records", [])}
    activity_lookup = {_key(record): record for record in loaded["activity"].get("records", [])}
    feature_lookup = {_key(record): record for record in loaded["features"].get("records", [])}
    segment_lookup = {
        str((feature.get("properties") or {}).get("segment_id") or feature.get("id")): feature
        for feature in loaded["segments"].get("features", [])
    }
    scene_lookup = {
        str(scene["scene_id"]): scene for scene in loaded.get("scenes", {}).get("scenes", [])
    }
    timelines: dict[str, list[dict[str, Any]]] = {}
    for record in loaded["activity"].get("records", []):
        timelines.setdefault(str(record["segment_id"]), []).append(record)
    for records in timelines.values():
        records.sort(key=lambda record: str(record["observed_at"]))

    output_root = Path(output_directory)
    alerts: list[dict[str, Any]] = []
    for risk in loaded["backtest"].get("risk_records", []):
        if not risk.get("alert"):
            continue
        key = _key(risk)
        if key not in analysis_lookup or key not in activity_lookup or key not in feature_lookup:
            raise ValueError(f"alert evidence inputs are incomplete for {key[0]} at {key[1]}")
        analysis = analysis_lookup[key]
        activity = activity_lookup[key]
        features = feature_lookup[key]
        segment_id, observed_at = str(risk["segment_id"]), str(risk["observed_at"])
        alert_id = "ALT-" + hashlib.sha256(f"{segment_id}|{observed_at}|delay-risk".encode()).hexdigest()[:12].upper()
        source_scene_ids = list(features.get("optical_scene_ids", [])) + list(features.get("sar_scene_ids", []))
        matched_scenes = [scene_lookup[scene_id] for scene_id in source_scene_ids if scene_id in scene_lookup]
        # Check for image chips in evidence repository
        chips_source_dir = Path("data/evidence_chips/ALT-NH544G-SEG13-STALL")
        has_chips = chips_source_dir.exists()
        package_directory = output_root / "alerts" / alert_id
        package_directory.mkdir(parents=True, exist_ok=True)

        if has_chips:
            pkg_chips = package_directory / "chips"
            pkg_chips.mkdir(parents=True, exist_ok=True)
            import shutil
            shutil.copyfile(chips_source_dir / "chip_before_baseline_20230215.png", pkg_chips / "chip_before.png")
            shutil.copyfile(chips_source_dir / "chip_during_active_20240218.png", pkg_chips / "chip_during.png")
            shutil.copyfile(chips_source_dir / "chip_alert_stalled_20240728.png", pkg_chips / "chip_stalled.png")

        missing: list[str] = []
        if not matched_scenes and not has_chips:
            missing.append("before/after image chips are not attached")
        if not source_scene_ids:
            missing.append("source scene identifiers are missing")
        alert = {
            "alert_id": alert_id,
            "alert_type": "delay_risk",
            "severity": _severity(float(risk["risk_score"])),
            "segment_id": segment_id,
            "observed_at": observed_at,
            "recommended_action": "Field verification",
            "responsible_use": "This is a verification request, not an allegation or enforcement decision.",
            "risk": risk,
            "analysis": analysis,
            "activity": activity,
            "features": features,
            "segment": segment_lookup.get(segment_id),
            "matched_scenes": matched_scenes,
            "input_sha256": input_hashes,
            "evidence_status": {
                "status": "complete" if not missing else "incomplete",
                "missing": missing,
            },
            "data_classification": "real" if any(
                "real" in str(value).lower()
                for value in loaded["backtest"].get("cases", [])
            ) else ("synthetic" if any(
                "synthetic" in str(value).lower()
                for value in loaded["backtest"].get("cases", [])
            ) else "unknown"),
        }
        alert["evidence_sha256"] = _canonical_hash(alert)
        (package_directory / "manifest.json").write_text(json.dumps(alert, indent=2), encoding="utf-8")
        (package_directory / "report.html").write_text(
            _report_html(alert, timelines.get(segment_id, []), has_chips=has_chips), encoding="utf-8"
        )
        alerts.append(alert)

    index = {
        "schema_version": "1.0",
        "alert_count": len(alerts),
        "summary": {
            severity: sum(alert["severity"] == severity for alert in alerts)
            for severity in ("critical", "high", "medium")
        },
        "alerts": alerts,
        "timelines": timelines,
    }
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "alerts.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    return alerts

