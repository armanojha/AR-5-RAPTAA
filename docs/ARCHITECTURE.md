# Architecture

Drishti has a Python processing pipeline and a React presentation layer. The generated `frontend/public/drishti_bundle.json` is the interface between them. The UI runs from this checked-in bundle by default; the optional local API serves the same file at `/bundle`.

## Processing stages

1. **Registry and geometry:** `real_case.py` loads three configured corridor cases and cached OSM alignments. `alignment.py` creates approximately 1 km segments with 300 m buffers. Tunnel proximity and terrain/land-cover context inform observability.
2. **Scene discovery and ingestion:** `live_ingestion.py` queries Earth Search for Sentinel-2 and Landsat and Planetary Computer for Sentinel-1 RTC, WorldCover and DEM. It fetches bounded Cloud Optimized GeoTIFF windows rather than full scenes. `scripts/ingest_real_satellite_cache.py` persists the local cache.
3. **Quality and features:** Optical bands are aligned to a 10 m grid. Sentinel-2 Scene Classification Layer values exclude cloud, shadow and other invalid pixels. Radar VV/VH receive Lee speckle filtering and conversion to dB. `features.py` produces segment-date NDVI, BSI, NDBI, brightness, VV/VH, rainfall, valid-pixel and continuity values relative to an initial epoch.
4. **Activity assessment:** `activity_index.py` computes the explainable 0–100 Satellite Activity Index (SAI). It is a relative observable-surface-activity score, not a completion percentage. `stall_divergence.py` applies chronological low-activity, rainfall, confidence and observability rules.
5. **Risk ranking:** `models_ml.py` trains a monotonic-constrained histogram gradient boosting classifier on ten tabular inputs, with sigmoid calibration when class counts permit. `backtest.py` blends its output with an explainable heuristic and compares alert dates with configured official delay dates.
6. **Evidence and presentation:** `evidence.py` writes date-stamped alert manifests, SHA-256 input hashes, image chips, HTML and ReportLab PDFs. `frontend_export.py` assembles the offline bundle and copied assets. React pages read the bundle through `DrishtiContext.tsx`.

Track C is separate from delay ranking. `track_c.py` rasterizes buffered corridor polygons and compares baseline/latest pixels using optical indices, radar changes and a WorldCover settlement mask. Its outputs are protective change candidates for human verification.

## Key entry points

| Command or file | Role |
| --- | --- |
| `python scripts/ingest_real_satellite_cache.py` | Fetch/cache public-data windows. Network required. |
| `python -m drishti real-demo build --output-dir output/real_case` | Rebuild analysis, reports and frontend bundle. |
| `python -m drishti alerts serve ... --bundle ...` | Optional local JSON API. |
| `frontend/src/App.tsx` | Dashboard routes. |

## Operational boundary

The existing demo is a batch case-study pipeline. UI filters, timeline controls and review states are interactive, but changing them does not initiate a new satellite acquisition. Review/dispatch state is stored in the browser's local storage, not a multi-user operational database. See [Data and validation](DATA_AND_VALIDATION.md) before interpreting scores or published metrics.
