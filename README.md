# Drishti

Drishti is a satellite-assisted infrastructure audit layer. It compares reported project status with observable surface activity and produces explainable requests for field verification. It does not estimate engineering completion, assign blame, or make enforcement decisions.

## Current architecture

`main` is the canonical integrated branch. It contains:

- a real-data pipeline for three corridors: NH-544G Package 1, Rishikesh–Karnaprayag rail, and Kacchi Dargah–Bidupur bridge;
- Sentinel-2 optical, Sentinel-1 SAR, Landsat baseline, WorldCover, DEM and rainfall ingestion from cached public-data windows;
- segment features, explainable activity and divergence scores, calibrated ML risk, chronological back-tests, negative controls and Track C detections;
- SHA-256 evidence manifests with image chips, HTML reports and PDFs;
- the React CIVITRACE frontend, built from one generated bundle and its copied evidence assets.

The generated frontend bundle at `frontend/public/drishti_bundle.json` is the contract between the processing pipeline and the React UI. A local API can optionally expose that exact same bundle at `/bundle`; it does not maintain a second frontend-specific dataset.

## Rebuild the real demonstration

The repository includes the current public-data cache under `data/real_cache`. From the repository root:

```powershell
$env:PYTHONPATH = "src"
python -m pip install -e .
python -u -m drishti real-demo build --output-dir output\real_case
```

That command regenerates the audit output and refreshes:

- `output/real_case/` — pipeline data, dashboard, alerts, Track C and reports;
- `frontend/public/drishti_bundle.json` — frontend source-of-truth bundle;
- `frontend/public/drishti_assets/` — copied chips, evidence packages and audit downloads.

## Run the React frontend

```powershell
Set-Location frontend
npm ci
npm run dev
```

By default, the frontend reads the checked-in offline bundle, so it works without a backend server.

To use the local API instead, create `frontend/.env.local` using `frontend/.env.example`, then start the API in another terminal:

```powershell
$env:PYTHONPATH = "src"
python -m drishti alerts serve `
  --evidence-dir output\real_case\evidence `
  --bundle frontend\public\drishti_bundle.json
```

The frontend will then request `http://127.0.0.1:8765/bundle`, the same generated file used by offline mode. Health is available at `/health`; alert detail endpoints remain at `/alerts` and `/segments/{segment_id}/timeline`.

## Verification

```powershell
$env:PYTHONPATH = "src"
python -m unittest discover -s tests -v

Set-Location frontend
npm run build
```

## Repository hygiene

`output/`, Python caches and frontend build artifacts are ignored. The evidence PDFs under `frontend/public/drishti_assets/` are generated outputs: regenerate them from the pipeline rather than hand-editing them.

The project contract is in [docs/architecture.txt](docs/architecture.txt); the judge narrative is in [docs/PITCH_AND_DEMO_GUIDE.md](docs/PITCH_AND_DEMO_GUIDE.md).
