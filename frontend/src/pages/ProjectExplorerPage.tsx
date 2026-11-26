import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { alertProjectId, ProjectRecord, SegmentRecord, useDrishtiData } from '../data/DrishtiContext';

type ClassificationFilter = 'all' | 'real' | 'synthetic';

const statusColor = (segment: SegmentRecord) => {
  if (!segment.is_assessable) return '#64748b';
  if (segment.alert_triggered || ['stall_candidate', 'stalled_or_high_divergence'].includes(segment.analysis_status)) {
    return '#ba1a1a';
  }
  if (segment.analysis_status === 'slowing') return '#eaa638';
  return '#008280';
};

const lineCoordinates = (segment: SegmentRecord): number[][] => {
  const collect = (value: unknown): number[][] => {
    if (!Array.isArray(value)) return [];
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      return [value as number[]];
    }
    return value.flatMap(collect);
  };
  return collect(segment.geometry?.coordinates);
};

const projectName = (project: ProjectRecord) => project.project_name ?? project.name ?? project.project_id;
const projectAgency = (project: ProjectRecord) => project.agency ?? project.ministry ?? 'Agency unavailable';
const projectBudgetCr = (project: ProjectRecord) =>
  project.budget_cr ?? (project.latest_cost_inr !== undefined ? project.latest_cost_inr / 10_000_000 : 0);

const displayPercent = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value) ? '—' : `${value.toFixed(1)}%`;

const riskLabel = (segments: SegmentRecord[]) => {
  if (segments.some((segment) => segment.alert_triggered)) return 'Priority verification';
  if (segments.some((segment) => !segment.is_assessable)) return 'Mixed observability';
  return 'Routine monitoring';
};

