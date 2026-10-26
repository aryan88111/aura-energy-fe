import React from 'react';
import { Wind, TrendingUp, BarChart2, FileSpreadsheet, BookOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { CacheStatus } from '../types';

export type ActiveTabType = 'explorer' | 'analytics' | 'ledger' | 'methodology';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  cacheStatus: CacheStatus | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  cacheStatus,
  isCollapsed = false,
  onToggleCollapse
}) => {
  return (
    <aside className={`crm-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="crm-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div className="crm-logo-box" title="Aura Energy Wholesale Desk">
            <Wind size={22} color="#ffffff" />
          </div>
          <div className="crm-brand-details">
            <div className="crm-brand-name">Aura Energy</div>
            <div className="crm-brand-sub">UK Wholesale Desk</div>
          </div>
        </div>

        {/* Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            className="crm-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="crm-nav-list">
        <div className="crm-nav-section-title">Wholesale Trading</div>

        <button
          className={`crm-nav-item ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
          title="Forecast Explorer"
        >
          <span className="crm-nav-icon">
            <TrendingUp size={19} />
          </span>
          <span className="crm-nav-label">Forecast Explorer</span>
        </button>

        <button
          className={`crm-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="Accuracy Analytics"
        >
          <span className="crm-nav-icon">
            <BarChart2 size={19} />
          </span>
          <span className="crm-nav-label">Accuracy Analytics</span>
        </button>

        <button
          className={`crm-nav-item ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
          title="Settlement Ledger"
        >
          <span className="crm-nav-icon">
            <FileSpreadsheet size={19} />
          </span>
          <span className="crm-nav-label">Settlement Ledger</span>
        </button>

        <div className="crm-nav-section-title" style={{ marginTop: 14 }}>Compliance &amp; Specs</div>

        <button
          className={`crm-nav-item ${activeTab === 'methodology' ? 'active' : ''}`}
          onClick={() => setActiveTab('methodology')}
          title="Desk Methodology"
        >
          <span className="crm-nav-icon">
            <BookOpen size={19} />
          </span>
          <span className="crm-nav-label">Desk Methodology</span>
        </button>
      </nav>

      {/* Sidebar Footer with Live Cache / Elexon Badge */}
      <div className="crm-sidebar-footer">
        <div
          className="crm-sync-card"
          title={isCollapsed ? `Elexon BMRS Live Sync: ${cacheStatus ? cacheStatus.fuelhh_wind_count.toLocaleString() : '1,488'} actuals, ${cacheStatus ? cacheStatus.windfor_count.toLocaleString() : '19,272'} forecasts` : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', marginBottom: isCollapsed ? 0 : 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#047857' }}>
              <span className="status-dot"></span>
              <span className="crm-sync-details">Elexon BMRS Stream</span>
            </span>
            <span className="crm-sync-details" style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: 9999, fontWeight: 700 }}>
              Live
            </span>
          </div>
          <div className="crm-sync-details" style={{ color: '#71717a', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div>Actuals (FUELHH): <strong>{cacheStatus ? cacheStatus.fuelhh_wind_count.toLocaleString() : '1,488'}</strong></div>
            <div>Forecasts (WINDFOR): <strong>{cacheStatus ? cacheStatus.windfor_count.toLocaleString() : '19,272'}</strong></div>
            <div style={{ color: '#d97706', fontWeight: 700, marginTop: 2 }}>Target: January 2026</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
