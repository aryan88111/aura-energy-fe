import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
  Cell
} from 'recharts';
import type { DiurnalMetric, ErrorDistributionBin, MetricsSummary } from '../types';
import { AlertCircle, BarChart3, TrendingUp, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

interface ErrorAnalyticsProps {
  diurnal: DiurnalMetric[];
  distribution: ErrorDistributionBin[];
  metrics: MetricsSummary | null;
}

export const ErrorAnalytics: React.FC<ErrorAnalyticsProps> = ({ diurnal, distribution, metrics }) => {
  if (!metrics || diurnal.length === 0) {
    return (
      <div className="warm-card" style={{ padding: 48, textAlign: 'center', color: '#71717a' }}>
        No analytical data available for this range.
      </div>
    );
  }

  // Find worst diurnal settlement period
  const worstDiurnalPeriod = [...diurnal].sort((a, b) => b.mae_mw - a.mae_mw)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Diurnal Error Profile Card */}
      <div className="warm-card" style={{ padding: 26 }}>
        <div className="card-header-row" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={20} color="#f59e0b" />
              </div>
              <h3 className="card-title-text">
                Diurnal Error Profile by Settlement Period (1 to 48)
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4, marginLeft: 46 }}>
              Quantifying forecast accuracy across the 24-hour cycle. Highest MAE occurs at{' '}
              <strong style={{ color: '#e11d48' }}>
                SP {worstDiurnalPeriod?.settlement_period} ({worstDiurnalPeriod?.time_label} UTC) with {worstDiurnalPeriod?.mae_mw.toLocaleString()} MW MAE
              </strong>.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717a' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }}></span>
                MAE (MW)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#71717a' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#27272a' }}></span>
                Mean Bias MBE (MW)
              </span>
            </div>
            <ArrowUpRight size={18} className="card-arrow-icon" />
          </div>
        </div>

        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <ComposedChart data={diurnal} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 3" stroke="#e8e2d5" vertical={false} />
              <XAxis
                dataKey="time_label"
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                minTickGap={16}
                tick={{ fill: '#71717a' }}
              />
              <YAxis
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val} MW`}
                tick={{ fill: '#71717a' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #eae5db',
                  borderRadius: 14,
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 8px 24px rgba(160, 140, 110, 0.12)',
                  color: '#18181b'
                }}
              />
              <Bar dataKey="mae_mw" fill="#fbbf24" name="Mean Absolute Error (MW)" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Line
                type="monotone"
                dataKey="mbe_mw"
                stroke="#18181b"
                strokeWidth={2}
                dot={{ r: 2, fill: '#18181b' }}
                name="Mean Bias Error MBE (MW)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Error Distribution Histogram + Quantile Risk Bands */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 22 }}>
        {/* Error Frequency Histogram */}
        <div className="warm-card" style={{ padding: 26 }}>
          <div className="card-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="#10b981" />
              </div>
              <h3 className="card-title-text">
                Forecast Error Distribution Histogram
              </h3>
            </div>
            <ArrowUpRight size={18} className="card-arrow-icon" />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 18, marginLeft: 46 }}>
            Empirical frequency of Error = (Forecast - Actual). Bins illustrate magnitude of imbalance exposure.
          </p>

          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer>
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="#e8e2d5" vertical={false} />
                <XAxis
                  dataKey="bin_label"
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  tick={{ fill: '#71717a' }}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fill: '#71717a' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #eae5db',
                    borderRadius: 14,
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: '0 8px 24px rgba(160, 140, 110, 0.12)',
                    color: '#18181b'
                  }}
                  formatter={(value: any) => [`${value}% (${distribution.find(d => d.percentage === value)?.count} periods)`, 'Probability']}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={22}>
                  {distribution.map((entry, idx) => {
                    const isOver = entry.min_val >= 0;
                    return (
                      <Cell
                        key={`cell-${idx}`}
                        fill={isOver ? '#fb7185' : '#fbbf24'}
                        opacity={0.9}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantile Confidence & Risk Sizing */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#8b5cf6" />
                </div>
                <h3 className="card-title-text">
                  Quantified Risk Bands &amp; Percentiles
                </h3>
              </div>
              <ArrowUpRight size={18} className="card-arrow-icon" />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 20, marginLeft: 46 }}>
              Statistical quantiles derived from historical Elexon January 2026 outturn data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', background: '#faf8f4', borderRadius: 14, border: '1px solid #eae5db' }}>
                <span style={{ fontSize: '0.84rem', color: '#52525b', fontWeight: 600 }}>P10 Error (Severe Under-forecast):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7c3aed' }}>
                  {metrics.p10_error_mw.toLocaleString()} MW
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', background: '#faf8f4', borderRadius: 14, border: '1px solid #eae5db' }}>
                <span style={{ fontSize: '0.84rem', color: '#52525b', fontWeight: 600 }}>P50 Error (Median Bias):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#18181b' }}>
                  {metrics.p50_error_mw.toLocaleString()} MW
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 14 }}>
                <span style={{ fontSize: '0.84rem', color: '#92400e', fontWeight: 700 }}>P90 Error (Severe Over-forecast Risk):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#92400e' }}>
                  +{metrics.p90_error_mw.toLocaleString()} MW
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', background: '#faf8f4', borderRadius: 14, border: '1px solid #eae5db' }}>
                <span style={{ fontSize: '0.84rem', color: '#52525b', fontWeight: 600 }}>Peak Over-forecast Extreme:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#e11d48' }}>
                  +{metrics.max_overforecast_mw.toLocaleString()} MW
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', background: '#faf8f4', borderRadius: 14, border: '1px solid #eae5db' }}>
                <span style={{ fontSize: '0.84rem', color: '#52525b', fontWeight: 600 }}>Peak Under-forecast Extreme:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#7c3aed' }}>
                  {metrics.max_underforecast_mw.toLocaleString()} MW
                </span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 14,
            background: '#faf8f4',
            border: '1px solid #eae5db',
            fontSize: '0.8rem',
            color: '#52525b'
          }}>
            <strong style={{ color: '#18181b' }}>Desk Execution Strategy:</strong> Procuring with a P90 buffer (+{metrics.p90_error_mw.toLocaleString()} MW) provides 90% statistical safety margin against deficit imbalance cashout at the National Grid ESO System Buy Price.
          </div>
        </div>
      </div>
    </div>
  );
};
