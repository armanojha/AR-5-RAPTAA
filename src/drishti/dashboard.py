from __future__ import annotations

import html
import json
import os
from pathlib import Path
from typing import Any


STATE_COLORS = {
    "active": "#22c55e",
    "accelerating": "#38bdf8",
    "slowing": "#f59e0b",
    "stall_candidate": "#f97316",
    "not_assessable": "#64748b",
    "unknown": "#334155",
}


def _map_svg(segments: list[dict[str, Any]], latest_states: dict[str, str]) -> str:
    coordinate_sets: list[tuple[str, list[list[float]]]] = []
    for feature in segments:
        segment_id = str((feature.get("properties") or {}).get("segment_id") or feature.get("id"))
        geometry = feature.get("geometry") or {}
        if geometry.get("type") == "Polygon" and geometry.get("coordinates"):
            coordinate_sets.append((segment_id, geometry["coordinates"][0]))
    all_coordinates = [coordinate for _, ring in coordinate_sets for coordinate in ring]
    if not all_coordinates:
        return '<svg viewBox="0 0 900 300" role="img" aria-label="No segment geometry"></svg>'
    min_x = min(point[0] for point in all_coordinates)
    max_x = max(point[0] for point in all_coordinates)
    min_y = min(point[1] for point in all_coordinates)
    max_y = max(point[1] for point in all_coordinates)
    width, height, pad = 900, 300, 30

    def project(point: list[float]) -> tuple[float, float]:
        x = pad + ((point[0] - min_x) / max(max_x - min_x, 1e-9)) * (width - 2 * pad)
        y = height - pad - ((point[1] - min_y) / max(max_y - min_y, 1e-9)) * (height - 2 * pad)
        return x, y

    paths: list[str] = []
    for segment_id, ring in coordinate_sets:
        projected = [project(point) for point in ring]
        path = " ".join(
            ("M" if index == 0 else "L") + f" {x:.1f} {y:.1f}"
            for index, (x, y) in enumerate(projected)
        ) + " Z"
        state = latest_states.get(segment_id, "unknown")
        color = STATE_COLORS.get(state, STATE_COLORS["unknown"])
        paths.append(
            f'<path d="{path}" fill="{color}" fill-opacity="0.68" stroke="#e2e8f0" stroke-width="1.5">'
            f'<title>{html.escape(segment_id)} · {html.escape(state)}</title></path>'
        )
    return (
        '<svg class="corridor-map" viewBox="0 0 900 300" role="img" '
        'aria-label="Corridor segments colored by latest assessment state">'
        '<rect width="900" height="300" rx="18" fill="#071426"/>'
        f'{"".join(paths)}</svg>'
    )


def _timeline_svg(records: list[dict[str, Any]]) -> str:
    by_segment: dict[str, list[dict[str, Any]]] = {}
    for record in records:
        by_segment.setdefault(str(record["segment_id"]), []).append(record)
    width, height, pad = 900, 280, 42
    lines: list[str] = []
    palette = ["#38bdf8", "#f97316", "#a78bfa", "#22c55e"]
    for series_index, (segment_id, series) in enumerate(sorted(by_segment.items())):
        series.sort(key=lambda record: str(record["observed_at"]))
        points: list[str] = []
        for index, record in enumerate(series):
            x = pad + ((width - 2 * pad) * index / max(len(series) - 1, 1))
            y = pad + ((height - 2 * pad) * (1 - float(record["activity_index"]) / 100))
            points.append(f"{x:.1f},{y:.1f}")
        color = palette[series_index % len(palette)]
        lines.append(
            f'<polyline points="{" ".join(points)}" fill="none" stroke="{color}" stroke-width="4">'
            f'<title>{html.escape(segment_id)}</title></polyline>'
        )
        for point in points:
            x, y = point.split(",")
            lines.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{color}"/>')
    return (
        '<svg class="timeline" viewBox="0 0 900 280" role="img" aria-label="Satellite Activity Index by segment">'
        '<rect width="900" height="280" rx="18" fill="#071426"/>'
        '<line x1="42" y1="238" x2="858" y2="238" stroke="#334155"/>'
        '<line x1="42" y1="42" x2="42" y2="238" stroke="#334155"/>'
        '<text x="8" y="46" fill="#94a3b8" font-size="13">100</text>'
        '<text x="20" y="240" fill="#94a3b8" font-size="13">0</text>'
        f'{"".join(lines)}</svg>'
    )


def _component_bars(alert: dict[str, Any] | None) -> str:
    if not alert:
        return '<p class="muted">No active alert components.</p>'
    rows: list[str] = []
    for component in alert.get("activity", {}).get("components", []):
        points = float(component.get("contribution", 0)) * 100
        width = min(100, points * 5)
        rows.append(
            '<div class="signal">'
            f'<div><span>{html.escape(str(component["name"]).replace("_", " ").title())}</span><strong>{points:.1f} pts</strong></div>'
            f'<div class="bar"><i style="width:{width:.1f}%"></i></div></div>'
        )
    return "".join(rows)


