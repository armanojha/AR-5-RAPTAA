import React from 'react';
import { Link } from 'react-router-dom';

type RiskFilter = 'critical' | 'high' | 'all';

const RISK_ROWS = [
  {
    rank: 1,
    tier: 'critical' as const,
    name: 'Delhi-Mumbai Expressway Pkg 4B',
    code: 'NHAI-CR-2022-DME-04',
    agency: 'NHAI / Highways',
    exposure: '₹4,280 Cr',
    crsLabel: '92/100 · CRITICAL',
    crsClass: 'bg-error text-on-error',
    rankBadgeClass: 'bg-error text-on-error',
    rowBgClass: 'bg-error-container/10',
    deficit: '-26.7%',
    deficitDesc: 'Sub-grade paving deficit',
    deficitColor: 'text-error',
    stagnation: '64 Days Static',
    stagnationColor: 'text-error font-medium',
    sensorDot: 'bg-error',
    sensorStatus: 'SAR Incoherence',
    primaryAction: 'Dispatch JPV',
    primaryBtnClass: 'bg-primary text-on-primary hover:bg-primary-container',
  },
  {
    rank: 2,
    tier: 'critical' as const,
    name: 'Bengaluru Suburban Rail Corridor 2',
    code: 'K-RIDE-SBN-02-YPR',
    agency: 'K-RIDE / Metro-Rail',
    exposure: '₹2,150 Cr',
    crsLabel: '88/100 · CRITICAL',
    crsClass: 'bg-error text-on-error',
    rankBadgeClass: 'bg-error text-on-error',
    rowBgClass: 'bg-error-container/5',
    deficit: '-35.0%',
    deficitDesc: 'Pier cast gap vs reported',
    deficitColor: 'text-error',
    stagnation: '45 Days Static',
    stagnationColor: 'text-error font-medium',
    sensorDot: 'bg-error',
    sensorStatus: 'Drone & Optical Confirmed',
    primaryAction: 'Dispatch JPV',
    primaryBtnClass: 'bg-primary text-on-primary hover:bg-primary-container',
  },
  {
    rank: 3,
    tier: 'high' as const,
    name: 'Dedicated Freight Corridor Phase 2',
    code: 'DFCCIL-EDFC-PH2',
    agency: 'DFCCIL / Rail',
    exposure: '₹6,850 Cr',
    crsLabel: '76/100 · HIGH',
    crsClass: 'bg-surface-container-high text-secondary',
    rankBadgeClass: 'bg-secondary text-on-secondary',
    rowBgClass: '',
    deficit: '-18.0%',
    deficitDesc: 'Track slab alignment lag',
    deficitColor: 'text-secondary',
    stagnation: '78 Days (Partial)',
    stagnationColor: 'text-error font-medium',
    sensorDot: 'bg-secondary',
    sensorStatus: 'Sentinel-2 Multispectral',
    primaryAction: 'Re-Verify',
    primaryBtnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
  },
  {
    rank: 4,
    tier: 'high' as const,
    name: 'Ganga Expressway Package 7',
    code: 'UPEIDA-GE-07',
    agency: 'UPEIDA / Expressways',
    exposure: '₹3,410 Cr',
    crsLabel: '71/100 · HIGH',
    crsClass: 'bg-surface-container-high text-secondary',
    rankBadgeClass: 'bg-secondary text-on-secondary',
    rowBgClass: '',
    deficit: '-14.2%',
    deficitDesc: 'Sub-base earth displacement',
    deficitColor: 'text-secondary',
    stagnation: '32 Days',
    stagnationColor: 'text-on-surface-variant',
    sensorDot: 'bg-secondary',
    sensorStatus: 'Equipment Demobilized',
    primaryAction: 'Re-Verify',
    primaryBtnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
  },
  {
    rank: 5,
    tier: 'moderate' as const,
    name: 'Zojila Tunnel Approach Road (NH-1)',
    code: 'NHIDCL-ZTL-01',
    agency: 'NHIDCL / Tunnels',
    exposure: '₹2,800 Cr',
    crsLabel: '64/100 · MODERATE',
    crsClass: 'bg-surface-container-low text-on-surface-variant',
    rankBadgeClass: 'bg-outline text-on-primary',
    rowBgClass: '',
    deficit: '-9.5%',
    deficitDesc: 'Terrain & freeze-thaw slowdown',
    deficitColor: 'text-on-surface',
    stagnation: '18 Days',
    stagnationColor: 'text-outline',
    sensorDot: 'bg-outline',
    sensorStatus: 'Winter Snow Mask',
    primaryAction: 'Log Memo',
    primaryBtnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
  },
  {
    rank: 6,
    tier: 'moderate' as const,
    name: 'Chennai Metro Rail Ph-2 Line 4',
    code: 'CMRL-P2-L4',
    agency: 'CMRL / Metro',
    exposure: '₹3,120 Cr',
    crsLabel: '59/100 · MODERATE',
    crsClass: 'bg-surface-container-low text-on-surface-variant',
    rankBadgeClass: 'bg-outline text-on-primary',
    rowBgClass: '',
    deficit: '-7.1%',
    deficitDesc: 'Underground TBM progress stable',
    deficitColor: 'text-on-surface',
    stagnation: '12 Days',
    stagnationColor: 'text-outline',
    sensorDot: 'bg-tertiary',
    sensorStatus: 'Ground Sensor Active',
    primaryAction: 'Log Memo',
    primaryBtnClass: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
  },
];

