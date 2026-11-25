# Drishti

Drishti is a satellite-assisted audit layer for public infrastructure. The Track A MVP compares reported project status with observable surface activity and raises explainable requests for field verification.

The system deliberately does **not** claim that a satellite activity score is an exact construction-completion percentage. Its core comparison is an Activity-Reporting Divergence Score, with confidence and observability attached to every result.

## Current implementation

Layer 1, the project registry, is implemented. It:

- validates project identity, dates, money and progress;
- preserves source URL and source date;
- labels every record as real, synthetic or mixed;
- computes cost-overrun and expenditure percentages without changing source fields;
- rejects duplicate project IDs and exports normalized JSON.

Layer 2, alignment and segmentation, is implemented. It:

- validates a single continuous GeoJSON LineString;
- uses a local metric projection without external geospatial dependencies;
- splits the alignment into deterministic one-kilometre segments;
- creates buffered segment polygons for imagery queries;
- attaches baseline dates, observability, source provenance and stable IDs.

Layer 3, satellite scene ingestion, is implemented. It:

- ingests saved STAC Features and FeatureCollections;
- can POST a standard search request to any STAC API;
- records scene, platform, acquisition time, bbox, cloud cover, licence and assets;
- calculates corridor-segment coverage;
- exports a normalized scene manifest;
- provides a bounded local asset cache with SHA-256 checksums.

Layer 4, preprocessing quality control, is implemented at the policy and array-operation level. It:

- applies Sentinel-2 SCL exclusions;
- checks cloud and valid-pixel thresholds;
- verifies required optical and SAR asset groups;
- sends non-RTC SAR scenes for review;
- builds masked temporal median composites;
- converts positive sigma-nought values to dB;
- exports accepted, review and rejected scene decisions.

GeoTIFF windowed I/O and reprojection will be connected when the production raster dependency is added. The quality contract and algorithms are already testable without it.

Layer 5, segment feature extraction, is implemented. It:

- calculates NDVI, BSI and NDBI from masked reflectance arrays;
- calculates optical brightness and baseline change;
- summarizes VV and VH backscatter and baseline change;
- carries rainfall, linear continuity, scene provenance and valid-pixel fraction;
- exports versioned segment-date feature records.

Layer 6, the Satellite Activity Index, is implemented. It:

- converts seven explainable signals to normalized activity components;
- uses explicit versioned weights rather than an opaque completion model;
- renormalizes safely when a sensor component is unavailable;
- combines valid-pixel coverage, observability and feature completeness into confidence;
- exports every raw value, effective weight and score contribution.

Layer 7, stall and divergence analysis, is implemented. It:

- evaluates each segment strictly in chronological order;
- requires three consecutive clear, sufficiently confident low-activity observations;
- breaks the streak when heavy rainfall explains the slowdown;
- marks low-observability or low-confidence records as not assessable;
- compares expected and observed activity percentiles without treating SAI as completion;
- exports the reasoning behind every state.

Layer 8, delay-risk case-study back-testing, is implemented. It:

- combines divergence, stall state and inactivity in an explainable risk score;
- treats the score as an uncalibrated prioritization measure, not a probability;
- excludes observations on or after the official delay date;
- reports first alert date, lead time and detection outcome;
- preserves label provenance and synthetic/real classification.

Layer 9, evidence packages and alert API, is implemented. It:

- creates one directory per actionable alert;
- stores analysis, activity components, context, provenance and geometry;
- hashes every input and the canonical alert manifest with SHA-256;
- verifies manifests and detects later tampering;
- produces a human-readable offline evidence report;
- exposes health, alert, severity-filter and segment-timeline JSON endpoints.

Layer 10, the judge-facing dashboard, is implemented. It:

- builds as one self-contained offline HTML page with no CDN dependency;
- displays corridor state, SAI histories, alert components and lead-time metrics;
- links directly to the matching evidence package;
- filters the verification queue by severity;
- labels synthetic evidence and repeats the responsible-use boundary.

## Quick start

No third-party runtime packages are required for Layer 1.

```powershell
python -m drishti registry validate --input data/sample_projects.csv
python -m drishti registry export --input data/sample_projects.csv --output output/projects.json
python -m drishti alignment build --input data/sample_alignment.geojson --project-id DEMO-001 --baseline-start 2023-01-15 --baseline-end 2024-01-14 --output output/segments.geojson
python -m drishti scenes ingest --input data/sample_stac_items.json --segments output/segments.geojson --provider synthetic --output output/scenes.json
python -m drishti quality evaluate --manifest output/scenes.json --output output/quality.json
python -m drishti features build --input data/sample_observations.json --output output/features.json
python -m drishti activity score --features output/features.json --segments output/segments.geojson --output output/activity.json
python -m drishti analysis detect --activity output/activity.json --features output/features.json --reporting data/sample_reporting.json --output output/analysis.json
python -m drishti backtest run --analysis output/analysis.json --labels data/sample_delay_labels.json --output output/backtest.json
python -m drishti alerts build --analysis output/analysis.json --backtest output/backtest.json --activity output/activity.json --features output/features.json --segments output/segments.geojson --output-dir output/evidence
python -m drishti dashboard build --evidence-dir output/evidence --segments output/segments.geojson --activity output/activity.json --analysis output/analysis.json --backtest output/backtest.json --output-dir output/dashboard
python -m http.server 8000 --directory output
```

When running directly from the repository without installing it:

```powershell
$env:PYTHONPATH = "src"
python -m drishti registry validate --input data/sample_projects.csv
```

Run the tests:

```powershell
$env:PYTHONPATH = "src"
python -m unittest discover -s tests -v
```

## Build order

1. Project registry - implemented
2. Alignment and segment builder - implemented
3. Satellite observation ingestion - implemented
4. Preprocessing and quality masks - implemented
5. Feature extraction - implemented
6. Satellite Activity Index - implemented
7. Stall detection and divergence scoring - implemented
8. Delay-risk back-test - implemented
9. Evidence package and alert API - implemented
10. Judge-facing dashboard - implemented
11. Optional protective Track C extension

The complete implementation contract is in [docs/architecture.txt](docs/architecture.txt).

