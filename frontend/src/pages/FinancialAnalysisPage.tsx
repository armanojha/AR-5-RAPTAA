import React from 'react';
import { Link } from 'react-router-dom';

const VERIFY_THUMB_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl8w4mmGIBjIb9XaKgIq3b7jnwzt3CLKwLIrC3l-4pwj-IykWqMC2D6k_cAfKA4CoZIM4LsecViWIQko1x0PIPasbI1xKtDCUev9V2aUClwXIVlHXKSiM2r9WmhETjDUl45VxY4ElkrqBpy-NBQfFjG8HCVo_Db-czqLN3ZzvQgMM26pChx6yo2mI-wH_yr5w3ZC6Gg3yHXdhElAetrRv34FC-Q3MLbqHy6QjY4kqY';

const BOQ_ROWS = [
  {
    id: 'BOQ-SEC-01',
    title: 'Subgrade Preparation & Earthworks',
    station: 'BOQ-SEC-01 (Ch. 172+000 - Ch. 204+000)',
    billed: '₹620.0 Cr',
    claimed: '95.0%',
    observed: '88.5%',
    observedClass: 'text-tertiary font-semibold',
    variance: '-₹40.3 Cr (-6.5%)',
    varianceClass: 'text-outline',
    critical: false,
    statusText: 'Supported with minor adjustment',
    statusBadgeClass: 'bg-surface-container text-on-surface-variant',
    dotColor: 'bg-secondary',
  },
  {
    id: 'BOQ-SEC-04',
    title: 'Major Bridges & Grade Separators',
    station: 'BOQ-SEC-04 (Ch. 191+200 Railway Overbridge)',
    billed: '₹540.0 Cr',
    claimed: '74.0%',
    observed: '38.0%',
    observedClass: 'text-error font-bold',
    variance: '-₹194.4 Cr (-36.0%)',
    varianceClass: 'text-error font-bold',
    critical: true,
    statusText: 'CRITICAL: ₹194.4 Cr Unverified',
    statusBadgeClass: 'bg-error text-on-error font-bold',
    icon: 'block',
  },
  {
    id: 'BOQ-SEC-02',
    title: 'Bituminous Concrete & DBM Pavement Layers',
    station: 'BOQ-SEC-02 (Dual 4-lane Carriageway surfacing)',
    billed: '₹890.0 Cr',
    claimed: '62.0%',
    observed: '32.0%',
    observedClass: 'text-error font-bold',
    variance: '-₹267.0 Cr (-30.0%)',
    varianceClass: 'text-error font-bold',
    critical: true,
    statusText: 'CRITICAL: ₹267.0 Cr Unverified',
    statusBadgeClass: 'bg-error text-on-error font-bold',
    icon: 'gavel',
  },
  {
    id: 'BOQ-SEC-05',
    title: 'Culverts & Minor Drainage (48 Structures)',
    station: 'BOQ-SEC-05 (Cross-drainage culverts)',
    billed: '₹310.0 Cr',
    claimed: '82.0%',
    observed: '64.0%',
    observedClass: 'text-secondary font-semibold',
    variance: '-₹55.8 Cr (-18.0%)',
    varianceClass: 'text-error font-medium',
    critical: false,
    statusText: 'Under Ground Inspection',
    statusBadgeClass: 'bg-surface-container-high text-on-surface',
    icon: 'search_check',
    iconClass: 'text-primary',
  },
  {
    id: 'BOQ-SEC-08',
    title: 'Safety Barriers & High-Reflective Signage',
    station: 'BOQ-SEC-08 (Median crash barriers & gantries)',
    billed: '₹110.0 Cr',
    claimed: '12.0%',
    observed: '0.0%',
    observedClass: 'text-error font-semibold',
    variance: '-₹13.2 Cr (-12.0%)',
    varianceClass: 'text-error font-medium',
    critical: false,
    statusText: 'Billing Suspended',
    statusBadgeClass: 'bg-surface-variant text-on-surface-variant',
    icon: 'pause_circle',
  },
];

