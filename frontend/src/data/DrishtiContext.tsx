import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ProjectRecord {
  project_id: string;
  project_name?: string;
  name?: string;
  sector?: string;
  ministry?: string;
  corridor_type?: string;
  agency?: string;
  state?: string;
  total_length_km?: number;
  budget_cr?: number;
  sanctioned_cost_inr?: number;
  latest_cost_inr?: number;
  spend_to_date_inr?: number;
  reported_progress_pct?: number;
  data_classification: 'real' | 'synthetic' | string;
  is_synthetic: boolean;
  segment_count?: number;
  not_assessable_count?: number;
  avg_activity_index?: number;
  avg_spend_pct?: number;
  avg_reported_pct?: number;
  avg_spend_vs_activity_ratio?: number;
  backtest_outcome?: string | null;
  lead_time_days?: number | null;
  note?: string;
}

export interface SegmentRecord {
  segment_id: string;
  project_id: string;
  corridor_name?: string;
  km_start?: number;
  km_end?: number;
  length_km?: number;
  geometry_type?: string;
  is_tunnel?: boolean;
  geometry: {
    type: string;
    coordinates: number[][] | number[][][];
  };
  latest_observed_at: string;
  activity_index: number | null;
  activity_confidence: number | null;
  spend_to_date_pct: number | null;
  reported_progress_pct: number | null;
  spend_vs_activity_ratio: number | null;
  activity_reporting_divergence: number | null;
  is_assessable: boolean;
  analysis_status: string;
  delay_risk_score: number;
  ml_delay_probability: number;
  alert_triggered: boolean;
}

export interface TimelineSegmentSnapshot {
  segment_id: string;
  project_id: string;
  activity_index: number | null;
  spend_to_date_pct: number | null;
  reported_progress_pct: number | null;
  spend_vs_activity_ratio: number | null;
  divergence: number | null;
  is_assessable: boolean;
  status: string;
  delay_risk_score: number;
  alert_triggered: boolean;
}

export interface TimelineFrame {
  observed_at: string;
  segments: TimelineSegmentSnapshot[];
}

export interface AlertRecord {
  alert_id: string;
  alert_type: string;
  severity: 'high' | 'medium' | 'low' | string;
  segment_id: string;
  observed_at: string;
  recommended_action: string;
  responsible_use: string;
  risk: {
    delay_risk_score?: number;
    risk_score?: number;
    ml_delay_probability?: number;
    score_components?: Record<string, number>;
    confidence?: number;
    state?: string;
  };
  analysis: {
    status?: string;
    state?: string;
    spend_to_date_pct: number;
    reported_progress_pct: number;
    spend_vs_activity_ratio?: number;
    activity_reporting_divergence: number;
    stall_duration_days?: number;
    observability?: string;
    rainfall_mm?: number;
    rainfall_confounded?: boolean;
    reasons?: string[];
  };
  activity: {
    activity_index: number | null;
    confidence: number | null;
    model_version?: string;
    components?: Array<{
      name: string;
      raw_value: number;
      normalized_value: number;
      configured_weight: number;
      contribution: number;
    }>;
  };
  segment: {
    project_id?: string;
    corridor_name?: string;
    km_start?: number;
    km_end?: number;
    properties?: {
      project_id?: string;
      start_m?: number;
      end_m?: number;
      observability?: string;
    };
  };
  data_classification: string;
  evidence_sha256: string;
  pdf_url?: string;
  html_url?: string;
  manifest_url?: string;
  chip_urls?: string[];
}

export const alertProjectId = (alert: AlertRecord) =>
  alert.segment?.project_id ?? alert.segment?.properties?.project_id;

export interface TrackCEvent {
  event_id: string;
  event_type: string;
  target_infrastructure: string;
  latitude: number;
  longitude: number;
  affected_area_m2: number;
  detected_pixels: number;
  protected_zone_pixels: number;
  mask_source: string;
  first_observed: string;
  last_verified: string;
  severity: string;
  data_classification: string;
  source_scenes: string[];
  source_hashes: Record<string, string>;
  evidence_description: string;
  recommended_action: string;
  evidence_chip_path: string;
  chip_url?: string;
  audit_hash: string;
}

export interface MLSummary {
  model_type: string;
  training_samples: number;
  positive_samples: number;
  cutoff_date: string;
  calibration_method: string;
  brier_score: number;
  monotonic_constraints: Record<string, number>;
  feature_importances: Record<string, number>;
  cusum_nh544g_bsi_breaks: {
    baseline_mean: number;
    baseline_std: number;
    upward_break_index: number | null;
    downward_break_index: number | null;
    cusum_pos: number[];
    cusum_neg: number[];
  };
  predictions: Array<{
    segment_id: string;
    project_id: string;
    observed_at: string;
    ml_delay_probability: number;
  }>;
}

export interface BacktestCase {
  case_id: string;
  segment_id: string;
  project_id: string;
  official_delay_date: string | null;
  first_alert_date: string | null;
  lead_time_days: number | null;
  outcome: string;
  eligible_observation_count?: number;
  source_url?: string;
  data_classification?: string;
}

