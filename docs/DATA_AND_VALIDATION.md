# Data provenance and validation

This document distinguishes real satellite inputs, configured project values, generated labels and synthetic portfolio records. A `real` satellite image does not make every associated project or evaluation field independently verified.

## Inputs in the three-corridor demo

| Input | Acquisition path | Current use |
| --- | --- | --- |
| Sentinel-2 Level-2A | Earth Search STAC (`sentinel-2-l2a`) | Optical surface-change features and image chips. |
| Sentinel-1 RTC | Planetary Computer STAC (`sentinel-1-rtc`) | VV/VH radar backscatter changes. |
| OSM ways | Cached way geometry under `data/real_cache/osm/` | Corridor alignments and buffered segments. |
| ESA WorldCover | Planetary Computer STAC | Land cover, forest context and existing built-up mask. |
| Copernicus GLO-30 DEM | Planetary Computer STAC | Terrain/slope context. |
| Landsat C2 L2 | Earth Search STAC | Longer historical vegetation context. |
| NASA POWER / Open-Meteo | Historical precipitation APIs | Rainfall confounder; NASA POWER is preferred when present. |
| Project cost, dates, progress, spending and delay dates | Case-study values configured in `scripts/ingest_real_satellite_cache.py`, with source URL fields | Reporting and historical comparison context. They are not automatically extracted from official feeds. |

The three real-imagery cases are NH-544G Package 1, Rishikesh–Karnaprayag rail and Kacchi Dargah–Bidupur bridge. Two additional portfolio entries are explicitly synthetic. The checked-in bundle's latest observation is 31 March 2025. Large raster windows are omitted from Git; a fresh clone must ingest them before rebuilding the full demo.

## Processing and assessment

The pipeline filters optical scenes by cloud metadata where available, masks invalid Sentinel-2 SCL classes, aligns bands, and computes changes relative to each segment's first observation. Radar uses terrain-corrected inputs, speckle filtering and dB conversion. Low-observability tunnel sections are marked not assessable. The SAI summarizes visible physical activity only.

Intermediate expected activity, reported progress and spending records are interpolated in the demo from configured project values. They should not be described as independently sourced reports for each epoch.

## What the current metrics do and do not mean

- The current training run has 23 labelled segment-date records, including 8 positive records. Its labels are **assigned from the rule detector's own states** in `real_case.py`. They are not independent field labels.
- The exported 100% precision/recall evaluation compares that detector with those derived labels. It is an internal consistency result, **not an estimate of field performance**.
- The Brier score in `models_ml.py` is calculated on training records. It is not a held-out probability-calibration metric.
- The three historical delay cases show whether an alert date precedes each configured official delay date. The current model uses a shared 2024-11-20 training cutoff, so the earlier bridge case is not a strictly prospective ML back-test.
- Track C pixel changes are approximate anomaly areas. They do not establish legal encroachment, illegal mining, asset damage or precise cadastral boundaries.
- The illustrative national ROI values in the frontend bundle are scenario assumptions, not a measured deployment result.

## Validation needed before operational claims

1. Obtain independently labelled, date-stamped segment outcomes from engineering inspection or audited project records.
2. Separate training and evaluation by **time and corridor**, so no future observations or related segments leak into earlier predictions.
3. Report precision, recall, false-alert rate, calibration and lead time with case counts and uncertainty.
4. Check performance by asset type, season, cloud cover, terrain and observability class.
5. Have a human review each Track C candidate against higher-resolution evidence, property boundaries and field records.

All source datasets retain their own licensing and attribution requirements. The repository's MIT licence covers project code, not third-party imagery.
