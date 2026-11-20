import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Eye, FileText, ChevronRight, Clock, CheckCircle, Scale } from 'lucide-react';
import { getAllRFQs } from "../../services/purchase/rfq.services";

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
  SENT:  { label: 'Sent',  color: '#2563eb', bg: 'rgba(59,130,246,0.15)' },
  CLOSED: { label: 'Closed', color: '#059669', bg: 'rgba(16,185,129,0.15)' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

const RFQList = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const data = await getAllRFQs();
      setRfqs(data || []);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    }
  };

  const filtered = rfqs.filter(r => 
    !search || 
    r.rfqNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.requisitionNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">RFQ List</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/purchase')}
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <FileText size={22} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Request For Quotation (RFQ)</h2>
            <p className="text-sm text-gray-400">Manage vendor sourcing requests</p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard/purchase/create-rfq')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
          + Create New RFQ
        </button>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search RFQ No, PR No..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 text-white"
          />
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))' }}>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">RFQ No</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Req No</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Deadline</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-[rgba(255,255,255,0.03)] text-white">
                <td className="px-4 py-3 font-bold text-[#7c3aed]">{r.rfqNumber}</td>
                <td className="px-4 py-3">{r.requisitionNumber || '-'}</td>
                <td className="px-4 py-3 text-gray-400">{r.responseDeadline || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/dashboard/purchase/quotations/comparison', { state: { rfq: r } })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors whitespace-nowrap"
                      title="Compare Vendor Quotations"
                    >
                      <Scale size={12} />
                      Compare Quotes
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No RFQs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RFQList;