export const FinancialAnalysisPage: React.FC = () => {
  const [highVarianceOnly, setHighVarianceOnly] = React.useState(false);

  const visibleRows = highVarianceOnly
    ? BOQ_ROWS.filter((r) => r.critical || r.id === 'BOQ-SEC-05')
    : BOQ_ROWS;

  return (
    <div className="flex flex-col w-full">
      {/* Top Context Header Bar */}
      <div className="bg-surface-container-low px-space-md sm:px-space-xl py-space-md shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md max-w-[1720px] mx-auto w-full">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
              <span>WORKSPACE</span>
              <span className="text-outline-variant">/</span>
              <span className="text-secondary font-medium">FINANCIAL AUDIT</span>
              <span className="text-outline-variant">/</span>
              <span className="text-primary font-semibold">NHAI-EXP-DME-04B</span>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Financial &amp; Physical Progress Analysis
              </h1>
              <span className="px-2 py-0.5 rounded font-label-md text-label-md bg-secondary-container text-on-secondary-container uppercase tracking-wide">
                Pkg 4B: Ch. 172+000 - Ch. 204+000
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                CAG/CVC Trigger Active
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Independent reconciliation between EPC contractor billings, reported progress, and orbital ground-truth
              physical verification.
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              <span>Audit Ledger v4.2</span>
            </button>
            <Link
              to="/reports"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">download</span>
              <span>Export Audit (CAG/CVC)</span>
            </Link>
            <Link
              to="/alerts"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-error text-on-error font-label-lg text-label-lg shadow-md hover:opacity-95 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              <span>Trigger Escrow Withholding Notice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Incident Alert Banner */}
      <div className="px-space-md sm:px-space-xl pt-space-md">
        <div className="max-w-[1720px] mx-auto w-full">
          <div className="bg-error-container text-on-error-container px-space-md py-space-sm rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded bg-error text-on-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-error-container">
                    Critical Financial Audit Trigger: Negative Physical Ground Variance
                  </span>
                  <span className="font-label-sm text-label-sm bg-error text-on-error px-1.5 py-0.5 rounded font-mono">
                    -26.7% PHYSICAL DEFICIT
                  </span>
                </div>
                <span className="font-body-sm text-body-sm opacity-90">
                  Cumulative treasury disbursements exceed satellite-verified ground state by ₹1,134.20 Cr across
                  32.0 km corridor. Immediate statutory audit freeze flagged.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md shrink-0 self-end md:self-center font-label-md text-label-md">
              <span className="font-mono">CLAUSE 19.4.2 ESCROW</span>
              <Link
                to="/reports"
                className="bg-surface-container-lowest text-error px-2.5 py-1 rounded font-medium hover:bg-surface transition-colors shadow-sm text-label-sm font-label-sm"
              >
                Review Protocol
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid Container */}
      <div className="px-space-md sm:px-space-xl py-space-lg space-y-space-lg max-w-[1720px] mx-auto w-full">
        {/* 4-Card Primary Tri-Metric Hero System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container" />
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  CONTRACTOR IPC CLAIM
                </span>
                <span className="font-label-sm text-label-sm text-secondary bg-surface-container-low px-1.5 py-0.5 rounded">
                  Q3 2024 Filing
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display-lg text-display-lg font-semibold text-on-surface tracking-tight">
                  68.2%
                </span>
                <span className="font-label-md text-label-md text-secondary font-mono">+4.1% MoM</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Certified by Independent Engineer (IE) via Milestone Filing VIII on 12-Oct-2024.
              </div>
            </div>
            <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-md -mb-space-md px-space-md py-space-xs flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Corridor Reach</span>
              <span className="font-mono font-medium text-on-surface">21.8 km / 32.0 km</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary" />
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-semibold">
                  SATELLITE GROUND TRUTH
                </span>
                <span className="font-label-sm text-label-sm text-tertiary bg-surface-container-low px-1.5 py-0.5 rounded">
                  InSAR &amp; Sentinel-2
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display-lg text-display-lg font-semibold text-tertiary tracking-tight">
                  41.5%
                </span>
                <span className="font-label-md text-label-md text-error font-mono">-26.7% vs IPC</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Optical high-res spectral mask + InSAR structural coherence verification (24-Oct-2024).
              </div>
            </div>
            <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-md -mb-space-md px-space-md py-space-xs flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Verified Physical Length</span>
              <span className="font-mono font-medium text-tertiary">13.28 km / 32.0 km</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  CUMULATIVE DISBURSED
                </span>
                <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-1.5 py-0.5 rounded">
                  Treasury Outflow
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display-lg text-display-lg font-semibold text-on-surface tracking-tight">
                  ₹2,910.4
                </span>
                <span className="font-label-lg text-label-lg text-on-surface-variant font-medium">Cr</span>
                <span className="font-label-sm text-label-sm bg-surface-container px-1 py-0.5 rounded font-mono text-on-surface">
                  68.0%
                </span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Against Total Approved EPC Contract Value of ₹4,280.00 Cr (Pkg 4B EPC Scope).
              </div>
            </div>
            <div className="pt-space-md mt-space-md bg-surface-container-low -mx-space-md -mb-space-md px-space-md py-space-xs flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Escrow Account #</span>
              <span className="font-mono font-medium text-on-surface">SBI-MUM-991204</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-error" />
            <div>
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-semibold">
                  CAPITAL AT AUDIT RISK
                </span>
                <span className="font-label-sm text-label-sm text-error bg-error-container px-1.5 py-0.5 rounded font-mono font-bold">
                  CRITICAL
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display-lg text-display-lg font-semibold text-error tracking-tight">
                  ₹1,134.2
                </span>
                <span className="font-label-lg text-label-lg text-error font-medium">Cr</span>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                Delta between cumulative disbursements (₹2,910.4 Cr) and verified physical base (₹1,776.2 Cr).
              </div>
            </div>
            <div className="pt-space-md mt-space-md bg-error-container -mx-space-md -mb-space-md px-space-md py-space-xs flex items-center justify-between font-label-sm text-label-sm text-on-error-container">
              <span className="font-medium">Withholding Recommended</span>
              <span className="font-mono font-bold">₹1,134.20 Cr</span>
            </div>
          </div>
        </div>

        {/* Comparative Tri-Track Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left 8-col: Tri-Track Timeline Visualisation */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-lg rounded-t-xl">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                    Tri-Track Comparative Trajectory: Jan 2023 – Oct 2024
                  </h2>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Target S-Curve vs. Contractor IPC Billings vs. Orbital Physical Verification
                </span>
              </div>
              <div className="flex items-center gap-space-sm flex-wrap font-label-sm text-label-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-outline" />
                  <span className="text-on-surface-variant">Planned S-Curve</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-primary" />
                  <span className="text-on-surface-variant">Billed &amp; Disbursed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-tertiary rounded-full" />
                  <span className="font-semibold text-tertiary">Verified Physical</span>
                </div>
              </div>
            </div>

            <div className="relative w-full h-[320px] bg-surface-container-lowest py-2 select-none">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 280">
                <defs>
                  <linearGradient id="unverifiedGap" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <line stroke="#dce9ff" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="20" y2="20" />
                <text className="fill-outline font-label-sm text-[10px]" textAnchor="end" x="30" y="24">
                  100%
                </text>
                <line stroke="#dce9ff" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="75" y2="75" />
                <text className="fill-outline font-label-sm text-[10px]" textAnchor="end" x="30" y="79">
                  75%
                </text>
                <line stroke="#dce9ff" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="130" y2="130" />
                <text className="fill-outline font-label-sm text-[10px]" textAnchor="end" x="30" y="134">
                  50%
                </text>
                <line stroke="#dce9ff" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="185" y2="185" />
                <text className="fill-outline font-label-sm text-[10px]" textAnchor="end" x="30" y="189">
                  25%
                </text>
                <line stroke="#c0c7d1" strokeWidth="1" x1="40" x2="780" y1="240" y2="240" />
                <text className="fill-outline font-label-sm text-[10px]" textAnchor="end" x="30" y="244">
                  0%
                </text>
                <polygon
                  fill="url(#unverifiedGap)"
                  points="533,142 610,122 690,105 770,90 770,148 690,154 610,162 533,168"
                />
                <path
                  d="M 50,235 C 200,230 350,180 500,120 C 620,70 700,45 770,35"
                  fill="none"
                  stroke="#717881"
                  strokeDasharray="6,4"
                  strokeWidth="2"
                />
                <path
                  d="M 50,238 Q 200,232 320,205 T 533,142 T 690,105 T 770,90"
                  fill="none"
                  stroke="#006099"
                  strokeWidth="2.5"
                />
                <path
                  d="M 50,238 Q 200,232 320,208 T 533,168 T 690,154 T 770,148"
                  fill="none"
                  stroke="#008280"
                  strokeWidth="3"
                />
                <circle cx="770" cy="35" fill="#717881" r="4" />
                <circle cx="770" cy="90" fill="#006099" r="5" />
                <circle cx="770" cy="148" fill="#008280" r="5" />
                <line stroke="#ba1a1a" strokeDasharray="2,2" strokeWidth="1" x1="533" x2="533" y1="130" y2="240" />
                <circle cx="533" cy="142" fill="#ba1a1a" r="3" />
              </svg>

              <div className="hidden sm:block absolute left-[58%] top-12 bg-surface-container-highest text-on-surface p-2 rounded shadow-md border-l-2 border-error max-w-[210px] pointer-events-none">
                <span className="font-label-sm text-label-sm text-error font-bold uppercase tracking-wider block">
                  Monsoon Divergence Alert
                </span>
                <span className="font-body-sm text-[11px] leading-tight text-on-surface-variant block">
                  Contractor claimed severe weather delays while billing 100% IPC allocations (May–Aug 2024).
                </span>
              </div>
              <div className="hidden sm:block absolute right-4 top-28 bg-surface-container text-on-surface p-2 rounded shadow-md border-l-2 border-tertiary max-w-[230px] pointer-events-none">
                <div className="flex items-center justify-between font-label-sm text-label-sm mb-0.5">
                  <span className="font-bold text-tertiary">CURRENT GAP: 26.7%</span>
                  <span className="text-error font-mono">₹1,134.2 Cr</span>
                </div>
                <span className="font-body-sm text-[11px] leading-tight text-on-surface-variant block">
                  InSAR Zero-Coherence confirms zero flyover deck erection at Ch. 191+200.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center px-2 sm:px-8 pt-2 font-label-sm text-label-sm text-outline border-t border-surface-container font-mono gap-2">
              <span>Q1 2023</span>
              <span>Q2 2023</span>
              <span>Q3 2023</span>
              <span>Q4 2023</span>
              <span>Q1 2024</span>
              <span className="text-error font-semibold">MAY 2024 [DIV.]</span>
              <span>Q3 2024</span>
              <span className="text-primary font-bold">OCT 2024 (NOW)</span>
            </div>
          </div>

          {/* Right 4-col: Spectral Ground Verification */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">satellite_alt</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                    Spectral Ground Verification
                  </h3>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono">
                  Ch. 191+200
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Optical high-resolution and Sentinel-1 SAR interferometry comparing claimed structural flyover pier cap
                placements vs. physical reflectance.
              </p>

              <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-high shadow-inner mb-space-md">
                <img
                  alt="Highway corridor overhead view"
                  className="w-full h-full object-cover"
                  src={VERIFY_THUMB_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <div className="flex items-center justify-between text-on-primary font-label-sm text-label-sm">
                    <span className="bg-primary/90 px-1.5 py-0.5 rounded">Cartosat-3 (0.28m)</span>
                    <span className="font-mono">Lat 21.6841° N, Lon 73.1209° E</span>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="material-symbols-outlined text-error text-[26px] drop-shadow-md">
                    crisis_alert
                  </span>
                  <span className="bg-surface-container-lowest/90 text-error font-label-sm text-[9px] px-1 py-0.5 rounded font-bold uppercase shadow">
                    ZERO DECK DETECTED
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm font-label-sm text-label-sm">
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block text-[10px]">SAR Coherence Metric</span>
                  <span className="font-mono font-semibold text-error text-[13px]">0.08 (No Structure)</span>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block text-[10px]">Reported Deck Casting</span>
                  <span className="font-mono font-semibold text-secondary text-[13px]">14/14 Spans (100%)</span>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block text-[10px]">Surface Albedo (DBM)</span>
                  <span className="font-mono font-semibold text-error text-[13px]">Absent (Bare Clay)</span>
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="text-outline block text-[10px]">Unearned IPC Invoiced</span>
                  <span className="font-mono font-semibold text-error text-[13px]">₹194.40 Cr</span>
                </div>
              </div>
            </div>

            <div className="pt-space-md mt-space-sm border-t border-surface-container flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline">Sensor telemetry pass: 4h ago</span>
              <Link
                to="/evidence"
                className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>View Full Spectral Layers</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BOQ vs. Satellite Surface Verification Table */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">table_chart</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                  Itemised Bill of Quantities (BOQ) vs. Satellite Surface Ground-Truth
                </h2>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Cross-tabulation of contractor interim payment claims against machine-interpreted multispectral
                physical validation.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-outline font-mono">
                {visibleRows.length} WORK PACKAGES AUDITED
              </span>
              <button
                type="button"
                onClick={() => setHighVarianceOnly((prev) => !prev)}
                className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-colors ${
                  highVarianceOnly
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">filter_list</span>
                <span>{highVarianceOnly ? 'Showing High Variance' : 'Filter High Variance'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-space-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider border-b border-surface-container">
                  <th className="py-2.5 px-space-lg font-medium">BOQ Work Package &amp; Station</th>
                  <th className="py-2.5 px-space-md font-medium text-right">Cumulative Billed</th>
                  <th className="py-2.5 px-space-md font-medium text-right">Certified Physical Claim</th>
                  <th className="py-2.5 px-space-md font-medium text-right">Satellite EO Result</th>
                  <th className="py-2.5 px-space-md font-medium text-right">Capital Variance (Delta)</th>
                  <th className="py-2.5 px-space-lg font-medium text-center">Audit Status &amp; Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`cursor-pointer transition-colors ${
                      row.critical
                        ? 'bg-error-container/20 hover:bg-error-container/30'
                        : 'hover:bg-surface-container-low/60'
                    }`}
                  >
                    <td className="py-3 px-space-lg">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-on-surface">{row.title}</span>
                          {row.critical && <span className="w-2 h-2 rounded-full bg-error" />}
                        </div>
                        <span
                          className={`font-label-sm text-label-sm font-mono ${
                            row.critical ? 'text-error font-bold' : 'text-outline'
                          }`}
                        >
                          {row.station}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-space-md text-right font-mono font-semibold text-on-surface">
                      {row.billed}
                    </td>
                    <td className="py-3 px-space-md text-right font-mono text-on-surface">{row.claimed}</td>
                    <td className={`py-3 px-space-md text-right font-mono ${row.observedClass}`}>
                      {row.observed}
                    </td>
                    <td className={`py-3 px-space-md text-right font-mono ${row.varianceClass}`}>
                      {row.variance}
                    </td>
                    <td className="py-3 px-space-lg text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-label-sm text-label-sm ${row.statusBadgeClass}`}
                      >
                        {row.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`} />}
                        {row.icon && (
                          <span className={`material-symbols-outlined text-[13px] ${row.iconClass ?? ''}`}>
                            {row.icon}
                          </span>
                        )}
                        {row.statusText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-container font-label-md text-label-md text-on-surface border-t-2 border-surface-container-highest">
                  <td className="py-2.5 px-space-lg font-bold">Corridor Sub-total (Audited Line Items)</td>
                  <td className="py-2.5 px-space-md text-right font-mono font-bold">₹2,470.0 Cr</td>
                  <td className="py-2.5 px-space-md text-right font-mono font-bold">71.4% Avg</td>
                  <td className="py-2.5 px-space-md text-right font-mono font-bold text-tertiary">44.5% Avg</td>
                  <td className="py-2.5 px-space-md text-right font-mono font-bold text-error">-₹570.7 Cr</td>
                  <td className="py-2.5 px-space-lg text-center font-bold text-error">
                    ACTION: ESCROW FREEZE MANDATE
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Statutory Compliance Notice & Formal Sign-off */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-space-sm mb-space-sm text-primary">
                <span className="material-symbols-outlined text-[22px]">policy</span>
                <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
                  MoRTH / NHAI Special Audit Circular 2024 Legal Protocol
                </span>
              </div>
              <div className="p-space-md rounded bg-surface-container-low border-l-4 border-primary text-on-surface space-y-space-xs mb-space-md">
                <p className="font-body-md text-body-md font-medium text-on-surface">
                  &quot;A difference exists between officially reported physical progress and satellite-estimated visible
                  progress. Further project verification is recommended.&quot;
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Note: Orbital discrepancies are formal investigation indicators under NHAI/MoRTH Special Audit Circular
                  Ref: NHAI/Fin/Aud/2024/09 and do not independently establish criminal or contract financial misconduct
                  without joint physical drone LIDAR profiling and ground forensic core-testing.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">fact_check</span>
                  <span>Joint Core Sampling Mandate triggered within 14 calendar days.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">lock_clock</span>
                  <span>Interim Escrow Account SBI-MUM-991204 frozen for Tranche IX.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">balance</span>
                  <span>CVC Vigilance Officer notified via Automated Encrypted Dispatch.</span>
                </div>
              </div>
            </div>
            <div className="pt-space-md mt-space-md border-t border-surface-container flex flex-wrap items-center justify-between gap-2 font-label-sm text-label-sm text-outline">
              <span>Statutory Authority: Central Vigilance Commission (CVC) Act §8(1)(h)</span>
              <span className="font-mono">DISPATCH REF: CIVITRACE-2024-PKG4B-AUD</span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-space-sm">
                STATUTORY SIGN-OFF &amp; VERIFICATION
              </span>
              <div className="space-y-space-md">
                <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold shrink-0">
                    <span className="material-symbols-outlined text-[20px]">draw</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-[14px] font-semibold text-on-surface leading-tight">
                      Shri V. K. Ramanathan
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      Financial Comptroller, MoRTH Special Cell
                    </span>
                    <span className="font-label-sm text-[10px] text-tertiary flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[12px]">verified</span> Digital Signature
                      Certified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm pb-space-sm border-b border-surface-container">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary font-bold shrink-0">
                    <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-[14px] font-semibold text-on-surface leading-tight">
                      Dr. Aris Thorne
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      Lead Geospatial Analyst, CIVITRACE
                    </span>
                    <span className="font-label-sm text-[10px] text-tertiary flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[12px]">verified</span> Multi-Spectral Hash
                      Valid
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded mt-space-md font-mono text-[10px] space-y-1">
              <div className="flex items-center justify-between text-outline">
                <span>SHA-256 LEDGER CHECKSUM</span>
                <span className="text-tertiary font-bold">SYNCED</span>
              </div>
              <div className="text-on-surface break-all select-all font-mono leading-tight">
                e9b7408f651c38e91cb37713d29188eafb4819d4b00a298248c8bdf942918f0a
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
