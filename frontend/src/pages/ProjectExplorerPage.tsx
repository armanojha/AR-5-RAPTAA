import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrishtiData } from '../data/DrishtiContext';

export const ProjectExplorerPage: React.FC = () => {
  const { data, loading, selectedProjectId, setSelectedProjectId } = useDrishtiData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'real' | 'synthetic'>('all');

  const projects = useMemo(() => {
    return (data?.projects ?? []).filter((p) => {
      if (classificationFilter === 'real' && p.is_synthetic) return false;
      if (classificationFilter === 'synthetic' && !p.is_synthetic) return false;
      if (
        search &&
        !`${p.project_id} ${p.project_name} ${p.agency ?? ''} ${p.state ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [data, classificationFilter, search]);

  const segments = useMemo(() => {
    return (data?.segments ?? []).filter((s) => {
      if (selectedProjectId !== 'ALL' && s.project_id !== selectedProjectId) return false;
      if (
        search &&
        !`${s.segment_id} ${s.corridor_name ?? ''} ${s.analysis_status}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [data, selectedProjectId, search]);

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading portfolio &amp; segments...</div>;
  }

  return (
    <div className="space-y-space-lg">
      {/* Portfolio Cards (3 Real + 2 Synthetic) */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Portfolio &amp; Corridor Explorer
            </h1>
            <p className="text-xs text-on-surface-variant">
              3 Real OSM + Sentinel-1/2 Corridors and 2 Explicitly Labelled Synthetic Portfolio Benchmarks
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter corridor or segment..."
              className="px-3 py-1.5 rounded border border-outline-variant/40 bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            {(['all', 'real', 'synthetic'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setClassificationFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-medium capitalize ${
                  classificationFilter === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {projects.map((p) => (
            <div
              key={p.project_id}
              onClick={() => {
                if (!p.is_synthetic) setSelectedProjectId(p.project_id);
              }}
              className={`p-space-md rounded-xl border transition-all ${
                selectedProjectId === p.project_id
                  ? 'border-primary bg-primary-fixed/15'
                  : 'border-outline-variant/30 bg-surface-container-low/40 hover:border-primary/50'
              } ${!p.is_synthetic ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-primary">{p.project_id}</span>
                <span
                  className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                    p.is_synthetic
                      ? 'bg-surface-container-high text-on-surface-variant'
                      : 'bg-tertiary-fixed/50 text-on-tertiary-fixed'
                  }`}
                >
                  {p.is_synthetic ? 'Synthetic Placeholder' : 'Real EO + OSM'}
                </span>
              </div>
              <h3 className="mt-1 font-semibold text-sm text-on-surface">{p.project_name}</h3>
              <p className="text-xs text-on-surface-variant">
                {p.agency ?? 'Agency'} · {p.state ?? 'India'} · {p.corridor_type ?? 'Corridor'}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-outline-variant/20 pt-2">
                <div>
                  <span className="text-outline block text-[10px]">Avg SAI</span>
                  <span className="font-mono font-semibold text-on-surface">
                    {p.avg_activity_index !== undefined ? p.avg_activity_index.toFixed(2) : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Spend / Rep</span>
                  <span className="font-mono font-semibold text-on-surface">
                    {p.avg_spend_pct ?? '—'}% / {p.avg_reported_pct ?? '—'}%
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px]">Lead Time</span>
                  <span className="font-mono font-semibold text-tertiary">
                    {p.lead_time_days ? `${p.lead_time_days}d` : p.backtest_outcome ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 33-Segment Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-space-lg py-space-md border-b border-outline-variant/20 flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            OSM Segment Inventory ({segments.length} segments)
          </h2>
          {selectedProjectId !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedProjectId('ALL')}
              className="text-xs text-primary hover:underline"
            >
              Show All Corridors
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm border-b border-outline-variant/20">
                <th className="py-2.5 px-4">Segment</th>
                <th className="py-2.5 px-4">Chainage</th>
                <th className="py-2.5 px-4">Observability</th>
                <th className="py-2.5 px-4">SAI</th>
                <th className="py-2.5 px-4">Spend %</th>
                <th className="py-2.5 px-4">Spend/Act Ratio</th>
                <th className="py-2.5 px-4">ML Delay Prob</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {segments.map((s) => (
                <tr key={s.segment_id} className="hover:bg-surface-container-low/40">
                  <td className="py-2.5 px-4 font-mono font-semibold text-primary">{s.segment_id}</td>
                  <td className="py-2.5 px-4 text-on-surface-variant">
                    km {s.km_start?.toFixed(1)} – {s.km_end?.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-4">
                    {s.is_assessable ? (
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed/40 text-on-tertiary-fixed font-medium">
                        Assessable
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">
                        not_assessable (tunnel)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.activity_index !== null ? s.activity_index.toFixed(3) : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.spend_to_date_pct !== null ? `${s.spend_to_date_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {s.spend_vs_activity_ratio !== null ? `${s.spend_vs_activity_ratio.toFixed(2)}x` : '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold">
                    {(s.ml_delay_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        s.analysis_status === 'stalled_or_high_divergence'
                          ? 'bg-error-container text-on-error-container'
                          : s.analysis_status === 'not_assessable'
                          ? 'bg-surface-container text-on-surface-variant'
                          : 'bg-tertiary-fixed/30 text-on-tertiary-fixed'
                      }`}
                    >
                      {s.analysis_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(s.project_id);
                        navigate('/evidence');
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      Inspect EO
                    </button>
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
