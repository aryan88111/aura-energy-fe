import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush
} from 'recharts';
import type { SettlementPeriodData } from '../types';
import {
  Wind,
  Zap,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Layers
} from 'lucide-react';

interface ForecastExplorerProps {
  timeSeries: SettlementPeriodData[];
  decisionCutoff?: string;
}

export const ForecastExplorer: React.FC<ForecastExplorerProps> = ({
  timeSeries,
  decisionCutoff = 'day_ahead_gate_closure'
}) => {
  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="warm-card" style={{ padding: 48, textAlign: 'center', color: '#71717a' }}>
        No time-series wind data available for the selected range.
      </div>
    );
  }

  // Statistical aggregates calculated dynamically from real settlement period data
  const stats = useMemo(() => {
    let peakActual = 0;
    let peakActualTime = '';
    let minActual = Infinity;
    let minActualTime = '';

    let maxOverError = 0;
    let maxOverErrorTime = '';
    let maxUnderError = 0;
    let maxUnderErrorTime = '';

    let sumActual = 0;
    let sumForecast = 0;
    let sumAbsError = 0;
    let withinToleranceCount = 0;
    const totalCount = timeSeries.length;

    timeSeries.forEach((d) => {
      const act = d.actual_mw ?? 0;
      const fst = d.forecast_mw ?? 0;
      const err = d.error_mw ?? 0;
      const absErr = d.abs_error_mw ?? Math.abs(err);
      const timeStr = `${d.settlement_date.slice(5)} SP${d.settlement_period} (${d.time_label} UTC)`;

      if (act > peakActual) {
        peakActual = act;
        peakActualTime = timeStr;
      }
      if (act < minActual) {
        minActual = act;
        minActualTime = timeStr;
      }

      if (err > maxOverError) {
        maxOverError = err;
        maxOverErrorTime = timeStr;
      }
      if (err < maxUnderError) {
        maxUnderError = err;
        maxUnderErrorTime = timeStr;
      }

      sumActual += act;
      sumForecast += fst;
      sumAbsError += absErr;

      // Settlement period tracking within ±150 MW target tolerance
      if (absErr <= 150) {
        withinToleranceCount++;
      }
    });

    const avgActual = totalCount > 0 ? sumActual / totalCount : 0;
    const avgForecast = totalCount > 0 ? sumForecast / totalCount : 0;
    const wape = sumActual > 0 ? (sumAbsError / sumActual) * 100 : 0;
    const trackingFidelity = totalCount > 0 ? Math.round((withinToleranceCount / totalCount) * 100) : 85;
    const volumeAccuracy = Math.max(0, Math.min(100, 100 - wape));

    // Latest period in the evaluated window
    const representative = timeSeries[timeSeries.length - 1] || timeSeries[0];
    const repAct = Math.round(representative.actual_mw ?? avgActual);
    const repFst = Math.round(representative.forecast_mw ?? avgForecast);
    const repErr = Math.round(representative.error_mw ?? (repFst - repAct));

    // Calculate dynamic % deviation vs the window mean
    const diffVsAvg = avgActual > 0 ? Math.round(((repAct - avgActual) / avgActual) * 100) : 0;

    const totalActualGWh = (sumActual * 0.5) / 1000;
    const totalForecastGWh = (sumForecast * 0.5) / 1000;
    const netImbalanceGWh = totalForecastGWh - totalActualGWh;

    return {
      peakActual: Math.round(peakActual),
      peakActualTime,
      minActual: Math.round(minActual === Infinity ? 0 : minActual),
      minActualTime,
      maxOverError: Math.round(maxOverError),
      maxOverErrorTime,
      maxUnderError: Math.round(maxUnderError),
      maxUnderErrorTime,
      avgActual: Math.round(avgActual),
      avgForecast: Math.round(avgForecast),
      totalActualGWh,
      totalForecastGWh,
      netImbalanceGWh,
      wape,
      volumeAccuracy,
      withinToleranceCount,
      trackingFidelity,
      repActual: repAct,
      repForecast: repFst,
      repError: repErr,
      diffVsAvg,
      repTime: `${representative.settlement_date.slice(5)} SP${representative.settlement_period} (${representative.time_label} UTC)`,
      count: totalCount,
    };
  }, [timeSeries]);

  const cutoffBadgeText = useMemo(() => {
    switch (decisionCutoff) {
      case 'day_ahead_gate_closure':
        return 'D-1 11:00 UTC';
      case 'day_ahead_morning':
        return 'D-1 07:00 UTC';
      case 'intraday_latest':
        return 'Real-Time';
      default:
        return 'Custom Cutoff';
    }
  }, [decisionCutoff]);

  // Format data for ComposedChart
  const chartData = useMemo(() => {
    return timeSeries.map((d) => ({
      time: `${d.settlement_date.slice(5)} ${d.time_label}`,
      sp: `SP ${d.settlement_period}`,
      fullDate: d.settlement_date,
      actual: d.actual_mw,
      forecast: d.forecast_mw,
      error: d.error_mw,
      publishTime: d.publish_time,
    }));
  }, [timeSeries]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const err = data.error;
      const isOver = err > 0;

      return (
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(226, 220, 208, 0.8)',
          padding: '14px 18px',
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(160, 140, 110, 0.12)',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-sans)',
          color: '#18181b',
          minWidth: 220
        }}>
          <div style={{ color: '#71717a', marginBottom: 8, fontWeight: 700, fontSize: '0.78rem' }}>
            {data.fullDate} &bull; {data.sp} ({data.time.split(' ')[1]} UTC)
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 4 }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>Delivered Wind:</span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{data.actual !== null ? `${data.actual.toLocaleString()} MW` : 'N/A'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 4 }}>
            <span style={{ color: '#d97706', fontWeight: 600 }}>Forecast at Cutoff:</span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>{data.forecast !== null ? `${data.forecast.toLocaleString()} MW` : 'N/A'}</strong>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 14,
            marginTop: 6,
            paddingTop: 6,
            borderTop: '1px solid #f4f1ea'
          }}>
            <span style={{ color: isOver ? '#e11d48' : '#7c3aed', fontWeight: 600 }}>Imbalance Error:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: isOver ? '#e11d48' : '#7c3aed' }}>
              {err !== null ? `${isOver ? '+' : ''}${err.toLocaleString()} MW` : 'N/A'}
            </strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Top Main Section: Left Chart Card (2/3) + Right Widgets (1/3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: 22,
        alignItems: 'start'
      }}>
        {/* Main Left Card: Top 3 Stat Items + Combined Chart */}
        <div className="warm-card" style={{ padding: 26 }}>
          {/* Top 3 Dynamic Stat Items */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: '1px solid #f4f1ea'
          }}>
            {/* Stat 1: Delivered Wind */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)'
              }}>
                <Wind size={22} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', fontWeight: 600 }}>
                  Delivered Wind Outturn
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
                    {stats.repActual.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a' }}>MW</span>
                  <span className={`pill-badge ${stats.diffVsAvg >= 0 ? 'pill-badge-green' : 'pill-badge-amber'}`} style={{ marginLeft: 4 }}>
                    {stats.diffVsAvg >= 0 ? `+${stats.diffVsAvg}%` : `${stats.diffVsAvg}%`} vs Avg
                  </span>
                </div>
              </div>
            </div>

            {/* Stat 2: Cutoff Forecast */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.15)'
              }}>
                <Clock size={22} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', fontWeight: 600 }}>
                  Cutoff Forecast Hedge
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
                    {stats.repForecast.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a' }}>MW</span>
                  <span className="pill-badge pill-badge-gray" style={{ marginLeft: 4 }}>
                    {cutoffBadgeText}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat 3: Imbalance Error */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: Math.abs(stats.repError) > 150 ? (stats.repError > 0 ? '#fff1f2' : '#f5f3ff') : '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
              }}>
                <Zap size={22} color={Math.abs(stats.repError) > 150 ? (stats.repError > 0 ? '#fb7185' : '#8b5cf6') : '#10b981'} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', fontWeight: 600 }}>
                  Net Imbalance Error
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 1 }}>
                  <span style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: stats.repError > 150 ? '#e11d48' : (stats.repError < -150 ? '#7c3aed' : '#059669'),
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {stats.repError > 0 ? '+' : ''}{stats.repError.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#71717a' }}>MW</span>
                  <span className={`pill-badge ${Math.abs(stats.repError) <= 150 ? 'pill-badge-green' : (stats.repError > 0 ? 'pill-badge-coral' : 'pill-badge-violet')}`} style={{ marginLeft: 4 }}>
                    {Math.abs(stats.repError) <= 150 ? 'In Tolerance' : (stats.repError > 0 ? 'Shortfall Risk' : 'Spill Surplus')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Composed Chart */}
          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="#e8e2d5" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  minTickGap={32}
                  tick={{ fill: '#71717a' }}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                  tick={{ fill: '#71717a' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="actual"
                  fill="#fbbf24"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={14}
                  name="Delivered Wind (MW)"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#27272a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#27272a', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                  name="Cutoff Forecast (MW)"
                />
                <Brush
                  dataKey="time"
                  height={28}
                  stroke="#dcd6c8"
                  fill="#faf8f4"
                  travellerWidth={8}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stack of 3 Cards (Battery Capsule, Performance Arc, System Health) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Card 1: Tracking Fidelity Capsule Meter */}
          <div className="warm-card" style={{ padding: 22 }}>
            <div className="card-header-row">
              <span className="card-title-text">Tracking Fidelity</span>
              <ArrowUpRight size={18} className="card-arrow-icon" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span>In Tolerance (&plusmn;150 MW)</span>
            </div>

            {/* Chunky Capsule Bar */}
            <div className="capsule-meter-box">
              <div
                className="capsule-meter-bar"
                style={{ width: `${stats.trackingFidelity}%` }}
              >
                <span>{stats.trackingFidelity}%</span>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Tolerance Band: &plusmn;150 MW</span>
              <strong>{stats.withinToleranceCount} / {stats.count} SPs</strong>
            </div>
          </div>

          {/* Card 2: Performance Trend Arc Gauge */}
          <div className="warm-card" style={{ padding: 22 }}>
            <div className="card-header-row">
              <span className="card-title-text">Performance Trend</span>
              <ArrowUpRight size={18} className="card-arrow-icon" />
            </div>

            {/* Dynamic Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.75rem', marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#71717a' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }}></span>
                Daily Average
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#71717a' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#fb7185' }}></span>
                Peak Gen
              </span>
            </div>

            {/* Semicircular SVG Arc Gauge */}
            <div style={{ position: 'relative', width: '100%', height: 110, display: 'flex', justifyContent: 'center' }}>
              <svg width="220" height="110" viewBox="0 0 220 110">
                <defs>
                  <linearGradient id="warmArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                </defs>
                <path
                  d="M 20 100 A 90 90 0 0 1 200 100"
                  fill="none"
                  stroke="#f4f1ea"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 90 90 0 0 1 200 100"
                  fill="none"
                  stroke="url(#warmArcGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 * (1 - Math.min(1, stats.avgActual / Math.max(1, stats.peakActual)))}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: -6, fontSize: '0.8rem', fontWeight: 700 }}>
              <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span>
                Avg: {stats.avgActual.toLocaleString()} MW
              </span>
              <span style={{ color: '#e11d48', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fb7185' }}></span>
                Peak: {stats.peakActual.toLocaleString()} MW
              </span>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.72rem', color: '#71717a' }}>
              Capacity Factor: <strong>{((stats.avgActual / Math.max(1, stats.peakActual)) * 100).toFixed(0)}%</strong> of window peak
            </div>
          </div>

          {/* Card 3: System Health Pill Box */}
          <div className="warm-card" style={{ padding: 22 }}>
            <div className="card-header-row">
              <span className="card-title-text">System Health</span>
              <ArrowUpRight size={18} className="card-arrow-icon" />
            </div>

            <div className="health-pill-frame">
              <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
                {stats.volumeAccuracy.toFixed(1)}%
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.78rem', color: '#71717a', fontWeight: 600 }}>
              Volume Accuracy (100% &minus; {stats.wape.toFixed(1)}% WAPE)
            </div>
            <div style={{ textAlign: 'center', marginTop: 4, fontSize: '0.72rem', color: '#a1a1aa' }}>
              Evaluated across {stats.totalActualGWh.toFixed(1)} GWh Delivered
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Analytical Summary Cards: Volumetric Balance + Extreme Settlement Periods */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: 22,
        alignItems: 'stretch'
      }}>
        {/* Card 1: Day-Ahead Outturn Volumetric Balance */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header-row" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} color="#f59e0b" />
                </div>
                <h3 className="card-title-text">
                  Day-Ahead Volumetric Energy Balance
                </h3>
              </div>
              <ArrowUpRight size={18} className="card-arrow-icon" />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 20, marginLeft: 46 }}>
              Aggregated energy outturn comparing physical generation delivered against day-ahead hedges across {stats.count} settlement periods.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.73rem', color: '#71717a', fontWeight: 600 }}>Delivered Energy</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  {stats.totalActualGWh.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>GWh</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: 4 }}>Metered Grid Outturn</div>
              </div>

              <div style={{ background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.73rem', color: '#71717a', fontWeight: 600 }}>Hedged Forecast</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  {stats.totalForecastGWh.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>GWh</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: 4 }}>Day-Ahead Hedged</div>
              </div>

              <div style={{ background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.73rem', color: '#71717a', fontWeight: 600 }}>Net Volume Variance</div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: stats.netImbalanceGWh > 0 ? '#e11d48' : '#7c3aed',
                  fontFamily: 'var(--font-mono)',
                  marginTop: 4
                }}>
                  {stats.netImbalanceGWh > 0 ? `+${stats.netImbalanceGWh.toFixed(1)}` : stats.netImbalanceGWh.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>GWh</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: stats.netImbalanceGWh > 0 ? '#e11d48' : '#7c3aed', marginTop: 4, fontWeight: 600 }}>
                  {stats.netImbalanceGWh > 0 ? 'Deficit Shortfall' : 'Spill Surplus'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18,
            padding: 12,
            background: '#faf8f4',
            border: '1px solid #eae5db',
            borderRadius: 12,
            fontSize: '0.78rem',
            color: '#71717a'
          }}>
            <strong style={{ color: '#18181b' }}>Desk Rule:</strong> Net variance represents total imbalance settled via Elexon Balancing Mechanism at cashout prices.
          </div>
        </div>

        {/* Card 2: Extreme Outturn Periods & Cashout Exposure */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header-row" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={18} color="#e11d48" />
                </div>
                <h3 className="card-title-text">
                  Extreme Outturn Periods &amp; Risk Sizing
                </h3>
              </div>
              <ArrowUpRight size={18} className="card-arrow-icon" />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: 20, marginLeft: 46 }}>
              Key settlement period events identifying maximum physical swings and greatest commercial cashout exposures.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#18181b' }}>Peak Generation Record</div>
                  <div style={{ fontSize: '0.72rem', color: '#71717a' }}>{stats.peakActualTime}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                  {stats.peakActual.toLocaleString()} MW
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#18181b' }}>Trough Generation Record</div>
                  <div style={{ fontSize: '0.72rem', color: '#71717a' }}>{stats.minActualTime}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#52525b', fontSize: '1rem' }}>
                  {stats.minActual.toLocaleString()} MW
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#be123c' }}>Worst Deficit Shortfall (Over-forecast)</div>
                  <div style={{ fontSize: '0.72rem', color: '#be123c' }}>{stats.maxOverErrorTime}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#e11d48', fontSize: '1rem' }}>
                  +{stats.maxOverError.toLocaleString()} MW
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6d28d9' }}>Worst Surplus Spill (Under-forecast)</div>
                  <div style={{ fontSize: '0.72rem', color: '#6d28d9' }}>{stats.maxUnderErrorTime}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#7c3aed', fontSize: '1rem' }}>
                  {stats.maxUnderError.toLocaleString()} MW
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 18,
            padding: 12,
            background: '#faf8f4',
            border: '1px solid #eae5db',
            borderRadius: 12,
            fontSize: '0.78rem',
            color: '#71717a'
          }}>
            <strong style={{ color: '#18181b' }}>Risk Guard:</strong> Worst shortfall period exposes the desk to peak System Buy Price (SBP) cashout charges.
          </div>
        </div>
      </div>
    </div>
  );
};
