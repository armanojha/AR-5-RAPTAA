import React from 'react';
import { Link } from 'react-router-dom';

type ViewMode = 'sidebyside' | 'splitslider' | 'diffmask' | 'ndvi';
type ScaleMode = '100%' | '200%' | '400%';

const PASS_A_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDAW9dMpnkpkQjvfd41Bn2_71SXRip7d-zyMHhItXlH1XfeZ5jS_Z68_dzswbwSl0nHWyxYByM9nKlS-wwzb012gJokVmXQd7gh05pSChxqwUvNP0jFF8I4_Qo-qmGAyMCAmGNsgDiZf_KOXGuReucu5bZ1H-TkXyWVzYzZpGrMy6az4-wwSaN-yC5LAbJYxmV0vVNDNjlSv7O5gvyZXfBHn3RIq7Z9mbs0iQ1JSIx';

const PASS_B_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAa4KsAO7Rq5y18pOtpYUMLbqJZOPGCpmW_EBiT92Tivze-X_MXw9Tl6ztNHOnkVpHtnKJmDW22JymppFdogV04f6R5GHtkE1bjTsW6XkYpLt-lHl4gs71DyXlpAJ1BXAXIoABD3upRQ_plE0_hru2DdJuFF2CcpGrVe4spEp_9NZl7nP2XMNpGgKWmFHAK9JXvkEm50T5BHSHjlzwcvU8REiUoMB9YVVEpqTHttfeN';

