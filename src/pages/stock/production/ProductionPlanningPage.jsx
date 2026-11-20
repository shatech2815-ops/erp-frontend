
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, Zap, Calendar, Hash,
  AlertCircle, CheckCircle, DollarSign, Package, BarChart2,
  Building2,
} from 'lucide-react';

import {
  createProductionPlan,
  getAllProductionPlans,
} from "../../../services/stock/production.services";
const LS_KEY_PLANS = 'mveng_productionplans';

const PRODUCTION_STATUSES = ['PLANNED', 'IN_PROGRESS', 'CREATED', 'CANCELLED', 'RELEASED', 'COMPLETED'];
const PRIORITIES           = ['HIGH', 'MEDIUM', 'LOW'];
const WORK_ORDER_STATUSES  = ['CREATED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const PRIORITY_COLORS = {
  HIGH:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
  MEDIUM: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
  LOW:    { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
};

const emptyPlan = {
  planCode: '', description: '', startDate: '', endDate: '',
  status: 'PLANNED', plant: '', priority: 'MEDIUM', estimatedCost: '',
  workOrders: [],
};

const emptyWO = {
  workOrderCode: '',
  quantity: '',
  productionPlanId: '',
  startDate: '',
  endDate: '',
  status: 'CREATED',
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={14} /></span>}
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder = 'Select…', required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none">
      <option value="">{placeholder}</option>
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden mb-5">
    <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-white/5 flex items-center gap-2">
      {Icon && <Icon size={14} style={{ color: '#dc2626' }} />}
      <p className="text-xs font-bold text-[#dc2626] uppercase tracking-widest">{title}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function ProductionPlanningPage() {
  const navigate = useNavigate();
  const [plan, setPlan]             = useState(emptyPlan);
  const [plans, setPlans]           = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (field, val) => setPlan(p => ({ ...p, [field]: val }));

  // const loadSavedPlans = async () => {
  //   try {
  //     const res = await fetch('/api/production/plans');
  //     if (res.ok) {
  //       const data = await res.json();
  //       setSavedPlans(Array.isArray(data) ? data : []);
  //       setPlans(Array.isArray(data) ? data : []);
  //       return;
  //     }
  //   } catch {}
  //   try {
  //     const raw = localStorage.getItem(LS_KEY_PLANS);
  //     if (raw) { const parsed = JSON.parse(raw); setSavedPlans(parsed); setPlans(parsed); }
  //   } catch {}
  // };

  const loadSavedPlans = async () => {
  try {
    const data = await getAllProductionPlans();

    console.log("Production Plans API Response:", data);

    const plansData = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
      ? data.data
      : [];

    setSavedPlans(plansData);
    setPlans(plansData);
  } catch (error) {
    console.error("Error loading production plans:", error);
    showToast("Failed to load production plans", "error");
  }
};

  useEffect(() => { loadSavedPlans(); }, []);

  const addWorkOrder = () => setPlan(p => ({ ...p, workOrders: [...p.workOrders, { ...emptyWO }] }));
  const removeWO = (i) => setPlan(p => ({ ...p, workOrders: p.workOrders.filter((_, idx) => idx !== i) }));
  const updateWO = (i, field, val) => setPlan(p => {
    const wos = [...p.workOrders];
    wos[i] = { ...wos[i], [field]: val };
    return { ...p, workOrders: wos };
  });

  // const handleSubmit = async () => {
  //   if (!plan.planCode.trim()) { showToast('Plan Code is required', 'error'); return; }
  //   setSaving(true);
  //   const payload = {
  //     planCode:      plan.planCode,
  //     description:   plan.description,
  //     startDate:     plan.startDate || null,
  //     endDate:       plan.endDate   || null,
  //     status:        plan.status,
  //     plant:         plan.plant,
  //     priority:      plan.priority,
  //     estimatedCost: plan.estimatedCost ? Number(plan.estimatedCost) : null,
  //     workOrders: plan.workOrders.map(wo => ({
  //       workOrderCode:      wo.workOrderCode,
  //       quantity:           wo.quantity ? Number(wo.quantity) : null,
  //       productionPlanning: wo.productionPlanId ? { id: Number(wo.productionPlanId) } : null,
  //       startDate:          wo.startDate || null,
  //       endDate:            wo.endDate   || null,
  //       status:             wo.status,
  //     })),
  //   };
  //   try {
  //     const res = await fetch('/api/production/plans', {
  //       method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  //     });
  //     if (!res.ok) throw new Error();
  //     const saved = await res.json();
  //     try {
  //       const raw = localStorage.getItem(LS_KEY_PLANS);
  //       const list = raw ? JSON.parse(raw) : [];
  //       localStorage.setItem(LS_KEY_PLANS, JSON.stringify([...list, saved]));
  //     } catch {}
  //     showToast('Production Plan saved!');
  //     setTimeout(() => { setPlan(emptyPlan); loadSavedPlans(); }, 1500);
  //   } catch {
  //     try {
  //       const raw = localStorage.getItem(LS_KEY_PLANS);
  //       const list = raw ? JSON.parse(raw) : [];
  //       localStorage.setItem(LS_KEY_PLANS, JSON.stringify([...list, { ...payload, id: Date.now() }]));
  //     } catch {}
  //     showToast('Production Plan saved (offline)!');
  //     setTimeout(() => { setPlan(emptyPlan); loadSavedPlans(); }, 1500);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSubmit = async () => {
  if (!plan.planCode.trim()) {
    showToast("Plan Code is required", "error");
    return;
  }

  setSaving(true);

  const payload = {
    planCode: plan.planCode,
    description: plan.description,
    startDate: plan.startDate || null,
    endDate: plan.endDate || null,
    status: plan.status,
    plant: plan.plant,
    priority: plan.priority,
    estimatedCost: plan.estimatedCost
      ? Number(plan.estimatedCost)
      : null,

    workOrders: plan.workOrders.map((wo) => ({
      workOrderCode: wo.workOrderCode,
      quantity: wo.quantity ? Number(wo.quantity) : null,
      startDate: wo.startDate || null,
      endDate: wo.endDate || null,
      status: wo.status,

      productionPlan: wo.productionPlanId
        ? { id: Number(wo.productionPlanId) }
        : null,
    })),
  };

  try {
    await createProductionPlan(payload);

    showToast("Production Plan saved successfully!");

    setPlan(emptyPlan);

    await loadSavedPlans();
  } catch (error) {
    console.error("Error saving production plan:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Failed to save Production Plan";

    showToast(errorMessage, "error");
  } finally {
    setSaving(false);
  }
};

  const priorityColor = PRIORITY_COLORS[plan.priority] || PRIORITY_COLORS.MEDIUM;

  return (
    <div className="space-y-4 w-full">
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
        <div>
          <h2 className="text-xl font-bold text-white">Production Planning</h2>
          <p className="text-sm text-gray-400">Create and manage production plans with work orders</p>
        </div>
      </div>

      {/* Plan Details */}
      <Section title="Plan Details" icon={BarChart2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Plan Code" placeholder="e.g. PLAN-2024-001" value={plan.planCode} onChange={v => set('planCode', v)} icon={Hash} required />
          <SelectField label="Status" value={plan.status} onChange={v => set('status', v)} options={PRODUCTION_STATUSES} />
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Description</label>
            <textarea value={plan.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional plan description…" rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all resize-none" />
          </div>
          <InputField label="Start Date" value={plan.startDate} onChange={v => set('startDate', v)} type="date" icon={Calendar} />
          <InputField label="End Date" value={plan.endDate} onChange={v => set('endDate', v)} type="date" icon={Calendar} />
          <InputField label="Plant / Facility" placeholder="e.g. Plant A" value={plan.plant} onChange={v => set('plant', v)} icon={Building2} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Priority</label>
            <select value={plan.priority} onChange={e => set('priority', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none"
              style={{ color: priorityColor.color }}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <InputField label="Estimated Cost (₹)" placeholder="0.00" value={plan.estimatedCost} onChange={v => set('estimatedCost', v)} type="number" icon={DollarSign} />
        </div>
      </Section>

      {/* Work Orders */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden mb-5">
        <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={14} style={{ color: '#dc2626' }} />
            <p className="text-xs font-bold text-[#dc2626] uppercase tracking-widest">Work Orders ({plan.workOrders.length})</p>
          </div>
          <button onClick={addWorkOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: '#dc2626' }}>
            <Plus size={12} /> Add Work Order
          </button>
        </div>
        <div className="p-6 space-y-4">
          {plan.workOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No work orders added yet</p>
              <button onClick={addWorkOrder} className="mt-3 text-xs text-[#dc2626] font-semibold hover:underline">
                + Add first work order
              </button>
            </div>
          ) : (
            plan.workOrders.map((wo, i) => (
              <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Work Order #{i + 1}</span>
                  <button onClick={() => removeWO(i)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <InputField
                    label="Work Order Code" placeholder="e.g. WO-001"
                    value={wo.workOrderCode} onChange={v => updateWO(i, 'workOrderCode', v)}
                    icon={Hash} required
                  />

                  <InputField
                    label="Quantity" placeholder="0"
                    value={wo.quantity} onChange={v => updateWO(i, 'quantity', v)}
                    type="number" icon={Package}
                  />

                  {/* Production Plan dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Production Plan</label>
                    <select
                      value={wo.productionPlanId}
                      onChange={e => updateWO(i, 'productionPlanId', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none">
                      <option value="">-- Select Plan --</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.planCode || `Plan #${p.id}`}</option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    label="Start Date"
                    value={wo.startDate} onChange={v => updateWO(i, 'startDate', v)}
                    type="date" icon={Calendar}
                  />

                  <InputField
                    label="End Date"
                    value={wo.endDate} onChange={v => updateWO(i, 'endDate', v)}
                    type="date" icon={Calendar}
                  />

                  {/* Status toggle buttons */}
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {WORK_ORDER_STATUSES.map(s => (
                        <button key={s} type="button" onClick={() => updateWO(i, 'status', s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${wo.status === s ? 'bg-[#dc2626] text-white border-[#dc2626]' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <button onClick={() => setPlan(emptyPlan)}
          className="flex-1 py-3 rounded-xl border border-white/10 text-purple-300 font-semibold hover:bg-white/10 transition-colors">
          Reset
        </button>
        <button onClick={handleSubmit} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          <Save size={16} />{saving ? 'Saving…' : 'Save Production Plan'}
        </button>
      </div>

      {/* Saved Production Plans List */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden mb-6">
        <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} style={{ color: '#dc2626' }} />
            <p className="text-xs font-bold text-[#dc2626] uppercase tracking-widest">
              Saved Production Plans ({savedPlans.length})
            </p>
          </div>
          <button onClick={loadSavedPlans} className="text-xs text-purple-300 font-semibold hover:underline">
            Refresh
          </button>
        </div>
        {savedPlans.length === 0 ? (
          <div className="text-center py-10">
            <BarChart2 size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No production plans saved yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #fff1f1, #fff8f8)' }}>
                  {['Plan Code', 'Description', 'Start Date', 'End Date', 'Plant / Facility', 'Priority', 'Est. Cost (₹)', 'Status', 'Work Orders'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(240,247,255,0.15)]">
                {savedPlans.map((p, i) => {
                  const pc = PRIORITY_COLORS[p.priority] || PRIORITY_COLORS.MEDIUM;
                  return (
                    <tr key={p.id || i} className="hover:bg-[rgba(255,248,248,0.12)] transition-colors">
                      <td className="px-5 py-3 font-semibold text-white text-xs">{p.planCode || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 max-w-[180px] truncate">{p.description || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{p.startDate || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{p.endDate || '—'}</td>
                      <td className="px-5 py-3 text-xs text-gray-300">{p.plant || '—'}</td>
                      <td className="px-5 py-3">
                        {p.priority
                          ? <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: pc.bg, color: pc.color }}>{p.priority}</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-300">
                        {p.estimatedCost != null ? `₹${Number(p.estimatedCost).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-[#dc2626]">
                          {p.status || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-300">
                        {Array.isArray(p.workOrders) ? p.workOrders.length : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}