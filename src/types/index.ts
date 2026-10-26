export interface SettlementPeriodData {
  start_time: string;
  settlement_date: string;
  settlement_period: number;
  time_label: string;
  actual_mw: number | null;
  forecast_mw: number | null;
  error_mw: number | null;
  abs_error_mw: number | null;
  publish_time: string | null;
}

export interface MetricsSummary {
  sample_count: number;
  mae_mw: number;
  rmse_mw: number;
  wape_percent: number;
  safe_mape_percent: number;
  mbe_mw: number;
  nmae_percent: number;
  total_actual_mwh: number;
  total_forecast_mwh: number;
  p10_error_mw: number;
  p50_error_mw: number;
  p90_error_mw: number;
  max_overforecast_mw: number;
  max_underforecast_mw: number;
}

export interface DiurnalMetric {
  settlement_period: number;
  time_label: string;
  sample_count: number;
  mae_mw: number;
  rmse_mw: number;
  mbe_mw: number;
  mean_actual_mw: number;
  mean_forecast_mw: number;
}

export interface ErrorDistributionBin {
  bin_label: string;
  min_val: number;
  max_val: number;
  count: number;
  percentage: number;
}

export interface ForecastResponse {
  status: string;
  date_from: string;
  date_to: string;
  decision_cutoff_type: string;
  metrics: MetricsSummary;
  diurnal_metrics: DiurnalMetric[];
  distribution: ErrorDistributionBin[];
  time_series: SettlementPeriodData[];
}

export interface ProcurementPoint {
  start_time: string;
  settlement_date: string;
  settlement_period: number;
  time_label: string;
  demand_mw: number;
  wind_forecast_mw: number;
  wind_actual_mw: number | null;
  net_procurement_need_mw: number;
  suggested_buffer_mw: number;
  total_procured_mw: number;
  imbalance_mw: number | null;
}

export interface ProcurementSummary {
  total_demand_mwh: number;
  wind_covered_mwh: number;
  thermal_procured_mwh: number;
  wind_penetration_percent: number;
  recommended_buffer_mwh: number;
  net_imbalance_mwh: number | null;
}

export interface ProcurementResponse {
  status: string;
  assumed_demand_mw: number;
  risk_confidence: string;
  summary: ProcurementSummary;
  schedule: ProcurementPoint[];
}

export interface CacheStatus {
  is_cached: boolean;
  fuelhh_wind_count: number;
  windfor_count: number;
  min_settlement_date: string | null;
  max_settlement_date: string | null;
  db_size_bytes: number;
}
