import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowLeftRight, Search, TrendingUp, TrendingDown,
  Package, Filter, RefreshCw,
} from 'lucide-react';

// const API_MOVEMENT = '/api/stock/reports/movement';
import { getStockMovementReport } from "../../../services/stock/stock.services";

// Backend StockMovementDTO: id, type (ADJUSTMENT/TRANSFER), movement (IN/OUT), quantity, warehouse, reference, date
const TypeBadge = ({ movement }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${movement === 'IN' ? 'bg-emerald-500/10 text-[#6ee7b7]' : 'bg-red-500/10 text-[#991b1b]'}`}>
    {movement === 'IN' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
    {movement || '—'}
  </span>
);

export default function StockMovementReportPage() {
  const navigate = useNavigate();
  const [records, setRecords]         = useState([]);
  const [search, setSearch]           = useState('');
  const [filterMovement, setFilterMovement] = useState('ALL');
  const [filterType, setFilterType]   = useState('ALL');
  const [loading, setLoading]         = useState(false);

  useEffect(() => { load(); }, []);

  // const load = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(API_MOVEMENT);
  //     if (res.ok) { setRecords(await res.json()); setLoading(false); return; }
  //   } catch {}
  //   try { const d = localStorage.getItem('srivaari_stock_movements'); if (d) setRecords(JSON.parse(d)); } catch {}
  //   setLoading(false);
  // };

  const load = async () => {
  setLoading(true);

  try {
    const data = await getStockMovementReport();
    setRecords(data || []);
  } catch (error) {
    console.error("Error loading stock movement report:", error);
    setRecords([]);
  } finally {
    setLoading(false);
  }
};

  const filtered = records.filter(r => {
    const matchQ = !search || (r.warehouse || '').toLowerCase().includes(search.toLowerCase()) || (r.reference || '').toLowerCase().includes(search.toLowerCase());
    const matchM = filterMovement === 'ALL' || r.movement === filterMovement;
    const matchT = filterType === 'ALL' || r.type === filterType;
    return matchQ && matchM && matchT;
  });

  const totalIn  = records.filter(r => r.movement === 'IN').reduce((s, r) => s + (r.quantity || 0), 0);
  const totalOut = records.filter(r => r.movement === 'OUT').reduce((s, r) => s + (r.quantity || 0), 0);

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
            <ArrowLeftRight size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Stock Movement Report</h1>
            <p className="text-xs text-gray-400 mt-0.5">All inbound and outbound stock movements</p>
          </div>
        </div>
        <button onClick={load} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Movements', value: records.length, color: '#8b5cf6', icon: Package },
          { label: 'Stock In',   value: records.filter(r => r.movement === 'IN').length,  color: '#059669', icon: TrendingUp },
          { label: 'Stock Out',  value: records.filter(r => r.movement === 'OUT').length, color: '#dc2626', icon: TrendingDown },
          { label: 'Net Qty',    value: parseFloat((totalIn - totalOut).toFixed(2)),      color: '#d97706', icon: ArrowLeftRight },
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
              placeholder="Search by warehouse or reference…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300">
              <option value="ALL">All Types</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <select value={filterMovement} onChange={e => setFilterMovement(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300">
              <option value="ALL">All Movements</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                {['#', 'Type', 'Movement', 'Qty', 'Warehouse', 'Reference', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No movement records found.'}</td></tr>
              ) : filtered.map((r, idx) => (
                <tr key={r.id || idx} className={`border-b border-white/10 hover:bg-white/10 ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-5 py-3 text-xs text-gray-400">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">{r.type || '—'}</span>
                  </td>
                  <td className="px-5 py-3"><TypeBadge movement={r.movement} /></td>
                  <td className="px-5 py-3 text-xs font-bold text-white">{r.quantity ?? '—'}</td>
                  <td className="px-5 py-3 text-xs text-purple-300">{r.warehouse || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{r.reference || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {r.date ? new Date(r.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
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
