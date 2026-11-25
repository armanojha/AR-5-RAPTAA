import React from 'react';
import { Link } from 'react-router-dom';

const EVIDENCE_FRAME_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBOTwcm5hgQn_yFisWvAql-y2Gk6JB4FYunzW5k2PHN4jcXhK6ZOMJuksKVFRYCdVlJCJ54czzQy-uNlYhwl6wHLa6faeUSc3jym_NysZUDe0xlhQjkyiONvybb27DigoflBkxOABuFhS9Iq0kXVjjI23nwazWCqUIQZ-T3SeqkKcLTe5L1WYBtZpp1tdpDWvIlRSUT4X0zkmv1MjQVl6-g-D_NAr3F4hDmFYjOHx61';

interface AlertRow {
  id: string;
  time: string;
  project: string;
  pkg: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  metric: string;
  metricSub: string;
  sensor: string;
  sensorSub: string;
  officer: string;
  actionLabel: string;
  exposure: string;
  contractor: string;
  vendorId: string;
  flaggedTitle: string;
  flaggedDesc: string;
  coords: string;
}

const ALERT_ROWS: AlertRow[] = [
  {
    id: 'ALT-2024-8842',
    time: 'Today, 04:12 UTC',
    project: 'Delhi-Mumbai Expressway',
    pkg: 'Package 4B (Vadodara-Kim)',
    category: 'Progress Discrepancy',
    severity: 'CRITICAL',
    metric: '-26.7%',
    metricSub: 'PHYSICAL vs BILL',
    sensor: 'Cartosat-3 + S1 SAR',
    sensorSub: '0.5m Pan + VV/VH InSAR',
    officer: 'Dr. A. Thorne',
    actionLabel: 'Active Inspection',
    exposure: '₹412.50 Cr',
    contractor: 'Patel-KNR Infrastructure JV',
    vendorId: 'Vendor ID: IND-7719',
    flaggedTitle: 'Km 191+200 Flyover Piers',
    flaggedDesc:
      'Zero superstructure girders or deck slabs detected by multi-pass radar interferometry, despite EPC contractor claiming 74% physical completion in Interim Payment Certificate #14.',
    coords: 'LAT: 21°44\'18.4"N | LON: 73°02\'34.9"E',
  },
  {
    id: 'ALT-2024-8839',
    time: 'Yesterday, 18:45 UTC',
    project: 'Dedicated Freight Corridor',
    pkg: 'Dadri-Khurja Eastern Spurr',
    category: 'Zero Activity (78d)',
    severity: 'HIGH',
    metric: '78 Days',
    metricSub: 'TEMPORAL FLATLINE',
    sensor: 'RISAT-1A SAR',
    sensorSub: 'Phase Coherence Matrix',
    officer: 'P. K. Sharma',
    actionLabel: 'Review Log',
    exposure: '₹285.00 Cr',
    contractor: 'Tata Projects – ALDESA JV',
    vendorId: 'Vendor ID: IND-6412',
    flaggedTitle: 'Dadri-Khurja Track-Bed Span',
    flaggedDesc:
      'No ballast or rail-laying surface modification across 3 consecutive SAR passes over 78 days; heavy plant equipment demobilized.',
    coords: 'LAT: 28°33\'11.2"N | LON: 77°34\'05.8"E',
  },
  {
    id: 'ALT-2024-8821',
    time: '22 Oct, 11:20 UTC',
    project: 'Bengaluru Suburban Rail',
    pkg: 'Corridor 2 (Baiyappanahalli)',
    category: 'Station Pier Mismatch',
    severity: 'CRITICAL',
    metric: '42 vs 85',
    metricSub: 'FOUNDATIONS BILLED',
    sensor: 'Cartosat-3 Pan',
    sensorSub: 'Shadow Length Height Det',
    officer: 'K. V. Raman',
    actionLabel: 'View Dossier',
    exposure: '₹198.40 Cr',
    contractor: 'L&T Infrastructure Rail',
    vendorId: 'Vendor ID: IND-4028',
    flaggedTitle: 'Station Pier Alignment C-2',
    flaggedDesc:
      '42 station foundation piers visible in optical imagery compared against 85 claimed in milestone billing schedule.',
    coords: 'LAT: 12°59\'26.1"N | LON: 77°39\'14.4"E',
  },
  {
    id: 'ALT-2024-8815',
    time: '21 Oct, 09:30 UTC',
    project: 'Ganga Expressway',
    pkg: 'Unnao-Prayagraj Pkg 4',
    category: 'Earthwork Surge',
    severity: 'MEDIUM',
    metric: '+8.4%',
    metricSub: 'ABOVE FEASIBILITY',
    sensor: 'Sentinel-2 MSI',
    sensorSub: 'SWIR Soil Moisture & NDVI',
    officer: 'S. Banerjee',
    actionLabel: 'Compaction Check',
    exposure: '₹64.20 Cr',
    contractor: 'IRB Infra Developers',
    vendorId: 'Vendor ID: IND-5501',
    flaggedTitle: 'Sub-base Compaction Section 3',
    flaggedDesc:
      'Accelerated soil clearing and embankment fill outpacing baseline feasibility; compaction density verification suggested prior to paving.',
    coords: 'LAT: 26°12\'42.0"N | LON: 80°41\'19.3"E',
  },
  {
    id: 'ALT-2024-8802',
    time: '19 Oct, 14:05 UTC',
    project: 'Mumbai Trans Harbour Link',
    pkg: 'Marine Spans 10-18',
    category: 'Cloud Obscuration',
    severity: 'LOW',
    metric: '12% Obscured',
    metricSub: 'PASS CONFIDENCE 68%',
    sensor: 'ESA Sentinel-2B',
    sensorSub: 'Cloud Probability Mask',
    officer: 'Automated Queue',
    actionLabel: 'Reposition Pass',
    exposure: '₹0.00 Cr',
    contractor: 'Daewoo – Tata Projects JV',
    vendorId: 'Vendor ID: IND-2190',
    flaggedTitle: 'Marine Span Cloud Occlusion',
    flaggedDesc:
      'Partial coastal cumulus cloud mask lowered optical pixel validity; SAR pass scheduled for gap-free structural verification.',
    coords: 'LAT: 18°58\'41.9"N | LON: 72°53\'12.2"E',
  },
];

