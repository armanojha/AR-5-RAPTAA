import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TimelineSegmentSnapshot, useDrishtiData } from '../data/DrishtiContext';

type MapLayer = 'hybrid' | 'sentinel2' | 'worldcover' | 'sar';
type AlertTab = 'all' | 'stall' | 'track_c';

// Map real India lat/lon onto the 1000x800 India Geo-Grid viewBox
function projectIndia(lon: number, lat: number): [number, number] {
  const x = 235 + ((lon - 68.0) / (97.5 - 68.0)) * 585;
  const y = 720 - ((lat - 7.5) / (36.5 - 7.5)) * 630;
  return [x, y];
}

const CORRIDOR_ANCHORS: Record<string, { lat: number; lon: number; label: string; region: string }> = {
  'NHAI-NH544G-PKG1': { lat: 13.95, lon: 77.78, label: 'NH-544G (Anantapur)', region: 'Andhra Pradesh' },
  'RVNL-RK-RAIL': { lat: 30.18, lon: 78.68, label: 'Rishikesh–Karnaprayag', region: 'Uttarakhand' },
  'BSRDC-KDB-BRIDGE': { lat: 25.61, lon: 85.34, label: 'Kacchi Dargah–Bidupur', region: 'Bihar (Ganga)' },
};

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    selectedProjectId,
    setSelectedProjectId,
    activeDateIndex,
    setActiveDateIndex,
  } = useDrishtiData();

  const [mapLayer, setMapLayer] = useState<MapLayer>('hybrid');
  const [alertTab, setAlertTab] = useState<AlertTab>('all');
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [focusedCorridorId, setFocusedCorridorId] = useState<string>('NHAI-NH544G-PKG1');

  const activeDate = data?.timeline_dates[activeDateIndex] ?? data?.latest_observed_at ?? '';

  const frameBySeg = useMemo(() => {
    const frame = data?.timeline_frames.find((f) => f.observed_at === activeDate);
    const map = new Map<string, TimelineSegmentSnapshot>();
    frame?.segments.forEach((s) => map.set(s.segment_id, s));
    return map;
  }, [data, activeDate]);

  const activeCorridorId =
    selectedProjectId !== 'ALL' && CORRIDOR_ANCHORS[selectedProjectId]
      ? selectedProjectId
      : focusedCorridorId;

  const toSaiPct = (v: number | null | undefined) => {
    if (v === null || v === undefined || Number.isNaN(v)) return 0;
    return Math.min(100, Math.max(0, Math.round(v <= 1 ? v * 100 : v)));
  };

  const velocityPoints = useMemo(() => {
    if (!data?.timeline_frames?.length) return [];
    return data.timeline_frames.map((frame, i) => {
      const assessable = frame.segments.filter((s) => s.is_assessable && s.activity_index !== null);
      const avgSaiPct =
        assessable.length > 0
          ? assessable.reduce((acc, s) => acc + toSaiPct(s.activity_index), 0) / assessable.length
          : 25;
      const x = (i / Math.max(1, data.timeline_frames.length - 1)) * 300;
      const y = 92 - (Math.min(100, Math.max(0, avgSaiPct)) / 100) * 75;
      return { x, y, date: frame.observed_at.slice(0, 7), avgSaiPct };
    });
  }, [data]);

  if (loading) {
    return <div className="p-space-xl text-on-surface-variant">Loading Drishti satellite telemetry...</div>;
  }
  if (error || !data) {
    return (
      <div className="p-space-xl text-error">
        Failed to load Drishti data: {error ?? 'Unknown error'}
      </div>
    );
  }

  const realProjects = data.projects.filter((p) => !p.is_synthetic);
  const synthProjects = data.projects.filter((p) => p.is_synthetic);

  const assessableSegs = data.segments.filter((s) => s.is_assessable);
  const tunnelSegs = data.segments.filter((s) => !s.is_assessable);
  const stalledSegs = assessableSegs.filter((s) => {
    const snap = frameBySeg.get(s.segment_id);
    const st = snap?.status ?? s.analysis_status;
    return st === 'stall_candidate' || st === 'slowing' || st === 'stalled_or_high_divergence';
  });
  const activeOkSegs = assessableSegs.length - stalledSegs.length;
  const activeOkPct = data.segments.length > 0 ? Math.round((activeOkSegs / data.segments.length) * 100) : 0;

  const focusedProject =
    realProjects.find((p) => p.project_id === activeCorridorId) ?? realProjects[0];
  const focusedAnchor = CORRIDOR_ANCHORS[activeCorridorId] ?? CORRIDOR_ANCHORS['NHAI-NH544G-PKG1'];
  const chipsForFocused = data.chips_by_project[activeCorridorId] ?? [];
  const latestChip = chipsForFocused[chipsForFocused.length - 1];

  const alertsList = data.alerts.filter((a) =>
    selectedProjectId === 'ALL' ? true : a.segment?.project_id === selectedProjectId
  );

  // Donut circumference = 2 * pi * 48 ≈ 301.59
  const circ = 301.59;
  const okDash = (activeOkPct / 100) * circ;

  const velocityLine = velocityPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const velocityArea =
    velocityPoints.length > 0
      ? `0,100 ${velocityLine} 300,100`
      : '0,85 150,45 300,30 300,100 0,100';

  const latestScenes = (data.scenes ?? []).slice(-4).reverse();

  return (
    <div className="space-y-space-lg">
      {/* Page Header Row (matching original CIVITRACE overview header) */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-label-sm text-[11px] uppercase tracking-wider text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span>
              NATIONAL GROUND TRUTH MONITORING NETWORK · {realProjects.length} Real Corridors +{' '}
              {synthProjects.length} Portfolio Benchmarks
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-[26px] font-bold text-on-surface tracking-tight">
            Infrastructure Intelligence Overview
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">
            Monitor corridor progress, detect physical-vs-financial divergence, and dispatch Joint Physical Verification against calibrated Sentinel-1 SAR &amp; Sentinel-2 optical telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm shrink-0">
          <Link
            to="/risk"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-medium text-on-surface hover:bg-surface-container-low shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">tune</span>
            <span>ML &amp; Calibration</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-medium text-on-surface shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
            <span>Epoch: {activeDate.slice(0, 10)}</span>
          </div>
          <Link
            to="/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Evidence Summary (PDF)</span>
          </Link>
        </div>
      </section>

      {/* 4 KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                CORRIDOR NETWORK
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">
                  {realProjects.length} Real
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                  {data.segments.length} OSM Segs
                </span>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                {assessableSegs.length} EO-assessable · {tunnelSegs.length} tunnel (not_assessable)
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Asset Mix</span>
              <span className="font-mono font-semibold text-on-surface">1 Hwy / 1 Rail / 1 Bridge</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: '48%' }} />
              <div className="bg-tertiary h-full" style={{ width: '30%' }} />
              <div className="bg-secondary h-full" style={{ width: '22%' }} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                VERIFICATION ALERTS
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">
                  {data.alerts.length}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold">
                  SHA-256
                </span>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                {stalledSegs.length} stalled at epoch · ReportLab PDFs ready
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>{stalledSegs.length} High Divergence</span>
              <span className="font-mono font-semibold text-on-surface">
                Brier {data.ml_summary.brier_score.toFixed(4)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '74%' }} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                EARLY BACK-TEST LEAD
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">392d</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold">
                  2/3 Early
                </span>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                NH-544G (392d) &amp; KDB Bridge (273d) ahead of DPR flag
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-error-container/50 text-error flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Eval Precision / Recall</span>
              <span className="font-mono font-semibold text-error">
                {(data.evaluation_metrics.precision * 100).toFixed(0)}% /{' '}
                {(data.evaluation_metrics.recall * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="bg-error h-full rounded-full" style={{ width: '67%' }} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                TRACK C · ASSET GUARD
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">
                  0{data.track_c_events.length}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-tertiary-fixed/50 text-on-tertiary-fixed font-semibold">
                  1.25M m²
                </span>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                OSM Polygon Rasterized + ESA WorldCover Masked
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-tertiary-fixed/40 text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>Neg-Control False Positives</span>
              <span className="font-mono font-semibold text-tertiary">
                {data.evaluation_metrics.false_alerts_on_negative_controls} FPs (10m GSD)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden">
              <div className="bg-tertiary-container h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Split: National Infrastructure Vector Grid + Ground Truth Alerts */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* Left 8 cols: National Infrastructure Vector Grid */}
        <div className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Map Top Header */}
          <div className="px-space-lg py-space-md border-b border-outline-variant/20 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">travel_explore</span>
                <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  National Infrastructure Vector Grid
                </span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed uppercase font-semibold">
                  S1+S2 LIVE
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/30">
                {(
                  [
                    ['hybrid', 'Hybrid Vector'],
                    ['sentinel2', 'Sentinel-2 True Color'],
                    ['worldcover', 'WorldCover / DEM'],
                    ['sar', 'SAR Radar'],
                  ] as [MapLayer, string][]
                ).map(([layer, label]) => (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => setMapLayer(layer)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      mapLayer === layer
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-label-sm text-[11px] uppercase text-outline mr-1">CORRIDOR:</span>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId('ALL')}
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    selectedProjectId === 'ALL'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All ({realProjects.length})
                </button>
                {realProjects.map((p) => (
                  <button
                    key={p.project_id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(p.project_id);
                      setFocusedCorridorId(p.project_id);
                    }}
                    className={`px-2.5 py-0.5 rounded-full font-medium ${
                      selectedProjectId === p.project_id
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {CORRIDOR_ANCHORS[p.project_id]?.label ?? p.project_id}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-on-surface-variant">
                Grid Anchor: {focusedAnchor.lat.toFixed(4)}° N, {focusedAnchor.lon.toFixed(4)}° E
              </span>
            </div>
          </div>

          {/* Map Canvas Graphic Area */}
          <div className="relative w-full h-[440px] sm:h-[500px] bg-gradient-to-b from-[#eaf2fb] via-[#f0f6ff] to-[#e4eef9] overflow-hidden select-none">
            {/* Optional real Sentinel-2 chip backdrop when Sentinel-2 / SAR tab selected */}
            {mapLayer !== 'hybrid' && latestChip?.rgb_url && (
              <img
                src={mapLayer === 'sentinel2' ? latestChip.rgb_url : latestChip.falsecolor_url ?? latestChip.rgb_url}
                alt={`${activeCorridorId} real Sentinel-2 imagery`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  mapLayer === 'sar' ? 'grayscale contrast-125 opacity-70' : 'opacity-80'
                }`}
              />
            )}

            <svg
              className="relative z-10 w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200"
              style={{ transform: `scale(${mapZoom})` }}
              viewBox="0 0 1000 800"
            >
              <defs>
                <pattern height="40" id="grid-pattern" patternUnits="userSpaceOnUse" width="40">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(113,120,129,0.16)"
                    strokeWidth="0.8"
                  />
                </pattern>
              </defs>
              <rect fill="url(#grid-pattern)" height="800" width="1000" />
              {/* India Silhouette */}
              <path
                d="M 450,90 C 480,120 540,110 570,140 C 600,170 560,200 580,230 C 600,260 670,250 710,240 C 740,240 790,260 810,290 C 830,320 810,340 770,350 C 740,360 700,340 680,350 C 660,370 650,400 630,420 C 600,450 610,500 590,540 C 570,580 540,640 510,690 C 490,720 480,720 460,680 C 440,640 400,560 380,500 C 360,450 330,420 310,400 C 280,380 250,370 240,350 C 230,320 270,300 290,280 C 320,250 350,220 380,180 C 410,140 430,90 450,90 Z"
                fill={mapLayer === 'hybrid' ? '#fbfdff' : 'rgba(251,253,255,0.22)'}
                stroke="#94a3b8"
                strokeWidth="1.8"
              />

              {/* Real Corridor Markers & Connecting Arcs */}
              {realProjects.map((p) => {
                const anchor = CORRIDOR_ANCHORS[p.project_id];
                if (!anchor) return null;
                const [cx, cy] = projectIndia(anchor.lon, anchor.lat);
                const isSelected = activeCorridorId === p.project_id;
                const hasLead = p.backtest_outcome === 'detected_before_official_flag';
                const color = hasLead ? '#ba1a1a' : '#008280';

                return (
                  <g
                    key={p.project_id}
                    className="cursor-pointer"
                    onClick={() => {
                      setFocusedCorridorId(p.project_id);
                      setSelectedProjectId(p.project_id);
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="18"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        opacity="0.55"
                        className="animate-pulse"
                      />
                    )}
                    <circle cx={cx} cy={cy} r={isSelected ? '9' : '7'} fill={color} stroke="#fff" strokeWidth="2" />
                    <text
                      x={cx + 14}
                      y={cy + 4}
                      fontSize="13"
                      fontWeight="600"
                      fill="#031c35"
                      className="font-sans"
                    >
                      {anchor.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Corridor Inspection Popover Card */}
            {focusedProject && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 z-20 w-[290px] bg-surface-container-lowest/95 backdrop-blur border border-outline-variant/40 rounded-xl p-space-md shadow-lg space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold text-error">
                    <span className="w-2 h-2 rounded-full bg-error" />
                    SPEND / SAI: {focusedProject.avg_spend_pct ?? 0}% vs{' '}
                    {toSaiPct(focusedProject.avg_activity_index)}%
                  </span>
                  <span className="font-mono text-outline">{focusedProject.project_id.split('-')[0]}</span>
                </div>
                <div className="font-headline-sm text-sm font-bold text-on-surface">
                  {focusedProject.project_name}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {focusedProject.segment_count} OSM segments ({focusedProject.not_assessable_count ?? 0} tunnel{' '}
                  <span className="font-mono">not_assessable</span>).{' '}
                  {focusedProject.lead_time_days
                    ? `Back-test detected ${focusedProject.lead_time_days} days ahead of official delay flag.`
                    : 'Monsoon cloud/rain confounded corridor (honest miss logged).'}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-xs">
                  <span className="font-mono text-outline">Epoch: {activeDate.slice(0, 10)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(focusedProject.project_id);
                      navigate('/evidence');
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Inspect Radar &gt;
                  </button>
                </div>
              </div>
            )}

            {/* Right Zoom Controls */}
            <div className="absolute right-4 top-6 z-20 flex flex-col bg-surface-container-lowest border border-outline-variant/40 rounded-lg shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setMapZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
                className="p-2 hover:bg-surface-container-low text-on-surface border-b border-outline-variant/20"
                title="Zoom in"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                type="button"
                onClick={() => setMapZoom((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
                className="p-2 hover:bg-surface-container-low text-on-surface border-b border-outline-variant/20"
                title="Zoom out"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                type="button"
                onClick={() => setMapZoom(1)}
                className="p-2 hover:bg-surface-container-low text-on-surface"
                title="Reset view"
              >
                <span className="material-symbols-outlined text-[18px]">fit_screen</span>
              </button>
            </div>

            {/* Bottom-Left Telemetry Layer Status Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-surface-container-lowest/95 backdrop-blur border border-outline-variant/40 rounded-lg p-3 shadow-sm text-[11px] space-y-1.5">
              <div className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-semibold">
                TELEMETRY LAYER STATUS
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error" /> Early Flagged ({stalledSegs.length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container" /> Verified On-Track ({activeOkSegs})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Track C Events ({data.track_c_events.length})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-outline" /> Tunnel N/A ({tunnelSegs.length})
                </span>
              </div>
            </div>
          </div>

          {/* Swath Telemetry Footer + Epoch Time Slider */}
          <div className="px-space-lg py-space-sm bg-surface-container-low/60 border-t border-outline-variant/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant">
              <span>
                Swath Sensor: <strong>Sentinel-2 MSI + Sentinel-1 SAR RTC</strong> · Resolution: <strong>10m GSD</strong> · Geometry: <strong>OpenStreetMap</strong>
              </span>
              <span>Active Epoch: {activeDate.slice(0, 10)}</span>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-semibold text-on-surface whitespace-nowrap">
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
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/40 text-primary font-semibold">
                {activeDate.slice(0, 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Ground Truth Alerts */}
        <div className="xl:col-span-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-space-lg py-space-md border-b border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">sensors</span>
                <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                  Ground Truth Alerts
                </h2>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold">
                {alertsList.length + data.track_c_events.length} Pending
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/20 text-xs">
              {(
                [
                  ['all', `All (${alertsList.length + data.track_c_events.length})`],
                  ['stall', `Stalls (${alertsList.length})`],
                  ['track_c', `Track C (${data.track_c_events.length})`],
                ] as [AlertTab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAlertTab(tab)}
                  className={`py-1 rounded font-medium text-center transition-colors ${
                    alertTab === tab
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-space-md space-y-space-sm max-h-[500px] overflow-y-auto">
            {(alertTab === 'all' || alertTab === 'track_c') &&
              data.track_c_events.map((ev) => (
                <div
                  key={ev.event_id}
                  className="p-space-md rounded-xl bg-surface-container-low/70 border border-outline-variant/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
                      TRACK C · {ev.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-outline">
                      {ev.last_verified.slice(0, 10)}
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-on-surface">{ev.target_infrastructure}</div>
                  <p className="text-xs text-on-surface-variant">
                    Detected <strong className="text-error">{ev.affected_area_m2.toLocaleString()} m²</strong>{' '}
                    ({ev.detected_pixels} px) inside rasterized OSM zone.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="font-mono text-outline">{ev.event_id}</span>
                    <Link to="/risk" className="font-semibold text-primary hover:underline">
                      View Evidence →
                    </Link>
                  </div>
                </div>
              ))}

            {(alertTab === 'all' || alertTab === 'stall') &&
              alertsList.slice(0, 4).map((al) => {
                const riskVal =
                  (al.risk as Record<string, unknown>)?.risk_score as number | undefined ??
                  al.risk?.delay_risk_score ??
                  0;
                return (
                  <div
                    key={al.alert_id}
                    className="p-space-md rounded-xl bg-surface-container-low/70 border border-outline-variant/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                          al.severity === 'high'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        {al.severity === 'high' ? 'SEVERE DISCREPANCY' : 'VERIFICATION'}
                      </span>
                      <span className="text-[11px] font-mono text-outline">
                        {al.observed_at.slice(0, 10)}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-on-surface">{al.segment_id}</div>
                    <p className="text-xs text-on-surface-variant">
                      Spend <strong>{al.analysis.spend_to_date_pct}%</strong> vs SAI{' '}
                      <strong>
                        {al.activity.activity_index !== null
                          ? `${(al.activity.activity_index * 100).toFixed(0)}%`
                          : 'N/A'}
                      </strong>{' '}
                      · Delay Risk <strong className="text-error">{(riskVal * 100).toFixed(0)}%</strong>.
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="font-mono text-outline">{al.alert_id}</span>
                      <Link to="/alerts" className="font-semibold text-primary hover:underline">
                        Inspect Dossier →
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="p-space-md border-t border-outline-variant/20 bg-surface-container-low/40">
            <Link
              to="/alerts"
              className="block w-full text-center py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-low"
            >
              View All {alertsList.length} Ground Verification Tasks
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom 4-Column Analytical Visualizations (matching Screenshot 2) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* 1. Status Distribution */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Status Distribution
              </h3>
              <span className="material-symbols-outlined text-outline text-[18px]">pie_chart</span>
            </div>
            <p className="text-xs text-on-surface-variant">Overall {data.segments.length} OSM Segments</p>
            <div className="relative flex items-center justify-center my-space-md">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" fill="none" r="48" stroke="#eff4ff" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  fill="none"
                  r="48"
                  stroke="#008280"
                  strokeWidth="12"
                  strokeDasharray={`${okDash.toFixed(1)} ${circ}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-headline-md text-xl font-bold text-on-surface">{activeOkPct}%</span>
                <span className="text-[10px] font-mono uppercase text-outline">ACTIVE OK</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary-container" /> Assessable On-Track
              </span>
              <span className="font-mono font-semibold">{activeOkSegs}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error" /> Stalled / Divergence
              </span>
              <span className="font-mono font-semibold">{stalledSegs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-outline" /> Tunnel (not_assessable)
              </span>
              <span className="font-mono font-semibold">{tunnelSegs.length}</span>
            </div>
          </div>
        </div>

        {/* 2. Corridor Audit Index */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Corridor Audit Index
              </h3>
              <span className="material-symbols-outlined text-outline text-[18px]">bar_chart</span>
            </div>
            <p className="text-xs text-on-surface-variant">3 Real Corridors: Reported vs Observed SAI</p>
            <div className="mt-space-md space-y-3">
              {realProjects.map((p) => {
                const rep = Math.round(p.avg_reported_pct ?? 0);
                const obs = toSaiPct(p.avg_activity_index);
                const gap = obs - rep;
                return (
                  <div key={p.project_id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="truncate text-on-surface">{p.project_id}</span>
                      <span className="font-mono text-error font-semibold">
                        Gap: {gap > 0 ? `+${gap}` : gap}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-14 text-outline">Reported</span>
                      <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, rep)}%` }} />
                      </div>
                      <span className="w-8 font-mono text-right">{rep}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-14 text-outline">Observed</span>
                      <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div className="bg-tertiary-container h-full rounded-full" style={{ width: `${Math.min(100, obs)}%` }} />
                      </div>
                      <span className="w-8 font-mono text-right">{obs}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Sensor Velocity */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Sensor Velocity
              </h3>
              <span className="material-symbols-outlined text-outline text-[18px]">show_chart</span>
            </div>
            <p className="text-xs text-on-surface-variant">Mean Corridor SAI Trajectory across Epochs</p>
            <div className="my-space-md">
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 110">
                <defs>
                  <linearGradient id="velocity-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#006099" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#006099" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="300" y1="30" y2="30" />
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="300" y1="65" y2="65" />
                <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="300" y1="95" y2="95" />
                <polygon points={velocityArea} fill="url(#velocity-grad)" />
                <polyline fill="none" stroke="#006099" strokeWidth="2.5" points={velocityLine} />
                {velocityPoints.length > 0 && (
                  <circle
                    cx={velocityPoints[velocityPoints.length - 1].x}
                    cy={velocityPoints[velocityPoints.length - 1].y}
                    fill="#006099"
                    r="4"
                  />
                )}
              </svg>
            </div>
          </div>
          <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Latest Mean SAI</span>
            <span className="font-mono font-semibold text-primary">
              {velocityPoints.length > 0
                ? `${velocityPoints[velocityPoints.length - 1].avgSaiPct.toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </div>

        {/* 4. Orbital Ingest Feed */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Orbital Ingest Feed
              </h3>
              <span className="material-symbols-outlined text-outline text-[18px]">satellite_alt</span>
            </div>
            <p className="text-xs text-on-surface-variant">Verified STAC / Copernicus Passes</p>
            <div className="mt-space-md space-y-2.5">
              {latestScenes.map((sc, idx) => {
                const sid = String(sc.scene_id ?? `Scene-${idx + 1}`);
                const sensor = String(sc.sensor ?? 'Sentinel-2 L2A');
                const dt = String(sc.acquired_at ?? '').slice(0, 10);
                return (
                  <div key={sid} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-on-surface truncate">{sensor}</div>
                      <div className="font-mono text-[10px] text-outline truncate">{sid}</div>
                    </div>
                    <span className="font-mono text-[11px] text-primary shrink-0">{dt}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Catalog Scenes</span>
            <Link to="/evidence" className="font-semibold text-primary hover:underline">
              Inspect EO Lab →
            </Link>
          </div>
        </div>
      </section>

      {/* Layer 12 National Scale & Responsible Use Footer */}
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-tertiary-fixed/50 text-on-tertiary-fixed font-semibold">
              Layer 12 · Commercialization &amp; Responsible Use
            </span>
            <span className="text-xs text-on-surface-variant">Verify-First Governance (No Contractor Blame)</span>
          </div>
          <div className="font-headline-sm text-base font-bold text-on-surface">
            Addressable Portfolio: ₹{data.layer12_roi.capex_lakh_cr}L Cr across{' '}
            {data.layer12_roi.addressable_projects.toLocaleString()} MoSPI Projects ({data.layer12_roi.roi_multiple}{' '}
            ROI at ₹{data.layer12_roi.annual_platform_cost_cr} Cr/yr)
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.layer12_roi.target_agencies.map((ag) => (
            <span
              key={ag}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-on-surface font-medium"
            >
              {ag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};
