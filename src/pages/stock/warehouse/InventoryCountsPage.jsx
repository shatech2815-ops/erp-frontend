import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, ClipboardList, MapPin, 
  Edit2, Trash2, RefreshCw, Calendar, CheckCircle,
  AlertCircle, Eye,
} from 'lucide-react';

import {
  getAllInventoryCounts,
  deleteInventoryCount,
} from '../../../services/stock/wareHouse.services';

const StatusBadge = ({ status }) => {
  const colors = {
    PLANNED:     { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    IN_PROGRESS: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
    COMPLETED:   { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
  };
  const c = colors[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      {status?.replace('_', ' ')}
    </span>
  );
};

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

export default function InventoryCountsPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const response = await getAllInventoryCounts();
      const countsData = Array.isArray(response) ? response : response?.data || [];
      setCounts(countsData);
    } catch (error) {
      console.error('Error fetching inventory counts:', error);
      showToast('Failed to load inventory counts', 'error');
      setCounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCounts(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteInventoryCount(id);
      setCounts((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
      showToast('Inventory count deleted successfully.');
    } catch (error) {
      console.error('Error deleting inventory count:', error);
      showToast('Failed to delete inventory count', 'error');
    }
  };

  const filtered = counts.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || (c.countName || '').toLowerCase().includes(q) || (c.warehouse || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/stock/warehouse')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <ClipboardList size={22} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Inventory Counts</h2>
          <p className="text-sm text-gray-400">Schedule and track physical stocktakes</p>
        </div>
        <button onClick={() => showToast("Add Inventory Count feature coming soon!", "info")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          <Plus size={16} /> New Count
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Counts" value={counts.length} color="#dc2626" icon={ClipboardList} />
        <StatCard label="Planned" value={counts.filter(c => c.status === 'PLANNED').length} color="#3b82f6" icon={Calendar} />
        <StatCard label="In Progress" value={counts.filter(c => c.status === 'IN_PROGRESS').length} color="#d97706" icon={RefreshCw} />
        <StatCard label="Completed" value={counts.filter(c => c.status === 'COMPLETED').length} color="#059669" icon={CheckCircle} />
      </div>

      {/* Search & Filter */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or warehouse…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none min-w-[160px]">
            <option value="">All Statuses</option>
            {['PLANNED', 'IN_PROGRESS', 'COMPLETED'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <button onClick={fetchCounts}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(255,255,255,0.10)] transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <ClipboardList size={28} style={{ color: '#dc2626' }} />
            </div>
            <p className="font-bold text-white text-lg">No Inventory Counts Found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || statusFilter ? 'Try adjusting your filters' : 'Schedule your first stocktake to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(139,92,246,0.12)]">
            {filtered.map(c => (
              <div key={c.id}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <ClipboardList size={18} style={{ color: '#dc2626' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white text-sm">{c.countName || '—'}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {c.warehouse && <span className="flex items-center gap-1"><MapPin size={11} />{c.warehouse}</span>}
                      {c.scheduledDate && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(c.scheduledDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center hover:bg-[rgba(255,255,255,0.10)] transition-colors">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => setDeleteId(c.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expandedId === c.id && (
                  <div className="px-5 pb-4 bg-white/5 border-t border-white/10">
                    <div className="mt-3">
                      <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-2">Notes</p>
                      <p className="text-sm text-gray-300">{c.notes || 'No notes provided.'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <h3 className="text-center font-bold text-white text-lg mb-1">Delete Inventory Count?</h3>
            <p className="text-center text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
