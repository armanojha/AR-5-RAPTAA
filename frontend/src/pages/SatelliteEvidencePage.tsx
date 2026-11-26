import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { alertProjectId, SegmentRecord } from '../data/DrishtiContext';
import { useDrishtiData } from '../data/DrishtiContext';

type ViewMode = 'sidebyside' | 'splitslider' | 'diffmask' | 'ndvi';
type ZoomScale = '100%' | '200%' | '400%';

const segmentCoordinates = (segment: SegmentRecord): number[][] => {
  const collect = (value: unknown): number[][] => {
    if (!Array.isArray(value)) return [];
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') return [value as number[]];
    return value.flatMap(collect);
  };
  return collect(segment.geometry?.coordinates);
};

export const SatelliteEvidencePage: React.FC = () => {
  const { data, loading, selectedProjectId, setSelectedProjectId } = useDrishtiData();
  const [viewMode, setViewMode] = useState<ViewMode>('splitslider');
  const [scale, setScale] = useState<ZoomScale>('100%');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [maskOpacity, setMaskOpacity] = useState<number>(65);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showUtmGrid, setShowUtmGrid] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [epochAIdx, setEpochAIdx] = useState<number>(0);
  const [epochBIdx, setEpochBIdx] = useState<number>(99);

  const realProjects = useMemo(
    () => (data?.projects ?? []).filter((p) => !p.is_synthetic),
    [data]
  );

  const activeCorridor =
    selectedProjectId !== 'ALL' && realProjects.some((p) => p.project_id === selectedProjectId)
      ? selectedProjectId
      : realProjects[0]?.project_id ?? 'NHAI-NH544G-PKG1';

  const epochs = data?.chips_by_project[activeCorridor] ?? [];
  const safeAIdx = Math.min(epochAIdx, Math.max(0, epochs.length - 1));
  const safeBIdx = Math.min(epochBIdx, Math.max(0, epochs.length - 1));
  const passA = epochs[safeAIdx];
  const passB = epochs[safeBIdx];
  const activeProject = data?.projects.find((project) => project.project_id === activeCorridor);
  const corridorSegments = useMemo(
    () => (data?.segments ?? []).filter((segment) => segment.project_id === activeCorridor),
    [activeCorridor, data]
  );
  const corridorAlerts = useMemo(
    () => (data?.alerts ?? []).filter((alert) => alertProjectId(alert) === activeCorridor),
    [activeCorridor, data]
  );
  const selectedAlert = [...corridorAlerts].sort(
    (a, b) => (b.risk.risk_score ?? b.risk.delay_risk_score ?? 0) - (a.risk.risk_score ?? a.risk.delay_risk_score ?? 0)
  )[0];
  const vectorPaths = useMemo(() => {
    const points = corridorSegments.flatMap(segmentCoordinates);
    if (!points.length) return [];
    const minLon = Math.min(...points.map((point) => point[0]));
    const maxLon = Math.max(...points.map((point) => point[0]));
    const minLat = Math.min(...points.map((point) => point[1]));
    const maxLat = Math.max(...points.map((point) => point[1]));
    const lonSpan = Math.max(0.001, maxLon - minLon);
    const latSpan = Math.max(0.001, maxLat - minLat);
    return corridorSegments.map((segment) => ({
      segment,
      points: segmentCoordinates(segment).map(([lon, lat]) => `${(35 + ((lon - minLon) / lonSpan) * 530).toFixed(1)},${(275 - ((lat - minLat) / latSpan) * 250).toFixed(1)}`).join(' '),
    }));
  }, [corridorSegments]);

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading EO Evidence Lab...</div>;
  }

  const scaleCss = scale === '100%' ? 'scale-100' : scale === '200%' ? 'scale-150' : 'scale-[2]';
  const imgAUrl =
    viewMode === 'ndvi' ? passA?.falsecolor_url ?? passA?.rgb_url : passA?.rgb_url ?? '';
  const imgBUrl =
    viewMode === 'ndvi' ? passB?.falsecolor_url ?? passB?.rgb_url : passB?.rgb_url ?? '';

  const stalledSegs = corridorSegments.filter((s) => s.alert_triggered || ['stall_candidate', 'slowing', 'stalled_or_high_divergence'].includes(s.analysis_status));
  const segmentIds = new Set(corridorSegments.map((segment) => segment.segment_id));
  const corridorScenes = data.scenes.filter((scene) => {
    const covered = scene.covered_segment_ids;
    return Array.isArray(covered) && covered.some((segmentId) => segmentIds.has(String(segmentId)));
  });
  const opticalScenes = corridorScenes.filter((scene) => String(scene.sensor_kind) === 'optical');
  const sarScenes = corridorScenes.filter((scene) => String(scene.sensor_kind) === 'sar');
  const cloudValues = opticalScenes.map((scene) => Number(scene.cloud_cover_pct)).filter(Number.isFinite);
  const averageCloud = cloudValues.length ? cloudValues.reduce((sum, value) => sum + value, 0) / cloudValues.length : 0;
  const riskScore = selectedAlert?.risk.risk_score ?? selectedAlert?.risk.delay_risk_score ?? 0;
  const signalComponents = selectedAlert?.activity.components?.slice().sort((a, b) => b.contribution - a.contribution).slice(0, 4) ?? [];

  return (
    <div className="space-y-space-lg">
      <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              Drishti EO Suite / Orbital Verification / <span className="font-mono">{activeCorridor}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface">
                {activeProject?.project_name ?? activeProject?.name ?? activeCorridor}
              </h1>
              <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold ${selectedAlert ? 'bg-error-container text-error' : 'bg-tertiary-fixed/40 text-tertiary'}`}>
                {selectedAlert ? `${selectedAlert.severity} verification priority` : 'No active alert'}
              </span>
            </div>
            <p className="mt-1 text-xs text-on-surface-variant">
              {activeProject?.ministry ?? activeProject?.agency ?? 'Public infrastructure corridor'} · {corridorSegments.length} OSM segments · {epochs.length} visual epochs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAlert?.manifest_url && <a href={selectedAlert.manifest_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-surface-container-low text-xs font-medium"><span className="material-symbols-outlined text-[15px] align-middle mr-1">data_object</span>Evidence manifest</a>}
            <Link to="/reports" className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold"><span className="material-symbols-outlined text-[15px] align-middle mr-1">picture_as_pdf</span>Certified reports</Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-wider text-on-surface-variant border-t border-outline-variant/20 pt-3">
          <span>Acquisition pair: <strong className="font-mono text-on-surface">{passA?.date ?? '—'} → {passB?.date ?? '—'}</strong></span>
          <span>EO stack: <strong className="text-on-surface">Sentinel-2 MSI + Sentinel-1 RTC</strong></span>
          <span>Resolution: <strong className="text-on-surface">10 m optical</strong></span>
          <span>Classification: <strong className="text-on-surface">{activeProject?.data_classification ?? 'real'}</strong></span>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-surface-container-low p-1 text-[10px]">
          <span className="px-3 py-1.5 rounded bg-surface-container-lowest text-primary font-semibold">1. Satellite Evidence</span>
          <Link to="/milestones" className="px-3 py-1.5 rounded text-on-surface-variant hover:text-on-surface">2. Milestone Verification</Link>
          <Link to="/financials" className="px-3 py-1.5 rounded text-on-surface-variant hover:text-on-surface">3. Financial Analysis</Link>
          <Link to="/reports" className="px-3 py-1.5 rounded text-on-surface-variant hover:text-on-surface">4. Evidence Dossier</Link>
        </div>
      </section>

      {/* Control Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Select Corridor"
            value={activeCorridor}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setEpochAIdx(0);
              setEpochBIdx(99);
            }}
            className="px-3 py-1.5 rounded border border-outline-variant/40 bg-surface-container-low text-xs font-mono font-semibold text-on-surface"
          >
            {realProjects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_id} ({p.project_name ?? p.name ?? p.project_id})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded border border-outline-variant/30">
            {(
              [
                ['sidebyside', 'Side-by-Side'],
                ['splitslider', 'Swipe'],
                ['diffmask', 'Diff Mask'],
                ['ndvi', 'False Color (NIR)'],
              ] as [ViewMode, string][]
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  viewMode === mode
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            {(['100%', '200%', '400%'] as ZoomScale[]).map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setScale(z)}
                className={`px-2 py-1 rounded font-mono ${
                  scale === z ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="accent-primary"
            />
            <span>OSM Vector</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showUtmGrid}
              onChange={(e) => setShowUtmGrid(e.target.checked)}
              className="accent-primary"
            />
            <span>UTM Grid</span>
          </label>
        </div>
      </div>

      {/* Epoch Selectors + Opacity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-md text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant">Pass A (Before):</span>
          <select
            value={safeAIdx}
            onChange={(e) => setEpochAIdx(Number(e.target.value))}
            className="flex-1 px-2 py-1 rounded border border-outline-variant/40 bg-surface-container-low font-mono"
          >
            {epochs.map((ep, idx) => (
              <option key={ep.date} value={idx}>
                {ep.date}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant">Pass B (After):</span>
          <select
            value={safeBIdx}
            onChange={(e) => setEpochBIdx(Number(e.target.value))}
            className="flex-1 px-2 py-1 rounded border border-outline-variant/40 bg-surface-container-low font-mono"
          >
            {epochs.map((ep, idx) => (
              <option key={ep.date} value={idx}>
                {ep.date}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-on-surface-variant whitespace-nowrap">
            Mask Opacity ({maskOpacity}%):
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={maskOpacity}
            onChange={(e) => setMaskOpacity(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>
      </div>

      {/* Main EO Viewport */}
      <div
        className="relative bg-[#07131f] border border-outline-variant/30 rounded-xl overflow-hidden shadow-md min-h-[420px]"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCursorCoords({
            x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
            y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
          });
        }}
      >
        {viewMode === 'sidebyside' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-black min-h-[420px]">
            <div className="relative overflow-hidden flex items-center justify-center">
              <img src={imgAUrl} alt={`Pass A ${passA?.date}`} className={`w-full h-[420px] object-contain transition-transform ${scaleCss}`} />
              <span className="absolute top-3 left-3 px-2 py-1 rounded bg-black/75 text-white font-mono text-xs">
                PASS A · {passA?.date} (Sentinel-2 L2A)
              </span>
            </div>
            <div className="relative overflow-hidden flex items-center justify-center">
              <img src={imgBUrl} alt={`Pass B ${passB?.date}`} className={`w-full h-[420px] object-contain transition-transform ${scaleCss}`} />
              <span className="absolute top-3 left-3 px-2 py-1 rounded bg-primary/90 text-white font-mono text-xs">
                PASS B · {passB?.date} (Sentinel-2 L2A)
              </span>
            </div>
          </div>
        ) : (
          <div className="relative h-[420px] overflow-hidden flex items-center justify-center">
            <img
              src={imgAUrl}
              alt={`Baseline ${passA?.date}`}
              className={`w-full h-full object-contain transition-transform ${scaleCss}`}
            />
            {viewMode === 'splitslider' && (
              <>
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={imgBUrl}
                    alt={`Latest ${passB?.date}`}
                    className={`w-full h-full object-contain transition-transform ${scaleCss}`}
                  />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  aria-label="Before/After Swipe Slider"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </>
            )}

            {viewMode === 'diffmask' && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                  opacity: maskOpacity / 100,
                  background:
                    'radial-gradient(circle at 48% 52%, rgba(239,68,68,0.55), transparent 55%), radial-gradient(circle at 65% 40%, rgba(16,185,129,0.4), transparent 45%)',
                }}
              />
            )}
          </div>
        )}

        {/* UTM Grid Overlay */}
        {showUtmGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        )}

        {/* Vector Centerline Overlay */}
        {showVectors && (
          <svg viewBox="0 0 600 300" className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {vectorPaths.map(({ segment, points }) => (
              <polyline
                key={segment.segment_id}
                points={points}
                fill="none"
                stroke={segment.alert_triggered ? '#ef4444' : segment.is_assessable ? '#38bdf8' : '#94a3b8'}
                strokeWidth={segment.alert_triggered ? 4 : 2.5}
                strokeDasharray={segment.is_assessable ? '6 3' : '3 4'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        )}

        <div className="absolute bottom-3 left-3 z-20 bg-black/80 text-white px-3 py-1.5 rounded font-mono text-[11px] flex flex-wrap gap-3">
          <span>CORRIDOR: {activeCorridor}</span>
          <span>EPOCH A: {passA?.date ?? 'N/A'}</span>
          <span>EPOCH B: {passB?.date ?? 'N/A'}</span>
          <span>
            CURSOR: {cursorCoords.x}%, {cursorCoords.y}%
          </span>
          <span>STALLED SEGS: {stalledSegs.length}/{corridorSegments.length}</span>
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        <div className="xl:col-span-5 space-y-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-base font-bold"><span className="material-symbols-outlined text-[18px] text-primary align-middle mr-2">biotech</span>Sensor &amp; Model Telemetry</h2>
              <span className="px-2 py-1 rounded bg-primary-fixed text-primary font-mono text-[10px]">{selectedAlert?.activity.model_version ?? 'SAI-V1'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded bg-surface-container-low"><span className="block text-[9px] uppercase text-outline">Optical scenes</span><strong className="text-xl font-mono">{opticalScenes.length}</strong><span className="block text-[9px] text-on-surface-variant">Sentinel-2 L2A</span></div>
              <div className="p-3 rounded bg-surface-container-low"><span className="block text-[9px] uppercase text-outline">SAR scenes</span><strong className="text-xl font-mono text-primary">{sarScenes.length}</strong><span className="block text-[9px] text-on-surface-variant">Sentinel-1 RTC</span></div>
              <div className="p-3 rounded bg-surface-container-low"><span className="block text-[9px] uppercase text-outline">Mean cloud cover</span><strong className="text-xl font-mono">{averageCloud.toFixed(2)}%</strong><span className="block text-[9px] text-on-surface-variant">Accepted optical scenes</span></div>
              <div className="p-3 rounded bg-surface-container-low"><span className="block text-[9px] uppercase text-outline">Risk score</span><strong className="text-xl font-mono text-error">{(riskScore * 100).toFixed(1)}%</strong><span className="block text-[9px] text-on-surface-variant">Verification ranking</span></div>
            </div>
            <div className="space-y-2">
              {signalComponents.map((component) => (
                <div key={component.name}>
                  <div className="flex justify-between text-[10px]"><span>{component.name.replace(/_/g, ' ')}</span><strong className="font-mono">{(component.normalized_value * 100).toFixed(1)}%</strong></div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface-container overflow-hidden"><div className="h-full rounded-full bg-primary" style={{width:`${Math.min(100, component.normalized_value * 100)}%`}} /></div>
                </div>
              ))}
              {signalComponents.length === 0 && <p className="text-xs text-outline">No alert component breakdown for the selected corridor.</p>}
            </div>
          </div>
          <div className="bg-error-container/25 border-l-4 border-error rounded-xl p-space-lg shadow-sm">
            <div className="flex justify-between gap-2 text-[10px] uppercase font-bold text-error"><span>Independent verification trigger</span><span className="font-mono">{selectedAlert ? `ALT ${selectedAlert.alert_id}` : 'No trigger'}</span></div>
            <p className="mt-2 text-xs leading-relaxed text-on-surface">
              {selectedAlert?.responsible_use ?? 'No automatic enforcement action. Review corridor evidence before field dispatch.'}
            </p>
          </div>
        </div>

        <div className="xl:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div><h2 className="text-base font-bold"><span className="material-symbols-outlined text-[18px] text-primary align-middle mr-2">psychology</span>Explainable Evidence Findings</h2><p className="text-[9px] uppercase tracking-wider text-outline">Multi-temporal EO reconciliation · verify-first workflow</p></div>
            <span className="px-2 py-1 rounded bg-primary-fixed text-primary font-mono text-[9px]">SHA-256 AUDITABLE</span>
          </div>
          {[
            ['1','What changed?', selectedAlert ? `Satellite Activity Index is ${selectedAlert.activity.activity_index?.toFixed(1) ?? 'not assessable'} with state “${selectedAlert.analysis.state ?? selectedAlert.analysis.status ?? 'review'}”. The signal is derived from optical, SAR and linear-continuity components.` : 'No alert-triggered change is present for this corridor.'],
            ['2','Where did it change?', selectedAlert ? `${selectedAlert.segment_id}${selectedAlert.segment?.km_start !== undefined ? ` · km ${selectedAlert.segment.km_start.toFixed(1)}–${selectedAlert.segment.km_end?.toFixed(1)}` : ''}. The location is tied to the OSM segment geometry and evidence manifest.` : `${corridorSegments.length} OSM corridor segments are monitored.`],
            ['3','When was it observed?', selectedAlert ? `${selectedAlert.observed_at.slice(0,10)}. The current comparison spans ${passA?.date ?? 'the baseline'} to ${passB?.date ?? 'the latest epoch'}.` : `Comparison spans ${passA?.date ?? 'baseline'} to ${passB?.date ?? 'latest epoch'}.`],
            ['4','Why was it flagged?', selectedAlert?.analysis.reasons?.join('; ') ?? (selectedAlert ? `Risk score ${(riskScore * 100).toFixed(1)}%, activity/reporting divergence ${selectedAlert.analysis.activity_reporting_divergence.toFixed(3)}, confidence ${((selectedAlert.activity.confidence ?? 0) * 100).toFixed(0)}%.` : 'No alert threshold was crossed.')],
            ['5','What needs verification?', selectedAlert?.recommended_action ?? 'Continue scheduled satellite monitoring and retain evidence provenance.'],
          ].map(([number,title,body], index) => (
            <div key={number} className={`p-3 rounded-lg ${index === 3 && selectedAlert ? 'bg-error-container/25 border-l-2 border-error' : 'bg-surface-container-low'}`}>
              <div className="flex gap-3"><span className={`w-5 h-5 shrink-0 rounded text-white text-[10px] font-bold flex items-center justify-center ${index === 3 && selectedAlert ? 'bg-error' : 'bg-primary'}`}>{number}</span><div><div className="text-[10px] uppercase tracking-wider font-bold text-primary">{title}</div><p className="mt-1 text-xs leading-relaxed text-on-surface">{body}</p></div></div>
            </div>
          ))}
        </div>
      </section>

      {/* Real Track C Pixel-Level Chips */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-lg shadow-sm space-y-space-md">
        <div>
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            Track C Pixel-Level Evidence Chips (OSM Polygon Rasterized)
          </h2>
          <p className="text-xs text-on-surface-variant">
            Real Sentinel-2 10m detections masked by ESA WorldCover baseline settlements
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {data.track_c_events.map((ev) => (
            <div
              key={ev.event_id}
              className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low/40"
            >
              {ev.chip_url && (
                <img
                  src={ev.chip_url}
                  alt={ev.event_id}
                  className="w-full h-56 object-contain bg-[#0b1320]"
                />
              )}
              <div className="p-space-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">{ev.event_id}</span>
                  <span className="text-xs font-semibold text-error">
                    {ev.affected_area_m2.toLocaleString()} m² ({ev.detected_pixels} px)
                  </span>
                </div>
                <p className="text-xs font-medium text-on-surface">{ev.target_infrastructure}</p>
                <p className="text-[11px] text-on-surface-variant">{ev.evidence_description}</p>
                <p className="text-[10px] font-mono text-outline truncate">SHA-256: {ev.audit_hash}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
