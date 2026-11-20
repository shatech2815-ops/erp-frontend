import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Search, CheckCircle, Clock, Filter, RefreshCw,
  DollarSign, Package, TrendingUp,
} from 'lucide-react';

// Backend ProductionReportDTO: planCode, plant, status, priority, startDate, endDate,
// totalWorkOrders, totalQuantity, estimatedCost, completedOrders
// const API_PRODUCTION_REPORT = '/api/production/reports/production';

import { getProductionReport } from "../../../services/stock/production.services";

const StatusBadge = ({ status }) => {
  const map = {
    PLANNED:     { bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8' },
    IN_PROGRESS: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
    COMPLETED:   { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
    CANCELLED:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
    RELEASED:    { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
    CREATED:     { bg: '#f1f5f9', color: '#64748b' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {status?.replace('_', ' ') || '—'}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const map = {
    HIGH:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
    MEDIUM: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
    LOW:    { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
  };
  const s = map[priority] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {priority || '—'}
    </span>
  );
};

export default function ProductionReportPage() {
  const navigate = useNavigate();
  const [records, setRecords]         = useState([]);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [loading, setLoading]         = useState(false);

  useEffect(() => { load(); }, []);

  // const load = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(API_PRODUCTION_REPORT);
  //     if (res.ok) { setRecords(await res.json()); setLoading(false); return; }
  //   } catch {}
  //   setLoading(false);
  // };

  const load = async () => {
  setLoading(true);

  try {
    const data = await getProductionReport();
    setRecords(data || []);
  } catch (error) {
    console.error("Error loading production report:", error);
    setRecords([]);
  } finally {
    setLoading(false);
  }
};

  const filtered = records.filter(r => {
    const matchQ = !search || (r.planCode || '').toLowerCase().includes(search.toLowerCase()) || (r.plant || '').toLowerCase().includes(search.toLowerCase());
    const matchS = filterStatus === 'ALL' || r.status === filterStatus;
    const matchP = filterPriority === 'ALL' || r.priority === filterPriority;
    return matchQ && matchS && matchP;
  });

  const totalCost = records.reduce((s, r) => s + (r.estimatedCost || 0), 0);
  const totalWO   = records.reduce((s, r) => s + (r.totalWorkOrders || 0), 0);
  const totalCompleted = records.reduce((s, r) => s + (r.completedOrders || 0), 0);

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a5b4fc] flex items-center justify-center">
            <Settings size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Production Report</h1>
            <p className="text-xs text-gray-400 mt-0.5">Summary of all production plans and work orders</p>
          </div>
        </div>
        <button onClick={load} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Plans',    value: records.length,   color: '#8b5cf6', icon: Package },
          { label: 'Work Orders',    value: totalWO,          color: '#6366f1', icon: TrendingUp },
          { label: 'Completed',      value: totalCompleted,   color: '#059669', icon: CheckCircle },
          { label: 'Est. Cost (₹)',  value: `₹${Number(totalCost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#d97706', icon: DollarSign },
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
              placeholder="Search by plan code or plant…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300">
              <option value="ALL">All Statuses</option>
              {['PLANNED','IN_PROGRESS','CREATED','CANCELLED','RELEASED','COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300">
              <option value="ALL">All Priorities</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} plans</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#6366f1] to-[#a5b4fc] text-white text-xs uppercase tracking-wide">
                {['Plan Code', 'Plant', 'Status', 'Priority', 'Start', 'End', 'Work Orders', 'Total Qty', 'Completed', 'Est. Cost'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No production data found.'}</td></tr>
              ) : filtered.map((r, idx) => (
                <tr key={idx} className={`border-b border-white/10 hover:bg-white/10 ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-4 py-3 text-xs font-bold text-white font-mono">{r.planCode || '—'}</td>
                  <td className="px-4 py-3 text-xs text-purple-300">{r.plant || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.startDate || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.endDate || '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white">{r.totalWorkOrders ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white">{r.totalQuantity ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#059669] font-bold">{r.completedOrders ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white">
                    {r.estimatedCost != null ? `₹${Number(r.estimatedCost).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
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
