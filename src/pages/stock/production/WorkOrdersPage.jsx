import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Package, Calendar, Hash,
  Edit2, Trash2, Save, AlertCircle, CheckCircle,
  RefreshCw, Filter, X, Layers, Check, ExternalLink,
  ChevronDown,
} from 'lucide-react';

import {
  getAllWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  completeWorkOrder,
  getAllProductionPlans,
} from "../../../services/stock/production.services";
import { getAllItems } from "../../../services/stock/item.services";
import { getAllBOMs } from "../../../services/stock/bom.services";

const WORK_ORDER_STATUSES = ['CREATED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_COLORS = {
  CREATED:     { bg: '#f1f5f9', color: '#64748b' },
  RELEASED:    { bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8' },
  IN_PROGRESS: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
  COMPLETED:   { bg: 'rgba(16,185,129,0.15)', color: '#059669' },
  CANCELLED:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.CREATED;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10"
    style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}18` }}>
      <Icon size={16} style={{ color }} />
    </div>
    <p className="text-2xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
  </div>
);

const emptyForm = {
  workOrderCode: '',
  productId: '',
  bomId: '',
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
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all`}
      />
    </div>
  </div>
);

export default function WorkOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [workOrders, setWorkOrders]   = useState([]);
  const [plans, setPlans]             = useState([]);
  const [items, setItems]             = useState([]);
  const [boms, setBoms]               = useState([]);

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [editId, setEditId]           = useState(null);
  const [saving, setSaving]           = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [deleteId, setDeleteId]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [workOrdersData, plansData, itemsData, bomsData] = await Promise.all([
        getAllWorkOrders().catch(() => []),
        getAllProductionPlans().catch(() => []),
        getAllItems().catch(() => []),
        getAllBOMs().catch(() => []),
      ]);

      setWorkOrders(Array.isArray(workOrdersData) ? workOrdersData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setBoms(Array.isArray(bomsData) ? bomsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Failed to load work orders data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAll(); 
  }, []);

  // Prepopulate from URL parameters if navigated from BOM page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    const bomId = params.get('bomId');
    if (productId || bomId) {
      setForm(prev => ({
        ...prev,
        productId: productId || prev.productId,
        bomId: bomId || prev.bomId,
        workOrderCode: `WO-${Date.now().toString().slice(-5)}`,
        quantity: prev.quantity || '10',
      }));
      setShowForm(true);
    }
  }, [location.search]);

  // When selected product changes, auto-match the BOM
  const handleProductChange = (productId) => {
    setForm(prev => {
      const matchingBom = boms.find(b => String(b.product?.id) === String(productId));
      return {
        ...prev,
        productId,
        bomId: matchingBom ? String(matchingBom.id) : '',
      };
    });
  };

  const selectedBom = boms.find(b => 
    String(b.id) === String(form.bomId) || 
    (form.productId && String(b.product?.id) === String(form.productId))
  );

  const handleSave = async () => {
    if (!form.workOrderCode) {
      showToast("Work Order Code is required.", "error");
      return;
    }

    setSaving(true);

    const payload = {
      workOrderCode: form.workOrderCode,
      quantity: Number(form.quantity) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
      productionPlanning: form.productionPlanId ? { id: Number(form.productionPlanId) } : null,
      item: form.productId ? { id: Number(form.productId) } : null,
      bom: form.bomId ? { id: Number(form.bomId) } : (selectedBom ? { id: Number(selectedBom.id) } : null),
    };

    try {
      if (editId) {
        await updateWorkOrder(editId, payload);
        showToast("Work order updated successfully!");
      } else {
        await createWorkOrder(payload);
        showToast("Work order created successfully!");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch (error) {
      console.error("Save error:", error);
      showToast(editId ? "Update failed." : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (woId) => {
    setCompletingId(woId);
    try {
      const res = await completeWorkOrder(woId);
      const actionMsg = res.inventoryActions && res.inventoryActions.length > 0
        ? ` (${res.inventoryActions.join(' · ')})`
        : '';
      showToast(`Work Order completed! Stock updated${actionMsg}`);
      fetchAll();
    } catch (err) {
      console.error("Completion error:", err);
      showToast("Failed to complete work order", "error");
    } finally {
      setCompletingId(null);
    }
  };

  const handleEdit = (wo) => {
    setForm({
      workOrderCode: wo.workOrderCode ?? "",
      productId: String(wo.item?.id || ""),
      bomId: String(wo.bom?.id || ""),
      quantity: wo.quantity ?? "",
      productionPlanId: String(wo.productionPlanning?.id || wo.productionPlan?.id || ""),
      startDate: wo.startDate ? wo.startDate.split("T")[0] : "",
      endDate: wo.endDate ? wo.endDate.split("T")[0] : "",
      status: wo.status ?? "CREATED",
    });

    setEditId(wo.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkOrder(id);
      showToast("Deleted successfully");
      fetchAll();
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Delete failed.", "error");
    }
    setDeleteId(null);
  };

  const filtered = workOrders.filter(wo => {
    if (statusFilter && wo.status !== statusFilter) return false;
    const q = search.toLowerCase();
    const matchesCode = !q || wo.workOrderCode?.toLowerCase().includes(q);
    const matchesItem = !q || wo.item?.name?.toLowerCase().includes(q);
    return matchesCode || matchesItem;
  });

  const stats = {
    total:      workOrders.length,
    created:    workOrders.filter(w => w.status === 'CREATED').length,
    inProgress: workOrders.filter(w => w.status === 'IN_PROGRESS').length,
    completed:  workOrders.filter(w => w.status === 'COMPLETED').length,
  };

  const sel = "w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none cursor-pointer";

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/stock/production')}
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Package size={22} style={{ color: '#dc2626' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Work Orders</h2>
            <p className="text-sm text-gray-400">Interconnected manufacturing execution & inventory consumption</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <Plus size={14} /> New Work Order
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Work Orders" value={stats.total} color="#8b5cf6" icon={Hash} />
        <StatCard label="Created" value={stats.created} color="#64748b" icon={Package} />
        <StatCard label="In Progress" value={stats.inProgress} color="#d97706" icon={RefreshCw} />
        <StatCard label="Completed & Stocked" value={stats.completed} color="#059669" icon={CheckCircle} />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by WO code or product…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none">
          <option value="">All Statuses</option>
          {WORK_ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* New/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#140f2d] border border-white/10 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <Package size={16} style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{editId ? 'Edit Work Order' : 'New Work Order'}</h3>
                  <p className="text-[11px] text-gray-400">Links product, BOM requirement & production execution</p>
                </div>
              </div>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Work Order Code" placeholder="e.g. WO-001" value={form.workOrderCode} onChange={v => set('workOrderCode', v)} icon={Hash} required />
                <InputField label="Target Quantity" placeholder="e.g. 20" value={form.quantity} onChange={v => set('quantity', v)} type="number" icon={Package} required />
              </div>

              {/* Finished Product to Produce */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                  Finished Product to Produce <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={form.productId} 
                    onChange={e => handleProductChange(e.target.value)} 
                    className={sel}
                  >
                    <option value="" className="bg-[#140f2d] text-gray-400">-- Select Finished Item --</option>
                    {items.map(it => (
                      <option key={it.id} value={it.id} className="bg-[#140f2d] text-white">
                        {it.name || it.itemName} ({it.sku})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* BOM Linked Information Card */}
              {selectedBom ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                    <Layers size={13} />
                    <span>Linked BOM Active (v{selectedBom.version || 1})</span>
                  </div>
                  <div className="text-gray-300">
                    Consumes: <strong className="text-white">{selectedBom.quantityRequired} {selectedBom.unit}</strong> of <strong className="text-purple-300">{selectedBom.component?.name || 'Component'}</strong> per unit produced.
                  </div>
                  {Number(form.quantity) > 0 && (
                    <div className="text-emerald-300 mt-1 font-semibold">
                      Total material requirement: {(Number(form.quantity) * Number(selectedBom.quantityRequired) * (1 + (Number(selectedBom.scrapPercentage || 0)/100))).toFixed(2)} {selectedBom.unit} will be issued automatically upon completion.
                    </div>
                  )}
                </div>
              ) : form.productId ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                  <span>No active BOM found for this product. You can still create the work order.</span>
                  <button 
                    type="button"
                    onClick={() => navigate('/dashboard/stock/items/bill-of-materials')}
                    className="text-amber-400 underline font-bold ml-2 inline-flex items-center gap-1 shrink-0"
                  >
                    Create BOM <ExternalLink size={10} />
                  </button>
                </div>
              ) : null}

              {/* Production Plan dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Production Plan</label>
                <div className="relative">
                  <select value={form.productionPlanId} onChange={e => set('productionPlanId', e.target.value)} className={sel}>
                    <option value="" className="bg-[#140f2d] text-gray-400">-- Select Production Plan --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#140f2d] text-white">
                        {p.planCode} {p.description ? `(${p.description})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Start Date" value={form.startDate} onChange={v => set('startDate', v)} type="date" icon={Calendar} />
                <InputField label="End Date" value={form.endDate} onChange={v => set('endDate', v)} type="date" icon={Calendar} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_ORDER_STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.status === s ? 'bg-[#dc2626] text-white border-[#dc2626]' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex gap-3 bg-white/[0.01]">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 font-semibold hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                <Save size={15} />{saving ? 'Saving…' : editId ? 'Update Work Order' : 'Create Work Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#140f2d] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="font-bold text-white mb-2">Delete Work Order?</h3>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl text-white font-semibold" style={{ background: '#dc2626' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white text-xs uppercase tracking-wide">
                  {['Code', 'Finished Product', 'Linked BOM', 'Plan', 'Dates', 'Quantity', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    <p>No work orders found.</p>
                  </td></tr>
                ) : filtered.map((wo, i) => (
                  <tr key={wo.id || i} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-semibold text-white text-xs font-mono">{wo.workOrderCode}</td>
                    
                    {/* Finished Product */}
                    <td className="px-5 py-3 text-xs">
                      {wo.item ? (
                        <div>
                          <div className="font-bold text-white">{wo.item.name || wo.item.itemName}</div>
                          <div className="text-[10px] text-purple-300 font-mono">{wo.item.sku}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </td>

                    {/* BOM Link */}
                    <td className="px-5 py-3 text-xs">
                      {wo.bom ? (
                        <div className="text-gray-300">
                          <span className="font-semibold text-emerald-400">{wo.bom.component?.name || 'Component'}</span>
                          <span className="text-[10px] text-gray-400 block">({wo.bom.quantityRequired} {wo.bom.unit || 'unit'})</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>

                    {/* Production Plan */}
                    <td className="px-5 py-3 text-xs text-gray-300">
                      {wo.productionPlanning?.planCode || wo.productionPlan?.planCode || '—'}
                    </td>
                    
                    {/* Dates */}
                    <td className="px-5 py-3 text-xs text-gray-400">
                      <div>Start: {wo.startDate ? wo.startDate.split('T')[0] : '—'}</div>
                      <div className="text-[11px] text-gray-500">End: {wo.endDate ? wo.endDate.split('T')[0] : '—'}</div>
                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-3 text-xs font-bold text-white">
                      {Number(wo.quantity || 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3"><StatusBadge status={wo.status} /></td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {wo.status !== 'COMPLETED' && (
                          <button 
                            onClick={() => handleComplete(wo.id)} 
                            disabled={completingId === wo.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            title="Complete Work Order & Auto-Execute Stock Movements"
                          >
                            {completingId === wo.id ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <Check size={11} />
                            )}
                            Produce
                          </button>
                        )}
                        <button onClick={() => handleEdit(wo)} className="p-1.5 rounded-lg text-purple-300 hover:bg-white/10" title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(wo.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10" title="Delete"><Trash2 size={13} /></button>
                      </div>
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