import React from 'react';
import { Link } from 'react-router-dom';

type AlertFilterTab = 'all' | 'discrepancy' | 'schedule' | 'flag';
type SectorFilter = 'all' | 'expressways' | 'rail' | 'metro' | 'ports';
type MapLayer = 'hybrid' | 'sentinel2' | 'cartosat' | 'sar';

const ALERT_ITEMS = [
  {
    id: 'alert-1',
    category: 'discrepancy' as const,
    badge: 'Severe Discrepancy',
    badgeClass: 'bg-error-container text-on-error-container',
    title: 'Delhi-Mumbai Expressway (Pkg 4B)',
    date: '14 Oct 2024',
    summary: (
      <>
        Reported progress: <strong className="text-on-surface">68%</strong> vs Satellite-Observed:{' '}
        <strong className="text-error">41%</strong>. Earthwork completed, but asphalt paving inactive for 78 consecutive
        days.
      </>
    ),
    corridor: 'Vadodara-Surat (NH-48 Ext)',
    actionLabel: 'View Evidence',
    actionTo: '/evidence',
  },
  {
    id: 'alert-2',
    category: 'schedule' as const,
    badge: 'Schedule Stagnation',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    title: 'Dedicated Freight Corridor (Ph-2)',
    date: '08 Oct 2024',
    summary: (
      <>
        Zero structural track-bed advancement detected across 3 consecutive ISRO Cartosat-3 passes. Heavy equipment moved
        off-site.
      </>
    ),
    corridor: 'Dadri-Khurja Stretch',
    actionLabel: 'View Log',
    actionTo: '/alerts',
  },
  {
    id: 'alert-3',
    category: 'discrepancy' as const,
    badge: 'Milestone Discrepancy',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    title: 'Bengaluru Suburban Rail (Corridor 2)',
    date: '02 Oct 2024',
    summary: (
      <>
        Station pier count observed: <strong className="text-on-surface">42/120</strong>. Milestone invoice claim filed
        for: <strong className="text-error">85/120 piers</strong>.
      </>
    ),
    corridor: 'Baiyappanahalli - Chikkabanavara',
    actionLabel: 'Review Invoice',
    actionTo: '/financials',
  },
  {
    id: 'alert-4',
    category: 'flag' as const,
    badge: 'Review Suggested',
    badgeClass: 'bg-tertiary/15 text-tertiary',
    title: 'Ganga Expressway (Section 3)',
    date: '29 Sep 2024',
    summary: (
      <>
        Rapid earthwork detected ahead of plan (<strong className="text-tertiary">+8.4%</strong>). Ground validation
        recommended to verify sub-base compaction density before asphalt layer.
      </>
    ),
    corridor: 'Unnao-Prayagraj Stretch',
    actionLabel: 'Compaction Map',
    actionTo: '/explorer',
  },
];