export const ProjectAlertsPage: React.FC = () => {
  const [selectedId, setSelectedId] = React.useState('ALT-2024-8842');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [noticeModalOpen, setNoticeModalOpen] = React.useState(false);
  const [noticeStatus, setNoticeStatus] = React.useState<'idle' | 'sending' | 'sent'>('idle');
  const [escrowFrozen, setEscrowFrozen] = React.useState(false);
  const [jpvCommissioned, setJpvCommissioned] = React.useState(false);

  const filteredRows = ALERT_ROWS.filter((row) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      row.id.toLowerCase().includes(q) ||
      row.project.toLowerCase().includes(q) ||
      row.pkg.toLowerCase().includes(q) ||
      row.contractor.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q)
    );
  });

  const activeAlert = ALERT_ROWS.find((r) => r.id === selectedId) ?? ALERT_ROWS[0];

  const handleConfirmNotice = () => {
    setNoticeStatus('sending');
    setTimeout(() => {
      setNoticeStatus('sent');
      setTimeout(() => {
        setNoticeModalOpen(false);
        setNoticeStatus('idle');
      }, 700);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Triage Summary Banner */}
      <div className="px-space-md sm:px-space-xl pt-space-lg pb-space-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              <span>Tactical Geospatial Operations</span>
              <span>•</span>
              <span className="font-code-md text-code-md text-primary">REAL-TIME INGESTION NODE 4A</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Project Alerts &amp; Anomaly Management
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
              Automated multi-sensor anomaly detection, statutory deviation notices, and risk triaging across 124
              monitored corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <div className="px-space-md py-space-xs rounded bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary">satellite_alt</span>
              <span>SAR + Optical Engine: Synchronized</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-space-md py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Export Triage Matrix</span>
            </button>
          </div>
        </div>

        {/* Alert Metrics Quadrant (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  All Pending Alerts
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-display-lg font-semibold text-on-surface tracking-tight">
                    28
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-medium">+3 since 0600Z</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">notification_important</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>124 Corridors Monitored</span>
              </div>
              <span className="font-code-md text-code-md text-outline">Q3-Q4 2024</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/30 group-hover:bg-primary transition-colors" />
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-error">
                  Critical Severity
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-display-lg font-semibold text-error tracking-tight">9</span>
                  <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-code-md">
                    Spread &gt;25%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Immediate statutory notice required
              </span>
              <span className="font-label-sm text-label-sm text-error font-semibold">Priority 1</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-error group-hover:h-1 transition-all" />
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                  Milestone Schedule Slippage
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-display-lg font-semibold text-secondary tracking-tight">
                    12
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">&gt;6 Months</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary-container/50 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">schedule</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Compound financial penalty risk
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">EPC Pkgs</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary group-hover:h-1 transition-all" />
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
                  Sensor Coherence / Stagnation
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-display-lg font-semibold text-tertiary tracking-tight">
                    7
                  </span>
                  <span className="font-label-sm text-label-sm text-tertiary font-code-md">&gt;60d Inactive</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[22px]">layers_clear</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Zero SAR speckle perturbation
              </span>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold">Ghost Works</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary group-hover:h-1 transition-all" />
          </div>
        </div>

        {/* Filter Ribbon Bar */}
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="flex flex-wrap items-center gap-space-sm flex-1">
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                filter_list
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-inner transition-colors"
                placeholder="Filter by Alert ID, Corridor, or Contractor..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container transition-colors">
              <span className="text-outline uppercase text-[10px]">Severity:</span>
              <span className="font-semibold text-error">Critical &amp; High (17)</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container transition-colors">
              <span className="text-outline uppercase text-[10px]">Category:</span>
              <span className="font-semibold">All Anomalies</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container transition-colors">
              <span className="text-outline uppercase text-[10px]">Sector:</span>
              <span className="font-semibold">Expressways &amp; Freight</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[15px] text-primary">date_range</span>
              <span className="font-semibold">Q3-Q4 2024</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Reset Filters</span>
            </button>
            <button
              type="button"
              onClick={() => setNoticeModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">send</span>
              <span>Batch Notice Protocol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Master-Detail Operational Workspace */}
      <div className="px-space-md sm:px-space-xl pb-space-2xl grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
        {/* Master Alert Ledger (Left 7 cols) */}
        <div className="xl:col-span-7 flex flex-col space-y-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-space-md py-space-sm bg-surface-container-low flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                  Active Corridors Under Alert Triaging
                </span>
                <span className="font-code-md text-code-md px-2 py-0.5 rounded-full bg-surface-container font-medium text-primary">
                  {filteredRows.length} of 28 displayed
                </span>
              </div>
              <div className="flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error" /> Critical
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary" /> Informational
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container text-outline uppercase font-label-sm text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Alert ID &amp; Time</th>
                    <th className="py-2.5 px-3">Project &amp; Pkg</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3 text-right">Deviation Metric</th>
                    <th className="py-2.5 px-3">Sensor Source</th>
                    <th className="py-2.5 px-3">Officer</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 text-on-surface font-body-sm text-body-sm">
                  {filteredRows.map((row) => {
                    const isSelected = row.id === activeAlert.id;
                    const severityBadge =
                      row.severity === 'CRITICAL'
                        ? 'bg-error-container text-on-error-container font-bold'
                        : row.severity === 'HIGH'
                          ? 'bg-secondary-container text-on-secondary-container font-semibold'
                          : row.severity === 'MEDIUM'
                            ? 'bg-primary-fixed text-on-primary-fixed-variant font-semibold'
                            : 'bg-surface-container-highest text-on-surface-variant font-medium';
                    const severityDot =
                      row.severity === 'CRITICAL'
                        ? 'bg-error'
                        : row.severity === 'HIGH'
                          ? 'bg-secondary'
                          : row.severity === 'MEDIUM'
                            ? 'bg-primary'
                            : 'bg-outline';

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-surface-container-high/60 hover:bg-surface-container'
                            : 'bg-surface-container-lowest hover:bg-surface-container-low'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span
                              className={`font-code-md text-code-md font-semibold flex items-center gap-1 ${
                                row.severity === 'CRITICAL'
                                  ? 'text-primary'
                                  : row.severity === 'HIGH'
                                    ? 'text-secondary'
                                    : row.severity === 'MEDIUM'
                                      ? 'text-primary'
                                      : 'text-outline'
                              }`}
                            >
                              {row.id === 'ALT-2024-8842' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                              )}
                              {row.id}
                            </span>
                            <span className="font-label-sm text-label-sm text-outline">{row.time}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col min-w-[150px]">
                            <span className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">
                              {row.project}
                            </span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-code-md">
                              {row.pkg}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm bg-surface-container text-on-surface font-medium">
                            {row.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-code-md text-label-sm ${severityBadge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${severityDot}`} />
                            {row.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-code-md text-code-md font-bold ${
                                row.severity === 'CRITICAL'
                                  ? 'text-error'
                                  : row.severity === 'HIGH'
                                    ? 'text-secondary'
                                    : row.severity === 'MEDIUM'
                                      ? 'text-primary'
                                      : 'text-outline'
                              }`}
                            >
                              {row.metric}
                            </span>
                            <span className="font-label-sm text-[10px] text-outline">{row.metricSub}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col min-w-[130px]">
                            <span className="font-label-sm text-label-sm font-medium text-on-surface">
                              {row.sensor}
                            </span>
                            <span className="font-label-sm text-[10px] text-outline">{row.sensorSub}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-body-sm text-body-sm text-on-surface whitespace-nowrap">
                            {row.officer}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(row.id);
                            }}
                            className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors whitespace-nowrap ${
                              isSelected
                                ? 'bg-primary text-on-primary hover:bg-primary-container shadow-sm'
                                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                            }`}
                          >
                            {row.actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-space-md bg-surface-container-low flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                <span>Showing {filteredRows.length} of 28 Active Alerts across 6 NHAI Zones</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm"
                >
                  1
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  2
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  3
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Sensor Triangulation Health
                </span>
                <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-code-md text-[10px]">
                  99.4% UPTIME
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                ISRO Cartosat-3 and Copernicus Sentinel SAR temporal alignment across high-risk civil packages.
              </p>
            </div>
            <div className="flex items-center gap-space-lg shrink-0">
              <div className="flex flex-col items-center">
                <svg className="w-24 h-12" viewBox="0 0 100 45">
                  <path
                    className="text-error"
                    d="M 5,40 Q 25,5 50,25 T 95,10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <circle className="text-error fill-current" cx="50" cy="25" r="4" />
                  <circle className="text-primary fill-current" cx="95" cy="10" r="4" />
                </svg>
                <span className="font-code-md text-[10px] text-outline">Radar Variance</span>
              </div>
              <div className="h-8 w-px bg-surface-container" />
              <div className="space-y-0.5">
                <div className="font-code-md text-code-md text-on-surface font-semibold">14 Orbital Passes</div>
                <div className="font-label-sm text-label-sm text-outline">Scheduled in next 48h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Detail Inspection Drawer (Right 5 cols) */}
        <div className="xl:col-span-5 flex flex-col space-y-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col space-y-space-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-error" />

            <div className="flex items-start justify-between gap-space-sm pt-1">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-md text-label-sm font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error" />
                    ACTIVE DOSSIER
                  </span>
                  <span className="font-code-md text-label-sm text-outline">FLAGGED BY ALGORITHM S-28</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                  Alert Dossier: {activeAlert.id}
                </h2>
                <div className="font-body-sm text-body-sm text-error font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">report_problem</span>
                  <span>
                    {activeAlert.category} ({activeAlert.metric})
                  </span>
                </div>
              </div>
              <Link
                to="/evidence"
                title="Open in Satellite Evidence"
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low p-space-md rounded-xl">
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Discrepancy Spread
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-lg text-headline-lg font-bold text-error tracking-tight">
                    {activeAlert.metric}
                  </span>
                  <span className="font-label-sm text-[10px] text-error font-medium">{activeAlert.metricSub}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Financial Exposure
                </span>
                <div className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                  {activeAlert.exposure}
                </div>
                <span className="font-label-sm text-[10px] text-on-surface-variant font-code-md">
                  IPC #14 Claim Submitted
                </span>
              </div>
              <div className="col-span-2 pt-2 space-y-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  EPC Contractor Consortium
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {activeAlert.contractor}
                  </span>
                  <span className="font-code-md text-code-md text-primary bg-primary-fixed/40 px-2 py-0.5 rounded">
                    {activeAlert.vendorId}
                  </span>
                </div>
              </div>
              <div className="col-span-2 pt-2 space-y-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Flagged Milestone &amp; Physical Deviation
                </span>
                <div className="p-2.5 rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm">
                  <div className="font-semibold text-error mb-0.5">{activeAlert.flaggedTitle}</div>
                  <p className="text-on-surface-variant text-[12px] leading-relaxed">{activeAlert.flaggedDesc}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 font-label-sm text-label-sm">
                <span className="text-outline uppercase tracking-wider">Satellite Evidence Frame</span>
                <span className="font-code-md text-primary">{activeAlert.coords}</span>
              </div>
              <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-inner group">
                <img
                  alt="Satellite evidence frame"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={EVIDENCE_FRAME_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-inverse-surface/80 text-inverse-on-surface font-code-md text-[10px]">
                      CARTOSAT-3 0.5M PAN
                    </span>
                    <span className="px-2 py-0.5 rounded bg-error/90 text-on-error font-code-md text-[10px] font-bold">
                      ANOMALY ZONE M4-B
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-inverse-on-surface font-code-md text-[11px]">
                    <span>RESOL: 0.52m GSD</span>
                    <span>SUN ELEV: 58.4°</span>
                    <span className="text-tertiary-fixed font-bold">DELTA ZERO DETECTED</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full border border-dashed border-error/80 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-error" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Independent Cross-Verification Trace
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low font-code-md text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">check_circle</span>
                    <span className="text-on-surface">Sentinel-1 InSAR Coherence</span>
                  </div>
                  <span className="text-error font-bold">Δ = 0.04 (Inactive)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-container-low font-code-md text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">check_circle</span>
                    <span className="text-on-surface">Cartosat-3 Shadow Pier Height Calc</span>
                  </div>
                  <span className="text-error font-bold">H = 0.0m (Zero Superstr.)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Statutory Escalation Workflow
              </span>
              <button
                type="button"
                onClick={() => setNoticeModalOpen(true)}
                className="w-full py-2.5 px-space-md rounded-lg bg-error hover:bg-error/90 text-on-error font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                <span>Dispatch Section 14 Explanation Notice to EPC</span>
              </button>
              <button
                type="button"
                onClick={() => setJpvCommissioned(true)}
                className="w-full py-2 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  {jpvCommissioned ? 'check_circle' : 'group_work'}
                </span>
                <span>
                  {jpvCommissioned
                    ? 'JPV Team 04 Commissioned'
                    : 'Recommend Joint Physical Verification (JPV)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEscrowFrozen((prev) => !prev)}
                className={`w-full py-2 px-space-md rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 transition-colors ${
                  escrowFrozen
                    ? 'bg-error text-on-error'
                    : 'bg-surface-container-low hover:bg-surface-container text-error'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>
                  {escrowFrozen
                    ? 'Escrow Freezing ACTIVE (Disallowance In Place)'
                    : 'Escrow Freezing Protocol (IPC #14 Disallowance)'}
                </span>
              </button>
            </div>

            <div className="pt-2 border-t-0 bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>
                  Assigned Officer: <strong className="text-on-surface">{activeAlert.officer}</strong>
                </span>
              </div>
              <span className="font-code-md text-outline">REV-LOG #99214-B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal: Statutory Notice Dispatch Confirmation */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm transition-opacity">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-2xl p-space-lg space-y-space-md mx-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Dispatch Statutory Section 14 Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNoticeModalOpen(false)}
                className="text-outline hover:text-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-space-md bg-surface-container-low rounded-lg space-y-2">
              <div className="flex justify-between font-label-sm text-label-sm gap-2">
                <span className="text-outline">TARGET RECIPIENT:</span>
                <span className="font-code-md text-on-surface font-bold text-right">
                  {activeAlert.contractor} (CEO &amp; Project Dir)
                </span>
              </div>
              <div className="flex justify-between font-label-sm text-label-sm gap-2">
                <span className="text-outline">STATUTORY REGULATION:</span>
                <span className="font-code-md text-on-surface text-right">
                  NHAI Works Manual Sec 14.2 (Civil Audit)
                </span>
              </div>
              <div className="flex justify-between font-label-sm text-label-sm gap-2">
                <span className="text-outline">EVIDENCE BUNDLE:</span>
                <span className="font-code-md text-primary text-right">
                  {activeAlert.id}-DOSSIER.pdf (6.4 MB)
                </span>
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              This UI prototype simulates formal dispatch of a verification request for {activeAlert.exposure} under
              Milestone 14 until a physical joint inspection team reviews the corridor.
            </p>

            <div className="flex items-center justify-end gap-space-sm pt-2">
              <button
                type="button"
                onClick={() => setNoticeModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
              >
                Cancel &amp; Review
              </button>
              <button
                type="button"
                onClick={handleConfirmNotice}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-label-lg text-label-lg font-semibold hover:bg-error/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    noticeStatus === 'sending' ? 'animate-spin' : ''
                  }`}
                >
                  {noticeStatus === 'sending'
                    ? 'progress_activity'
                    : noticeStatus === 'sent'
                      ? 'check'
                      : 'send'}
                </span>
                <span>
                  {noticeStatus === 'sending'
                    ? 'Simulating Dispatch...'
                    : noticeStatus === 'sent'
                      ? 'Dispatched (Demo)'
                      : 'Execute & Issue Section 14 Notice'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
