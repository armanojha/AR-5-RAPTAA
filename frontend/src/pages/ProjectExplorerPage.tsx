import React from 'react';
import { Link } from 'react-router-dom';

const PROJECTS = [
  {
    id: 'NHAI-DME-PKG4B',
    dossierCode: 'NHAI-EXP-DME-04B',
    sector: 'Expressways',
    name: 'Delhi-Mumbai Expressway (Pkg 4B)',
    location: 'Vadodara – Surat Corridor, Gujarat',
    agency: 'National Highways Authority of India (NHAI)',
    contractor: 'Patel-KNR Infra JV',
    sanctioned: '₹4,280 Cr',
    sanctionedFull: '₹4,280.0 Cr',
    disbursed: '₹2,910.4 Cr',
    disbursedPct: '68.0% Released',
    lastPass: '14 Oct 2024',
    statusLabel: 'Discrepancy (27% Gap)',
    statusType: 'error' as const,
    claimedPct: 68.2,
    observedPct: 41.5,
    spread: '-26.7% SPREAD',
    excessNote: '₹1,134.2 Cr',
    completionTarget: '31 Mar 2025',
    delayNote: '+7.5 Mo Delay',
  },
  {
    id: 'DFCCIL-W-02',
    dossierCode: 'DFCCIL-W-02',
    sector: 'High-Speed Rail',
    name: 'Western Dedicated Freight Corridor',
    location: 'Rewari – Madar Section, Rajasthan',
    agency: 'Dedicated Freight Corridor Corp (DFCCIL)',
    contractor: 'L&T – Sojitz Consortium',
    sanctioned: '₹6,850 Cr',
    sanctionedFull: '₹6,850.0 Cr',
    disbursed: '₹5,480.0 Cr',
    disbursedPct: '80.0% Released',
    lastPass: '12 Oct 2024',
    statusLabel: 'Verified Normal',
    statusType: 'tertiary' as const,
    claimedPct: 81.0,
    observedPct: 82.2,
    spread: '+1.2% SPREAD',
    excessNote: '₹0.0 Cr',
    completionTarget: '30 Jun 2025',
    delayNote: 'On Schedule',
  },
  {
    id: 'MMRDA-MTHL-02',
    dossierCode: 'MMRDA-MTHL-02',
    sector: 'Bridges',
    name: 'Mumbai Trans Harbour Link (Pkg 2)',
    location: 'Sewri to Nhava Sheva Marine Spans',
    agency: 'MMRDA',
    contractor: 'Daewoo – Tata Projects JV',
    sanctioned: '₹7,637 Cr',
    sanctionedFull: '₹7,637.0 Cr',
    disbursed: '₹7,102.4 Cr',
    disbursedPct: '93.0% Released',
    lastPass: '09 Oct 2024',
    statusLabel: 'Final Verification',
    statusType: 'secondary' as const,
    claimedPct: 95.0,
    observedPct: 92.8,
    spread: '-2.2% SPREAD',
    excessNote: '₹168.0 Cr',
    completionTarget: '31 Dec 2024',
    delayNote: 'Final Sign-off',
  },
  {
    id: 'UPEIDA-GE-08',
    dossierCode: 'UPEIDA-GE-08',
    sector: 'Expressways',
    name: 'Ganga Expressway (Unnao-Prayagraj)',
    location: 'Package 4 Earthwork & Paving',
    agency: 'UPEIDA',
    contractor: 'Adani Road Transport',
    sanctioned: '₹5,994 Cr',
    sanctionedFull: '₹5,994.0 Cr',
    disbursed: '₹3,236.7 Cr',
    disbursedPct: '54.0% Released',
    lastPass: '05 Oct 2024',
    statusLabel: 'Under Review',
    statusType: 'neutral' as const,
    claimedPct: 58.0,
    observedPct: 50.4,
    spread: '-7.6% SPREAD',
    excessNote: '₹455.5 Cr',
    completionTarget: '30 Sep 2025',
    delayNote: '+1.5 Mo Review',
  },
  {
    id: 'CMRL-L4-C2',
    dossierCode: 'CMRL-L4-C2',
    sector: 'Urban Transit',
    name: 'Chennai Metro Phase-2 (Line 4)',
    location: 'Lighthouse to Poonamallee Bypass',
    agency: 'CMRL',
    contractor: 'HCC – KEC International JV',
    sanctioned: '₹3,750 Cr',
    sanctionedFull: '₹3,750.0 Cr',
    disbursed: '₹2,100.0 Cr',
    disbursedPct: '56.0% Released',
    lastPass: '01 Oct 2024',
    statusLabel: 'Delayed (+14 Mo)',
    statusType: 'error' as const,
    claimedPct: 59.0,
    observedPct: 44.0,
    spread: '-15.0% SPREAD',
    excessNote: '₹562.5 Cr',
    completionTarget: '31 Dec 2026',
    delayNote: '+14.0 Mo Delay',
  },
];