export const OverviewPage: React.FC = () => {
  const [alertTab, setAlertTab] = React.useState<AlertFilterTab>('all');
  const [sector, setSector] = React.useState<SectorFilter>('all');
  const [mapLayer, setMapLayer] = React.useState<MapLayer>('hybrid');

  const visibleAlerts =
    alertTab === 'all' ? ALERT_ITEMS : ALERT_ITEMS.filter((item) => item.category === alertTab);

  return (
    <div className="p-space-md sm:p-space-lg w-full max-w-[1920px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Page Header & Global Controls */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs text-primary font-label-md text-label-md">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="tracking-wide font-semibold uppercase">
                National Ground Truth Monitoring Network
              </span>
              <span className="text-outline-variant">•</span>
              <span className="text-on-surface-variant font-label-sm">
                Cycle 44-B / Indian Union Geo-Grid
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Infrastructure Intelligence Overview
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Monitor infrastructure activity, analyse project progress and identify projects requiring physical ground
              verification against multispectral orbital radar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm pt-space-xs lg:pt-0">
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-2 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">tune</span>
              <span>Sensor Config</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-2 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">date_range</span>
              <span>Last 90 Days</span>
              <span className="material-symbols-outlined text-[14px] text-outline">arrow_drop_down</span>
            </button>
            <Link
              to="/reports"
              className="flex items-center gap-1.5 px-space-md py-2 rounded bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>National Summary (PDF)</span>
            </Link>
          </div>
        </section>

        {/* Metric Cards Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Metric 1: Total Projects */}
          <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Corridor Network
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">124</span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-semibold">
                    +12 Q3
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  14,820 km linear infra &amp; 48 major hubs
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm">
              <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                <span>Asset Distribution</span>
                <span className="font-semibold text-on-surface">64 Exp / 32 Rail / 18 Met / 10 Port</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest flex overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '52%' }} />
                <div className="bg-secondary h-full" style={{ width: '26%' }} />
                <div className="bg-tertiary h-full" style={{ width: '14%' }} />
                <div className="bg-primary-container h-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>

          {/* Metric 2: Require Inspection */}
          <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Priority Flag
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">18</span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                    Urgent
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Discrepancy &gt;35% or stagnant surface
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-secondary shadow-inner">
                <span className="material-symbols-outlined text-[20px]">farsight_digital</span>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm">
              <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                <span>8 Severe Variance</span>
                <span className="text-secondary font-medium">10 Stagnant &gt;60d</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          {/* Metric 3: Delayed Projects */}
          <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Statutory Schedule
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">12</span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
                    Critical
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Behind baseline schedule by &gt;6 mos
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center text-error shadow-inner">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm">
              <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                <span>Avg Slip Duration</span>
                <span className="text-error font-medium">4.2 Months Slip</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="bg-error h-full rounded-full" style={{ width: '48%' }} />
              </div>
            </div>
          </div>

          {/* Metric 4: Progress Discrepancies */}
          <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Satellite Audit
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg font-bold text-on-surface">09</span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-semibold">
                    Audited
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Reported vs Satellite variance &gt;25%
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-tertiary/15 flex items-center justify-center text-tertiary shadow-inner">
                <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm">
              <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                <span>Spectral Confidence</span>
                <span className="text-tertiary font-medium">99.4% Sar Resolution</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Main Center Geospatial GIS Section & Project Alerts Split Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Geospatial GIS Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-xl bg-surface-container-lowest shadow-md overflow-hidden relative">
            {/* GIS Bar & Filters */}
            <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">travel_explore</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    National Infrastructure Vector Grid
                  </span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed uppercase font-semibold">
                    ISRO-NRSC LIVE
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 bg-surface-container-lowest p-0.5 rounded-lg shadow-sm">
                  {(
                    [
                      ['hybrid', 'Hybrid Vector'],
                      ['sentinel2', 'Sentinel-2 True Color'],
                      ['cartosat', 'Cartosat DEM'],
                      ['sar', 'SAR Radar'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMapLayer(key)}
                      className={
                        mapLayer === key
                          ? 'px-2 py-1 rounded text-primary font-label-sm text-label-sm bg-surface-container font-semibold transition-all'
                          : 'px-2 py-1 rounded text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-all'
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-space-xs pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-label-sm text-label-sm text-outline uppercase mr-1">Sector:</span>
                  {(
                    [
                      ['all', 'All (124)'],
                      ['expressways', 'Expressways (64)'],
                      ['rail', 'Rail (32)'],
                      ['metro', 'Metro (18)'],
                      ['ports', 'Ports (10)'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSector(key)}
                      className={
                        sector === key
                          ? 'px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm cursor-pointer shadow-xs'
                          : 'px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm cursor-pointer transition-colors'
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-space-sm text-label-sm font-label-sm text-outline">
                  <span>Grid Anchor:</span>
                  <span className="font-code-md text-code-md text-on-surface bg-surface-container px-2 py-0.5 rounded">
                    20.5937° N, 78.9629° E
                  </span>
                </div>
              </div>
            </div>

            {/* Map Canvas Graphic Area */}
            <div className="relative w-full h-[420px] sm:h-[540px] bg-gradient-to-b from-[#eaf2fb] via-[#f0f6ff] to-[#e4eef9] overflow-hidden select-none">
              <svg className="w-full h-full object-contain filter drop-shadow-sm" viewBox="0 0 1000 800">
                <defs>
                  <pattern height="40" id="grid-pattern" patternUnits="userSpaceOnUse" width="40">
                    <path
                      className="text-outline-variant/20"
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    />
                  </pattern>
                  <linearGradient id="corridor-red" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="corridor-teal" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#006765" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#008280" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <rect fill="url(#grid-pattern)" height="800" width="1000" />
                <path
                  d="M 450,90 C 480,120 540,110 570,140 C 600,170 560,200 580,230 C 600,260 670,250 710,240 C 740,240 790,260 810,290 C 830,320 810,340 770,350 C 740,360 700,340 680,350 C 660,370 650,400 630,420 C 600,450 610,500 590,540 C 570,580 540,640 510,690 C 490,720 480,720 460,680 C 440,640 400,560 380,500 C 360,450 330,420 310,400 C 280,380 250,370 240,350 C 230,320 270,300 290,280 C 320,250 350,220 380,180 C 410,140 430,90 450,90 Z"
                  fill="#fbfdff"
                  stroke="#c0c7d1"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  className="animate-pulse"
                  d="M 420,270 Q 380,340 350,450"
                  fill="none"
                  stroke="#ba1a1a"
                  strokeDasharray="6 3"
                  strokeWidth="4.5"
                />
                <path
                  d="M 425,275 Q 520,310 650,370"
                  fill="none"
                  stroke="#2f628b"
                  strokeDasharray="4 2"
                  strokeWidth="3.5"
                />
                <path d="M 350,450 Q 420,550 510,620" fill="none" stroke="#008280" strokeWidth="3" />
                <path d="M 470,550 L 460,630" fill="none" stroke="#006099" strokeWidth="2.5" />
                <circle cx="420" cy="270" fill="#006099" r="6" />
                <circle cx="420" cy="270" fill="none" opacity="0.6" r="10" stroke="#006099" strokeWidth="1" />
                <text fill="#031c35" fontFamily="Geist" fontSize="11" fontWeight="600" x="430" y="268">
                  NCT Delhi (NCR-01)
                </text>
                <circle cx="370" cy="385" fill="#ba1a1a" r="7" />
                <circle
                  className="animate-ping"
                  cx="370"
                  cy="385"
                  fill="none"
                  r="15"
                  stroke="#ba1a1a"
                  strokeWidth="2"
                  style={{ animationDuration: '2.2s' }}
                />
                <circle cx="370" cy="385" fill="none" opacity="0.4" r="24" stroke="#ba1a1a" strokeWidth="1" />
                <circle cx="350" cy="455" fill="#008280" r="6" />
                <text fill="#031c35" fontFamily="Geist" fontSize="11" fontWeight="600" x="270" y="460">
                  Mumbai Coastal
                </text>
                <circle cx="460" cy="630" fill="#2f628b" r="5" />
                <text fill="#031c35" fontFamily="Geist" fontSize="11" fontWeight="600" x="475" y="635">
                  Bengaluru Rail Hub
                </text>
                <circle cx="660" cy="370" fill="#006099" r="5" />
                <text fill="#031c35" fontFamily="Geist" fontSize="11" fontWeight="600" x="675" y="375">
                  Kolkata Port Link
                </text>
                <circle cx="530" cy="320" fill="#006099" r="4.5" />
                <text fill="#414750" fontFamily="Geist" fontSize="10" fontWeight="500" x="540" y="315">
                  Varanasi Multimodal
                </text>
              </svg>

              {/* Floating Coordinates & Zoom Panel */}
              <div className="absolute top-4 right-4 flex flex-col gap-1 bg-surface-container-lowest/90 backdrop-blur p-1 rounded-lg shadow-md border-0">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <div className="h-px bg-surface-container-high my-0.5" />
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
                  title="Fit to India Bounds"
                >
                  <span className="material-symbols-outlined text-[18px]">crop_free</span>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
                  title="Distance Measure Tool"
                >
                  <span className="material-symbols-outlined text-[18px]">straighten</span>
                </button>
              </div>

              {/* Interactive Telemetry Tooltip over Delhi-Mumbai Expressway Pkg 4 */}
              <div className="hidden sm:block absolute top-[42%] left-[28%] -translate-y-1/2 w-72 bg-surface-container-lowest rounded-lg shadow-xl p-space-md pointer-events-auto transform transition-transform hover:scale-105 duration-200">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                    <span className="font-label-sm text-label-sm font-semibold uppercase text-error">
                      Discrepancy: +32.4%
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline">NE-4/PKG-04</span>
                </div>
                <div className="font-headline-sm text-[13px] text-on-surface font-semibold leading-tight mt-1">
                  Delhi-Mumbai Expressway (Vadodara Ext)
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
                  Reported surface completion: <strong className="text-on-surface">68.0%</strong>. Satellite spectral
                  classification confirms earthwork base only (<strong className="text-error">41.2%</strong>).
                </p>
                <div className="flex items-center justify-between mt-space-sm pt-space-xs border-t border-surface-container-low text-[10px] font-label-sm">
                  <span className="text-on-surface-variant font-code-md">SAR-S2: 24h ago</span>
                  <Link
                    className="text-primary hover:text-primary-container font-semibold flex items-center gap-0.5"
                    to="/evidence"
                  >
                    Inspect Radar <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  </Link>
                </div>
              </div>

              {/* Floating Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 bg-surface-container-lowest/95 backdrop-blur px-space-md py-space-sm rounded-lg shadow-md max-w-xs flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Telemetry Layer Status
                </span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-body-sm text-[11px] text-on-surface">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error" />
                    <span>&gt;25% Discrepancy (9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                    <span>Verified On-Track (85)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <span>Stagnant &gt;45d (10)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                    <span>Schedule Slip (12)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick GIS Footer Status Strip */}
            <div className="px-space-md py-space-xs bg-surface-container-low flex flex-wrap items-center justify-between gap-2 font-label-sm text-label-sm text-on-surface-variant">
              <div className="flex flex-wrap items-center gap-space-md">
                <span>
                  Swath Sensor: <strong className="text-on-surface">Sentinel-2 MSI + Cartosat-3 PAN</strong>
                </span>
                <span>
                  Cloud Cover Filter: <strong className="text-on-surface">&lt; 8.2% max</strong>
                </span>
                <span>
                  Optical GSD: <strong className="text-on-surface">0.28m resampled</strong>
                </span>
              </div>
              <div className="text-outline">Sync Status: Realtime (ISRO Ground Station Shadnagar)</div>
            </div>
          </div>

          {/* Right Side: High-Priority Project Alerts (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-[20px]">crisis_alert</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Ground Truth Alerts</h2>
                </div>
                <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                  9 Pending
                </span>
              </div>

              {/* Alert Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg mb-space-md">
                {(
                  [
                    ['all', 'All (9)'],
                    ['discrepancy', 'Discrepancy (4)'],
                    ['schedule', 'Schedule (3)'],
                    ['flag', 'Flag (2)'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAlertTab(key)}
                    className={
                      alertTab === key
                        ? 'flex-1 py-1 rounded bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold shadow-xs'
                        : 'flex-1 py-1 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Alert Cards Stack */}
              <div className="space-y-space-sm">
                {visibleAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded font-label-sm text-[10px] font-bold uppercase tracking-wider ${item.badgeClass}`}
                        >
                          {item.badge}
                        </span>
                        <h3 className="font-headline-sm text-[14px] text-on-surface mt-1 font-semibold group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <span className="font-label-sm text-[10px] text-outline font-code-md shrink-0">
                        {item.date}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between text-label-sm font-label-sm">
                      <span className="text-outline font-code-md">{item.corridor}</span>
                      <Link
                        className="text-primary font-semibold flex items-center gap-0.5 hover:underline"
                        to={item.actionTo}
                      >
                        {item.actionLabel}{' '}
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/alerts"
                className="block w-full mt-space-md py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md text-center transition-colors"
              >
                View All 18 Ground Verification Tasks
              </Link>
            </div>
          </div>
        </section>

        {/* Analytical Visualizations Section (Bottom Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Chart 1: Status Distribution */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Status Distribution</h3>
                <span className="material-symbols-outlined text-outline text-[18px]">pie_chart</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Overall 124 National Projects
              </p>
              <div className="relative flex items-center justify-center my-space-md">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" fill="none" r="48" stroke="#eff4ff" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#008280"
                    strokeDasharray="205 301.6"
                    strokeDashoffset="0"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#2f628b"
                    strokeDasharray="45 301.6"
                    strokeDashoffset="-205"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#ba1a1a"
                    strokeDasharray="30 301.6"
                    strokeDashoffset="-250"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#006099"
                    strokeDasharray="21.6 301.6"
                    strokeDashoffset="-280"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">68%</span>
                  <span className="font-label-sm text-[9px] uppercase tracking-wider text-outline font-semibold">
                    Active Ok
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 font-label-sm text-label-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
                    Normal / On Schedule
                  </span>
                  <span className="font-semibold text-on-surface">85 (68%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Under Review
                  </span>
                  <span className="font-semibold text-on-surface">18 (15%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-error" />
                    Statutory Delayed
                  </span>
                  <span className="font-semibold text-on-surface">12 (10%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Audit Discrepancy
                  </span>
                  <span className="font-semibold text-on-surface">9 (7%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Corridor Audit Index */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Corridor Audit Index</h3>
                <span className="material-symbols-outlined text-outline text-[18px]">bar_chart</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Top 4 corridors: Planned vs Observed
              </p>
              <div className="space-y-3 mt-space-md">
                <div>
                  <div className="flex justify-between font-label-sm text-label-sm mb-1">
                    <span className="text-on-surface font-medium truncate max-w-[150px]">
                      Delhi-Mum Exp (Pkg 4)
                    </span>
                    <span className="text-error font-semibold font-code-md">Gap: -27%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-label-sm text-outline w-12">Reported</span>
                      <div className="h-2 rounded bg-surface-container flex-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '68%' }} />
                      </div>
                      <span className="text-[10px] font-code-md text-on-surface w-7 text-right">68%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-label-sm text-outline w-12">Observed</span>
                      <div className="h-2 rounded bg-surface-container flex-1 overflow-hidden">
                        <div className="h-full bg-tertiary" style={{ width: '41%' }} />
                      </div>
                      <span className="text-[10px] font-code-md text-on-surface w-7 text-right">41%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-label-sm text-label-sm mb-1">
                    <span className="text-on-surface font-medium truncate max-w-[150px]">
                      DFC Dadri-Khurja
                    </span>
                    <span className="text-secondary font-semibold font-code-md">Gap: -18%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-label-sm text-outline w-12">Reported</span>
                      <div className="h-2 rounded bg-surface-container flex-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '54%' }} />
                      </div>
                      <span className="text-[10px] font-code-md text-on-surface w-7 text-right">54%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-label-sm text-outline w-12">Observed</span>
                      <div className="h-2 rounded bg-surface-container flex-1 overflow-hidden">
                        <div className="h-full bg-tertiary" style={{ width: '36%' }} />
                      </div>
                      <span className="text-[10px] font-code-md text-on-surface w-7 text-right">36%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-label-sm text-label-sm mb-1">
                    <span className="text-on-surface font-medium truncate max-w-[150px]">
                      Bengaluru Suburban C-2
                    </span>
                    <span className="text-error font-semibold font-code-md">Gap: -35%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-label-sm text-outline w-12">Reported</span>
                      <div className="h-2 rounded bg-surface-container flex-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '71%' }} />
                      </div>
                      <span className="text-[10px] font-code-md text-on-surface w-7 text-right">71%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-label-sm text-outline w-12">Observed</span>
                      <div className="h-2 rounded bg-surface-container flex-1 overflow-hidden">
                        <div className="h-full bg-tertiary" style={{ width: '36%' }} />
                      </div>
                      <span className="text-[10px] font-code-md text-on-surface w-7 text-right">36%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-sm text-label-sm font-label-sm text-outline">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-primary" />
                Reported Claim
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-tertiary" />
                Orbital Ground Truth
              </span>
            </div>
          </div>

          {/* Chart 3: Sensor Velocity */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Sensor Velocity</h3>
                <span className="material-symbols-outlined text-outline text-[18px]">show_chart</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Surface modification pixel flux (90d)
              </p>
              <div className="my-space-md">
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 110">
                  <defs>
                    <linearGradient id="velocity-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#006099" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#006099" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="300" y1="20" y2="20" />
                  <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="300" y1="55" y2="55" />
                  <line stroke="#eff4ff" strokeWidth="1" x1="0" x2="300" y1="90" y2="90" />
                  <path
                    d="M 0,85 C 30,70 50,88 80,45 C 110,10 130,40 160,25 C 190,12 210,65 240,40 C 270,18 290,30 300,15 L 300,100 L 0,100 Z"
                    fill="url(#velocity-grad)"
                  />
                  <path
                    d="M 0,85 C 30,70 50,88 80,45 C 110,10 130,40 160,25 C 190,12 210,65 240,40 C 270,18 290,30 300,15"
                    fill="none"
                    stroke="#006099"
                    strokeWidth="2.5"
                  />
                  <circle cx="160" cy="25" fill="#006099" r="4" />
                  <circle cx="160" cy="25" fill="none" opacity="0.5" r="8" stroke="#006099" strokeWidth="1" />
                </svg>
              </div>
              <div className="flex justify-between items-center text-label-sm font-label-sm text-outline">
                <span>Jul (Monsoon Dip)</span>
                <span>Aug (Post-Rain surge)</span>
                <span className="text-primary font-semibold">Oct (Peak Velocity)</span>
              </div>
            </div>
            <div className="p-space-xs rounded bg-surface-container-low flex items-center justify-between font-label-sm text-[11px] mt-space-sm">
              <span className="text-on-surface-variant">Avg Surface Displacement:</span>
              <span className="font-code-md font-semibold text-primary">48.2 ha / week</span>
            </div>
          </div>

          {/* Chart 4: Orbital Ingest Feed */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Orbital Ingest Feed</h3>
                <span className="material-symbols-outlined text-outline text-[18px]">satellite_alt</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Live sensor pass acquisition telemetry
              </p>
              <div className="space-y-2 mt-space-md">
                <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">
                        Sentinel-2B (MSI)
                      </div>
                      <div className="font-label-sm text-[10px] text-outline font-code-md">
                        Tile: 43QGD (Gujarat Corridor)
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[10px] text-on-surface-variant font-code-md">18m ago</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">sync</span>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">
                        Cartosat-3 (PAN+MX)
                      </div>
                      <div className="font-label-sm text-[10px] text-outline font-code-md">
                        Processing Stereo Pairs (DFC)
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[10px] text-primary font-code-md">In ingest</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">
                        PlanetScope (SuperDove)
                      </div>
                      <div className="font-label-sm text-[10px] text-outline font-code-md">
                        Sub-meter Ortho (Ganga Exp)
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[10px] text-on-surface-variant font-code-md">1h 42m</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-outline">radar</span>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">
                        RISAT-1A / EOS-04
                      </div>
                      <div className="font-label-sm text-[10px] text-outline font-code-md">
                        C-Band SAR Interferometry
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[10px] text-on-surface-variant font-code-md">3h 10m</span>
                </div>
              </div>
            </div>
            <div className="mt-space-sm pt-space-xs border-t border-surface-container-low flex justify-between items-center font-label-sm text-[11px]">
              <span className="text-outline">Sensor Coverage: 98.2%</span>
              <Link className="text-primary hover:underline font-semibold" to="/alerts">
                Inspect Telemetry Log →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
