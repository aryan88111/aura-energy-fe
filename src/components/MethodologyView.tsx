import React from 'react';
import { BookOpen, Clock, ShieldCheck, Zap, Database, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header Banner */}
      <div className="warm-card" style={{ padding: '28px 34px', background: 'linear-gradient(135deg, #ffffff 0%, #fef8ee 100%)', borderColor: '#fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
          }}>
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>
              Desk Methodology &amp; Mathematical Specification
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#71717a', marginTop: 3 }}>
              Official trading desk analytical reference for UK electricity wholesale operations, Elexon BMRS datasets, and quantitative wind forecast evaluation.
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: 22 }}>
        {/* Section 1: Day-Ahead Gate Closure */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#f59e0b" />
              </div>
              <h3 className="card-title-text">
                1. Day-Ahead Gate Closure &amp; Temporal Cutoffs
              </h3>
            </div>
            <ArrowUpRight size={18} className="card-arrow-icon" />
          </div>

          <p style={{ fontSize: '0.86rem', color: '#52525b', lineHeight: 1.6 }}>
            In the Great Britain (GB) electricity wholesale market, electricity delivery day <strong>D</strong> consists of <strong>48 half-hour settlement periods</strong> (00:00 to 24:00 UTC).
            Commercial buying and selling orders on power exchanges (EPEX SPOT and Nord Pool) close strictly on day <strong>D-1 at 11:00 UTC Gate Closure</strong>.
          </p>

          <div style={{ padding: 14, background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 14, fontSize: '0.82rem' }}>
            <div style={{ fontWeight: 700, color: '#18181b', marginBottom: 4 }}>Temporal Guardrail (Zero Lookahead Bias):</div>
            <p style={{ color: '#d97706', fontFamily: 'var(--font-mono)' }}>
              Forecast(t) = WINDFOR where publishTime &le; Decision_Cutoff(D-1 11:00 UTC)
            </p>
            <div style={{ marginTop: 8, color: '#71717a', fontSize: '0.78rem' }}>
              Revisions published after 11:00 UTC on D-1 are strictly quarantined from day-ahead evaluation because traders cannot act on future information at order submission.
            </div>
          </div>
        </div>

        {/* Section 2: Elexon BMRS Datasets */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} color="#10b981" />
              </div>
              <h3 className="card-title-text">
                2. Elexon BMRS Data Streams &amp; Alignment
              </h3>
            </div>
            <ArrowUpRight size={18} className="card-arrow-icon" />
          </div>

          <p style={{ fontSize: '0.86rem', color: '#52525b', lineHeight: 1.6 }}>
            Per prompt constraints, the platform relies exclusively on national generation actuals and forecasts from Elexon BMRS for <strong>January 2026</strong>:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: 12, background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: '#047857', fontSize: '0.84rem' }}>FUELHH / stream (Actuals)</span>
                <span className="pill-badge pill-badge-green">1,488 Half-Hours</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#71717a' }}>
                Filtered strictly for <code>fuelType == &quot;WIND&quot;</code>. Provides actual metered outturn generation across all GB transmission-connected wind farms for each 30-minute settlement period.
              </p>
            </div>

            <div style={{ padding: 12, background: '#faf8f4', border: '1px solid #eae5db', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: '#d97706', fontSize: '0.84rem' }}>WINDFOR / stream (Forecasts)</span>
                <span className="pill-badge pill-badge-amber">19,272 Revisions</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#71717a' }}>
                National wind forecasts published at hourly horizons. Aligned to half-hourly settlement periods (1–48) via continuous time-series linear interpolation matching turbine kinetic inertia.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Quantitative Error Evaluation Engine */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#f59e0b" />
              </div>
              <h3 className="card-title-text">
                3. Quantitative Error Evaluation Formulas
              </h3>
            </div>
            <ArrowUpRight size={18} className="card-arrow-icon" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.83rem' }}>
            <div style={{ padding: 12, background: '#faf8f4', borderRadius: 12, border: '1px solid #eae5db' }}>
              <div style={{ fontWeight: 700, color: '#18181b' }}>Mean Absolute Error (MAE):</div>
              <code style={{ color: '#d97706', display: 'block', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>MAE = (1 / N) * &Sigma; |Forecast_i - Actual_i|</code>
              <span style={{ color: '#71717a', fontSize: '0.78rem' }}>Measures average magnitude of forecast deviation in MW.</span>
            </div>

            <div style={{ padding: 12, background: '#faf8f4', borderRadius: 12, border: '1px solid #eae5db' }}>
              <div style={{ fontWeight: 700, color: '#18181b' }}>Volume-Weighted Absolute Percentage Error (WAPE):</div>
              <code style={{ color: '#059669', display: 'block', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>WAPE = (&Sigma; |Forecast_i - Actual_i| / &Sigma; Actual_i) * 100%</code>
              <span style={{ color: '#71717a', fontSize: '0.78rem' }}>
                <strong>Industry Standard Choice:</strong> Classical MAPE divides by Actual, which explodes to &infin; when actual wind drops near 0 MW during calm periods. WAPE normalizes by aggregate volume and is unconditionally numerically stable.
              </span>
            </div>

            <div style={{ padding: 12, background: '#faf8f4', borderRadius: 12, border: '1px solid #eae5db' }}>
              <div style={{ fontWeight: 700, color: '#18181b' }}>Mean Bias Error (MBE):</div>
              <code style={{ color: '#e11d48', display: 'block', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>MBE = (1 / N) * &Sigma; (Forecast_i - Actual_i)</code>
              <span style={{ color: '#71717a', fontSize: '0.78rem' }}>
                Positive MBE indicates systematic over-forecasting (utility under-buys, risking shortfall). Negative MBE indicates under-forecasting (utility over-buys, risking surplus spill).
              </span>
            </div>

            <div style={{ padding: 12, background: '#faf8f4', borderRadius: 12, border: '1px solid #eae5db' }}>
              <div style={{ fontWeight: 700, color: '#18181b' }}>Root Mean Squared Error (RMSE):</div>
              <code style={{ color: '#7c3aed', display: 'block', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>RMSE = &radic;[ (1 / N) * &Sigma; (Forecast_i - Actual_i)&sup2; ]</code>
              <span style={{ color: '#71717a', fontSize: '0.78rem' }}>Penalizes large outlier forecast errors that trigger costly rapid thermal redispatch.</span>
            </div>
          </div>
        </div>

        {/* Section 4: Trading Impact & Imbalance Exposure */}
        <div className="warm-card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} color="#8b5cf6" />
              </div>
              <h3 className="card-title-text">
                4. Commercial Imbalance &amp; Trading Desk Action
              </h3>
            </div>
            <ArrowUpRight size={18} className="card-arrow-icon" />
          </div>

          <p style={{ fontSize: '0.86rem', color: '#52525b', lineHeight: 1.6 }}>
            UK suppliers face asymmetric balancing cashout settlement under the Balancing and Settlement Code (BSC):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, color: '#be123c', fontSize: '0.82rem', marginBottom: 2 }}>
                Over-Forecasting (Short Position / Deficit Risk):
              </div>
              <div style={{ fontSize: '0.8rem', color: '#881337' }}>
                If day-ahead wind is over-forecast, the desk under-procures wholesale power. When actual generation falls short, the utility must buy cashout energy from National Grid ESO at the <strong>System Buy Price (SBP)</strong>, which spikes dramatically during cold calm periods.
              </div>
            </div>

            <div style={{ padding: 12, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, color: '#6d28d9', fontSize: '0.82rem', marginBottom: 2 }}>
                Under-Forecasting (Long Position / Spill Risk):
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4c1d95' }}>
                If day-ahead wind is under-forecast, the desk over-procures power. Surplus energy is cashed out at the <strong>System Sell Price (SSP)</strong>, often at steep discounts or negative prices during windy periods.
              </div>
            </div>

            <div style={{ padding: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, color: '#047857', fontSize: '0.82rem', marginBottom: 2 }}>
                Empirical Quantile Bands (P10 / P50 / P90):
              </div>
              <div style={{ fontSize: '0.8rem', color: '#064e3b' }}>
                Traders utilize the <strong>P90 Conservative Band</strong> to purchase risk reserves, safeguarding portfolio margins against tail-risk forecast blunders.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