def build_dashboard(
    *,
    evidence_directory: str | Path,
    segments_path: str | Path,
    activity_path: str | Path,
    analysis_path: str | Path,
    backtest_path: str | Path,
    output_directory: str | Path,
) -> Path:
    evidence_root = Path(evidence_directory)
    output_root = Path(output_directory)
    alerts_payload = json.loads((evidence_root / "alerts.json").read_text(encoding="utf-8"))
    segments = json.loads(Path(segments_path).read_text(encoding="utf-8"))
    activity = json.loads(Path(activity_path).read_text(encoding="utf-8"))
    analysis = json.loads(Path(analysis_path).read_text(encoding="utf-8"))
    backtest = json.loads(Path(backtest_path).read_text(encoding="utf-8"))
    alerts = list(alerts_payload.get("alerts", []))

    latest_states: dict[str, str] = {}
    for record in sorted(analysis.get("records", []), key=lambda value: str(value["observed_at"])):
        latest_states[str(record["segment_id"])] = str(record["state"])
    top_alert = max(alerts, key=lambda alert: float(alert["risk"]["risk_score"]), default=None)
    median_lead = backtest.get("summary", {}).get("median_lead_time_days")
    assessable = sum(state != "not_assessable" for state in latest_states.values())
    segment_count = len(segments.get("features", []))
    coverage = (assessable / len(latest_states) * 100) if latest_states else 0

    alert_cards: list[str] = []
    for alert in alerts:
        report_path = evidence_root / "alerts" / alert["alert_id"] / "report.html"
        report_href = os.path.relpath(report_path, output_root).replace("\\", "/")
        alert_cards.append(
            f'<article class="alert-card" data-severity="{html.escape(alert["severity"])}">'
            f'<div><span class="severity {html.escape(alert["severity"])}">{html.escape(alert["severity"])}</span>'
            f'<span class="synthetic">{html.escape(alert["data_classification"])}</span></div>'
            f'<h3>{html.escape(alert["segment_id"])}</h3>'
            f'<p>{html.escape(alert["analysis"]["state"].replace("_", " ").title())} · risk {float(alert["risk"]["risk_score"]):.3f} · confidence {float(alert["analysis"]["confidence"]):.2f}</p>'
            f'<p class="muted">{html.escape(alert["recommended_action"])}</p>'
            f'<a href="{html.escape(report_href)}">Open evidence package →</a></article>'
        )

    legend = "".join(
        f'<span><i style="background:{color}"></i>{html.escape(state.replace("_", " ").title())}</span>'
        for state, color in STATE_COLORS.items()
        if state != "unknown"
    )
    data_payload = {
        "alerts": alerts,
        "latest_states": latest_states,
        "backtest_summary": backtest.get("summary", {}),
        "data_classification": "synthetic" if any(alert.get("data_classification") == "synthetic" for alert in alerts) else "unknown",
    }
    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "dashboard_data.json").write_text(json.dumps(data_payload, indent=2), encoding="utf-8")
    document = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Drishti Infrastructure Audit</title>
