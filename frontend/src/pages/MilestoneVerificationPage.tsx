import React, { useMemo } from 'react';
import { useDrishtiData } from '../data/DrishtiContext';

export const MilestoneVerificationPage: React.FC = () => {
  const { data, loading, selectedProjectId } = useDrishtiData();

  const scurveSeries = useMemo(() => {
    if (!data) return [];
    return data.timeline_frames.map((frame, idx) => {
      const segs = frame.segments.filter(
        (s) => selectedProjectId === 'ALL' || s.project_id === selectedProjectId
      );
      const assessable = segs.filter((s) => s.is_assessable && s.activity_index !== null);
      const avgSaiPct =
        assessable.length > 0
          ? (assessable.reduce((acc, s) => acc + (s.activity_index ?? 0), 0) / assessable.length) * 100
          : 0;
      const avgSpend =
        segs.length > 0
          ? segs.reduce((acc, s) => acc + (s.spend_to_date_pct ?? 0), 0) / segs.length
          : 0;
      const avgReported =
        segs.length > 0
          ? segs.reduce((acc, s) => acc + (s.reported_progress_pct ?? 0), 0) / segs.length
          : 0;
      const planned = Math.min(100, ((idx + 1) / Math.max(1, data.timeline_frames.length)) * 90);
      return {
        date: frame.observed_at.slice(0, 10),
        saiPct: Number(avgSaiPct.toFixed(1)),
        spendPct: Number(avgSpend.toFixed(1)),
        reportedPct: Number(avgReported.toFixed(1)),
        plannedPct: Number(planned.toFixed(1)),
      };
    });
  }, [data, selectedProjectId]);

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading S-Curve &amp; Back-test...</div>;
  }

  const buildPolyline = (key: 'plannedPct' | 'spendPct' | 'reportedPct' | 'saiPct') => {
    if (scurveSeries.length === 0) return '';
    return scurveSeries
      .map((pt, i) => {
        const x = 40 + (i / Math.max(1, scurveSeries.length - 1)) * 520;
        const y = 200 - (Math.min(100, Math.max(0, pt[key])) / 100) * 170;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const cusumBreaks = data.ml_summary.cusum_nh544g_bsi_breaks ?? [];

  return (
    <div className="space-y-space-lg">
      {/* Dynamic S-Curve */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Physical vs. Financial S-Curve ({selectedProjectId === 'ALL' ? 'All 3 Corridors' : selectedProjectId})
            </h1>
            <p className="text-xs text-on-surface-variant">
              Tracks Spend %, Reported DPR %, Planned Baseline, and Satellite Activity Index (SAI %)
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#94a3b8] inline-block" /> Planned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#f59e0b] inline-block" /> Spend %
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#3b82f6] inline-block" /> Reported %
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#10b981] inline-block" /> Satellite SAI %
            </span>
          </div>
        </div>

        <svg viewBox="0 0 600 230" className="w-full h-64 bg-surface-container-low/40 rounded-lg border border-outline-variant/20">
          {[0, 25, 50, 75, 100].map((v) => {
            const y = 200 - (v / 100) * 170;
            return (
              <g key={v}>
                <line x1="40" y1={y} x2="560" y2={y} stroke="rgba(100,116,139,0.2)" strokeDasharray="3 3" />
                <text x="10" y={y + 4} fontSize="10" fill="#64748b">
                  {v}%
                </text>
              </g>
            );
          })}
          <polyline fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" points={buildPolyline('plannedPct')} />
          <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points={buildPolyline('spendPct')} />
          <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={buildPolyline('reportedPct')} />
          <polyline fill="none" stroke="#10b981" strokeWidth="3" points={buildPolyline('saiPct')} />
          {scurveSeries.map((pt, i) => {
            const x = 40 + (i / Math.max(1, scurveSeries.length - 1)) * 520;
            return (
              <text key={pt.date} x={x} y="220" fontSize="9" fill="#64748b" textAnchor="middle">
                {pt.date.slice(2, 7)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 3-Corridor Chronological Back-Test */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-space-lg py-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Chronological Back-Test Across 3 Real Corridors
            </h2>
            <p className="text-xs text-on-surface-variant">
              Method: {data.backtest.method} · Alert Threshold: {data.backtest.alert_threshold}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm border-b border-outline-variant/20">
                <th className="py-2.5 px-4">Case ID</th>
                <th className="py-2.5 px-4">Segment</th>
                <th className="py-2.5 px-4">Official Delay Date</th>
                <th className="py-2.5 px-4">First Satellite Alert</th>
                <th className="py-2.5 px-4">Lead Time</th>
                <th className="py-2.5 px-4">Outcome</th>
                <th className="py-2.5 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {data.backtest.cases.map((c) => (
                <tr key={c.case_id} className="hover:bg-surface-container-low/40">
                  <td className="py-2.5 px-4 font-mono font-semibold text-primary">{c.case_id}</td>
                  <td className="py-2.5 px-4 font-mono">{c.segment_id}</td>
                  <td className="py-2.5 px-4 font-mono">{c.official_delay_date ?? '—'}</td>
                  <td className="py-2.5 px-4 font-mono">{c.first_alert_date ?? 'None'}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold">
                    {c.lead_time_days !== null ? `${c.lead_time_days} days` : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        c.outcome === 'detected_before_official_flag'
                          ? 'bg-tertiary-fixed/40 text-on-tertiary-fixed'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      {c.outcome}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {c.source_url ? (
                      <a
                        href={c.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        Official Doc ↗
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSUM Structural Break Detector */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-sm">
        <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
          CUSUM Structural Break Detection (NH-544G Bare Soil Index)
        </h2>
        <p className="text-xs text-on-surface-variant">
          Non-parametric change-point breaks detected in Sentinel-2 BSI series ({cusumBreaks.length} break points)
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {cusumBreaks.length === 0 ? (
            <span className="text-xs text-outline">No structural break points above threshold.</span>
          ) : (
            cusumBreaks.map((b, i) => (
              <div
                key={`${b.observed_at}-${i}`}
                className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-xs"
              >
                <div className="font-mono font-semibold text-primary">{b.observed_at.slice(0, 10)}</div>
                <div className="text-on-surface-variant">
                  BSI {b.value?.toFixed(3)} · {b.direction ?? 'shift'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
