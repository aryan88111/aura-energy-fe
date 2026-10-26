import type { ForecastResponse, CacheStatus } from '../types';

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://localhost:5050/api';
const API_BASE = rawBase.replace(/\/+$/, '');

export async function fetchForecastData(
  dateFrom: string,
  dateTo: string,
  decisionCutoff: string = 'day_ahead_gate_closure',
  customHour: number = 11
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
    decision_cutoff: decisionCutoff,
    custom_cutoff_hour: customHour.toString(),
  });

  const res = await fetch(`${API_BASE}/forecasts?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch forecasts' }));
    throw new Error(err.detail || 'Network error fetching forecast data');
  }
  return res.json();
}

export async function fetchCacheStatus(): Promise<CacheStatus> {
  const res = await fetch(`${API_BASE}/data/status`);
  if (!res.ok) {
    throw new Error('Failed to fetch cache status');
  }
  return res.json();
}

export function getExportUrl(dateFrom: string, dateTo: string, decisionCutoff: string): string {
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
    decision_cutoff: decisionCutoff,
  });
  return `${API_BASE}/export?${params.toString()}`;
}
