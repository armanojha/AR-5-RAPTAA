import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDrishtiData } from '../data/DrishtiContext';

export const FinancialAnalysisPage: React.FC = () => {
  const { data, loading, selectedProjectId } = useDrishtiData();
  const [highVarianceOnly, setHighVarianceOnly] = useState(false);

  const rows = useMemo(() => {
    const segs = (data?.segments ?? []).filter(
      (s) => selectedProjectId === 'ALL' || s.project_id === selectedProjectId
    );
    if (!highVarianceOnly) return segs;
    return segs.filter(
      (s) =>
        s.analysis_status === 'stall_candidate' ||
        s.analysis_status === 'slowing' ||
        s.analysis_status === 'stalled_or_high_divergence' ||
        (s.spend_vs_activity_ratio !== null && s.spend_vs_activity_ratio >= 1.5)
    );
  }, [data, selectedProjectId, highVarianceOnly]);

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading financial audit telemetry...</div>;
  }

  const assessableSegs = rows.filter((s) => s.is_assessable);
  const flaggedSegs = rows.filter(
    (s) =>
      s.analysis_status === 'stall_candidate' ||
      s.analysis_status === 'slowing' ||
      s.analysis_status === 'stalled_or_high_divergence'
  );
  const avgRatio =
    assessableSegs.length > 0
      ? assessableSegs.reduce((acc, s) => acc + (s.spend_vs_activity_ratio ?? 0), 0) /
        assessableSegs.length
      : 0;

  return (
    <div className="space-y-space-lg">
      {/* Responsible Use Banner */}
      <div className="bg-surface-container-low border border-primary/30 rounded-xl p-space-md flex items-start gap-3 text-xs">
        <span className="material-symbols-outlined text-primary text-[20px]">policy</span>
        <div>
          <span className="font-semibold text-on-surface">
            Responsible-Use Governance Policy:
          </span>{' '}
          <span className="text-on-surface-variant">
            Spend-vs-Activity divergence flags segments for independent ground/JPV verification only. Drishti never attributes fault or suspends billing automatically.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant">
            ILLUSTRATIVE NATIONAL CAPEX
          </span>
          <div className="mt-1 text-2xl font-bold text-on-surface">
            ₹{data.layer12_roi.capex_lakh_cr}L Cr
          </div>
          <div className="text-xs text-on-surface-variant">
            {data.layer12_roi.addressable_projects.toLocaleString()} MoSPI Projects ·{' '}
            {data.layer12_roi.delayed_projects} Delayed
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant">
            COST OVERRUN EXPOSURE
          </span>
          <div className="mt-1 text-2xl font-bold text-error">
            ₹{data.layer12_roi.cost_overrun_lakh_cr}L Cr
          </div>
          <div className="text-xs text-on-surface-variant">
            Illustrative platform ROI: {data.layer12_roi.roi_multiple} at ₹{data.layer12_roi.annual_platform_cost_cr} Cr/yr
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant">
            MEAN SPEND / ACTIVITY RATIO
          </span>
          <div className="mt-1 text-2xl font-bold text-primary">{avgRatio.toFixed(2)}x</div>
          <div className="text-xs text-on-surface-variant">
            Across {assessableSegs.length} EO-assessable segments
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <span className="text-[11px] font-label-sm uppercase text-on-surface-variant">
            VERIFICATION REQUESTED
          </span>
          <div className="mt-1 text-2xl font-bold text-on-surface">{flaggedSegs.length} Segments</div>
          <div className="text-xs text-on-surface-variant">
            High Spend vs. Observed EO Activity
          </div>
        </div>
      </div>

      {/* Spend vs Satellite Activity Audit Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-space-lg py-space-md border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Segment Spend-vs-Activity Audit ({rows.length} rows)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Compares Expenditure % and Reported DPR % against Satellite Activity Index (SAI)
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant/30">
            <input
              type="checkbox"
              checked={highVarianceOnly}
              onChange={(e) => setHighVarianceOnly(e.target.checked)}
              className="accent-primary"
            />
            <span>High Variance Only</span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm border-b border-outline-variant/20">
                <th className="py-2.5 px-4">Segment</th>
                <th className="py-2.5 px-4">Corridor</th>
                <th className="py-2.5 px-4">Spend %</th>
                <th className="py-2.5 px-4">Reported %</th>
                <th className="py-2.5 px-4">Satellite SAI</th>
                <th className="py-2.5 px-4">Spend / SAI Ratio</th>
                <th className="py-2.5 px-4">Divergence</th>
                <th className="py-2.5 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {rows.map((s) => (
                <tr key={s.segment_id} className="hover:bg-surface-container-low/40">
                  <td className="py-2.5 px-4 font-mono font-semibold text-primary">
                    <Link to="/evidence" className="hover:underline">
                      {s.segment_id}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 text-on-surface-variant">{s.project_id}</td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.spend_to_date_pct !== null ? `${s.spend_to_date_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.reported_progress_pct !== null ? `${s.reported_progress_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.activity_index !== null ? `${(s.activity_index * 100).toFixed(1)}%` : 'N/A (Tunnel)'}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold">
                    {s.spend_vs_activity_ratio !== null
                      ? `${s.spend_vs_activity_ratio.toFixed(2)}x`
                      : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.activity_reporting_divergence !== null
                      ? s.activity_reporting_divergence.toFixed(3)
                      : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    {!s.is_assessable ? (
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                        Not Assessable
                      </span>
                    ) : s.analysis_status === 'stall_candidate' ||
                      s.analysis_status === 'slowing' ||
                      s.analysis_status === 'stalled_or_high_divergence' ? (
                      <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-medium">
                        Verification Requested
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed/40 text-on-tertiary-fixed font-medium">
                        Aligned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
