import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, PackageCheck, ChevronRight } from 'lucide-react';
import { getAllGRNs } from "../../services/purchase/grn.services";

const STATUS_CONFIG = {
  RECEIVED: { label: 'Received', color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
  INSPECTED: { label: 'Inspected', color: '#059669', bg: 'rgba(16,185,129,0.15)' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

const GRNList = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      const data = await getAllGRNs();
      setGrns(data || []);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
    }
  };

  const filtered = grns.filter(g => 
    !search || 
    g.grnNumber?.toLowerCase().includes(search.toLowerCase()) ||
    g.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
    g.vendor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">GRN List</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/purchase')}
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <PackageCheck size={22} style={{ color: '#059669' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Goods Receipt Note (GRN)</h2>
            <p className="text-sm text-gray-400">Track received materials and inventory updates</p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard/purchase/create-grn')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
          + Create GRN
        </button>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search GRN, PO No, Vendor..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/30 bg-white/5 text-white"
          />
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.08), rgba(4,120,87,0.08))' }}>
              <th className="text-left px-4 py-3 text-xs font-bold text-emerald-300 uppercase">GRN No</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-emerald-300 uppercase">PO No</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-emerald-300 uppercase">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-emerald-300 uppercase">Received Date</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-emerald-300 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-emerald-300 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map(g => (
              <tr key={g.id} className="hover:bg-[rgba(255,255,255,0.03)] text-white">
                <td className="px-4 py-3 font-bold text-emerald-400">{g.grnNumber}</td>
                <td className="px-4 py-3">{g.poNumber}</td>
                <td className="px-4 py-3 font-medium">{g.vendor}</td>
                <td className="px-4 py-3 text-gray-400">{g.receivedDate}</td>
                <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => navigate(`/dashboard/stock/inventory/quality?grnId=${g.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Quality Check
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No GRNs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default GRNList;
