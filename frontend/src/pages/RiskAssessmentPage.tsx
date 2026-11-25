import React, { useMemo } from 'react';
import { useDrishtiData } from '../data/DrishtiContext';

export const RiskAssessmentPage: React.FC = () => {
  const {
    data,
    loading,
    selectedProjectId,
    dispatchedSegments,
    dispatchVerification,
    markVerified,
    resetDispatch,
  } = useDrishtiData();

  const rankedSegments = useMemo(() => {
    return (data?.segments ?? [])
      .filter((s) => s.is_assessable)
      .filter((s) => selectedProjectId === 'ALL' || s.project_id === selectedProjectId)
      .sort((a, b) => b.delay_risk_score - a.delay_risk_score);
  }, [data, selectedProjectId]);

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading Risk, ML &amp; Track C...</div>;
  }

  const ml = data.ml_summary;
  const evalM = data.evaluation_metrics;
  const sens = data.weight_sensitivity;
  const importances = Object.entries(ml.feature_importances ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-space-lg">
      {/* Track C: Guard the Nation */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
              Track C · Guard the Nation
            </span>
            <h1 className="mt-1 font-headline-md text-headline-md font-semibold text-on-surface">
              Asset Protection &amp; Riverbed Mining Surveillance ({data.track_c_events.length} Real Events)
            </h1>
            <p className="text-xs text-on-surface-variant">
              Exact OSM corridor &amp; river polygon rasterization (`rasterio.features.rasterize`) masked by ESA WorldCover 10m baseline settlements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          {data.track_c_events.map((ev) => (
            <div
              key={ev.event_id}
              className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low/40 flex flex-col"
            >
              {ev.chip_url && (
                <img
                  src={ev.chip_url}
                  alt={ev.event_id}
                  className="w-full h-56 object-contain bg-[#0b1320]"
                />
              )}
              <div className="p-space-md space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-primary">{ev.event_id}</span>
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
                    {ev.affected_area_m2.toLocaleString()} m² ({ev.detected_pixels} px)
                  </span>
                </div>
                <div className="font-semibold text-on-surface">{ev.target_infrastructure}</div>
                <p className="text-on-surface-variant">{ev.evidence_description}</p>
                <div className="text-[11px] text-on-surface">
                  <strong>Action:</strong> {ev.recommended_action}
                </div>
                <div className="text-[10px] font-mono text-outline truncate pt-1 border-t border-outline-variant/20">
                  Scenes: {ev.source_scenes.join(' → ')} | SHA-256: {ev.audit_hash}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML, Calibration & Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Calibrated Monotonic ML Model ({ml.model_type})
            </h2>
            <p className="text-xs text-on-surface-variant">
              Calibration: {ml.calibration_method} · Brier Score: {ml.brier_score.toFixed(4)} · Cutoff:{' '}
              {ml.cutoff_date} · Train Samples: {ml.training_samples} ({ml.positive_samples} delayed)
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-on-surface-variant uppercase">
              Permutation Feature Importances &amp; Monotonic Constraints
            </div>
            {importances.map(([feat, imp]) => {
              const cst = ml.monotonic_constraints?.[feat] ?? 0;
              const pct = Math.min(100, Math.max(4, imp * 250));
              return (
                <div key={feat} className="flex items-center gap-3 text-xs">
                  <span className="w-44 font-mono truncate text-on-surface">{feat}</span>
                  <div className="flex-1 h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 font-mono text-right">{imp.toFixed(3)}</span>
                  <span className="w-16 font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-center">
                    cst:{cst > 0 ? '+1' : cst < 0 ? '-1' : '0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evaluation & Weight Sensitivity */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Evaluation &amp; Weight Calibration
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-outline block text-[10px]">Precision / Recall</span>
              <span className="font-mono font-bold text-tertiary text-sm">
                {(evalM.precision * 100).toFixed(0)}% / {(evalM.recall * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-outline block text-[10px]">Neg-Control FPs</span>
              <span className="font-mono font-bold text-on-surface text-sm">
                {evalM.false_alerts_on_negative_controls}
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-outline block text-[10px]">Not Assessable</span>
              <span className="font-mono font-bold text-on-surface text-sm">
                {evalM.not_assessable_percentage.toFixed(1)}%
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-outline block text-[10px]">Weight Stability</span>
              <span className="font-mono font-bold text-primary text-sm uppercase">
                {typeof sens.overall_stability === 'number'
                  ? `${(sens.overall_stability * 100).toFixed(1)}%`
                  : String(sens.overall_stability ?? 'highly_robust').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant">{sens.rationale}</p>
        </div>
      </div>

      {/* Field Verification Dispatch Queue */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-space-lg py-space-md border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Ranked Field-Verification Queue ({rankedSegments.length} assessable segments)
          </h2>
          <p className="text-xs text-on-surface-variant">
            Dispatch Joint Physical Verification (JPV) teams on high-risk segments (persisted locally)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm border-b border-outline-variant/20">
                <th className="py-2.5 px-4">Segment</th>
                <th className="py-2.5 px-4">Delay Risk</th>
                <th className="py-2.5 px-4">Calibrated ML Prob</th>
                <th className="py-2.5 px-4">Spend / SAI</th>
                <th className="py-2.5 px-4">Verification Status</th>
                <th className="py-2.5 px-4">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {rankedSegments.slice(0, 15).map((s) => {
                const dispatch = dispatchedSegments[s.segment_id];
                return (
                  <tr key={s.segment_id} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-4 font-mono font-semibold text-primary">{s.segment_id}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold">
                      {(s.delay_risk_score * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {(s.ml_delay_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-mono">
                      {s.spend_to_date_pct?.toFixed(0)}% /{' '}
                      {s.activity_index !== null ? (s.activity_index * 100).toFixed(0) + '%' : 'N/A'}
                    </td>
                    <td className="py-2.5 px-4">
                      {dispatch ? (
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${
                            dispatch.status === 'Verified'
                              ? 'bg-tertiary-fixed/40 text-on-tertiary-fixed'
                              : 'bg-primary-fixed text-on-primary-fixed'
                          }`}
                        >
                          {dispatch.status} · {dispatch.timestamp.slice(0, 10)}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">Pending Review</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 flex gap-2">
                      {!dispatch && (
                        <button
                          type="button"
                          onClick={() => dispatchVerification(s.segment_id)}
                          className="px-2.5 py-1 rounded bg-primary text-on-primary hover:bg-primary-container font-medium"
                        >
                          Dispatch JPV
                        </button>
                      )}
                      {dispatch?.status === 'Dispatched' && (
                        <button
                          type="button"
                          onClick={() => markVerified(s.segment_id)}
                          className="px-2.5 py-1 rounded bg-tertiary text-on-tertiary font-medium"
                        >
                          Mark Verified
                        </button>
                      )}
                      {dispatch && (
                        <button
                          type="button"
                          onClick={() => resetDispatch(s.segment_id)}
                          className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface-variant"
                        >
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