const SECTORS = ['Expressways', 'High-Speed Rail', 'Bridges', 'Urban Transit'] as const;

const SAT_MAP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBsN17aVCC5QFMpUzj9221Ydk2AQEjfgCVE167IOsaLFroZT-Y8P_U6Xs1YkfmJoGgn84OaBHnFx_odmqV6E2QF0QRVOwpY_poc7tY0SGJVDS8FLusqY3WGhJ0i9VQc7FMfIu0pTBQI6OvPsRDnfJjW3FjOovcYPOh8sR1pr0rOhtA0mJYx9aE7T5SZ3ti3NFqfUrkC_VIiCYUcHBwBLw-AzhlLSaN8FKrAtR8x4Ruv';

export const ProjectExplorerPage: React.FC = () => {
  const [searchText, setSearchText] = React.useState('Vadodara-Surat');
  const [activeSector, setActiveSector] = React.useState<string | null>('Expressways');
  const [selectedId, setSelectedId] = React.useState<string>('NHAI-DME-PKG4B');
  const [showOptical, setShowOptical] = React.useState(true);
  const [showSar, setShowSar] = React.useState(true);
  const [showCadastral, setShowCadastral] = React.useState(false);
  const [showChainage, setShowChainage] = React.useState(true);

  const filteredProjects = PROJECTS.filter((proj) => {
    const q = searchText.trim().toLowerCase();
    const matchesSearch =
      !q ||
      q === 'vadodara-surat' ||
      proj.name.toLowerCase().includes(q) ||
      proj.id.toLowerCase().includes(q) ||
      proj.location.toLowerCase().includes(q);
    const matchesSector = !activeSector || activeSector === 'Expressways' ? true : proj.sector === activeSector;
    return matchesSearch && matchesSector;
  });

  const selectedProject = PROJECTS.find((p) => p.id === selectedId) ?? PROJECTS[0];

  return (
    <div className="p-space-md sm:p-space-lg w-full max-w-[1920px] mx-auto">
      <div className="flex flex-col w-full">
        {/* Top Operational Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">
              <span>Intelligence</span>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold">Project Explorer</span>
              <span className="text-outline-variant">/</span>
              <span className="bg-surface-container-high text-primary px-1.5 py-0.5 rounded font-label-sm text-[10px]">
                124 Assets Monitored
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Geospatial Project Explorer
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Interactive spatial directory and GIS inspection workspace for public infrastructure corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container-lowest hover:bg-surface-container-low text-secondary font-label-md text-label-md rounded shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
              <span>Filter Bounds</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container-lowest hover:bg-surface-container-low text-secondary font-label-md text-label-md rounded shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">polyline</span>
              <span>Export GIS Shapefile</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-1.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_location_alt</span>
              <span>Add Monitored Asset</span>
            </button>
          </div>
        </div>

        {/* Tri-Column Tactical Geospatial Workspace Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start w-full">
          {/* LEFT PANEL: Spatial Directory & Telemetry Index */}
          <div className="xl:col-span-3 flex flex-col gap-space-md w-full">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:bg-surface-container-lowest transition-colors focus:outline-none"
                  placeholder="Search project name, NHAI code, state..."
                  type="text"
                />
              </div>

              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                    Sector Filters
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText('');
                      setActiveSector(null);
                    }}
                    className="font-label-sm text-[10px] text-primary cursor-pointer hover:underline"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SECTORS.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setActiveSector(activeSector === sec ? null : sec)}
                      className={
                        activeSector === sec
                          ? 'px-2 py-1 rounded bg-primary text-on-primary font-label-sm text-[10px] font-medium tracking-tight'
                          : 'px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-[10px]'
                      }
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-space-xs bg-surface-container-low px-space-sm py-1.5 rounded">
                <div className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
                  <span className="material-symbols-outlined text-[14px]">swap_vert</span>
                  <span>Sort:</span>
                </div>
                <select
                  defaultValue="Highest Discrepancy (-27%)"
                  className="bg-transparent font-label-sm text-label-sm text-on-surface font-semibold focus:outline-none cursor-pointer"
                >
                  <option>Highest Discrepancy (-27%)</option>
                  <option>Latest Acquisition Pass</option>
                  <option>Budget Value (High → Low)</option>
                  <option>Delay Severity Index</option>
                </select>
              </div>

              {/* Projects Directory Scrollable List */}
              <div className="space-y-space-sm max-h-[700px] overflow-y-auto pr-0.5">
                {filteredProjects.map((project) => {
                  const isSelected = project.id === selectedProject.id;
                  const badgeStyle =
                    project.statusType === 'error'
                      ? 'bg-error-container text-on-error-container'
                      : project.statusType === 'tertiary'
                        ? 'bg-tertiary-container/20 text-tertiary'
                        : project.statusType === 'secondary'
                          ? 'bg-secondary-container/50 text-secondary'
                          : 'bg-surface-container-high text-on-surface-variant';

                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedId(project.id)}
                      className={`p-space-md rounded-xl shadow-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-surface-container-low hover:bg-surface-container ring-1 ring-primary/30'
                          : 'bg-surface-container-lowest hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-space-xs mb-1">
                        <span
                          className={`font-label-sm text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider flex items-center gap-1 ${badgeStyle}`}
                        >
                          {project.id === 'NHAI-DME-PKG4B' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                          )}
                          {project.statusLabel}
                        </span>
                        <span className="font-label-sm text-label-sm text-outline">{project.id}</span>
                      </div>
                      <h3 className="font-headline-sm text-[14px] text-on-surface leading-tight">
                        {project.name}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-2.5">
                        {project.location}
                      </p>

                      {project.id === 'NHAI-DME-PKG4B' ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 p-space-xs rounded bg-surface-container-lowest mb-2 font-label-sm text-label-sm">
                            <div>
                              <span className="text-outline block text-[9px] uppercase">Sanctioned</span>
                              <span className="text-on-surface font-semibold font-code-md">
                                {project.sanctioned}
                              </span>
                            </div>
                            <div>
                              <span className="text-outline block text-[9px] uppercase">Last Sat Pass</span>
                              <span className="text-primary font-semibold font-code-md">
                                {project.lastPass}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between font-label-sm text-[10px]">
                              <span className="text-on-surface-variant">Visible vs Claimed Progress</span>
                              <span className="text-error font-semibold font-code-md">41.5% / 68.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                              <div className="bg-primary h-full" style={{ width: '41.5%' }} />
                              <div className="bg-error/40 h-full" style={{ width: '26.7%' }} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant pt-1">
                          <span className="font-code-md font-semibold text-on-surface">
                            {project.sanctioned}
                          </span>
                          <span className="text-outline">{project.lastPass}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CENTER PANEL: Flexible GIS Workspace Viewport */}
          <div className="xl:col-span-6 flex flex-col gap-space-sm w-full">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col relative">
              {/* GIS Map HUD Navigation Header */}
              <div className="p-space-sm bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm z-20">
                <div className="flex items-center gap-space-sm">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low font-label-sm text-label-sm text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-primary">my_location</span>
                    <span className="font-code-md font-medium">21°10'34&quot; N, 72°50'12&quot; E</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
                    <span>
                      Elev: <strong className="font-code-md text-on-surface">28m MSL</strong>
                    </span>
                    <span className="text-outline-variant">|</span>
                    <span>
                      Res: <strong className="font-code-md text-on-surface">0.5m/px</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-surface-container-low text-secondary transition-colors"
                    title="Distance Measurement"
                  >
                    <span className="material-symbols-outlined text-[18px]">straighten</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-surface-container-low text-secondary transition-colors"
                    title="Polygon Area Tool"
                  >
                    <span className="material-symbols-outlined text-[18px]">square_foot</span>
                  </button>
                  <Link
                    to="/evidence"
                    className="p-1.5 rounded bg-surface-container-high text-primary transition-colors flex items-center gap-1 px-2 py-1 font-label-sm text-[11px]"
                    title="Split Screen Compare"
                  >
                    <span className="material-symbols-outlined text-[16px]">compare</span>
                    <span>Compare</span>
                  </Link>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-surface-container-low text-secondary transition-colors"
                    title="Reset Orientation"
                  >
                    <span className="material-symbols-outlined text-[18px]">explore</span>
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded hover:bg-surface-container-low text-secondary transition-colors"
                    title="Full Canvas Zoom"
                  >
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Layer Toggles Strip */}
              <div className="px-space-md py-1.5 bg-surface-container-low flex flex-wrap items-center gap-space-sm font-label-sm text-label-sm">
                <span className="text-outline text-[10px] uppercase font-semibold">Active Overlays:</span>
                <label className="flex items-center gap-1.5 cursor-pointer bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                  <input
                    checked={showOptical}
                    onChange={(e) => setShowOptical(e.target.checked)}
                    className="accent-primary rounded w-3.5 h-3.5"
                    type="checkbox"
                  />
                  <span className="text-on-surface font-medium">Satellite Optical (True Color)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                  <input
                    checked={showSar}
                    onChange={(e) => setShowSar(e.target.checked)}
                    className="accent-primary rounded w-3.5 h-3.5"
                    type="checkbox"
                  />
                  <span className="text-on-surface font-medium">SAR Radar</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                  <input
                    checked={showCadastral}
                    onChange={(e) => setShowCadastral(e.target.checked)}
                    className="accent-primary rounded w-3.5 h-3.5"
                    type="checkbox"
                  />
                  <span className="text-on-surface-variant">Cadastral Parcels</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                  <input
                    checked={showChainage}
                    onChange={(e) => setShowChainage(e.target.checked)}
                    className="accent-primary rounded w-3.5 h-3.5"
                    type="checkbox"
                  />
                  <span className="text-on-surface font-medium">Chainage (Ch 142 - 214)</span>
                </label>
              </div>

              {/* Main Map Canvas & Tactical Visual Representation */}
              <div className="relative w-full h-[460px] sm:h-[580px] bg-inverse-surface overflow-hidden select-none">
                {showOptical && (
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-85"
                    style={{ backgroundImage: `url('${SAT_MAP_URL}')` }}
                  />
                )}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  fill="none"
                  viewBox="0 0 800 580"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="earthworkGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#EAA638" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#EAA638" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 140 L 800 140 M 0 290 L 800 290 M 0 440 L 800 440"
                    opacity="0.3"
                    stroke="#cfe5ff"
                    strokeDasharray="4 8"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M 200 0 L 200 580 M 400 0 L 400 580 M 600 0 L 600 580"
                    opacity="0.3"
                    stroke="#cfe5ff"
                    strokeDasharray="4 8"
                    strokeWidth="0.5"
                  />
                  {showSar && (
                    <>
                      <path
                        d="M 60 480 Q 220 380 340 320 T 520 220 T 740 100"
                        stroke="#ffffff"
                        strokeLinecap="round"
                        strokeOpacity="0.1"
                        strokeWidth="24"
                      />
                      <path d="M 60 480 Q 180 410 270 360" stroke="#008280" strokeLinecap="round" strokeWidth="6" />
                      <path
                        d="M 270 360 Q 360 310 440 265"
                        stroke="#EAA638"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                        strokeWidth="5"
                      />
                      <path d="M 440 265 Q 490 240 530 215" stroke="#ba1a1a" strokeDasharray="3 3" strokeWidth="7" />
                      <path
                        d="M 530 215 Q 630 160 740 100"
                        stroke="#EAA638"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                        strokeWidth="5"
                      />
                      <path
                        d="M 400 30 Q 450 180 470 310 T 520 560"
                        stroke="#2f79b4"
                        strokeLinecap="round"
                        strokeOpacity="0.35"
                        strokeWidth="14"
                      />
                    </>
                  )}
                </svg>

                {showChainage && (
                  <>
                    <div className="absolute left-[12%] bottom-[20%] pointer-events-auto cursor-pointer group">
                      <div className="bg-inverse-surface/90 text-inverse-on-surface px-1.5 py-0.5 rounded font-label-sm text-[9px] shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
                        <span>Ch. 142.0 (Paved)</span>
                      </div>
                    </div>
                    <div className="absolute left-[36%] bottom-[42%] pointer-events-auto cursor-pointer group">
                      <div className="bg-inverse-surface/90 text-inverse-on-surface px-1.5 py-0.5 rounded font-label-sm text-[9px] shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EAA638]" />
                        <span>Ch. 168.4 (Sub-base)</span>
                      </div>
                    </div>
                    <div className="absolute left-[54%] top-[34%] pointer-events-auto cursor-pointer group">
                      <div className="bg-inverse-surface/90 text-inverse-on-surface px-1.5 py-0.5 rounded font-label-sm text-[9px] shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                        <span className="text-error-container font-semibold">Ch. 182.2 (Major Bridge #14)</span>
                      </div>
                    </div>
                    <div className="absolute right-[12%] top-[14%] pointer-events-auto cursor-pointer group">
                      <div className="bg-inverse-surface/90 text-inverse-on-surface px-1.5 py-0.5 rounded font-label-sm text-[9px] shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                        <span>Ch. 214.0 (Surat Interchange)</span>
                      </div>
                    </div>
                  </>
                )}

                <div
                  className="hidden sm:block absolute left-[45%] top-[24%] -translate-x-1/2 pointer-events-auto z-10 max-w-xs animate-bounce"
                  style={{ animationDuration: '3s' }}
                >
                  <div className="bg-surface-container-lowest/95 backdrop-blur shadow-xl rounded-lg p-space-sm border-l-4 border-error">
                    <div className="flex items-center justify-between gap-space-xs mb-1">
                      <span className="font-label-sm text-[9px] font-bold uppercase tracking-wider text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">report</span>
                        Anomaly #4B-07
                      </span>
                      <span className="font-label-sm text-[9px] text-outline font-code-md">Piers 12-18</span>
                    </div>
                    <p className="font-headline-sm text-[12px] font-semibold text-on-surface leading-tight">
                      Tapi River Bridge Foundations Stagnant
                    </p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Zero structural volumetric delta detected for{' '}
                      <strong className="text-error font-semibold">64 consecutive days</strong> across 4 satellite
                      passes.
                    </p>
                    <div className="mt-2 pt-1 border-t border-outline-variant/30 flex items-center justify-between font-label-sm text-[10px]">
                      <span className="text-outline">Contractor Claim: 70%</span>
                      <span className="text-error font-bold">Visible: 44.1%</span>
                    </div>
                  </div>
                </div>

                <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-10">
                  <div className="bg-surface-container-lowest/90 backdrop-blur rounded p-1.5 shadow-sm flex flex-col items-center">
                    <span className="font-label-sm text-[10px] font-bold text-primary">N</span>
                    <span className="material-symbols-outlined text-[16px] text-primary">navigation</span>
                  </div>
                  <div className="bg-surface-container-lowest/90 backdrop-blur rounded shadow-sm flex flex-col">
                    <button
                      type="button"
                      className="p-1.5 hover:bg-surface-container text-on-surface transition-colors"
                      title="Zoom In"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <div className="h-[1px] bg-outline-variant/30" />
                    <button
                      type="button"
                      className="p-1.5 hover:bg-surface-container text-on-surface transition-colors"
                      title="Zoom Out"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                  </div>
                </div>

                <div className="absolute left-4 bottom-4 z-10 max-w-xs bg-surface-container-lowest/90 backdrop-blur rounded-lg p-space-sm shadow-md font-label-sm text-label-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-on-surface">GIS Legend</span>
                    <span className="text-outline text-[9px]">Cartosat-3 • 0.5m</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-space-md gap-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#008280] rounded" />
                      <span className="text-on-surface-variant truncate">Paved Bituminous</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#EAA638] rounded" />
                      <span className="text-on-surface-variant truncate">Sub-base Earthwork</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-error rounded" />
                      <span className="text-on-surface-variant truncate">Stagnant Site</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-primary rounded" />
                      <span className="text-on-surface-variant truncate">Staging Depot</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm font-label-sm text-label-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
                  <span className="text-on-surface">
                    Telemetry Sync: <strong>ISRO NRSC Cartosat-3</strong> (Pass #902) &amp;{' '}
                    <strong>ESA Sentinel-2</strong>
                  </span>
                </div>
                <div className="flex items-center gap-space-md text-outline">
                  <span>
                    Projection: <strong className="text-on-surface font-code-md">EPSG:32643 (UTM 43N)</strong>
                  </span>
                  <span>
                    Cloud Cover: <strong className="text-on-surface font-code-md">0.0%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Detailed Analytical Inspection Dossier */}
          <div className="xl:col-span-3 flex flex-col gap-space-md w-full">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-md">
              <div className="border-b border-outline-variant/30 pb-space-sm">
                <div className="flex items-center justify-between gap-space-xs mb-1">
                  <span className="font-code-md font-semibold text-primary px-2 py-0.5 rounded bg-primary-fixed text-[11px]">
                    {selectedProject.dossierCode}
                  </span>
                  <span className="font-label-sm text-[10px] text-error font-bold uppercase tracking-wider bg-error-container/60 px-1.5 py-0.5 rounded">
                    High Priority Audit
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-sm text-on-surface font-bold">
                  {selectedProject.name}
                </h2>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-1 leading-snug">
                  {selectedProject.agency} / Concessionaire: <strong>{selectedProject.contractor}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                    Sanctioned Budget
                  </span>
                  <span className="font-headline-sm text-[15px] font-bold text-on-surface font-code-md mt-0.5">
                    {selectedProject.sanctionedFull}
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant">Approved Revised 2022</span>
                </div>
                <div className="p-space-sm rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">
                    Disbursed Capital
                  </span>
                  <span className="font-headline-sm text-[15px] font-bold text-primary font-code-md mt-0.5">
                    {selectedProject.disbursed}
                  </span>
                  <span className="font-label-sm text-[10px] text-primary font-semibold font-code-md">
                    {selectedProject.disbursedPct}
                  </span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-semibold uppercase text-on-surface tracking-wider">
                    Audit Progress Delta
                  </span>
                  <span className="font-code-md font-bold text-error text-[12px]">
                    {selectedProject.spread}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-label-sm text-[11px]">
                      <span className="text-on-surface-variant">Claimed Official Progress</span>
                      <span className="font-bold text-on-surface font-code-md">
                        {selectedProject.claimedPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full rounded-full"
                        style={{ width: `${selectedProject.claimedPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-label-sm text-[11px]">
                      <span className="text-on-surface-variant">Satellite Optical Ground Truth</span>
                      <span className="font-bold text-primary font-code-md">
                        {selectedProject.observedPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${selectedProject.observedPct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded bg-surface-container-lowest mt-1 font-label-sm text-[10px] text-on-surface-variant flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-error shrink-0 mt-0.5">
                    warning
                  </span>
                  <span>
                    Excess disbursement of approximately <strong>{selectedProject.excessNote}</strong> flagged
                    against unverified physical works.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm font-label-sm text-label-sm">
                <div className="space-y-0.5">
                  <span className="text-outline text-[10px] uppercase block">Completion Target</span>
                  <span className="text-on-surface font-semibold font-code-md text-[11px]">
                    {selectedProject.completionTarget}
                  </span>
                  <span className="text-error font-medium text-[10px] block">
                    {selectedProject.delayNote}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-outline text-[10px] uppercase block">Constellation Feed</span>
                  <span className="text-on-surface font-semibold text-[11px]">Cartosat-3 + Sentinel-2</span>
                  <span className="text-outline text-[10px] block">MSI Spectral Bands</span>
                </div>
              </div>

              <div className="space-y-space-xs pt-space-xs border-t border-outline-variant/30">
                <span className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Milestone Disaggregation
                </span>
                <div className="space-y-1.5">
                  <div className="p-1.5 rounded bg-surface-container-low flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                      <span className="font-medium text-on-surface">Land Acquisition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-code-md font-bold text-tertiary">100%</span>
                      <span className="font-label-sm text-[9px] text-outline">Verified</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-surface-container-low flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                      <span className="font-medium text-on-surface">Earthwork &amp; Sub-base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-code-md font-bold text-tertiary">88.0%</span>
                      <span className="font-label-sm text-[9px] text-outline">Verified</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-surface-container-low flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-error">error</span>
                      <span className="font-medium text-on-surface">Major Bridges (18 Nos)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-code-md font-bold text-error">44%</span>
                      <span className="font-label-sm text-[9px] text-outline-variant line-through">Rep. 70%</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-surface-container-low flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-error">dangerous</span>
                      <span className="font-medium text-on-surface">Bituminous Paving</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-code-md font-bold text-error">18.0%</span>
                      <span className="font-label-sm text-[9px] text-outline-variant line-through">Rep. 52%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
                <Link
                  className="w-full flex items-center justify-center gap-2 py-2 px-space-md bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded font-semibold transition-all shadow-sm"
                  to="/evidence"
                >
                  <span>Open Satellite Evidence &amp; Change Detection</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  to="/reports"
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-space-md bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md rounded transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">download_for_offline</span>
                  <span>Download Geospatial Audit Dossier (PDF/GeoJSON)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