export const ProjectExplorerPage: React.FC = () => {
  const { data, loading, error, selectedProjectId, setSelectedProjectId } = useDrishtiData();
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState<ClassificationFilter>('real');
  const [showSatellite, setShowSatellite] = useState(true);
  const [showSegments, setShowSegments] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.projects ?? [])
      .filter((project) => {
        if (classification === 'real' && project.is_synthetic) return false;
        if (classification === 'synthetic' && !project.is_synthetic) return false;
        return (
          !query ||
          `${project.project_id} ${projectName(project)} ${projectAgency(project)} ${project.state ?? ''} ${project.sector ?? ''}`
            .toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => Number(a.is_synthetic) - Number(b.is_synthetic));
  }, [classification, data, search]);

  const realProjects = data?.projects.filter((project) => !project.is_synthetic) ?? [];
  const selectedProject =
    data?.projects.find((project) => project.project_id === selectedProjectId) ?? realProjects[0] ?? data?.projects[0];
  const selectedSegments = data?.segments.filter((segment) => segment.project_id === selectedProject?.project_id) ?? [];
  const selectedAlerts =
    data?.alerts.filter((alert) => alertProjectId(alert) === selectedProject?.project_id) ?? [];
  const latestChip = selectedProject
    ? data?.chips_by_project[selectedProject.project_id]?.slice(-1)[0]
    : undefined;

  const mapModel = useMemo(() => {
    const points = selectedSegments.flatMap(lineCoordinates).filter((point) => point.length >= 2);
    if (points.length === 0) return { paths: [] as Array<{ segment: SegmentRecord; points: string }>, center: null };
    const lons = points.map((point) => point[0]);
    const lats = points.map((point) => point[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const lonSpan = Math.max(maxLon - minLon, 0.001);
    const latSpan = Math.max(maxLat - minLat, 0.001);
    const project = ([lon, lat]: number[]) => {
      const x = 50 + ((lon - minLon) / lonSpan) * 700;
      const y = 550 - ((lat - minLat) / latSpan) * 500;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    };
    return {
      paths: selectedSegments.map((segment) => ({ segment, points: lineCoordinates(segment).map(project).join(' ') })),
      center: { lon: (minLon + maxLon) / 2, lat: (minLat + maxLat) / 2 },
    };
  }, [selectedSegments]);

  if (loading) return <div className="p-space-xl text-on-surface-variant">Loading geospatial explorer...</div>;
  if (error || !data || !selectedProject) {
    return <div className="p-space-xl text-error">Unable to load project explorer: {error ?? 'No project data'}</div>;
  }

  const averageDivergence =
    selectedSegments.length > 0
      ? selectedSegments.reduce((sum, segment) => sum + (segment.activity_reporting_divergence ?? 0), 0) /
        selectedSegments.length
      : 0;
  const budgetCr = projectBudgetCr(selectedProject);
  const spendPct = selectedProject.avg_spend_pct ?? 0;
  const reportedPct = selectedProject.avg_reported_pct ?? 0;
  const disbursedCr = selectedProject.spend_to_date_inr !== undefined
    ? selectedProject.spend_to_date_inr / 10_000_000
    : budgetCr * (spendPct / 100);
  const assessable = selectedSegments.filter((segment) => segment.is_assessable).length;
  const active = selectedSegments.filter(
    (segment) => segment.is_assessable && !segment.alert_triggered && segment.analysis_status !== 'slowing'
  ).length;
  const slowing = selectedSegments.filter(
    (segment) => segment.is_assessable && (segment.alert_triggered || segment.analysis_status === 'slowing')
  ).length;
  const notAssessable = selectedSegments.length - assessable;
  const highestRisk = [...selectedSegments].sort((a, b) => b.delay_risk_score - a.delay_risk_score)[0];

  return (
    <div className="space-y-space-lg">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-on-surface-variant">
            <span>Intelligence</span><span>/</span><span className="font-semibold text-primary">Project Explorer</span>
            <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-mono">
              {realProjects.length} REAL CORRIDORS · {data.segments.length} SEGMENTS
            </span>
          </div>
          <h1 className="mt-1 font-headline-lg text-2xl font-bold text-on-surface">Geospatial Project Explorer</h1>
          <p className="text-xs text-on-surface-variant">
            Real OSM corridor geometry, Sentinel observations and verification-priority metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/reports" className="px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-xs font-medium">
            <span className="material-symbols-outlined text-[15px] align-middle mr-1">polyline</span>Export GeoJSON
          </Link>
          <Link to="/evidence" className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px] align-middle mr-1">satellite_alt</span>Open EO Evidence
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        <aside className="xl:col-span-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-space-md space-y-space-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[17px]">search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search corridor, agency, state..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-outline mb-2">Portfolio filter</div>
            <div className="flex gap-1.5">
              {(['real', 'all', 'synthetic'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setClassification(filter)}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-semibold ${classification === filter ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredProjects.map((project) => {
              const projectSegments = data.segments.filter((segment) => segment.project_id === project.project_id);
              const selected = project.project_id === selectedProject.project_id;
              return (
                <button
                  key={project.project_id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.project_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selected ? 'bg-primary-fixed/20 border-primary/50 shadow-sm' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40'}`}
                >
                  <div className="flex justify-between gap-2 items-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${project.is_synthetic ? 'bg-surface-container-high text-on-surface-variant' : projectSegments.some((segment) => segment.alert_triggered) ? 'bg-error-container text-error' : 'bg-tertiary-fixed/40 text-tertiary'}`}>
                      {project.is_synthetic ? 'Synthetic benchmark' : riskLabel(projectSegments)}
                    </span>
                    <span className="text-[9px] font-mono text-outline">{project.project_id}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-on-surface leading-tight">{projectName(project)}</h3>
                  <p className="mt-0.5 text-[11px] text-on-surface-variant">{projectAgency(project)} · {project.state ?? project.sector ?? 'India'}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-2 text-[10px]">
                    <div><span className="block uppercase text-outline">Budget</span><strong className="font-mono">{projectBudgetCr(project) ? `₹${projectBudgetCr(project).toLocaleString(undefined, { maximumFractionDigits: 1 })} Cr` : 'Portfolio only'}</strong></div>
                    <div><span className="block uppercase text-outline">Latest EO</span><strong className="font-mono text-primary">{projectSegments[0]?.latest_observed_at?.slice(0, 10) ?? '—'}</strong></div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px]"><span>SAI / Reported</span><strong className="font-mono">{displayPercent(project.avg_activity_index)} / {displayPercent(project.avg_reported_pct)}</strong></div>
                    <div className="mt-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, project.avg_activity_index ?? 0)}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredProjects.length === 0 && <p className="py-8 text-center text-xs text-outline">No matching projects.</p>}
          </div>
        </aside>

        <div className="xl:col-span-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-1 rounded bg-surface-container-low text-on-surface">
                <span className="material-symbols-outlined text-[13px] align-middle text-primary mr-1">my_location</span>
                {mapModel.center ? `${mapModel.center.lat.toFixed(4)}° N, ${mapModel.center.lon.toFixed(4)}° E` : 'No spatial geometry'}
              </span>
              <span className="hidden sm:inline px-2 py-1 rounded bg-surface-container-low text-on-surface-variant">OSM · WGS84 · 1 km segments</span>
            </div>
            <Link to="/evidence" className="px-2 py-1 rounded bg-surface-container-high text-primary text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">compare</span>Compare epochs
            </Link>
          </div>
          <div className="px-3 py-2 bg-surface-container-low flex flex-wrap gap-2 text-[10px]">
            <span className="uppercase tracking-wider text-outline font-semibold mr-1">Active overlays:</span>
            {[
              ['Satellite EO', showSatellite, setShowSatellite],
              ['OSM Segments', showSegments, setShowSegments],
              ['Alerts', showAlerts, setShowAlerts],
            ].map(([label, checked, setter]) => (
              <label key={String(label)} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-lowest cursor-pointer">
                <input type="checkbox" checked={Boolean(checked)} onChange={(event) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)} />
                {String(label)}
              </label>
            ))}
          </div>
          <div className="relative h-[610px] bg-[#dbe8e6] overflow-hidden">
            {showSatellite && latestChip?.rgb_url ? (
              <img src={latestChip.rgb_url} alt={`Latest Sentinel observation for ${projectName(selectedProject)}`} className="absolute inset-0 w-full h-full object-cover opacity-55 saturate-75" />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#d8e8e4_25%,#eef4ef_25%,#eef4ef_50%,#d8e8e4_50%,#d8e8e4_75%,#eef4ef_75%)] bg-[length:36px_36px]" />
            )}
            <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
              <defs>
                <filter id="route-shadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.45" /></filter>
              </defs>
              {showSegments && mapModel.paths.map(({ segment, points }) => (
                points && <polyline key={segment.segment_id} points={points} fill="none" stroke={statusColor(segment)} strokeWidth={segment.alert_triggered ? 8 : 6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={!segment.is_assessable ? '9 6' : undefined} filter="url(#route-shadow)" />
              ))}
            </svg>
            {showAlerts && highestRisk && highestRisk.alert_triggered && (
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[min(88%,330px)] bg-surface-container-lowest/95 backdrop-blur rounded-lg shadow-xl border-l-4 border-error p-3">
                <div className="flex justify-between text-[9px] uppercase font-bold text-error"><span>Verification priority</span><span className="font-mono">{highestRisk.segment_id}</span></div>
                <h3 className="mt-1 text-sm font-bold">Highest-risk corridor segment</h3>
                <p className="mt-1 text-[11px] text-on-surface-variant">Risk {(highestRisk.delay_risk_score * 100).toFixed(1)}% · SAI {displayPercent(highestRisk.activity_index)} · Spend {displayPercent(highestRisk.spend_to_date_pct)}</p>
                <div className="mt-2 pt-2 border-t border-outline-variant/30 flex justify-between text-[10px]"><span>Reported {displayPercent(highestRisk.reported_progress_pct)}</span><strong className="text-error">{highestRisk.analysis_status.replace(/_/g, ' ')}</strong></div>
              </div>
            )}
            <div className="absolute right-4 top-4 rounded-lg bg-surface-container-lowest/90 shadow p-2 text-center text-primary"><div className="text-[10px] font-bold">N</div><span className="material-symbols-outlined text-[18px]">navigation</span></div>
            <div className="absolute left-4 bottom-4 rounded-lg bg-surface-container-lowest/92 backdrop-blur shadow-md p-3 text-[10px]">
              <div className="font-bold uppercase tracking-wider mb-2">Real-data legend</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {[['#008280','Active / stable'],['#eaa638','Slowing'],['#ba1a1a','Alert triggered'],['#64748b','Not assessable']].map(([color,label]) => <div key={label} className="flex items-center gap-1.5"><span className="w-3 h-1 rounded" style={{backgroundColor: color}} /><span>{label}</span></div>)}
              </div>
            </div>
          </div>
          <div className="p-3 bg-surface-container-low flex flex-wrap justify-between gap-2 text-[10px] text-on-surface-variant">
            <span><span className="inline-block w-2 h-2 rounded-full bg-tertiary mr-1" />Real bundle sync: <strong className="text-on-surface">Sentinel-1/2 + OSM</strong></span>
            <span>Latest: <strong className="font-mono text-on-surface">{selectedSegments[0]?.latest_observed_at?.slice(0, 10) ?? data.latest_observed_at.slice(0, 10)}</strong></span>
          </div>
        </div>

        <aside className="xl:col-span-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm p-space-md space-y-space-md">
          <div className="pb-3 border-b border-outline-variant/30">
            <div className="flex justify-between gap-2 items-center">
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-mono text-[10px] font-bold">{selectedProject.project_id}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${selectedAlerts.length ? 'bg-error-container text-error' : 'bg-tertiary-fixed/40 text-tertiary'}`}>{selectedAlerts.length ? `${selectedAlerts.length} alerts` : 'No active alert'}</span>
            </div>
            <h2 className="mt-2 text-base font-bold leading-tight text-on-surface">{projectName(selectedProject)}</h2>
            <p className="mt-1 text-[11px] text-on-surface-variant">{projectAgency(selectedProject)} · {selectedProject.state ?? selectedProject.sector ?? 'India'}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-surface-container-low"><span className="block text-[9px] uppercase text-outline">Latest budget</span><strong className="block mt-1 font-mono text-sm">{budgetCr ? `₹${budgetCr.toLocaleString()} Cr` : '—'}</strong><span className="text-[9px] text-on-surface-variant">Registry value</span></div>
            <div className="p-3 rounded-lg bg-surface-container-low"><span className="block text-[9px] uppercase text-outline">Estimated spent</span><strong className="block mt-1 font-mono text-sm text-primary">{budgetCr ? `₹${disbursedCr.toFixed(1)} Cr` : '—'}</strong><span className="text-[9px] text-primary">{spendPct.toFixed(1)}% of budget</span></div>
          </div>
          <div className="p-3 rounded-lg bg-surface-container-low space-y-3">
            <div className="flex justify-between text-[10px] uppercase font-semibold"><span>Reported vs observable activity</span><span className={averageDivergence < 0 ? 'text-error' : 'text-tertiary'}>{averageDivergence >= 0 ? '+' : ''}{averageDivergence.toFixed(1)} avg divergence</span></div>
            <div><div className="flex justify-between text-[10px]"><span>Reported DPR progress</span><strong>{reportedPct.toFixed(1)}%</strong></div><div className="mt-1 h-2 rounded-full bg-surface-container overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{width:`${Math.min(100,reportedPct)}%`}} /></div></div>
            <div><div className="flex justify-between text-[10px]"><span>Satellite Activity Index</span><strong className="text-primary">{(selectedProject.avg_activity_index ?? 0).toFixed(1)}</strong></div><div className="mt-1 h-2 rounded-full bg-surface-container overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${Math.min(100,selectedProject.avg_activity_index ?? 0)}%`}} /></div></div>
            <p className="p-2 rounded bg-surface-container-lowest text-[9px] text-on-surface-variant"><span className="material-symbols-outlined text-[13px] text-primary align-middle mr-1">info</span>SAI is observable surface activity, not engineering completion.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div><span className="block uppercase text-outline">Back-test</span><strong className="font-mono">{selectedProject.lead_time_days ? `${selectedProject.lead_time_days}d lead` : selectedProject.backtest_outcome ?? '—'}</strong></div>
            <div><span className="block uppercase text-outline">EO feed</span><strong>Sentinel-1/2</strong><span className="block text-outline">OSM alignment</span></div>
          </div>
          <div className="pt-3 border-t border-outline-variant/30">
            <div className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">Corridor segment status</div>
            <div className="space-y-1.5 text-[10px]">
              {[
                ['check_circle','Active / stable',active,'text-tertiary'],
                ['warning','Slowing / alert',slowing,'text-error'],
                ['visibility','EO assessable',assessable,'text-primary'],
                ['block','Not assessable',notAssessable,'text-outline'],
              ].map(([icon,label,count,color]) => <div key={String(label)} className="flex items-center justify-between p-2 rounded bg-surface-container-low"><span className="flex items-center gap-1.5"><span className={`material-symbols-outlined text-[14px] ${color}`}>{icon}</span>{label}</span><strong className="font-mono">{count}</strong></div>)}
            </div>
          </div>
          <div className="pt-3 border-t border-outline-variant/30 space-y-2">
            <Link to="/evidence" className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold">Open Satellite Evidence <span className="material-symbols-outlined text-[15px]">arrow_forward</span></Link>
            <Link to="/milestones" className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-surface-container text-on-surface text-xs font-medium">Open Back-test &amp; Milestones</Link>
          </div>
        </aside>
      </section>
    </div>
  );
};