<meta name="description" content="Offline judge dashboard for explainable satellite infrastructure alerts">
<style>
:root{{--ink:#e5edf7;--muted:#91a4bd;--panel:#0d1b2d;--line:#21344d;--accent:#38bdf8;--orange:#f97316}}
*{{box-sizing:border-box}} body{{margin:0;background:#050b14;color:var(--ink);font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.5}}
body:before{{content:"";position:fixed;inset:0;background:radial-gradient(circle at 85% 10%,#0c4a6e55,transparent 32%),radial-gradient(circle at 10% 50%,#7c2d1233,transparent 35%);pointer-events:none}}
main{{position:relative;max-width:1240px;margin:auto;padding:28px}} header{{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}}
.brand{{display:flex;align-items:center;gap:12px;font-weight:800;letter-spacing:.08em}} .brand b{{display:grid;place-items:center;width:34px;height:34px;border:2px solid var(--accent);border-radius:50%;color:var(--accent)}}
.mode{{font-size:12px;color:#fed7aa;background:#7c2d12;padding:7px 10px;border-radius:999px;text-transform:uppercase;font-weight:800}}
.hero{{padding:52px 0 30px;display:grid;grid-template-columns:1.5fr 1fr;gap:32px;align-items:end}} h1{{font-size:clamp(42px,7vw,84px);line-height:.96;margin:0;letter-spacing:-.055em}} h1 em{{color:var(--accent);font-style:normal}}
.hero p{{color:var(--muted);font-size:18px;max-width:640px}} .decision{{border-left:3px solid var(--orange);padding:4px 0 4px 18px}}
.metrics{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0 32px}} .metric,.panel,.alert-card{{background:linear-gradient(145deg,#0e1d30,#091525);border:1px solid var(--line);border-radius:18px}}
.metric{{padding:18px}} .metric strong{{display:block;font-size:32px}} .metric span,.muted{{color:var(--muted)}} .grid{{display:grid;grid-template-columns:1.35fr .65fr;gap:18px;margin:18px 0}}
.panel{{padding:22px;overflow:hidden}} .panel h2{{margin:0 0 8px;font-size:22px}} .panel-head{{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}}
.legend{{display:flex;gap:12px;flex-wrap:wrap;color:var(--muted);font-size:12px}} .legend span{{display:flex;align-items:center;gap:5px}} .legend i{{width:9px;height:9px;border-radius:50%}}
.corridor-map,.timeline{{width:100%;height:auto;display:block}} .signal{{margin:14px 0}} .signal>div:first-child{{display:flex;justify-content:space-between;font-size:13px}} .bar{{height:8px;background:#14263b;border-radius:999px;overflow:hidden;margin-top:6px}} .bar i{{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--orange))}}
.filters{{display:flex;gap:8px;margin:14px 0}} button{{background:#10243a;border:1px solid #29415f;color:var(--ink);padding:8px 12px;border-radius:999px;cursor:pointer}} button.active{{background:var(--accent);color:#032033}}
.alerts{{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}} .alert-card{{padding:18px}} .alert-card h3{{margin:14px 0 6px}} .alert-card a{{color:#7dd3fc;text-decoration:none;font-weight:700}} .severity,.synthetic{{display:inline-block;font-size:11px;font-weight:800;text-transform:uppercase;padding:5px 8px;border-radius:999px;margin-right:6px}} .severity.medium{{background:#78350f;color:#fde68a}} .severity.high,.severity.critical{{background:#7f1d1d;color:#fecaca}} .synthetic{{background:#243248;color:#cbd5e1}}
.notice{{margin-top:28px;padding:18px;border:1px solid #7c2d12;background:#25150d;border-radius:14px;color:#fed7aa}} footer{{padding:34px 0;color:var(--muted);font-size:13px}}
@media(max-width:850px){{.hero,.grid{{grid-template-columns:1fr}}.metrics{{grid-template-columns:repeat(2,1fr)}}.alerts{{grid-template-columns:1fr}}}} @media(max-width:520px){{main{{padding:18px}}.metrics{{grid-template-columns:1fr}}header{{align-items:flex-start;gap:12px}}}}
</style></head><body><main>
<header><div class="brand"><b>D</b> DRISHTI</div><span class="mode">Offline judge mode · synthetic demo</span></header>
<section class="hero"><div><p>Satellite-assisted infrastructure audit</p><h1>See activity.<br><em>Verify early.</em></h1><p>Drishti prioritizes field verification by comparing expected construction activity with explainable satellite signals.</p></div><div class="decision"><strong>Decision supported</strong><p>Which corridor segment should the monitoring team inspect first?</p></div></section>
<section class="metrics"><div class="metric"><span>Monitored segments</span><strong>{segment_count}</strong></div><div class="metric"><span>Active alerts</span><strong>{len(alerts)}</strong></div><div class="metric"><span>Median lead time</span><strong>{html.escape(str(median_lead or '—'))}<small> days</small></strong></div><div class="metric"><span>Assessable coverage</span><strong>{coverage:.0f}<small>%</small></strong></div></section>
<section class="panel"><div class="panel-head"><div><h2>Corridor state</h2><p class="muted">Latest segment assessment</p></div><div class="legend">{legend}</div></div>{_map_svg(segments.get('features', []), latest_states)}</section>
<section class="grid"><div class="panel"><h2>Satellite Activity Index</h2><p class="muted">Relative observable activity—not engineering completion.</p>{_timeline_svg(activity.get('records', []))}</div><aside class="panel"><h2>Why the alert fired</h2><p class="muted">Explainable score contribution</p>{_component_bars(top_alert)}</aside></section>
<section class="panel"><div class="panel-head"><div><h2>Verification queue</h2><p class="muted">Ranked by explainable risk score</p></div></div><div class="filters"><button class="active" data-filter="all">All</button><button data-filter="critical">Critical</button><button data-filter="high">High</button><button data-filter="medium">Medium</button></div><div class="alerts">{''.join(alert_cards) or '<p class="muted">No alerts generated.</p>'}</div></section>
<div class="notice"><strong>Responsible-use boundary:</strong> alerts request field verification. They do not accuse contractors, estimate exact completion, track individuals or make enforcement decisions.</div>
<footer>Drishti · Track A MVP · Local offline build · Inputs and evidence carry SHA-256 integrity hashes.</footer>
</main><script>
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{{
 document.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('active')); button.classList.add('active');
 const filter=button.dataset.filter; document.querySelectorAll('.alert-card').forEach(card=>{{card.hidden=filter!=='all'&&card.dataset.severity!==filter;}});
}}));
</script></body></html>"""
    output_path = output_root / "index.html"
    output_path.write_text(document, encoding="utf-8")
    return output_path

