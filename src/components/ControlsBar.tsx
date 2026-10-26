import React from 'react';
import { Calendar, Clock, Download, RefreshCw } from 'lucide-react';
import { getExportUrl } from '../services/api';

interface ControlsBarProps {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (d: string) => void;
  setDateTo: (d: string) => void;
  decisionCutoff: string;
  setDecisionCutoff: (c: string) => void;
  customHour: number;
  setCustomHour: (h: number) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  decisionCutoff,
  setDecisionCutoff,
  customHour,
  setCustomHour,
  isLoading,
  onRefresh
}) => {
  const setPreset = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const isPresetActive = (from: string, to: string) => dateFrom === from && dateTo === to;
  const exportUrl = getExportUrl(dateFrom, dateTo, decisionCutoff);

  return (
    <div className="controls-bar">
      {/* Date Presets */}
      <div className="control-group">
        <span className="control-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={13} color="#a1a1aa" /> Target:
        </span>
        <button
          className={`btn-pill ${isPresetActive('2026-01-01', '2026-01-02') ? 'active' : ''}`}
          onClick={() => setPreset('2026-01-01', '2026-01-02')}
        >
          Jan 1–2
        </button>
        <button
          className={`btn-pill ${isPresetActive('2026-01-01', '2026-01-07') ? 'active' : ''}`}
          onClick={() => setPreset('2026-01-01', '2026-01-07')}
        >
          Week 1
        </button>
        <button
          className={`btn-pill ${isPresetActive('2026-01-08', '2026-01-14') ? 'active' : ''}`}
          onClick={() => setPreset('2026-01-08', '2026-01-14')}
        >
          Week 2
        </button>
        <button
          className={`btn-pill ${isPresetActive('2026-01-15', '2026-01-21') ? 'active' : ''}`}
          onClick={() => setPreset('2026-01-15', '2026-01-21')}
        >
          Week 3
        </button>
        <button
          className={`btn-pill ${isPresetActive('2026-01-01', '2026-01-31') ? 'active' : ''}`}
          onClick={() => setPreset('2026-01-01', '2026-01-31')}
        >
          Full Jan 2026
        </button>
      </div>

      {/* Custom Date Pickers */}
      <div className="control-group">
        <input
          type="date"
          className="date-input"
          value={dateFrom}
          min="2026-01-01"
          max="2026-01-31"
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>to</span>
        <input
          type="date"
          className="date-input"
          value={dateTo}
          min="2026-01-01"
          max="2026-01-31"
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Decision Cutoff Selector */}
      <div className="control-group" style={{ marginLeft: 'auto' }}>
        <span className="control-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={13} color="#a1a1aa" /> Decision Cutoff:
        </span>
        <select
          className="select-input"
          value={decisionCutoff}
          onChange={(e) => setDecisionCutoff(e.target.value)}
        >
          <option value="day_ahead_gate_closure">Day-Ahead Gate Closure (D-1 11:00 UTC)</option>
          <option value="day_ahead_morning">Morning Desk Briefing (D-1 07:00 UTC)</option>
          <option value="intraday_latest">Intraday Rolling Latest (Real-Time)</option>
          <option value="custom">Custom D-1 Cutoff Hour</option>
        </select>

        {decisionCutoff === 'custom' && (
          <select
            className="select-input"
            value={customHour}
            onChange={(e) => setCustomHour(Number(e.target.value))}
            style={{ width: 95 }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}:00 UTC
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Actions: Sync & CSV Export */}
      <div className="control-group">
        <button
          onClick={onRefresh}
          className="btn-pill"
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Reload analysis"
        >
          <RefreshCw size={13} color="#d97706" className={isLoading ? 'spin-anim' : ''} />
          <span>Sync</span>
        </button>

        <a
          href={exportUrl}
          download
          className="btn-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            color: '#065f46',
            borderColor: '#a7f3d0',
            background: '#ecfdf5',
            fontWeight: 600
          }}
        >
          <Download size={13} color="#059669" />
          <span>Export CSV</span>
        </a>
      </div>
    </div>
  );
};
