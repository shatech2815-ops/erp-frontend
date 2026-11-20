import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Calendar, Hash, User,
  AlertCircle, CheckCircle, Zap, Clock, Search,
  Trash2, Edit2, RefreshCw, X, Package,
} from 'lucide-react';


import {
  createProductionSchedule,
  updateProductionSchedule,
  deleteProductionSchedule,
  getAllProductionSchedules,
} from "../../../services/stock/productionSchedule.services";

import{ getAllWorkOrders} from "../../../services/stock/production.services"
const LS_KEY       = 'mveng_schedules';
const LS_WORKORDERS = 'mveng_workorders';

const SCHEDULE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'CREATED', 'CANCELLED', 'RELEASED', 'COMPLETED'];

const STATUS_COLORS = {
  PLANNED:     { bg: '#f1f5f9', color: '#64748b' },
  SCHEDULED:   { bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8' },
  CREATED:     { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
  RELEASED:    { bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8' },
  IN_PROGRESS: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
  RUNNING:     { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
  COMPLETED:   { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
  CANCELLED:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {status}
    </span>
  );
};

const emptyForm = {
  workOrderId: '', scheduledStartTime: '', scheduledEndTime: '',
  machine: '', operator: '', status: 'PLANNED',
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={14} /></span>}
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all`}
      />
    </div>
  </div>
);

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10"
    style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
      <Icon size={15} style={{ color }} />
    </div>
    <p className="text-2xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
  </div>
);

export default function ProductionSchedulingPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules]   = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const [deleteId, setDeleteId]     = useState(null);


  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const loadFromStorage = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  };

  // const fetchAll = async () => {
  //   setLoading(true);
  //   try {
  //     const [sRes, wRes] = await Promise.all([
  //       fetch('/api/production/schedules'),
  //       fetch('/api/production/work-orders'),
  //     ]);
  //     if (sRes.ok) { const d = await sRes.json(); setSchedules(d); localStorage.setItem(LS_KEY, JSON.stringify(d)); }
  //     else setSchedules(loadFromStorage());
  //     if (wRes.ok) {
  //       const wos = await wRes.json();
  //       setWorkOrders(wos);
  //     } else {
  //       try {
  //         const raw = localStorage.getItem('mveng_workorders');
  //         if (raw) setWorkOrders(JSON.parse(raw));
  //       } catch {}
  //     }
  //   } catch {
  //     setSchedules(loadFromStorage());
  //   } finally { setLoading(false); }
  // };

  const fetchAll = async () => {
  setLoading(true);

  try {
    const [schedulesData, workOrdersData] = await Promise.all([
      getAllProductionSchedules(),
      getAllWorkOrders(),
    ]);

    setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    setWorkOrders(Array.isArray(workOrdersData) ? workOrdersData : []);
  } catch (error) {
    console.error("Error loading schedules:", error);
    showToast("Failed to load schedules", "error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchAll(); }, []);

  // const handleSave = async () => {
  //   if (!form.workOrderId) { showToast('Work Order is required.', 'error'); return; }
  //   setSaving(true);
  //   const payload = {
  //     workOrder:          { id: Number(form.workOrderId) },
  //     scheduledStartTime: form.scheduledStartTime || null,
  //     scheduledEndTime:   form.scheduledEndTime   || null,
  //     machine:            form.machine  || null,
  //     operator:           form.operator || null,
  //     status:             form.status,
  //   };
  //   try {
  //     const res = await fetch('/api/production/schedules', {
  //       method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  //     });
  //     if (res.ok) { showToast('Schedule saved!'); setShowForm(false); setForm(emptyForm); setEditId(null); fetchAll(); }
  //     else throw new Error();
  //   } catch {
  //     let stored = [];
  //     try { const d = localStorage.getItem(LS_KEY); if (d) stored = JSON.parse(d); } catch {}
  //     const updated = editId !== null
  //       ? stored.map(s => s.id === editId ? { ...s, ...form } : s)
  //       : [...stored, { ...form, id: Date.now() }];
  //     setSchedules(updated);
  //     try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
  //     showToast(editId !== null ? 'Schedule updated.' : 'Schedule created.');
  //     setShowForm(false); setForm(emptyForm); setEditId(null);
  //   } finally { setSaving(false); }
  // };


  const handleSave = async () => {
  if (!form.workOrderId) {
    showToast("Work Order is required.", "error");
    return;
  }

  setSaving(true);

  const payload = {
    workOrder: {
      id: Number(form.workOrderId),
    },

    scheduledStartTime: form.scheduledStartTime || null,
    scheduledEndTime: form.scheduledEndTime || null,
    machine: form.machine || null,
    operator: form.operator || null,
    status: form.status,
  };

  try {
    if (editId) {
      await updateProductionSchedule(editId, payload);
      showToast("Schedule updated!");
    } else {
      await createProductionSchedule(payload);
      showToast("Schedule created!");
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
    fetchAll();
  } catch (error) {
    console.error("Save schedule error:", error);
    showToast(editId ? "Update failed." : "Save failed.", "error");
  } finally {
    setSaving(false);
  }
};


  const handleEdit = (s) => {
    setForm({
      workOrderId:        s.workOrder?.id          ?? '',
      scheduledStartTime: s.scheduledStartTime      || '',
      scheduledEndTime:   s.scheduledEndTime        || '',
      machine:            s.machine                || '',
      operator:           s.operator               || '',
      status:             s.status                 || 'PLANNED',
    });
    setEditId(s.id);
    setShowForm(true);
  };

  // const handleDelete = (id) => {
  //   let stored = [];
  //   try { const d = localStorage.getItem(LS_KEY); if (d) stored = JSON.parse(d); } catch {}
  //   const updated = stored.filter(s => s.id !== id);
  //   setSchedules(updated);
  //   try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
  //   showToast('Schedule deleted.');
  // };

  const handleDelete = async (id) => {
  try {
    await deleteProductionSchedule(id);
    showToast("Schedule deleted!");
    fetchAll();
  } catch (error) {
    console.error("Delete error:", error);
    showToast("Delete failed.", "error");
  }

  setDeleteId(null);
};

  const filtered = schedules.filter(s => {
    const q = search.toLowerCase();
    const wo = s.workOrder?.workOrderCode || '';
    const matchSearch = !q || wo.toLowerCase().includes(q) || s.machine?.toLowerCase().includes(q) || s.operator?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/stock/production')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <Zap size={22} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Production Scheduling</h2>
          <p className="text-sm text-gray-400">Schedule machines and operators for work orders</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          <Plus size={16} /> New Schedule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {SCHEDULE_STATUSES.map(s => (
          <StatCard key={s} label={s} value={schedules.filter(sc => sc.status === s).length}
            color={STATUS_COLORS[s].color} icon={Clock} />
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by work order, machine, operator…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-300 focus:outline-none appearance-none min-w-[150px]">
          <option value="">All Statuses</option>
          {SCHEDULE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(255,255,255,0.10)] transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <Zap size={16} style={{ color: '#dc2626' }} />
                </div>
                <h3 className="font-bold text-white">{editId ? 'Edit Schedule' : 'New Schedule'}</h3>
              </div>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Work Order <span className="text-red-400">*</span></label>
                <select value={form.workOrderId} onChange={e => set('workOrderId', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none">
                  <option value="">-- Select Work Order --</option>
                  {workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.workOrderCode} (Qty: {wo.quantity})</option>)}
                </select>
              </div>
              <InputField label="Scheduled Start Time" value={form.scheduledStartTime} onChange={v => set('scheduledStartTime', v)} type="datetime-local" icon={Calendar} />
              <InputField label="Scheduled End Time" value={form.scheduledEndTime} onChange={v => set('scheduledEndTime', v)} type="datetime-local" icon={Calendar} />
              <InputField label="Machine" placeholder="e.g. CNC-01" value={form.machine} onChange={v => set('machine', v)} />
              <InputField label="Operator" placeholder="Operator name" value={form.operator} onChange={v => set('operator', v)} icon={User} />
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {SCHEDULE_STATUSES.map(s => {
                    const c = STATUS_COLORS[s];
                    return (
                      <button key={s} onClick={() => set('status', s)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                        style={form.status === s ? { background: c.bg, color: c.color, borderColor: c.color } : { background: 'white', color: '#64748b', borderColor: 'rgba(226,232,240,0.14)' }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                <Save size={14} />{saving ? 'Saving…' : editId ? 'Update' : 'Save Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Zap size={28} style={{ color: '#dc2626' }} />
            </div>
            <p className="font-bold text-white text-lg">No Schedules Found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || statusFilter ? 'Adjust your filters' : 'Create your first production schedule'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(139,92,246,0.12)]">
            {filtered.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <Clock size={18} style={{ color: '#dc2626' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-white text-sm">{s.workOrder?.workOrderCode || `Schedule #${s.id}`}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {s.machine && <span>Machine: {s.machine}</span>}
                    {s.operator && <span className="flex items-center gap-1"><User size={11} />{s.operator}</span>}
                    {s.scheduledStartTime && (
                      <span className="flex items-center gap-1"><Calendar size={11} />{String(s.scheduledStartTime).replace('T', ' ').slice(0, 16)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(s)}
                    className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center hover:bg-[rgba(255,255,255,0.10)] transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(s.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-center font-bold text-white text-lg mb-1">Delete Schedule?</h3>
            <p className="text-center text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