export const SatelliteEvidencePage: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [sliderPct, setSliderPct] = React.useState(52);
  const [isDragging, setIsDragging] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('splitslider');
  const [scale, setScale] = React.useState<ScaleMode>('200%');
  const [maskOpacity, setMaskOpacity] = React.useState(85);
  const [showVectors, setShowVectors] = React.useState(true);
  const [showUtmGrid, setShowUtmGrid] = React.useState(true);
  const [coords, setCoords] = React.useState('E: 342,881.24  N: 2,341,920.10');

  const updateSliderPosition = React.useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    if (pct < 2) pct = 2;
    if (pct > 98) pct = 98;
    setSliderPct(pct);
  }, []);

  React.useEffect(() => {
    const onMouseUp = () => setIsDragging(false);
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) updateSliderPosition(e.clientX);
    };
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isDragging, updateSliderPosition]);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    const baseEast = 342100 + normX * 820;
    const baseNorth = 2341900 + (1 - normY) * 940;
    setCoords(`E: ${baseEast.toFixed(2)}  N: ${baseNorth.toFixed(2)}`);
  };

  const effectiveClipPct = viewMode === 'sidebyside' ? 50 : viewMode === 'diffmask' ? 0 : sliderPct;

  return (
    <div className="p-space-md sm:p-space-lg w-full max-w-[1920px] mx-auto">
      <div className="flex flex-col w-full">
        {/* Sub-Header & Geospatial Breadcrumb Ribbon */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-lg flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                <span className="text-primary font-semibold">CIVITRACE EO-SUITE</span>
                <span className="text-outline-variant">/</span>
                <span>ORBITAL VERIFICATION</span>
                <span className="text-outline-variant">/</span>
                <span className="font-code-md text-code-md text-on-surface font-semibold">
                  NHAI-EXP-DME-04B
                </span>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  Delhi-Mumbai Expressway{' '}
                  <span className="font-normal text-on-surface-variant text-body-lg">
                    (Pkg 4B: Vadodara-Surat Section, Ch. 172+000 to Ch. 204+000)
                  </span>
                </h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-md text-label-md font-semibold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  CRITICAL DISCREPANCY DETECTED (-26.7% Variance)
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                type="button"
                className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md px-3 py-1.5 rounded transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">download</span>
                <span>Geotiff Export</span>
              </button>
              <Link
                to="/reports"
                className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md px-3 py-1.5 rounded transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                <span>Certified Forensic Report (PDF)</span>
              </Link>
            </div>
          </div>

          {/* Metadata Attributes Bar & Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
            <div className="flex flex-wrap items-center gap-x-space-lg gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase mr-1.5">Sector:</span>
                <span className="text-on-surface font-medium">National Expressway Corridors</span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase mr-1.5">Agency:</span>
                <span className="text-on-surface font-medium">NHAI / EPC Contractor: Patel-KNR JV</span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase mr-1.5">
                  Acquisition Pair:
                </span>
                <span className="font-code-md text-code-md text-primary font-medium">
                  12 Mar 2024 (Pass A) vs 14 Oct 2024 (Pass B)
                </span>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase mr-1.5">Cadence:</span>
                <span className="text-on-surface font-medium">216 Days Δ</span>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-1 bg-surface-container-low p-1 rounded-lg">
              <Link
                className="px-3 py-1 rounded bg-surface-container-lowest text-primary font-headline-sm text-body-sm shadow-sm flex items-center gap-1"
                to="/evidence"
              >
                <span className="material-symbols-outlined text-[15px]">satellite_alt</span>
                <span>1. Satellite Evidence</span>
              </Link>
              <Link
                className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1"
                to="/milestones"
              >
                <span className="material-symbols-outlined text-[15px]">fact_check</span>
                <span>2. Milestone Verification</span>
              </Link>
              <Link
                className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1"
                to="/financials"
              >
                <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
                <span>3. Financial Analysis</span>
              </Link>
              <Link
                className="px-3 py-1 rounded text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors flex items-center gap-1"
                to="/reports"
              >
                <span className="material-symbols-outlined text-[15px]">folder_open</span>
                <span>4. Project Dossier</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* CENTERPIECE: Interactive Dual-Pass Satellite Workspace */}
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col mb-space-lg">
          {/* Viewport Header Toolbar */}
          <div className="px-space-lg py-2.5 bg-surface-container flex flex-wrap items-center justify-between gap-space-md select-none">
            <div className="flex items-center gap-space-md flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container shrink-0" />
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-tight">
                  PASS A [BASELINE]:
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Sentinel-2A • 12 Mar 2024 • 10:42 UTC • Sun 56° • Cloud: 0.1%
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-surface-container-lowest p-1 rounded shadow-sm">
              {(
                [
                  ['sidebyside', 'Side-by-Side'],
                  ['splitslider', 'Split-Slider Overlay'],
                  ['diffmask', 'Difference Mask'],
                  ['ndvi', 'NIR/NDVI'],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={
                    viewMode === mode
                      ? 'px-2.5 py-1 rounded bg-primary text-on-primary font-label-md text-label-md font-semibold transition-colors'
                      : 'px-2.5 py-1 rounded font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors'
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-space-md justify-end flex-1 min-w-[260px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container shrink-0" />
                <span className="font-label-md text-label-md text-on-surface font-semibold tracking-tight">
                  PASS B [ORBIT]:
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Cartosat-3 • 14 Oct 2024 • 05:18 UTC • Sun 48° • Cloud: 0.0%
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Tool Ribbon */}
          <div className="px-space-lg py-2 bg-surface-container-low flex flex-wrap items-center justify-between gap-2 text-body-sm">
            <div className="flex flex-wrap items-center gap-space-lg">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm uppercase text-outline">Scale:</span>
                <div className="inline-flex rounded shadow-sm">
                  {(['100%', '200%', '400%'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={
                        scale === s
                          ? 'px-2 py-0.5 bg-primary text-on-primary font-label-sm text-label-sm font-semibold'
                          : 'px-2 py-0.5 bg-surface-container-lowest font-label-sm text-label-sm text-on-surface hover:bg-surface-container'
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm uppercase text-outline">
                  Change Mask Opacity:
                </span>
                <input
                  className="w-24 h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                  max={100}
                  min={0}
                  type="range"
                  value={maskOpacity}
                  onChange={(e) => setMaskOpacity(Number(e.target.value))}
                />
                <span className="font-code-md text-code-md text-on-surface-variant">{maskOpacity}%</span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  checked={showVectors}
                  onChange={(e) => setShowVectors(e.target.checked)}
                  className="rounded w-3.5 h-3.5 text-primary accent-primary"
                  type="checkbox"
                />
                <span className="font-label-md text-label-md text-on-surface font-medium">
                  Vector Boundary Overlay
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  checked={showUtmGrid}
                  onChange={(e) => setShowUtmGrid(e.target.checked)}
                  className="rounded w-3.5 h-3.5 text-primary accent-primary"
                  type="checkbox"
                />
                <span className="font-label-md text-label-md text-on-surface font-medium">UTM 43N Grid</span>
              </label>
            </div>

            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-1.5 bg-surface-container-lowest px-2 py-0.5 rounded font-code-md text-code-md text-on-surface">
                <span className="material-symbols-outlined text-[14px] text-outline">pin_drop</span>
                <span>21°44'18.4&quot;N 73°02'34.9&quot;E</span>
              </div>
              <div className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>GSD: 0.5m/px</span>
              </div>
            </div>
          </div>

          {/* THE DUAL-PASS INTERACTIVE CANVAS VIEWPORT */}
          <div
            ref={containerRef}
            onMouseMove={handleContainerMouseMove}
            className="relative w-full h-[460px] sm:h-[580px] bg-inverse-surface overflow-hidden select-none cursor-crosshair"
          >
            {/* LAYER 1: BASELINE (PASS A: March 2024) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${PASS_A_URL}')`,
                filter: viewMode === 'ndvi' ? 'hue-rotate(120deg) saturate(1.6)' : undefined,
              }}
            >
              <div className="absolute top-4 left-4 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded shadow text-inverse-on-surface font-label-sm text-label-sm flex flex-col gap-0.5 pointer-events-none">
                <span className="font-semibold text-primary-fixed">PASS A • 12 MAR 2024</span>
                <span className="text-outline-variant font-code-md text-code-md">
                  RAW EARTH CUT / ZERO PAVEMENT
                </span>
              </div>
              <div className="absolute top-1/4 left-1/4 px-2 py-0.5 rounded bg-inverse-surface/75 text-inverse-on-surface font-code-md text-[10px] pointer-events-none">
                Ch. 174+000 (Subgrade Cleared)
              </div>
            </div>

            {/* LAYER 2: CURRENT (PASS B: October 2024) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `polygon(${effectiveClipPct}% 0%, 100% 0%, 100% 100%, ${effectiveClipPct}% 100%)`,
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${PASS_B_URL}')`,
                  filter: viewMode === 'ndvi' ? 'hue-rotate(90deg) contrast(1.15)' : undefined,
                }}
              >
                <div className="absolute top-4 right-4 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded shadow text-inverse-on-surface font-label-sm text-label-sm flex flex-col items-end gap-0.5 pointer-events-none">
                  <span className="font-semibold text-tertiary-fixed">PASS B • 14 OCT 2024</span>
                  <span className="text-outline-variant font-code-md text-code-md">
                    RECENT ORBIT / HIGH ACCURACY
                  </span>
                </div>

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ opacity: maskOpacity / 100 }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      height="8"
                      id="diagonalRedHatch"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                      width="8"
                    >
                      <line stroke="#ba1a1a" strokeWidth="2.5" x1="0" x2="0" y1="0" y2="8" />
                    </pattern>
                  </defs>
                  {showVectors && (
                    <>
                      <polygon
                        fill="#006765"
                        fillOpacity="0.38"
                        points="530,120 740,110 745,210 535,225"
                        stroke="#75d6d3"
                        strokeDasharray="4,2"
                        strokeWidth="2"
                      />
                      <polygon
                        fill="#006099"
                        fillOpacity="0.32"
                        points="760,110 990,95 1010,230 770,225"
                        stroke="#98cbff"
                        strokeWidth="2"
                      />
                      <polygon
                        fill="#f59e0b"
                        fillOpacity="0.30"
                        points="620,290 730,285 710,360 600,350"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                      <polygon
                        fill="url(#diagonalRedHatch)"
                        fillOpacity="0.45"
                        points="840,320 1060,310 1070,440 850,455"
                        stroke="#ba1a1a"
                        strokeWidth="2.5"
                      />
                    </>
                  )}
                  {showUtmGrid && (
                    <>
                      <line
                        stroke="#cfe5ff"
                        strokeDasharray="2,4"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        x1="200"
                        x2="200"
                        y1="0"
                        y2="580"
                      />
                      <line
                        stroke="#cfe5ff"
                        strokeDasharray="2,4"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        x1="600"
                        x2="600"
                        y1="0"
                        y2="580"
                      />
                      <line
                        stroke="#cfe5ff"
                        strokeDasharray="2,4"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        x1="1000"
                        x2="1000"
                        y1="0"
                        y2="580"
                      />
                      <line
                        stroke="#cfe5ff"
                        strokeDasharray="2,4"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        x1="1400"
                        x2="1400"
                        y1="0"
                        y2="580"
                      />
                      <line
                        stroke="#cfe5ff"
                        strokeDasharray="2,4"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        x1="0"
                        x2="1920"
                        y1="200"
                        y2="200"
                      />
                      <line
                        stroke="#cfe5ff"
                        strokeDasharray="2,4"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        x1="0"
                        x2="1920"
                        y1="400"
                        y2="400"
                      />
                    </>
                  )}
                </svg>

                <div className="hidden md:flex absolute top-[140px] left-[560px] bg-tertiary text-on-tertiary px-2 py-1 rounded shadow-lg font-code-md text-[11px] items-center gap-1 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
                  <span>Bituminous Layer Complete (+4.5km)</span>
                </div>
                <div className="hidden md:flex absolute top-[140px] left-[810px] bg-primary text-on-primary px-2 py-1 rounded shadow-lg font-code-md text-[11px] items-center gap-1 pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
                  <span>Positive Earthwork (+12.4 ha)</span>
                </div>
                <div className="hidden md:flex absolute top-[340px] left-[870px] bg-error text-on-error px-2 py-1 rounded shadow-lg font-code-md text-[11px] items-center gap-1 pointer-events-auto animate-bounce cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">emergency</span>
                  <span>FLAGGED: Km 191 Pier Abutment (No Superstructure)</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE SLIDER DIVIDER */}
            {viewMode !== 'diffmask' && (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onTouchMove={(e) => {
                  if (e.touches[0]) updateSliderPosition(e.touches[0].clientX);
                }}
                className="absolute top-0 bottom-0 z-30 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${effectiveClipPct}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-[2px] h-full bg-surface-container-lowest shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
                <div className="absolute w-8 h-8 rounded-full bg-surface-container-lowest text-primary shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                </div>
                <div className="absolute -top-1 px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-sm text-[9px] tracking-wider uppercase font-semibold">
                  SLIDER
                </div>
              </div>
            )}

            {/* Scale Bar, North Arrow, GIS HUD */}
            <div className="absolute bottom-4 left-4 z-20 flex items-end gap-space-lg pointer-events-none">
              <div className="bg-inverse-surface/85 backdrop-blur px-3 py-2 rounded text-inverse-on-surface flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4 font-label-sm text-label-sm">
                  <span>200 METERS</span>
                  <span className="font-code-md text-[9px] text-outline-variant">UTM ZONE 43N</span>
                </div>
                <div className="w-36 h-1.5 bg-inverse-surface border border-inverse-on-surface/40 flex">
                  <div className="w-1/2 h-full bg-inverse-on-surface" />
                  <div className="w-1/2 h-full bg-transparent" />
                </div>
                <div className="flex justify-between text-[9px] font-code-md text-outline-variant">
                  <span>0m</span>
                  <span>100m</span>
                  <span>200m</span>
                </div>
              </div>
              <div className="bg-inverse-surface/85 backdrop-blur w-9 h-9 rounded flex items-center justify-center text-inverse-on-surface">
                <div className="flex flex-col items-center">
                  <span className="font-label-sm text-[9px] font-bold text-error leading-none">N</span>
                  <span className="material-symbols-outlined text-[16px] leading-none">navigation</span>
                </div>
              </div>
            </div>

            {/* Real-Time Cursor Coordinates HUD */}
            <div className="hidden sm:flex absolute bottom-4 right-4 z-20 bg-inverse-surface/85 backdrop-blur px-3 py-1.5 rounded text-inverse-on-surface font-code-md text-[11px] items-center gap-3 pointer-events-none">
              <span className="flex items-center gap-1 text-tertiary-fixed">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
                Δ Spectral Change: ACTIVE
              </span>
              <span className="text-outline-variant">|</span>
              <span>{coords}</span>
            </div>
          </div>

          {/* Visual Legend Bar */}
          <div className="px-space-lg py-space-md bg-surface-container-lowest border-t border-outline-variant/10 flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-wrap items-center gap-space-lg">
              <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">
                Change Vector Legend:
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-primary" />
                <span className="font-label-md text-label-md text-on-surface">
                  Subgrade/Earthwork Verified
                </span>
                <span className="font-code-md text-code-md text-primary font-semibold">(+12.4 ha)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-tertiary" />
                <span className="font-label-md text-label-md text-on-surface">Bituminous Paving Complete</span>
                <span className="font-code-md text-code-md text-tertiary font-semibold">(+4.2 km)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500" />
                <span className="font-label-md text-label-md text-on-surface">
                  Unclassified Regrowth / Rework
                </span>
                <span className="font-code-md text-code-md text-amber-700 font-semibold">(1.8 ha)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded border border-error bg-error/30 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-error rounded-full" />
                </span>
                <span className="font-label-md text-label-md text-error font-semibold">
                  Critical Inactivity (Km 191)
                </span>
                <span className="font-code-md text-code-md text-error">(210 Days Stagnant)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-surface-container-high" />
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Unchanged Right-of-Way
                </span>
                <span className="font-code-md text-code-md text-on-surface-variant">(18.6 ha)</span>
              </div>
            </div>
            <button
              type="button"
              className="font-label-md text-label-md text-primary hover:text-primary-container font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">layers</span>
              <span>Configure AI Mask Threshold</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SPLIT: Analytical Intelligence & Explainable AI Findings */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-2xl">
          {/* LEFT BOX (5 cols): Sensor & Model Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">biotech</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Sensor &amp; Model Telemetry
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container font-code-md text-code-md text-on-surface-variant">
                    EO-PIPELINE v4.2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-space-md mb-space-md">
                  <div className="p-space-md rounded bg-surface-container-low flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Neural Core Architecture
                    </span>
                    <span className="font-body-md text-body-md text-on-surface font-semibold mt-0.5">
                      Civitrace-GeoU-Net v4.2
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      ResNet-101 Spatial-Temporal
                    </span>
                  </div>
                  <div className="p-space-md rounded bg-surface-container-low flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Pixel Resolution (GSD)
                    </span>
                    <span className="font-display-lg text-[22px] leading-tight text-primary font-bold mt-0.5">
                      0.50 m/px
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      Cartosat-3 Panchromatic Fusion
                    </span>
                  </div>
                  <div className="p-space-md rounded bg-surface-container-low flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Corridor Monitored
                    </span>
                    <span className="font-display-lg text-[22px] leading-tight text-on-surface font-bold mt-0.5">
                      348.5 ha
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      Linear Ch. 172 to 204
                    </span>
                  </div>
                  <div className="p-space-md rounded bg-surface-container-low flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Surface Modified (Detected)
                    </span>
                    <span className="font-display-lg text-[22px] leading-tight text-tertiary font-bold mt-0.5">
                      48.2 ha
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      13.8% Total Corridor Area
                    </span>
                  </div>
                </div>

                <div className="space-y-space-md pt-space-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1 font-label-md text-label-md">
                      <span className="text-on-surface font-medium">Earthwork Extraction Confidence</span>
                      <span className="font-code-md text-code-md text-primary font-semibold">94.8%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '94.8%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1 font-label-md text-label-md">
                      <span className="text-on-surface font-medium">
                        Pavement Bitumen Classification Confidence
                      </span>
                      <span className="font-code-md text-code-md text-tertiary font-semibold">97.2%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-tertiary rounded-full" style={{ width: '97.2%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1 font-label-md text-label-md">
                      <span className="text-on-surface font-medium">
                        Atmospheric &amp; Cloud Shadow Masking
                      </span>
                      <span className="font-code-md text-code-md text-on-surface font-semibold">
                        0.0% (Clear Transparency)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full bg-tertiary-container rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-space-lg pt-space-md border-t border-outline-variant/15 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  <span className="font-label-sm text-label-sm text-on-surface font-medium">
                    Sentinel Hub &amp; Cartosat-3 Core Synchronized
                  </span>
                </div>
                <span className="font-code-md text-code-md text-outline">LATENCY: 184ms</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border-l-4 border-error flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-error uppercase font-bold tracking-wider">
                  Independent Audit Trigger
                </span>
                <span className="font-code-md text-code-md px-2 py-0.5 bg-error-container text-on-error-container rounded font-bold">
                  -26.7% NET VARIANCE
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                Contractor claims <strong>₹412.50 Cr</strong> in cumulative billings through Q3 for Section Ch.
                188-204 bituminous completion. Optical &amp; SAR telemetry reveals physical road base progress is
                currently restricted strictly to <strong>Ch. 174-178.5</strong>.
              </p>
            </div>
          </div>

          {/* RIGHT BOX (7 cols): EXPLAINABLE AI FINDINGS */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-space-sm mb-space-md border-b border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Explainable AI Findings (XAI Dossier)
                    </h2>
                    <span className="font-label-sm text-label-sm text-outline">
                      AEROSPACE-GRADE MULTI-TEMPORAL RECONCILIATION
                    </span>
                  </div>
                </div>
                <span className="bg-surface-container px-2 py-1 rounded font-code-md text-code-md text-primary font-semibold">
                  ISO-19115 GIS COMPLIANT
                </span>
              </div>

              <div className="flex flex-col gap-space-md">
                <div className="p-space-md rounded bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-primary text-on-primary font-code-md text-[10px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                      WHAT CHANGED?
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface pl-7 leading-relaxed">
                    Surface excavation and black asphalt application detected between{' '}
                    <strong>Ch. 174+000 and Ch. 178+500</strong> (4.5 km linear coverage). Multi-spectral reflectance
                    shows dense bituminous binder absorption at 2.2 µm. Heavy vehicle compaction tracks are
                    physically distinguishable in the sub-base layer.
                  </p>
                </div>

                <div className="p-space-md rounded bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-primary text-on-primary font-code-md text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                      WHERE DID IT CHANGE?
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface pl-7 leading-relaxed">
                    Confined strictly to Northern Package boundary (
                    <span className="font-code-md text-code-md text-on-surface-variant font-medium">
                      UTM 43N 342100E 2341900N
                    </span>
                    ). The Southern segment (<strong>Ch. 188 to 204</strong>) shows{' '}
                    <strong>zero road formation or compaction activity</strong> across the 216-day orbital interval.
                  </p>
                </div>

                <div className="p-space-md rounded bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-primary text-on-primary font-code-md text-[10px] flex items-center justify-center font-bold">
                      3
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                      WHEN DID IT CHANGE?
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface pl-7 leading-relaxed">
                    Changes occurred predominantly between <strong>15 April 2024 and 10 June 2024</strong>. The rate
                    of physical surface modification dropped sharply to <strong>&lt;0.02 ha/week</strong> post-monsoon
                    (August through October 2024), indicating severe site desynchronization.
                  </p>
                </div>

                <div className="p-space-md rounded bg-error-container/30 border-l-2 border-error hover:bg-error-container/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-error text-on-error font-code-md text-[10px] flex items-center justify-center font-bold">
                      4
                    </span>
                    <span className="font-label-md text-label-md text-error font-bold uppercase tracking-wider">
                      WHY WAS IT FLAGGED?
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface pl-7 leading-relaxed">
                    Official contractor IPC #14 claims <strong>68.2% total completion</strong>, specifically certifying
                    full flyover bridge structure at <strong>Km 191+200</strong>. Satellite optical and SAR backscatter
                    confirmation proves <strong>only 6 foundation piers exist</strong>; zero superstructure deck
                    girders, piers caps, or approach ramps are physically present.
                  </p>
                </div>

                <div className="p-space-md rounded bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-primary text-on-primary font-code-md text-[10px] flex items-center justify-center font-bold">
                      5
                    </span>
                    <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                      WHAT NEEDS VERIFICATION?
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface pl-7 leading-relaxed">
                    Immediate physical engineering audit required for the <strong>Km 191 Bridge Structure</strong>,
                    paired with cross-sectional LiDAR scanning of <strong>Ch. 188 to 204</strong> right-of-way to
                    freeze disbursement claims of <strong>₹412.50 Cr</strong> pending verification of uninitiated
                    bituminous courses.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-space-lg mt-space-md border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant font-code-md">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
                <span>Analyst Sign-off: Dr. Aris Thorne (ISRO-Authorized)</span>
              </div>
              <div className="flex flex-wrap items-center gap-space-md">
                <Link
                  to="/alerts"
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md px-4 py-2 rounded transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">history_edu</span>
                  <span>Audit Trail Log</span>
                </Link>
                <Link
                  to="/milestones"
                  className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2 rounded transition-all shadow-md flex items-center gap-1.5 font-semibold"
                >
                  <span>Proceed to Milestone Verification Table</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
