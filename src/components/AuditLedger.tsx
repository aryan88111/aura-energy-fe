import React, { useState } from 'react';
import type { SettlementPeriodData } from '../types';
import { Search, Download, ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { getExportUrl } from '../services/api';

interface AuditLedgerProps {
  timeSeries: SettlementPeriodData[];
  dateFrom: string;
  dateTo: string;
  decisionCutoff: string;
}

export const AuditLedger: React.FC<AuditLedgerProps> = ({
  timeSeries,
  dateFrom,
  dateTo,
  decisionCutoff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorFilter, setErrorFilter] = useState<'all' | 'over' | 'under'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="warm-card" style={{ padding: 48, textAlign: 'center', color: '#71717a' }}>
        No settlement period data available for the selected range.
      </div>
    );
  }

  const exportUrl = getExportUrl(dateFrom, dateTo, decisionCutoff);

  // Filter and sort for table
  const filteredRows = timeSeries.filter((r) => {
    const matchesSearch =
      r.settlement_date.includes(searchTerm) ||
      r.time_label.includes(searchTerm) ||
      `SP ${r.settlement_period}`.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (errorFilter === 'over') return (r.error_mw ?? 0) > 100;
    if (errorFilter === 'under') return (r.error_mw ?? 0) < -100;
    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="warm-card" style={{ padding: 26 }}>
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={20} color="#f59e0b" />
            </div>
            <h3 className="card-title-text">
              Settlement Period Audit Ledger (SP 1–48)
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 4, marginLeft: 46 }}>
            Granular half-hourly audit comparing actual metered generation (FUELHH) against cutoff forecasts (WINDFOR)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: 4, background: '#faf8f4', border: '1px solid #eae5db', padding: 3, borderRadius: 9999 }}>
            <button
              className={`btn-pill ${errorFilter === 'all' ? 'active' : ''}`}
              style={{ padding: '4px 12px', fontSize: '0.76rem' }}
              onClick={() => setErrorFilter('all')}
            >
              All ({timeSeries.length})
            </button>
            <button
              className={`btn-pill ${errorFilter === 'over' ? 'active' : ''}`}
              style={{ padding: '4px 12px', fontSize: '0.76rem' }}
              onClick={() => setErrorFilter('over')}
            >
              Over-forecast (&gt;100 MW)
            </button>
            <button
              className={`btn-pill ${errorFilter === 'under' ? 'active' : ''}`}
              style={{ padding: '4px 12px', fontSize: '0.76rem' }}
              onClick={() => setErrorFilter('under')}
            >
              Under-forecast (&lt;-100 MW)
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#a1a1aa' }} />
            <input
              type="text"
              placeholder="Search SP or Date..."
              className="select-input"
              style={{ paddingLeft: 30, width: 180 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Export CSV link */}
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
              fontWeight: 600,
              fontSize: '0.78rem'
            }}
          >
            <Download size={13} color="#059669" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                Date &amp; Time (UTC) {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
              <th>Period</th>
              <th>Actual Wind (MW)</th>
              <th>Forecast at Cutoff (MW)</th>
              <th>Forecast Error (MW)</th>
              <th>Absolute Error</th>
              <th>Status</th>
              <th>Cutoff Revision Used</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r, i) => {
              const err = r.error_mw;
              let statusBadge = <span className="badge-exact">Accurate (&plusmn;100 MW)</span>;
              if (err !== null) {
                if (err > 100) statusBadge = <span className="badge-over">Over (+{Math.round(err)} MW)</span>;
                else if (err < -100) statusBadge = <span className="badge-under">Under ({Math.round(err)} MW)</span>;
              }

              return (
                <tr key={i}>
                  <td style={{ color: '#18181b', fontWeight: 600 }}>
                    {r.settlement_date} {r.time_label}
                  </td>
                  <td style={{ color: '#d97706', fontWeight: 700 }}>SP {r.settlement_period}</td>
                  <td style={{ color: '#059669', fontWeight: 700 }}>
                    {r.actual_mw !== null ? r.actual_mw.toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ color: '#18181b', fontWeight: 700 }}>
                    {r.forecast_mw !== null ? r.forecast_mw.toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ color: (err ?? 0) > 0 ? '#e11d48' : '#7c3aed', fontWeight: 700 }}>
                    {err !== null ? `${err > 0 ? '+' : ''}${err.toLocaleString()}` : 'N/A'}
                  </td>
                  <td>{r.abs_error_mw !== null ? r.abs_error_mw.toLocaleString() : 'N/A'}</td>
                  <td>{statusBadge}</td>
                  <td style={{ fontSize: '0.74rem', color: '#71717a' }}>
                    {r.publish_time ? new Date(r.publish_time).toISOString().replace('T', ' ').slice(0, 16) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
