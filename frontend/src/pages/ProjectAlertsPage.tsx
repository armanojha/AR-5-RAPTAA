import React, { useMemo, useState } from 'react';
import { alertProjectId, useDrishtiData } from '../data/DrishtiContext';

export const ProjectAlertsPage: React.FC = () => {
  const { data, loading, selectedProjectId } = useDrishtiData();
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [search, setSearch] = useState('');

  const alerts = useMemo(() => {
    return (data?.alerts ?? []).filter((a) => {
      if (selectedProjectId !== 'ALL' && alertProjectId(a) !== selectedProjectId) return false;
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (
        search &&
        !`${a.alert_id} ${a.segment_id} ${a.recommended_action}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [data, selectedProjectId, severityFilter, search]);

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading verification alerts...</div>;
  }

  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Verification Alerts ({alerts.length} of {data.alerts.length})
          </h1>
          <p className="text-xs text-on-surface-variant">
            Every alert includes ReportLab PDF, interactive HTML report, real Sentinel-2 chips, and SHA-256 manifest
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter alert or segment..."
            className="px-3 py-1.5 rounded border border-outline-variant/40 bg-surface-container-low text-xs"
          />
          {(['all', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize ${
                severityFilter === sev
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        {alerts.map((al) => {
          const thumb = al.chip_urls?.[0];
          return (
            <div
              key={al.alert_id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md shadow-sm flex gap-space-md"
            >
              {thumb && (
                <img
                  src={thumb}
                  alt={al.alert_id}
                  className="w-28 h-28 rounded-lg object-cover bg-[#0b1320] shrink-0 border border-outline-variant/30"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-primary truncate">
                    {al.alert_id}
                  </span>
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold shrink-0 ${
                      al.severity === 'high'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {al.severity}
                  </span>
                </div>
                <div className="text-xs font-medium text-on-surface">
                  {al.segment_id} · Observed {al.observed_at.slice(0, 10)}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  Risk {(((al.risk as Record<string, unknown>)?.risk_score as number | undefined ?? al.risk?.delay_risk_score ?? 0) * 100).toFixed(0)}% · Spend{' '}
                  {al.analysis.spend_to_date_pct}% vs SAI{' '}
                  {al.activity.activity_index !== null
                    ? (al.activity.activity_index * 100).toFixed(0) + '%'
                    : 'N/A'}
                </div>
                <p className="text-[11px] text-on-surface-variant line-clamp-2">
                  {al.recommended_action}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium">
                  {al.pdf_url && (
                    <a
                      href={al.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-primary text-on-primary hover:bg-primary-container"
                    >
                      PDF Report
                    </a>
                  )}
                  {al.html_url && (
                    <a
                      href={al.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface hover:bg-surface-container"
                    >
                      HTML Evidence
                    </a>
                  )}
                  {al.manifest_url && (
                    <a
                      href={al.manifest_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono"
                    >
                      SHA-256
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
