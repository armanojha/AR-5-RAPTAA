from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image as RLImage
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def export_alert_pdf(
    alert: dict[str, Any],
    output_pdf_path: str | Path,
    chip_paths: list[tuple[str, Path]] | None = None,
) -> Path:
    """Export an audit-ready, timestamped PDF evidence report for an alert using ReportLab."""
    out_path = Path(output_pdf_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DrishtiTitle",
        parent=styles["Heading1"],
        fontSize=18,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
    )
    h2_style = ParagraphStyle(
        "DrishtiH2",
        parent=styles["Heading2"],
        fontSize=12,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=10,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "DrishtiBody",
        parent=styles["Normal"],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
    )
    notice_style = ParagraphStyle(
        "DrishtiNotice",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#9a3412"),
        backColor=colors.HexColor("#ffedd5"),
        borderPadding=6,
    )

    story: list[Any] = []
    story.append(Paragraph(f"DRISHTI SATELLITE AUDIT REPORT — {alert['alert_id']}", title_style))
    story.append(
        Paragraph(
            f"<b>Segment:</b> {alert['segment_id']} &nbsp;|&nbsp; "
            f"<b>Severity:</b> {str(alert['severity']).upper()} &nbsp;|&nbsp; "
            f"<b>Observed:</b> {alert['observed_at']} &nbsp;|&nbsp; "
            f"<b>Classification:</b> {alert.get('data_classification', 'mixed')}",
            body_style,
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "<b>Responsible-Use Boundary:</b> Recommended Action: Field Verification. "
            "This report prioritizes ground inspection and is not an allegation of contractor default or automated enforcement.",
            notice_style,
        )
    )

    analysis = alert.get("analysis", {})
    risk = alert.get("risk", {})
    features = alert.get("features", {})

    story.append(Paragraph("1. Assessment Summary & Trigger Reasoning", h2_style))
    summary_rows = [
        ["Metric", "Value", "Metric", "Value"],
        [
            "Detected State",
            str(analysis.get("state", "")),
            "Risk Score",
            f"{float(risk.get('risk_score', 0.0)):.3f}",
        ],
        [
            "Activity Index (SAI)",
            f"{float(analysis.get('activity_index', 0.0)):.1f} / 100",
            "Confidence",
            f"{float(analysis.get('confidence', 0.0)):.2f}",
        ],
        [
            "Rainfall in Window",
            f"{float(features.get('rainfall_mm', 0.0)):.1f} mm",
            "Observability",
            str(analysis.get("observability", "")),
        ],
        [
            "Spend-vs-Activity Ratio",
            f"{analysis.get('spend_vs_activity_ratio', 'N/A')}",
            "ML Calibrated Delay Prob.",
            f"{risk.get('ml_delay_probability', 'N/A')}",
        ],
    ]
    summary_table = Table(summary_rows, colWidths=[38 * mm, 48 * mm, 42 * mm, 48 * mm])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#f1f5f9")),
                ("BACKGROUND", (2, 1), (2, -1), colors.HexColor("#f1f5f9")),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(summary_table)

    reasons = analysis.get("reasons", [])
    if reasons:
        story.append(Spacer(1, 4))
        for r in reasons:
            story.append(Paragraph(f"• {r}", body_style))

    # Activity component contributions
    components = alert.get("activity", {}).get("components", [])
    if components:
        story.append(Paragraph("2. Explainable Signal Contributions", h2_style))
        comp_rows = [["Signal Component", "Raw Value", "Normalized", "Weight", "Points (0-100)"]]
        for c in components:
            comp_rows.append(
                [
                    str(c.get("name", "")).replace("_", " ").title(),
                    f"{float(c.get('raw_value', 0.0)):.4f}",
                    f"{float(c.get('normalized_value', 0.0)):.3f}",
                    f"{float(c.get('effective_weight', 0.0)):.2f}",
                    f"{float(c.get('contribution', 0.0)) * 100:.2f}",
                ]
            )
        comp_table = Table(comp_rows, colWidths=[54 * mm, 30 * mm, 30 * mm, 26 * mm, 36 * mm])
        comp_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0369a1")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("PADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(comp_table)

    # Image chips
    valid_chips = [(label, Path(p)) for label, p in (chip_paths or []) if Path(p).exists()]
    if valid_chips:
        story.append(Paragraph("3. Multi-Temporal Visual Satellite Evidence Chips", h2_style))
        img_cells = []
        cap_cells = []
        cell_width = min(55 * mm, (172 * mm) / len(valid_chips))
        for label, cpath in valid_chips[:3]:
            img_cells.append(RLImage(str(cpath), width=cell_width - 4 * mm, height=cell_width - 4 * mm))
            cap_cells.append(Paragraph(f"<b>{label}</b>", body_style))
        chip_table = Table([img_cells, cap_cells], colWidths=[cell_width] * len(valid_chips[:3]))
        chip_table.setStyle(
            TableStyle(
                [
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("PADDING", (0, 0), (-1, -1), 4),
                ]
            )
        )
        story.append(chip_table)

    story.append(Paragraph("4. Data Provenance & Cryptographic Integrity", h2_style))
    opt_scenes = ", ".join(features.get("optical_scene_ids", [])) or "none"
    sar_scenes = ", ".join(features.get("sar_scene_ids", [])) or "none"
    story.append(Paragraph(f"<b>Optical Scene IDs:</b> {opt_scenes}", body_style))
    story.append(Paragraph(f"<b>SAR Scene IDs:</b> {sar_scenes}", body_style))
    story.append(Paragraph(f"<b>Evidence SHA-256:</b> <font face='Courier' size='8'>{alert.get('evidence_sha256', '')}</font>", body_style))

    doc.build(story)
    return out_path
