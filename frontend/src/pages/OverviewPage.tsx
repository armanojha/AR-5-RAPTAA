import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TimelineSegmentSnapshot, useDrishtiData } from '../data/DrishtiContext';

type MapLayer = 'hybrid' | 'sentinel2' | 'worldcover' | 'sar';
type AlertTab = 'all' | 'stall' | 'track_c';

function extractCoords(geom: { type: string; coordinates: number[][] | number[][][] }): number[][] {
  if (!geom || !geom.coordinates) return [];
  if (geom.type === 'LineString') return geom.coordinates as number[][];
  if (geom.type === 'MultiLineString' && Array.isArray(geom.coordinates[0])) {
    return (geom.coordinates as number[][][])[0] ?? [];
  }
  return [];
}

export const OverviewPage: React.FC = () => {
  const { data, loading, error, selectedProjectId, setSelectedProjectId, activeDateIndex, setActiveDateIndex } =
    useDrishtiData();
  const [mapLayer, setMapLayer] = useState<MapLayer>('hybrid');
  const [alertTab, setAlertTab] = useState<AlertTab>('all');

  const activeDate = data?.timeline_dates[activeDateIndex] ?? data?.latest_observed_at ?? '';

  const frameBySeg = useMemo(() => {
    const frame = data?.timeline_frames.find((f) => f.observed_at === activeDate);
    const map = new Map<string, TimelineSegmentSnapshot>();
    frame?.segments.forEach((s) => map.set(s.segment_id, s));
    return map;
  }, [data, activeDate]);

  const filteredSegments = useMemo(() => {
    const segs = data?.segments ?? [];
    if (selectedProjectId === 'ALL') return segs;
    return segs.filter((s) => s.project_id === selectedProjectId);
  }, [data, selectedProjectId]);

  // Project SVG coordinates for active corridor (default NHAI-NH544G-PKG1 if ALL)
  const mapProjectId = selectedProjectId === 'ALL' ? 'NHAI-NH544G-PKG1' : selectedProjectId;
  const mapSegments = useMemo(
    () => (data?.segments ?? []).filter((s) => s.project_id === mapProjectId),
    [data, mapProjectId]
  );

  const svgPaths = useMemo(() => {
    const allPts: number[][] = [];
    mapSegments.forEach((s) => {
      extractCoords(s.geometry).forEach((pt) => allPts.push(pt));
    });
    if (allPts.length === 0) return [];
    const xs = allPts.map((p) => p[0]);
    const ys = allPts.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1e-4);
    const spanY = Math.max(maxY - minY, 1e-4);

    return mapSegments.map((s) => {
      const pts = extractCoords(s.geometry);
      const d = pts
        .map(([x, y], idx) => {
          const px = 40 + ((x - minX) / spanX) * 520;
          const py = 220 - ((y - minY) / spanY) * 180;
          return `${idx === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
        })
        .join(' ');
      const snap = frameBySeg.get(s.segment_id);
      const status = snap?.status ?? s.analysis_status;
      const isAssessable = snap?.is_assessable ?? s.is_assessable;
      return { segment: s, d, status, isAssessable, sai: snap?.activity_index ?? s.activity_index };
    });
  }, [mapSegments, frameBySeg]);

  if (loading) {
    return <div className="p-space-xl text-on-surface-variant">Loading real satellite bundle...</div>;
  }
  if (error || !data) {
    return (
      <div className="p-space-xl text-error">
        Failed to load Drishti data: {error ?? 'Unknown error'}
      </div>
    );
  }

  const realProjects = data.projects.filter((p) => !p.is_synthetic);
  const notAssessableCount = filteredSegments.filter((s) => !s.is_assessable).length;
  const assessableCount = filteredSegments.length - notAssessableCount;
  const stalledCount = filteredSegments.filter((s) => {
    const snap = frameBySeg.get(s.segment_id);
    return (snap?.status ?? s.analysis_status) === 'stalled_or_high_divergence';
  }).length;

  const chipsForMap = data.chips_by_project[mapProjectId] ?? [];
  const latestChip = chipsForMap[chipsForMap.length - 1];

  const layerBgStyle: Record<MapLayer, string> = {
    hybrid: 'bg-[#071828]',
    sentinel2: 'bg-[#0a1f1c]',
    worldcover: 'bg-[#132013]',
    sar: 'bg-[#151822]',
  };

  const alertsList = data.alerts.filter((a) =>
    selectedProjectId === 'ALL' ? true : a.segment?.project_id === selectedProjectId
  );

  return (
    <div className="space-y-space-lg">
      {/* Hero KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
            <span>REAL CORRIDORS MONITORED</span>
            <span className="material-symbols-outlined text-primary text-[20px]">route</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-2xl font-bold text-on-surface">
              {realProjects.length} Real
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
              {data.segments.length} OSM Segments
            </span>
          </div>
          <div className="mt-1 text-xs text-on-surface-variant">
            {assessableCount} EO-assessable · {notAssessableCount} tunnel (not_assessable)
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
            <span>EARLY BACK-TEST LEAD TIME</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">schedule</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-2xl font-bold text-on-surface">
              392 / 273 Days
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-tertiary-fixed/40 text-on-tertiary-fixed font-semibold">
              2/3 Early
            </span>
          </div>
          <div className="mt-1 text-xs text-on-surface-variant">
            Precision {(data.evaluation_metrics.precision * 100).toFixed(0)}% · Recall{' '}
            {(data.evaluation_metrics.recall * 100).toFixed(0)}% · 0 Neg-Control FPs
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
            <span>VERIFICATION ALERTS (SHA-256)</span>
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-2xl font-bold text-error">
              {data.alerts.length}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
              {stalledCount} Stalled @ Epoch
            </span>
          </div>
          <div className="mt-1 text-xs text-on-surface-variant">
            Calibrated HistGBDT Brier {data.ml_summary.brier_score.toFixed(4)}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md">
            <span>TRACK C: GUARD THE NATION</span>
            <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-2xl font-bold text-on-surface">
              {data.track_c_events.length} Events
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
              1.25M m²
            </span>
          </div>
          <div className="mt-1 text-xs text-on-surface-variant">
            OSM Polygon Rasterized + WorldCover Masked
          </div>
        </div>
      </div>

      {/* Interactive Time Slider + Corridor Map + Layer Switcher */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">
        <div className="xl:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-space-lg py-space-md border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
                Corridor Spatial Telemetry — {mapProjectId}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Real OpenStreetMap alignment · Epoch {activeDate.slice(0, 10)} · Layer: {mapLayer.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
              {(['hybrid', 'sentinel2', 'worldcover', 'sar'] as MapLayer[]).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  onClick={() => setMapLayer(layer)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    mapLayer === layer
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {layer === 'hybrid'
                    ? 'Hybrid'
                    : layer === 'sentinel2'
                    ? 'Sentinel-2'
                    : layer === 'worldcover'
                    ? 'WorldCover'
                    : 'SAR dB'}
                </button>
              ))}
            </div>
          </div>

          <div className={`relative h-[280px] ${layerBgStyle[mapLayer]} flex items-center justify-center overflow-hidden`}>
            {latestChip?.rgb_url && mapLayer !== 'sar' && (
              <img
                src={mapLayer === 'sentinel2' ? latestChip.falsecolor_url ?? latestChip.rgb_url : latestChip.rgb_url}
                alt={`${mapProjectId} real Sentinel-2 chip`}
                className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
              />
            )}
            <svg viewBox="0 0 600 260" className="relative z-10 w-full h-full">
              <defs>
                <pattern id="grid20" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="600" height="260" fill="url(#grid20)" />
              {svgPaths.map(({ segment, d, status, isAssessable, sai }) => {
                const stroke = !isAssessable
                  ? '#94a3b8'
                  : status === 'stalled_or_high_divergence'
                  ? '#ef4444'
                  : '#10b981';
                return (
                  <g key={segment.segment_id}>
                    <path
                      d={d}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={!isAssessable ? '6 4' : undefined}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <title>
                        {segment.segment_id} | Status: {status} | SAI:{' '}
                        {sai !== null && sai !== undefined ? sai.toFixed(2) : 'N/A (Tunnel)'}
                      </title>
                    </path>
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-3 left-3 z-20 flex flex-wrap gap-2 bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Progressing
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Stalled / Divergence
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" /> Tunnel (not_assessable)
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20 flex gap-1">
              {realProjects.map((p) => (
                <button
                  key={p.project_id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.project_id)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border ${
                    mapProjectId === p.project_id
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-lowest/90 text-on-surface border-outline-variant/40'
                  }`}
                >
                  {p.project_id.split('-')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slider */}
          <div className="px-space-lg py-space-md bg-surface-container-low/60 border-t border-outline-variant/20 flex items-center gap-4">
            <span className="font-label-sm text-xs font-semibold text-on-surface whitespace-nowrap">
              Epoch Time Slider:
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, data.timeline_dates.length - 1)}
              value={activeDateIndex}
              onChange={(e) => setActiveDateIndex(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <span className="font-mono text-xs px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/30 text-primary font-semibold">
              {activeDate.slice(0, 10)}
            </span>
          </div>
        </div>

        {/* Live Alerts & Track C Feed */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm flex flex-col">
          <div className="px-space-lg py-space-md border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
              Intelligence Feed
            </h2>
            <div className="flex gap-1">
              {(['all', 'stall', 'track_c'] as AlertTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAlertTab(tab)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    alertTab === tab
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'stall' ? 'Stalls' : 'Track C'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] divide-y divide-outline-variant/20">
            {(alertTab === 'all' || alertTab === 'track_c') &&
              data.track_c_events.map((ev) => (
                <Link
                  key={ev.event_id}
                  to="/risk"
                  className="block p-space-md hover:bg-surface-container-low/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-semibold">
                      TRACK C · {ev.event_id}
                    </span>
                    <span className="text-[11px] font-semibold text-error">
                      {ev.affected_area_m2.toLocaleString()} m²
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-on-surface">{ev.target_infrastructure}</p>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant line-clamp-2">
                    {ev.recommended_action}
                  </p>
                </Link>
              ))}

            {(alertTab === 'all' || alertTab === 'stall') &&
              alertsList.slice(0, 6).map((al) => (
                <Link
                  key={al.alert_id}
                  to="/alerts"
                  className="block p-space-md hover:bg-surface-container-low/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-semibold text-primary">
                      {al.segment_id}
                    </span>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                        al.severity === 'high'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {al.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Spend {al.analysis.spend_to_date_pct}% vs SAI{' '}
                    {al.activity.activity_index !== null
                      ? (al.activity.activity_index * 100).toFixed(0) + '%'
                      : 'N/A'}{' '}
                    · Risk {(((al.risk as Record<string, unknown>)?.risk_score as number | undefined ?? al.risk?.delay_risk_score ?? 0) * 100).toFixed(0)}%
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Layer 12 Business Value & Responsible-Use Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-center">
        <div className="lg:col-span-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-tertiary-fixed/40 text-on-tertiary-fixed font-semibold">
              Layer 12 · National Scale &amp; Responsible Use
            </span>
            <span className="text-xs text-on-surface-variant">
              Verify-First Governance (No Contractor Allegations)
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Addressable Portfolio: ₹{data.layer12_roi.capex_lakh_cr}L Cr across{' '}
            {data.layer12_roi.addressable_projects.toLocaleString()} MoSPI Projects ({data.layer12_roi.roi_multiple}{' '}
            ROI at ₹{data.layer12_roi.annual_platform_cost_cr} Cr/yr)
          </h3>
          <p className="text-xs text-on-surface-variant">
            {data.layer12_roi.value_drivers.join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-start lg:justify-end">
          {data.layer12_roi.target_agencies.map((ag) => (
            <span
              key={ag}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-medium"
            >
              {ag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
