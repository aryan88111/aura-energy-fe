import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { ActiveTabType } from './components/Sidebar';
import { ControlsBar } from './components/ControlsBar';
import { KpiRibbon } from './components/KpiRibbon';
import { ForecastExplorer } from './components/ForecastExplorer';
import { ErrorAnalytics } from './components/ErrorAnalytics';
import { AuditLedger } from './components/AuditLedger';
import { MethodologyView } from './components/MethodologyView';
import { fetchForecastData, fetchCacheStatus } from './services/api';
import type { ForecastResponse, CacheStatus } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('explorer');
  const [dateFrom, setDateFrom] = useState<string>('2026-01-01');
  const [dateTo, setDateTo] = useState<string>('2026-01-07');
  const [decisionCutoff, setDecisionCutoff] = useState<string>('day_ahead_gate_closure');
  const [customHour, setCustomHour] = useState<number>(11);

  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fData, cStatus] = await Promise.all([
        fetchForecastData(dateFrom, dateTo, decisionCutoff, customHour),
        fetchCacheStatus().catch(() => null)
      ]);
      setForecastData(fData);
      if (cStatus) setCacheStatus(cStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with analytics backend');
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, decisionCutoff, customHour]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getCutoffLabel = () => {
    switch (decisionCutoff) {
      case 'day_ahead_gate_closure':
        return 'D-1 11:00 UTC (Day-Ahead Gate Closure)';
      case 'day_ahead_morning':
        return 'D-1 07:00 UTC (Morning Desk Briefing)';
      case 'intraday_latest':
        return 'Real-Time Intraday Rolling';
      case 'custom':
        return `Custom D-1 ${customHour.toString().padStart(2, '0')}:00 UTC`;
      default:
        return decisionCutoff;
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="crm-app-layout">
      {/* Left CRM Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cacheStatus={cacheStatus}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Right CRM Main Viewport */}
      <div className="crm-main-viewport">
        {/* Top CRM Global Action Bar */}
        <header className="crm-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#18181b', letterSpacing: '-0.01em' }}>
              {activeTab === 'explorer' && 'Day-Ahead Wind Forecast Explorer'}
              {activeTab === 'analytics' && 'Quantitative Accuracy & Error Analytics'}
              {activeTab === 'ledger' && 'Settlement Period Audit Ledger (SP 1–48)'}
              {activeTab === 'methodology' && 'Desk Methodology & Mathematical Specification'}
            </h1>
            <span className="pill-badge pill-badge-amber">
              UK Grid &bull; Jan 2026
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: '0.78rem', color: '#71717a' }}>
              Enforced Cutoff: <strong style={{ color: '#18181b' }}>{getCutoffLabel()}</strong>
            </div>
            <button
              onClick={loadData}
              className="btn-pill"
              disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', fontSize: '0.78rem' }}
              title="Sync latest analytics"
            >
              <RefreshCw size={13} color="#d97706" className={isLoading ? 'spin-anim' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </header>

        {/* Scrollable CRM Content View */}
        <div className="crm-content-container">
          {/* Global Filter & Cutoff Controls Bar */}
          {activeTab !== 'methodology' && (
            <ControlsBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              setDateFrom={setDateFrom}
              setDateTo={setDateTo}
              decisionCutoff={decisionCutoff}
              setDecisionCutoff={setDecisionCutoff}
              customHour={customHour}
              setCustomHour={setCustomHour}
              isLoading={isLoading}
              onRefresh={loadData}
            />
          )}

          {/* Error notification banner if any */}
          {error && (
            <div style={{
              padding: '12px 18px',
              borderRadius: 14,
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.84rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} color="#e11d48" />
                <span style={{ fontWeight: 600 }}>{error}</span>
              </div>
              <button onClick={loadData} className="btn-pill" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                Retry
              </button>
            </div>
          )}

          {/* Executive KPI Ribbon (displayed on analytical tabs) */}
          {activeTab !== 'methodology' && (
            <KpiRibbon metrics={forecastData?.metrics || null} />
          )}

          {/* Main Tab Viewport */}
          <main style={{ minHeight: 460, position: 'relative' }}>
            {isLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(251, 249, 245, 0.75)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: 20
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#ffffff',
                  border: '1px solid #eae5db',
                  padding: '14px 22px',
                  borderRadius: 14,
                  boxShadow: '0 8px 24px rgba(160, 140, 110, 0.12)',
                  color: '#d97706',
                  fontWeight: 600,
                  fontSize: '0.86rem'
                }}>
                  <RefreshCw size={18} className="spin-anim" />
                  <span>Calculating quantitative metrics &amp; aligning settlement periods...</span>
                </div>
              </div>
            )}

            {activeTab === 'explorer' && (
              <ForecastExplorer
                timeSeries={forecastData?.time_series || []}
                decisionCutoff={decisionCutoff}
              />
            )}

            {activeTab === 'analytics' && (
              <ErrorAnalytics
                diurnal={forecastData?.diurnal_metrics || []}
                distribution={forecastData?.distribution || []}
                metrics={forecastData?.metrics || null}
              />
            )}

            {activeTab === 'ledger' && (
              <AuditLedger
                timeSeries={forecastData?.time_series || []}
                dateFrom={dateFrom}
                dateTo={dateTo}
                decisionCutoff={decisionCutoff}
              />
            )}

            {activeTab === 'methodology' && (
              <MethodologyView />
            )}
          </main>

          {/* Clean CRM Footer */}
          <footer style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--border-warm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.76rem',
            color: '#71717a'
          }}>
            <div>
              Data Source: Elexon BMRS Datasets (<code>FUELHH/stream</code> &amp; <code>WINDFOR/stream</code>) &bull; Delivery Month: January 2026
            </div>
            <div>
              Aura Energy Wholesale Power Desk &bull; Zero Lookahead Bias Enforced
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
