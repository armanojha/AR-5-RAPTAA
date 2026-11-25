import React, { useMemo, useState } from 'react';
import { useDrishtiData } from '../data/DrishtiContext';

type ViewMode = 'sidebyside' | 'splitslider' | 'diffmask' | 'ndvi';
type ZoomScale = '100%' | '200%' | '400%';

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

  if (loading || !data) {
    return <div className="p-space-xl text-on-surface-variant">Loading EO Evidence Lab...</div>;
  }

  const scaleCss = scale === '100%' ? 'scale-100' : scale === '200%' ? 'scale-150' : 'scale-[2]';
  const imgAUrl =
    viewMode === 'ndvi' ? passA?.falsecolor_url ?? passA?.rgb_url : passA?.rgb_url ?? '';
  const imgBUrl =
    viewMode === 'ndvi' ? passB?.falsecolor_url ?? passB?.rgb_url : passB?.rgb_url ?? '';

  const corridorSegments = data.segments.filter((s) => s.project_id === activeCorridor);
  const stalledSegs = corridorSegments.filter((s) => s.analysis_status === 'stalled_or_high_divergence');

  return (
    <div className="space-y-space-lg">
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
                {p.project_id} ({p.project_name})
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
            <line
              x1="60"
              y1="230"
              x2="540"
              y2="70"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
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