export interface EvaluationMetrics {
  sample_count: number;
  confusion_matrix: { tp: number; fp: number; tn: number; fn: number };
  precision: number;
  recall: number;
  f1_score: number;
  false_alerts_on_negative_controls: number;
  not_assessable_percentage: number;
}

export interface WeightSensitivity {
  baseline_weights: Record<string, number>;
  sample_size: number;
  overall_stability: number;
  rationale: string;
  component_analysis: Record<string, { mean: number; std: number }>;
}

export interface ChipEpoch {
  date: string;
  rgb_url?: string;
  falsecolor_url?: string;
}

export interface DrishtiBundle {
  schema_version: string;
  generated_at: string;
  data_classification: string;
  latest_observed_at: string;
  timeline_dates: string[];
  projects: ProjectRecord[];
  segments: SegmentRecord[];
  timeline_frames: TimelineFrame[];
  alerts: AlertRecord[];
  alerts_summary: Record<string, unknown>;
  track_c_events: TrackCEvent[];
  ml_summary: MLSummary;
  backtest: {
    method: string;
    alert_threshold: number;
    cases: BacktestCase[];
    summary: Record<string, unknown>;
  };
  evaluation_metrics: EvaluationMetrics;
  weight_sensitivity: WeightSensitivity;
  quality_summary: Record<string, number>;
  scenes: Array<Record<string, unknown>>;
  chips_by_project: Record<string, ChipEpoch[]>;
  audit_files: Record<string, string>;
  layer12_roi: {
    is_illustrative?: boolean;
    assumption_note?: string;
    addressable_projects: number;
    capex_lakh_cr: number;
    cost_overrun_lakh_cr: number;
    delayed_projects: number;
    annual_platform_cost_cr: number;
    roi_multiple: string;
    value_drivers: string[];
    target_agencies: string[];
  };
}

export interface DispatchState {
  status: 'Dispatched' | 'Verified';
  timestamp: string;
  team: string;
}

interface DrishtiContextValue {
  data: DrishtiBundle | null;
  loading: boolean;
  error: string | null;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeDateIndex: number;
  setActiveDateIndex: (idx: number) => void;
  dispatchedSegments: Record<string, DispatchState>;
  dispatchVerification: (segmentId: string, team?: string) => void;
  markVerified: (segmentId: string) => void;
  resetDispatch: (segmentId: string) => void;
}

const DrishtiContext = createContext<DrishtiContextValue | undefined>(undefined);
const DISPATCH_STORAGE_KEY = 'drishti_dispatched_segments_v1';
const API_BASE_URL = String(import.meta.env.VITE_DRISHTI_API_BASE ?? '').replace(/\/$/, '');
const DATA_SOURCE_URL = API_BASE_URL ? `${API_BASE_URL}/bundle` : '/drishti_bundle.json';

export const DrishtiDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DrishtiBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [activeDateIndex, setActiveDateIndex] = useState<number>(0);
  const [dispatchedSegments, setDispatchedSegments] = useState<Record<string, DispatchState>>(() => {
    try {
      const raw = localStorage.getItem(DISPATCH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let cancelled = false;
    fetch(DATA_SOURCE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} loading Drishti data from ${DATA_SOURCE_URL}`);
        return res.json();
      })
      .then((bundle: DrishtiBundle) => {
        if (cancelled) return;
        setData(bundle);
        setActiveDateIndex(Math.max(0, (bundle.timeline_dates?.length ?? 1) - 1));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load Drishti data bundle');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistDispatches = (next: Record<string, DispatchState>) => {
    setDispatchedSegments(next);
    try {
      localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  };

  const dispatchVerification = (segmentId: string, team = 'PIU / JPV Field Cell') => {
    persistDispatches({
      ...dispatchedSegments,
      [segmentId]: {
        status: 'Dispatched',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
        team,
      },
    });
  };

  const markVerified = (segmentId: string) => {
    const existing = dispatchedSegments[segmentId];
    persistDispatches({
      ...dispatchedSegments,
      [segmentId]: {
        status: 'Verified',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
        team: existing?.team ?? 'PIU / JPV Field Cell',
      },
    });
  };

  const resetDispatch = (segmentId: string) => {
    const next = { ...dispatchedSegments };
    delete next[segmentId];
    persistDispatches(next);
  };

  return (
    <DrishtiContext.Provider
      value={{
        data,
        loading,
        error,
        selectedProjectId,
        setSelectedProjectId,
        activeDateIndex,
        setActiveDateIndex,
        dispatchedSegments,
        dispatchVerification,
        markVerified,
        resetDispatch,
      }}
    >
      {children}
    </DrishtiContext.Provider>
  );
};

export function useDrishtiData(): DrishtiContextValue {
  const ctx = useContext(DrishtiContext);
  if (!ctx) {
    throw new Error('useDrishtiData must be used inside DrishtiDataProvider');
  }
  return ctx;
}
