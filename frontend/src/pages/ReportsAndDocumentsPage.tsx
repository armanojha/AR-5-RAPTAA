import React, { useState } from 'react';
import { useDrishtiData } from '../data/DrishtiContext';

type DocTab = 'all' | 'pdfs' | 'track_c' | 'audit';

export const ReportsAndDocumentsPage: React.FC = () => {
  const { data, loading } = useDrishtiData();
  const [activeTab, setActiveTab] = useState<DocTab>('all');

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading generated evidence &amp; PDFs...</div>;
  }

  const auditEntries = Object.entries(data.audit_files ?? {});

  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Reports, PDFs &amp; SHA-256 Audit Manifests
          </h1>
          <p className="text-xs text-on-surface-variant">
            Real ReportLab PDFs, HTML evidence dossiers, Track C chips, and machine-verifiable SHA-256 manifests
          </p>
        </div>
        <div className="flex gap-1 bg-surface-container-low p-1 rounded border border-outline-variant/30">
          {(
            [
              ['all', 'All'],
              ['pdfs', `Alert PDFs (${data.alerts.length})`],
              ['track_c', `Track C (${data.track_c_events.length})`],
              ['audit', `Calibration & Audit (${auditEntries.length})`],
            ] as [DocTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                activeTab === tab
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit JSONs */}
      {(activeTab === 'all' || activeTab === 'audit') && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Calibration, Back-Test &amp; Evaluation Artifacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {auditEntries.map(([name, url]) => (
              <a
                key={name}
                href={url}
                download={name}
                target="_blank"
                rel="noreferrer"
                className="p-space-md rounded-xl border border-outline-variant/30 bg-surface-container-low/40 hover:border-primary flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-mono text-xs font-semibold text-primary">{name}</div>
                  <div className="text-[11px] text-on-surface-variant">Machine-readable JSON artifact</div>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">download</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Track C Evidence */}
      {(activeTab === 'all' || activeTab === 'track_c') && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Track C Evidence Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {data.track_c_events.map((ev) => (
              <div
                key={ev.event_id}
                className="p-space-md rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex gap-3 items-center"
              >
                {ev.chip_url && (
                  <img
                    src={ev.chip_url}
                    alt={ev.event_id}
                    className="w-20 h-20 rounded object-cover bg-[#0b1320] shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1 text-xs">
                  <div className="font-mono font-semibold text-primary">{ev.event_id}</div>
                  <div className="text-on-surface font-medium truncate">{ev.target_infrastructure}</div>
                  <div className="font-mono text-[10px] text-outline truncate">
                    SHA-256: {ev.audit_hash}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert PDFs & HTML Reports */}
      {(activeTab === 'all' || activeTab === 'pdfs') && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
          <div className="px-space-lg py-space-md border-b border-outline-variant/20">
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Alert Evidence Dossiers ({data.alerts.length} ReportLab PDFs + HTML + Manifests)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant uppercase font-label-sm border-b border-outline-variant/20">
                  <th className="py-2.5 px-4">Alert ID</th>
                  <th className="py-2.5 px-4">Segment</th>
                  <th className="py-2.5 px-4">Observed</th>
                  <th className="py-2.5 px-4">SHA-256 Digest</th>
                  <th className="py-2.5 px-4">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {data.alerts.map((al) => (
                  <tr key={al.alert_id} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-4 font-mono font-semibold text-primary">{al.alert_id}</td>
                    <td className="py-2.5 px-4 font-mono">{al.segment_id}</td>
                    <td className="py-2.5 px-4 font-mono">{al.observed_at.slice(0, 10)}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-on-surface-variant max-w-[200px] truncate">
                      {al.evidence_sha256}
                    </td>
                    <td className="py-2.5 px-4 flex gap-2">
                      {al.pdf_url && (
                        <a
                          href={al.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-primary text-on-primary font-medium"
                        >
                          PDF
                        </a>
                      )}
                      {al.html_url && (
                        <a
                          href={al.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface"
                        >
                          HTML
                        </a>
                      )}
                      {al.manifest_url && (
                        <a
                          href={al.manifest_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-mono"
                        >
                          Manifest
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
