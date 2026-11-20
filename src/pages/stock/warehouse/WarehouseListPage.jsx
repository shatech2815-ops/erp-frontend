import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Warehouse, MapPin, Mail, Phone,
  Edit2, Trash2, RefreshCw, Building2, Package, ChevronRight,
  AlertCircle, CheckCircle, X, Eye,
} from 'lucide-react';

import {
  getAllWarehouses,
  deactivateWarehouse,
} from '../../../services/stock/wareHouse.services';
// const LS_KEY   = 'srivaari_warehouselist';

const WAREHOUSE_TYPES = ['DISTRIBUTION', 'STORAGE', 'COLD_STORAGE'];

const TypeBadge = ({ type }) => {
  const colors = {
    DISTRIBUTION: { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
    STORAGE:      { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
    COLD_STORAGE: { bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8' },
  };
  const c = colors[type] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      {type?.replace('_', ' ')}
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

export default function WarehouseListPage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // const loadFromStorage = () => {
  //   try {
  //     const raw = localStorage.getItem(LS_KEY);
  //     return raw ? JSON.parse(raw) : [];
  //   } catch { return []; }
  // };

  // const saveToStorage = (data) => {
  //   localStorage.setItem(LS_KEY, JSON.stringify(data));
  // };

  // const fetchWarehouses = async () => {
  //   setLoading(true);
  //   try {
  //     if (!res.ok) throw new Error();
  //     const data = await res.json();
  //     setWarehouses(data);
  //     saveToStorage(data);
  //   } catch {
  //     const cached = loadFromStorage();
  //     setWarehouses(cached);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchWarehouses = async () => {
  setLoading(true);

  try {
    const response = await getAllWarehouses();

    const warehouseData = Array.isArray(response)
      ? response
      : response?.data || [];

    setWarehouses(warehouseData);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    showToast('Failed to load warehouses', 'error');
    setWarehouses([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchWarehouses(); }, []);

  // const handleDelete = (id) => {
  //   const updated = warehouses.filter(w => w.id !== id);
  //   setWarehouses(updated);
  //   try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
  //   setDeleteId(null);
  //   showToast('Warehouse deleted.');
  // };

  const handleDelete = async (id) => {
  try {
    await deactivateWarehouse(id);

    setWarehouses((prev) => prev.filter((w) => w.id !== id));
    setDeleteId(null);
    showToast('Warehouse deleted successfully.');
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    showToast('Failed to delete warehouse', 'error');
  }
};

  const filtered = warehouses.filter(w => {
    const q = search.toLowerCase();
    const matchSearch = !q || (w.code || '')?.toLowerCase().includes(q) || (w.name || '')?.toLowerCase().includes(q) || (w.city || '')?.toLowerCase().includes(q);
    const matchType = !typeFilter || w.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalCapacity = warehouses.reduce((s, w) => s + (Number(w.capacity) || 0), 0);

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
          <Warehouse size={22} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Warehouse List</h2>
          <p className="text-sm text-gray-400">View and manage all warehouses</p>
        </div>
        <button onClick={() => navigate('/dashboard/stock/warehouse/add-warehouse')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          <Plus size={16} /> Add Warehouse
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Warehouses" value={warehouses.length} color="#dc2626" icon={Building2} />
        <StatCard label="Distribution" value={warehouses.filter(w => w.type === 'DISTRIBUTION').length} color="#7c3aed" icon={Package} />
        <StatCard label="Cold Storage" value={warehouses.filter(w => w.type === 'COLD_STORAGE').length} color="#1d4ed8" icon={Warehouse} />
        <StatCard label="Total Capacity" value={totalCapacity.toLocaleString()} color="#059669" icon={Building2} />
      </div>

      {/* Search & Filter */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by code, name or city…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none min-w-[160px]">
            <option value="">All Types</option>
            {WAREHOUSE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <button onClick={fetchWarehouses}
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
              <Warehouse size={28} style={{ color: '#dc2626' }} />
            </div>
            <p className="font-bold text-white text-lg">No Warehouses Found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || typeFilter ? 'Try adjusting your filters' : 'Add your first warehouse to get started'}
            </p>
            {!search && !typeFilter && (
              <button onClick={() => navigate('/dashboard/stock/warehouse/add-warehouse')}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: '#dc2626' }}>
                <Plus size={14} /> Add Warehouse
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[rgba(139,92,246,0.12)]">
            {filtered.map(w => (
              <div key={w.id}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <Building2 size={18} style={{ color: '#dc2626' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white text-sm">{w.name || '—'}</p>
                      <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{w.code || '—'}</span>
                      <TypeBadge type={w.type} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {w.city && <span className="flex items-center gap-1"><MapPin size={11} />{w.city}{w.state ? `, ${w.state}` : ''}</span>}
                      {w.email && <span className="flex items-center gap-1"><Mail size={11} />{w.email}</span>}
                      {w.capacity && <span className="flex items-center gap-1"><Package size={11} />Capacity: {w.capacity}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                      className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center hover:bg-[rgba(255,255,255,0.10)] transition-colors">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => navigate('/dashboard/stock/warehouse/add-warehouse', { state: { warehouse: w } })}
                      className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center hover:bg-[rgba(255,255,255,0.10)] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(w.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expandedId === w.id && (
                  <div className="px-5 pb-4 bg-white/5 border-t border-white/10">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {[
                        { label: 'Country', value: w.country },
                        { label: 'Contact Person', value: w.contactPerson },
                        { label: 'Total Area', value: w.totalArea },
                        { label: 'Locations', value: w.locations?.length || 0 },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-[#140f2d]/80 rounded-xl p-3 border border-white/10">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-bold text-white mt-0.5">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                    {w.locations?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-2">Locations</p>
                        <div className="flex flex-wrap gap-2">
                          {w.locations.map((loc, i) => (
                            <span key={i} className="text-xs px-3 py-1 rounded-full bg-[#140f2d]/80 border border-white/10 text-purple-300 font-medium">
                              {loc.locationCode} – {loc.locationName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
            <h3 className="text-center font-bold text-white text-lg mb-1">Delete Warehouse?</h3>
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