export const RiskAssessmentPage: React.FC = () => {
  const [syncing, setSyncing] = React.useState(false);
  const [filter, setFilter] = React.useState<RiskFilter>('critical');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1000);
  };

  const visibleRows =
    filter === 'all'
      ? RISK_ROWS
      : filter === 'high'
        ? RISK_ROWS.filter((r) => r.tier === 'critical' || r.tier === 'high')
        : RISK_ROWS;

  return (
    <div className="flex flex-col w-full">
      {/* Operational Sub-Header Ribbon */}
      <div className="bg-surface-container-lowest px-space-md sm:px-space-xl py-space-md shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                CIVITRACE AUDIT PROTOCOL · STAGE 4
              </span>
              <span className="text-outline-variant">/</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                ENGINEERING HEURISTIC v3.1
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Infrastructure Risk Assessment &amp; Predictive Auditing
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
              Multi-dimensional risk modeling combining orbital sensor coherence, milestone velocity, contractor
              historical variance, and financial exposure across national mega-corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-md shrink-0">
            <div className="bg-surface-container-low px-space-md py-1.5 rounded flex items-center gap-space-sm">
              <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Assessment Confidence
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  98.4% <span className="font-normal text-on-surface-variant">(ISO-19115 Verified)</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                onClick={handleSync}
                className="h-8 px-space-sm bg-surface-container hover:bg-surface-container-high rounded text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors"
              >
                <span
                  className={`material-symbols-outlined text-[16px] text-primary ${
                    syncing ? 'animate-spin' : ''
                  }`}
                >
                  sync
                </span>
                <span>Sync Models</span>
              </button>
              <Link
                to="/reports"
                className="h-8 px-space-sm bg-primary text-on-primary hover:bg-primary-container rounded font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Risk Brief</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-space-md sm:p-space-xl space-y-space-xl">
        {/* Section 1: Key Metric Index Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-error" />
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  High Risk Corridors
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg text-error font-semibold">09</span>
                  <span className="font-label-sm text-label-sm text-error/80 uppercase">Corridors</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-error-container/60 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">fmd_bad</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
              <span className="font-label-sm text-label-sm text-error font-medium">
                Immediate Intervention Mandated
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Moderate Risk Corridors
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg text-secondary font-semibold">23</span>
                  <span className="font-label-sm text-label-sm text-outline uppercase">Corridors</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">warning_amber</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>Enhanced Optical Scan Rate</span>
              <span className="font-semibold text-primary">Every 48h</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary" />
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  On-Track &amp; Nominal
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg text-tertiary font-semibold">92</span>
                  <span className="font-label-sm text-label-sm text-outline uppercase">Segments</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>Standard Sentinel-2 Pass</span>
              <span className="font-semibold text-tertiary">10-Day Cadence</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Cumulative Capital At-Risk
                </span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-display-lg text-display-lg text-primary font-semibold">₹14,820</span>
                  <span className="font-label-sm text-label-sm text-primary uppercase">Cr</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>Total Monitored Portfolio</span>
              <span className="font-semibold text-on-surface">₹1,18,400 Cr (12.5%)</span>
            </div>
          </div>
        </div>

        {/* Section 2 & 3: Multi-Dimensional Risk Matrix & 5-Pillar Scores */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl">
          {/* 2x2 Risk Quadrant Engine (7 cols) */}
          <div className="xl:col-span-7 bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Risk Quadrant Matrix: Physical Slip vs Capital Exposure
                </h2>
              </div>
              <span className="font-label-sm text-label-sm bg-surface-container px-space-sm py-1 rounded text-on-surface-variant">
                Cross-Correlation: R² = 0.841
              </span>
            </div>

            <div className="relative bg-surface-container-low rounded p-space-md h-96 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-40">
                <div className="bg-surface-container/50" />
                <div className="bg-error-container/30" />
                <div className="bg-surface-container-lowest/60" />
                <div className="bg-tertiary-fixed/20" />
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-outline-variant/60 pointer-events-none" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-outline-variant/60 pointer-events-none" />

              <div className="absolute top-3 left-4 pointer-events-none">
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                  Q2: High Discrepancy / Mid Exposure
                </span>
              </div>
              <div className="absolute top-3 right-4 text-right pointer-events-none">
                <span className="font-label-sm text-label-sm text-error font-bold uppercase tracking-wider">
                  Q1: RED ZONE (High Slip + High Capital)
                </span>
              </div>
              <div className="absolute bottom-3 left-4 pointer-events-none">
                <span className="font-label-sm text-label-sm text-outline font-semibold uppercase tracking-wider">
                  Q4: Low Exposure / Stable
                </span>
              </div>
              <div className="absolute bottom-3 right-4 text-right pointer-events-none">
                <span className="font-label-sm text-label-sm text-tertiary font-semibold uppercase tracking-wider">
                  Q3: High Capital / On Schedule
                </span>
              </div>

              {/* Scatter Nodes */}
              <div className="absolute top-14 right-14 cursor-pointer group z-10">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-6 h-6 rounded-full bg-error/30 animate-ping" />
                  <span className="w-3.5 h-3.5 rounded-full bg-error shadow-sm group-hover:scale-125 transition-transform" />
                </div>
                <div className="absolute -top-7 -right-12 hidden group-hover:flex flex-col bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded shadow-md font-label-sm text-label-sm whitespace-nowrap z-20">
                  <span className="font-bold text-error-container">Delhi-Mumbai Pkg 4B</span>
                  <span>Gap: -26.7% | ₹4,280 Cr</span>
                </div>
                <span className="font-label-sm text-label-sm text-error font-bold mt-1 inline-block -ml-6">
                  DME Pkg 4B
                </span>
              </div>

              <div className="absolute top-24 right-44 cursor-pointer group z-10">
                <div className="w-3 h-3 rounded-full bg-error shadow-sm group-hover:scale-125 transition-transform" />
                <div className="absolute -top-7 -right-8 hidden group-hover:flex flex-col bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded shadow-md font-label-sm text-label-sm whitespace-nowrap z-20">
                  <span className="font-bold text-error-container">Bengaluru Rail C-2</span>
                  <span>Gap: -35.0% | ₹2,150 Cr</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface font-medium mt-1 inline-block -ml-4">
                  BLR Rail C2
                </span>
              </div>

              <div className="absolute top-20 left-28 cursor-pointer group z-10">
                <div className="w-3 h-3 rounded-full bg-secondary shadow-sm group-hover:scale-125 transition-transform" />
                <div className="absolute -top-7 -left-8 hidden group-hover:flex flex-col bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded shadow-md font-label-sm text-label-sm whitespace-nowrap z-20">
                  <span className="font-bold text-primary-fixed">Ganga Expy Pkg 7</span>
                  <span>Gap: -14.2% | ₹3,410 Cr</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mt-1 inline-block -ml-2">
                  Ganga Pkg 7
                </span>
              </div>

              <div className="absolute bottom-16 right-20 cursor-pointer group z-10">
                <div className="w-3.5 h-3.5 rounded-full bg-tertiary shadow-sm group-hover:scale-125 transition-transform" />
                <div className="absolute -top-7 -right-8 hidden group-hover:flex flex-col bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded shadow-md font-label-sm text-label-sm whitespace-nowrap z-20">
                  <span className="font-bold text-tertiary-fixed">DFC Dadri-Rewari</span>
                  <span>Gap: +1.2% (On-Time) | ₹6,850 Cr</span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary font-medium mt-1 inline-block -ml-6">
                  DFC Dadri-Rewari
                </span>
              </div>

              <div className="absolute bottom-20 left-56 cursor-pointer group z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-sm group-hover:scale-125 transition-transform" />
                <div className="absolute -top-7 -left-4 hidden group-hover:flex flex-col bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded shadow-md font-label-sm text-label-sm whitespace-nowrap z-20">
                  <span className="font-bold text-surface-container-lowest">MCR Ph-2</span>
                  <span>Gap: -1.8% | ₹1,980 Cr</span>
                </div>
                <span className="font-label-sm text-label-sm text-outline font-medium mt-1 inline-block -ml-2">
                  MCR Ph-2
                </span>
              </div>

              <div className="absolute bottom-10 left-16 cursor-pointer group z-10">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-outline" />
                  <div className="w-2 h-2 rounded-full bg-outline" />
                  <div className="w-2 h-2 rounded-full bg-outline" />
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-1 inline-block">
                  88 Corridors (Nominal)
                </span>
              </div>

              <div className="absolute bottom-1 right-2 font-label-sm text-label-sm text-outline flex items-center gap-1">
                <span>FINANCIAL EXPOSURE (CAPITAL AT STAKE) →</span>
              </div>
              <div className="absolute top-2 left-2 font-label-sm text-label-sm text-outline [writing-mode:vertical-rl] rotate-180 flex items-center gap-1">
                <span>PHYSICAL DISCREPANCY / GROUND DEFICIT →</span>
              </div>
            </div>

            <div className="mt-space-md pt-space-xs flex flex-wrap items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
              <div className="flex flex-wrap items-center gap-space-md">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error" /> Critical Intervention (Q1)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Stagnation Drift (Q2)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary" /> Capital Secure (Q3)
                </span>
              </div>
              <span className="text-outline">Updated: Orbital Pass T-02:18 UTC</span>
            </div>
          </div>

          {/* 5-Pillar Risk Scoring Engines (5 cols) */}
          <div className="xl:col-span-5 bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  5-Pillar Predictive Audit Model
                </h2>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-mono font-medium">
                WEIGHTED INDEX
              </span>
            </div>

            <div className="space-y-space-md py-space-xs">
              <div className="bg-surface-container-low p-space-sm rounded hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between font-label-sm text-label-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-error">speed</span>
                    Schedule Slip Velocity
                  </span>
                  <span className="text-error font-bold font-mono">4.2 Mo Slip Avg</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded overflow-hidden">
                  <div className="bg-error h-full rounded" style={{ width: '78%' }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline mt-1">
                  <span>Ground speed vs DPR target</span>
                  <span>Weight: 25%</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between font-label-sm text-label-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-secondary">satellite_alt</span>
                    Optical / InSAR Ground Verification Gap
                  </span>
                  <span className="text-secondary font-bold font-mono">-22.4% Variance</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded overflow-hidden">
                  <div className="bg-secondary h-full rounded" style={{ width: '66%' }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline mt-1">
                  <span>Sentinel-2 SAR volumetric disparity</span>
                  <span>Weight: 25%</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between font-label-sm text-label-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-error">front_loader</span>
                    Physical Stagnation Index
                  </span>
                  <span className="text-error font-bold font-mono">64 Days Max Static</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded overflow-hidden">
                  <div className="bg-error h-full rounded" style={{ width: '82%' }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline mt-1">
                  <span>Zero earth-moving activity detected</span>
                  <span>Weight: 20%</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between font-label-sm text-label-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">price_change</span>
                    Financial Burn Rate Anomaly
                  </span>
                  <span className="text-primary font-bold font-mono">+18.5% Over-run</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded overflow-hidden">
                  <div className="bg-primary h-full rounded" style={{ width: '58%' }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline mt-1">
                  <span>Disbursement vs observed civil progress</span>
                  <span>Weight: 20%</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded hover:bg-surface-container transition-colors">
                <div className="flex items-center justify-between font-label-sm text-label-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">cloud</span>
                    Sensor Reliability &amp; Cloud Masking Risk
                  </span>
                  <span className="text-tertiary font-bold font-mono">4.1% Latency</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded overflow-hidden">
                  <div className="bg-tertiary h-full rounded" style={{ width: '14%' }} />
                </div>
                <div className="flex justify-between font-label-sm text-label-sm text-outline mt-1">
                  <span>Cartosat-3 and Copernicus optical clearance</span>
                  <span>Weight: 10%</span>
                </div>
              </div>
            </div>

            <div className="mt-space-sm pt-space-xs flex items-center justify-between font-label-sm text-label-sm text-outline">
              <span>Algorithmic Composite Score Model</span>
              <span className="text-primary font-semibold">CIVITRACE CRS-Alpha v4</span>
            </div>
          </div>
        </div>

        {/* Section 4: National Corridor Risk Ranking Table */}
        <div className="bg-surface-container-lowest rounded shadow-sm overflow-hidden flex flex-col">
          <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px]">analytics</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Top Flagged Mega-Corridors by Composite Risk Score (CRS)
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ranked hierarchy prioritized for engineering ground verification, JPV mobilization, and CAG audit flag
                escalation.
              </p>
            </div>
            <div className="flex items-center gap-space-xs shrink-0">
              <div className="flex items-center bg-surface-container-low rounded p-0.5">
                {(
                  [
                    ['critical', 'Critical (9)'],
                    ['high', 'High (23)'],
                    ['all', 'All Corridors (124)'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={
                      filter === key
                        ? 'px-space-sm py-1 rounded bg-surface-container-lowest text-primary font-label-sm text-label-sm font-semibold shadow-xs'
                        : 'px-space-sm py-1 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-outline">
                <tr>
                  <th className="py-2.5 px-space-md">Rank / Corridor Identity</th>
                  <th className="py-2.5 px-space-md">Agency / Sector</th>
                  <th className="py-2.5 px-space-md text-right">Exposure (₹ Cr)</th>
                  <th className="py-2.5 px-space-md text-center">CRS Risk Index</th>
                  <th className="py-2.5 px-space-md">Physical Ground Deficit</th>
                  <th className="py-2.5 px-space-md">Stagnation</th>
                  <th className="py-2.5 px-space-md">Sensor Status</th>
                  <th className="py-2.5 px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-none">
                {visibleRows.map((row) => (
                  <tr
                    key={row.code}
                    className={`hover:bg-surface-container transition-colors group ${row.rowBgClass}`}
                  >
                    <td className="py-2.5 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <span
                          className={`w-5 h-5 rounded font-label-sm text-label-sm flex items-center justify-center font-bold shrink-0 ${row.rankBadgeClass}`}
                        >
                          {row.rank}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-headline-sm text-[13px] text-on-surface font-semibold group-hover:text-primary transition-colors">
                            {row.name}
                          </span>
                          <span className="font-label-sm text-label-sm font-mono text-outline">{row.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-space-md">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">
                        {row.agency}
                      </span>
                    </td>
                    <td className="py-2.5 px-space-md text-right font-mono font-semibold text-on-surface">
                      {row.exposure}
                    </td>
                    <td className="py-2.5 px-space-md text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${row.crsClass}`}
                      >
                        {row.crsLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-space-md">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold font-mono ${row.deficitColor}`}>{row.deficit}</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm truncate">
                          {row.deficitDesc}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-space-md">
                      <span className={`font-mono ${row.stagnationColor}`}>{row.stagnation}</span>
                    </td>
                    <td className="py-2.5 px-space-md">
                      <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                        <span className={`w-2 h-2 rounded-full ${row.sensorDot}`} />
                        <span>{row.sensorStatus}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-space-md text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/alerts"
                          className={`h-6 px-2 rounded font-label-sm text-label-sm font-medium transition-colors flex items-center ${row.primaryBtnClass}`}
                        >
                          {row.primaryAction}
                        </Link>
                        <Link
                          to="/evidence"
                          title="Deep Dive Telemetry"
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-surface-container text-on-surface-variant"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
            <span>Showing {visibleRows.length} of 10 prioritized corridors in operational triage queue</span>
            <div className="flex items-center gap-space-sm">
              <span className="text-outline">Page 1 of 3</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-6 h-6 rounded bg-surface-container-lowest flex items-center justify-center text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="w-6 h-6 rounded bg-surface-container-lowest flex items-center justify-center text-on-surface font-bold hover:bg-surface-container"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-6 h-6 rounded bg-surface-container-lowest flex items-center justify-center text-outline hover:text-on-surface"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-6 h-6 rounded bg-surface-container-lowest flex items-center justify-center text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Regulatory Audit Disclaimer & Methodology Protocol */}
        <div className="bg-surface-container p-space-lg rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md">
            <span className="material-symbols-outlined text-outline text-[24px] mt-0.5 shrink-0">gavel</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-outline">
                Statutory &amp; Methodological Notice · National Infrastructure Pipeline (NIP)
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
                The Civitrace Composite Risk Score (CRS) is an algorithmic heuristic synthesized from multispectral
                satellite observations, synthetic aperture radar (InSAR) coherence matrices, contractor billing
                telemetry, and public milestones. This metric is designed strictly to prioritize federal engineering
                inspection resources, optimize Joint Physical Verification (JPV) rosters, and flag early-stage drift. It
                does not constitute a legal determination of contractual breach or financial culpability.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 self-end md:self-center">
            <span className="font-label-sm text-label-sm font-mono text-outline uppercase">
              ISO 19115 / OGC WCS Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
