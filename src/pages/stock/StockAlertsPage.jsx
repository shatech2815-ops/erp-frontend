import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Search, AlertTriangle, AlertCircle, Info,
  Filter, RefreshCw, Box
} from 'lucide-react';

import { getStockAlerts } from "../../services/stock/stock.services";

const SeverityBadge = ({ severity }) => {
  const map = {
    CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: '#dc2626', label: 'Critical' },
    WARNING:  { bg: 'rgba(245,158,11,0.15)', color: '#d97706', label: 'Warning' },
    INFO:     { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Info' },
  };
  const s = map[severity] || { bg: '#f1f5f9', color: '#64748b', label: severity || '—' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

export default function StockAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch]   = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStockAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error("Error loading stock alerts:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = alerts.filter(a => {
    const matchQ = !search || 
      (a.warehouse || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.message || '').toLowerCase().includes(search.toLowerCase());
    const matchS = filterSeverity === 'ALL' || a.severity === filterSeverity;
    return matchQ && matchS;
  });

  const total    = alerts.length;
  const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warnings = alerts.filter(a => a.severity === 'WARNING').length;
  const infos    = alerts.filter(a => a.severity === 'INFO').length;

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Bell size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Stock Alerts</h1>
            <p className="text-xs text-gray-400 mt-0.5">Active inventory and stock warnings</p>
          </div>
        </div>
        <button onClick={load} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Alerts', value: total,    color: '#8b5cf6', icon: Bell },
          { label: 'Critical',     value: critical, color: '#dc2626', icon: AlertTriangle },
          { label: 'Warnings',     value: warnings, color: '#d97706', icon: AlertCircle },
          { label: 'Info',         value: infos,    color: '#3b82f6', icon: Info },
        ].map(s => (
          <div key={s.label} className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: s.color }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search alerts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300">
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} alerts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white text-xs uppercase tracking-wide">
                {['#', 'Severity', 'Type', 'Warehouse', 'Message', 'Quantity / Threshold'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No active alerts.'}</td></tr>
              ) : filtered.map((a, idx) => (
                <tr key={a.id || idx} className={`border-b border-white/10 hover:bg-white/10 ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-5 py-3 text-xs text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3"><SeverityBadge severity={a.severity} /></td>
                  <td className="px-5 py-3 text-xs font-semibold text-purple-300">{a.type || '—'}</td>
                  <td className="px-5 py-3 text-xs text-white">{a.warehouse || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-300">{a.message || '—'}</td>
                  <td className="px-5 py-3 text-xs font-bold text-white">
                    {a.quantity != null ? `${a.quantity} / ${a.threshold || 0}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
