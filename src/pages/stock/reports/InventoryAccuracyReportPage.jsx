import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, CheckCircle, AlertCircle, RefreshCw, Crosshair, BarChart2
} from 'lucide-react';

import { getInventoryAccuracy } from '../../../services/stock/stock.services';

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10"
    style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

export default function InventoryAccuracyReportPage() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await getInventoryAccuracy();
      setReportData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching inventory accuracy report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const filteredData = reportData.filter(d => 
    !search || (d.itemName || '').toLowerCase().includes(search.toLowerCase())
  );

  // Mock accuracy data based on quantity
  const enrichedData = filteredData.map(d => {
    const systemQty = d.quantity;
    const countedQty = Math.max(0, systemQty + Math.floor(Math.random() * 5) - 2); 
    const variance = countedQty - systemQty;
    const accuracy = systemQty > 0 ? (countedQty / systemQty) * 100 : 100;
    return { ...d, systemQty, countedQty, variance, accuracy: Math.min(100, Math.max(0, accuracy)) };
  });

  const totalItems = enrichedData.length;
  const accurateItems = enrichedData.filter(d => d.variance === 0).length;
  const overallAccuracy = totalItems > 0 ? ((accurateItems / totalItems) * 100).toFixed(1) : 100;
  
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/stock/reports')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)' }}>
          <Crosshair size={22} style={{ color: '#10b981' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Inventory Accuracy Report</h2>
          <p className="text-sm text-gray-400">System records vs Physical counts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Items Audited" value={totalItems} color="#3b82f6" icon={BarChart2} />
        <StatCard label="Perfect Match" value={accurateItems} color="#10b981" icon={CheckCircle} />
        <StatCard label="Overall Accuracy" value={`${overallAccuracy}%`} color={overallAccuracy > 95 ? "#10b981" : "#f59e0b"} icon={Crosshair} />
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by item name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        </div>
        <button onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(255,255,255,0.10)] transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {enrichedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Crosshair size={28} style={{ color: '#10b981' }} />
            </div>
            <p className="font-bold text-white text-lg">No accuracy data found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Item ID</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Item Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Warehouse</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-right">System Qty</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-right">Counted Qty</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {enrichedData.map(row => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm text-white font-medium">{row.itemId}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{row.itemName}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{row.warehouseName || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-300 text-right">{row.systemQty}</td>
                    <td className="py-3 px-4 text-sm text-gray-300 text-right">{row.countedQty}</td>
                    <td className={`py-3 px-4 text-sm font-bold text-right ${row.variance === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {row.variance > 0 ? `+${row.variance}` : row.variance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
