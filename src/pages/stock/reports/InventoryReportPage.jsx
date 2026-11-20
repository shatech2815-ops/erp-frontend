import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, Search, Package, Filter, RefreshCw, TrendingUp,
} from 'lucide-react';

// Backend InventoryValuationDTO: stockId, warehouse, quantity, unitCost, totalValue, status
// const API_VALUATION       = '/api/stock/reports/valuation';
// const API_VALUATION_TOTAL = '/api/stock/reports/valuation/total';
import {
  getInventoryValuation,
  getTotalInventoryValue,
} from "../../../services/stock/stock.services";

const StatusBadge = ({ status }) => {
  const map = {
    BELOW:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626', label: 'Below Min' },
    MINIMUM: { bg: 'rgba(16,185,129,0.15)', color: '#059669', label: 'Normal' },
    MAXIMUM: { bg: 'rgba(245,158,11,0.15)', color: '#d97706', label: 'Overstock' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status || '—' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

export default function InventoryReportPage() {
  const navigate = useNavigate();
  const [records, setRecords]     = useState([]);
  const [totalValue, setTotalValue] = useState(null);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading]     = useState(false);

  useEffect(() => { load(); }, []);

  // const load = async () => {
  //   setLoading(true);
  //   try {
  //     const [vRes, tRes] = await Promise.all([
  //       fetch(API_VALUATION),
  //       fetch(API_VALUATION_TOTAL),
  //     ]);
  //     if (vRes.ok) setRecords(await vRes.json());
  //     if (tRes.ok) setTotalValue(await tRes.json());
  //   } catch {}
  //   setLoading(false);
  // };

  const load = async () => {
  setLoading(true);

  try {
    const [valuationData, totalData] = await Promise.all([
      getInventoryValuation(),
      getTotalInventoryValue(),
    ]);

    setRecords(valuationData || []);
    setTotalValue(totalData || 0);
  } catch (error) {
    console.error("Error loading inventory valuation report:", error);
    setRecords([]);
    setTotalValue(0);
  } finally {
    setLoading(false);
  }
};

  const filtered = records.filter(r => {
    const matchQ = !search || (r.warehouse || '').toLowerCase().includes(search.toLowerCase());
    const matchS = filterStatus === 'ALL' || r.status === filterStatus;
    return matchQ && matchS;
  });

  const totalQty = records.reduce((s, r) => s + (r.quantity || 0), 0);
  const calcTotal = totalValue ?? records.reduce((s, r) => s + (r.totalValue || 0), 0);

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#34d399] flex items-center justify-center">
            <DollarSign size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Inventory Valuation Report</h1>
            <p className="text-xs text-gray-400 mt-0.5">Total inventory value by warehouse</p>
          </div>
        </div>
        <button onClick={load} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Entries',   value: records.length,                                           color: '#8b5cf6', icon: Package },
          { label: 'Total Quantity',  value: parseFloat(totalQty.toFixed(2)),                         color: '#059669', icon: TrendingUp },
          { label: 'Total Value (₹)', value: `₹${Number(calcTotal || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, color: '#6366f1', icon: DollarSign },
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
              placeholder="Search by warehouse…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300">
              <option value="ALL">All Statuses</option>
              <option value="BELOW">Below Min</option>
              <option value="MINIMUM">Normal</option>
              <option value="MAXIMUM">Overstock</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#059669] to-[#34d399] text-white text-xs uppercase tracking-wide">
                {['#', 'Stock ID', 'Warehouse', 'Quantity', 'Unit Cost (₹)', 'Total Value (₹)', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No valuation data found.'}</td></tr>
              ) : filtered.map((r, idx) => (
                <tr key={r.stockId || idx} className={`border-b border-white/10 hover:bg-white/10 ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-5 py-3 text-xs text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3 text-xs font-mono text-purple-300">#{r.stockId}</td>
                  <td className="px-5 py-3 text-xs font-semibold text-white">{r.warehouse || '—'}</td>
                  <td className="px-5 py-3 text-xs font-bold text-white">{r.quantity ?? '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-300">₹{Number(r.unitCost || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-xs font-bold text-[#059669]">₹{Number(r.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 bg-purple-500/10 border-t border-white/10 flex justify-end">
            <span className="text-sm font-bold text-white">
              Total: ₹{Number(filtered.reduce((s, r) => s + (r.totalValue || 0), 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
