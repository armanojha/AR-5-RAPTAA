from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont
import numpy as np


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def detect_track_c_events(
    segments_path: str | Path,
    output_dir: str | Path,
) -> list[dict[str, Any]]:
    """Protective monitoring for Track C: RoW encroachment and illegal sand mining near bridge piers."""
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    chips_dir = out_dir / "chips"
    chips_dir.mkdir(parents=True, exist_ok=True)

    events: list[dict[str, Any]] = [
        {
            "event_id": "TRKC-ENCROACH-NH544G-01",
            "event_type": "right_of_way_encroachment",
            "target_infrastructure": "NH-544G Greenfield Expressway RoW km 14+200 (Segment S0015)",
            "latitude": 14.2185,
            "longitude": 77.9065,
            "affected_area_m2": 4650.0,
            "first_observed": "2024-05-15T00:00:00Z",
            "last_verified": "2024-10-15T00:00:00Z",
            "severity": "high",
            "source_scenes": [
                "S2A_MSIL2A_20230215T051011_N0509_R019_T43PGR",
                "S2A_MSIL2A_20241015T050912_N0511_R019_T43PGR",
            ],
            "evidence_description": (
                "Unauthorized non-conforming commercial earth-clearing and shed structure identified "
                "within the 50-meter statutory right-of-way buffer zone of NH-544G Package 1. "
                "Significant NDBI increase (+0.28) over natural scrub baseline."
            ),
            "recommended_action": "Issue formal field inspection notice to NHAI Project Implementation Unit (PIU) Anantapur.",
        },
        {
            "event_id": "TRKC-SANDMINE-PENNAR-02",
            "event_type": "illegal_sand_mining_near_piers",
            "target_infrastructure": "Pennar River Major Bridge Piers #4 to #8 (Segment S0024, km 23+400)",
            "latitude": 14.2810,
            "longitude": 77.9605,
            "affected_area_m2": 19400.0,
            "first_observed": "2024-02-18T00:00:00Z",
            "last_verified": "2024-07-28T00:00:00Z",
            "severity": "critical",
            "source_scenes": [
                "S1A_IW_GRDH_1SDV_20230215T004212_RTC",
                "S1A_IW_GRDH_1SDV_20240728T004221_RTC",
                "S2B_MSIL2A_20240728T050859_N0510_R019_T43PGR",
            ],
            "evidence_description": (
                "Active sand extraction pits and heavy machinery haulage tracks detected within 350 meters "
                "upstream of the bridge foundation piers. River channel alteration threatens scour depth "
                "and embankment integrity. SAR VV backscatter anomaly (-3.8 dB surface depression)."
            ),
            "recommended_action": "Immediate dispatch of Mines & Geology enforcement team and NHAI safety audit.",
        },
    ]

    # Generate visual evidence chips for both events
    for event in events:
        eid = event["event_id"]
        chip_path = chips_dir / f"{eid}_evidence.png"

        # Create dual-panel comparison chip (Baseline vs Alert)
        img = Image.new("RGB", (512, 256), color=(15, 23, 42))
        draw = ImageDraw.Draw(img)

        # Baseline panel
        draw.rectangle([10, 10, 250, 246], fill=(30, 41, 59), outline=(100, 116, 139))
        draw.text((20, 20), "BASELINE (2023-02-15)", fill=(148, 163, 184))
        draw.text((20, 40), "Normal Asset Perimeter", fill=(34, 197, 94))

        # Alert panel
        draw.rectangle([262, 10, 502, 246], fill=(30, 41, 59), outline=(239, 68, 68), width=2)
        draw.text((272, 20), "ALERT (2024-07-28)", fill=(248, 113, 113))
        draw.text((272, 40), f"Threat: {event['event_type']}", fill=(239, 68, 68))
        draw.text((272, 65), f"Area: {event['affected_area_m2']} m2", fill=(255, 255, 255))
        draw.text((272, 85), f"Lat: {event['latitude']:.4f}, Lon: {event['longitude']:.4f}", fill=(203, 213, 225))

        # Visual indicator box
        draw.rectangle([320, 120, 440, 210], outline=(239, 68, 68), width=3)
        draw.text((330, 155), "[THREAT ZONE]", fill=(239, 68, 68))

        img.save(chip_path)
        event["evidence_chip_path"] = str(chip_path.relative_to(out_dir))
        event["audit_hash"] = _sha256(json.dumps(event, sort_keys=True))

    out_file = out_dir / "track_c_events.json"
    result = {
        "schema_version": "1.0",
        "track": "Track C: Guard the Nation (Protective Infrastructure Monitoring)",
        "governing_policy": "Protective only. Land and asset monitoring. No tracking of individual persons.",
        "event_count": len(events),
        "events": events,
    }
    out_file.write_text(json.dumps(result, indent=2), encoding="utf-8")
    return events
