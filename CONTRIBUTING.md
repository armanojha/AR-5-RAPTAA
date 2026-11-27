# Contributing to Drishti

Thank you for helping improve an evidence-first infrastructure monitoring tool.

## Set up

1. Use Python 3.11+ and Node.js 20+.
2. Install the Python package with `python -m pip install -e .`.
3. In `frontend/`, run `npm ci`.
4. Run `python -m unittest discover -s tests -v` and `npm run build` before proposing a change.

The checked-in frontend bundle works offline. Tests that require generated output or untracked rasters skip when those inputs are unavailable. To run the full case-study integration test, ingest the public raster windows and rebuild `output/real_case/` as described in the README.

## Pull requests

- Keep changes focused and explain the user-visible behavior and verification performed.
- Add or update tests for substantive processing or API changes.
- Preserve the distinction between observable surface activity and engineering completion.
- Label synthetic, generated and independently sourced records accurately. Include a source URL, acquisition date and licence information for new real data.
- Do not commit credentials, restricted imagery, large intermediate rasters or personal information.
- Treat Track C detections as field-verification candidates, never as proof of illegality.

For a new corridor, document its OSM alignment, project-reporting provenance, observation windows, observability limitations and validation labels. See [data and validation](docs/DATA_AND_VALIDATION.md).
