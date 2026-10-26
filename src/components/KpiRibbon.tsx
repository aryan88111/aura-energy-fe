import React from 'react';
import type { MetricsSummary } from '../types';
import { Activity, Percent, TrendingUp, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

interface KpiRibbonProps {
  metrics: MetricsSummary | null;
}

export const KpiRibbon: React.FC<KpiRibbonProps> = ({ metrics }) => {
  if (!metrics || metrics.sample_count === 0) {
    return null;
  }

  const isOverforecast = metrics.mbe_mw > 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: 16
    }}>
      {/* 1. MAE Card */}
      <div className="warm-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.04em' }}>
            Mean Absolute Error (MAE)
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={17} color="#f59e0b" />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
          {metrics.mae_mw.toLocaleString()}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginLeft: 4 }}>MW</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
          Normalized nMAE: <strong style={{ color: '#d97706' }}>{metrics.nmae_percent}%</strong>
        </div>
      </div>

      {/* 2. WAPE Card */}
      <div className="warm-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.04em' }}>
            Volume-Weighted WAPE
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Percent size={17} color="#10b981" />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
          {metrics.wape_percent}%
        </div>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
          Zero-safe percentage error
        </div>
      </div>

      {/* 3. RMSE Card */}
      <div className="warm-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.04em' }}>
            Volatility (RMSE)
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#faf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={17} color="#52525b" />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
          {metrics.rmse_mw.toLocaleString()}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginLeft: 4 }}>MW</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
          RMSE/MAE Ratio: <strong>{(metrics.rmse_mw / (metrics.mae_mw || 1)).toFixed(2)}x</strong>
        </div>
      </div>

      {/* 4. Mean Bias Error (MBE) Card */}
      <div className="warm-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.04em' }}>
            Systematic Bias (MBE)
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: isOverforecast ? '#fff1f2' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={17} color={isOverforecast ? '#fb7185' : '#8b5cf6'} />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: isOverforecast ? '#e11d48' : '#7c3aed', fontFamily: 'var(--font-mono)' }}>
          {metrics.mbe_mw > 0 ? `+${metrics.mbe_mw.toLocaleString()}` : metrics.mbe_mw.toLocaleString()}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginLeft: 4 }}>MW</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
          {isOverforecast ? (
            <span style={{ color: '#e11d48', fontWeight: 600 }}>Over-forecasts (Deficit risk)</span>
          ) : (
            <span style={{ color: '#7c3aed', fontWeight: 600 }}>Under-forecasts (Surplus spill)</span>
          )}
        </div>
      </div>

      {/* 5. Severe Risk (P90) Card */}
      <div className="warm-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.04em' }}>
            Tail Risk Buffer (P90)
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={17} color="#8b5cf6" />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>
          {metrics.p90_error_mw > 0 ? `+${metrics.p90_error_mw.toLocaleString()}` : metrics.p90_error_mw.toLocaleString()}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginLeft: 4 }}>MW</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
          Recommended safety margin
        </div>
      </div>

      {/* 6. Delivered Energy GWh */}
      <div className="warm-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', color: '#71717a', letterSpacing: '0.04em' }}>
            Delivered Wind Energy
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={17} color="#f59e0b" />
          </div>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#18181b', fontFamily: 'var(--font-mono)' }}>
          {(metrics.total_actual_mwh / 1000).toFixed(1)}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#71717a', marginLeft: 4 }}>GWh</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
          Forecast: {((metrics.total_forecast_mwh) / 1000).toFixed(1)} GWh ({metrics.sample_count} SPs)
        </div>
      </div>
    </div>
  );
};
