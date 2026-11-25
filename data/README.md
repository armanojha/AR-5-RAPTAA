# Data policy

All files in this directory are synthetic and exist only to exercise Layers 1 through 8. `sample_observations.json` contains small reflectance and SAR arrays so feature extraction and activity scoring remain deterministic. `sample_reporting.json` and `sample_delay_labels.json` exercise divergence, stall detection and chronological early-warning validation without presenting synthetic evidence as real.

Real competition data must include its source URL, source date and `real` classification. If a record combines official and generated values, it must be classified as `mixed`, and the generated fields must be identified in accompanying metadata.

Do not commit credentials, restricted imagery or data whose licence prohibits redistribution.

