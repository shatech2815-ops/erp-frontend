

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Package, Sliders,
  TrendingUp, TrendingDown, Save, X, Edit2, Trash2,
  CheckCircle, XCircle, Filter, RefreshCw,
} from 'lucide-react';

import {
  createStockAdjustment,
  getAllStockAdjustments,
  getAllStockLevels,
} from "../../services/stock/stock.services";


// const API_ADJ        = '/api/stock/adjustments';
// const API_WAREHOUSES = '/api/warehouses';

// Backend StockAdjustment: adjustmentQty, reason, adjustmentType, adjustmentDate, remarks, warehouse, adjustedBy
const ADJUSTMENT_TYPES = ['IN', 'OUT'];
const REASONS = ['Purchase Receipt', 'Sales Return', 'Damage Write-Off', 'Theft', 'Expired Goods', 'Production Consumption', 'Manual Correction', 'Other'];

const emptyForm = {
  adjustmentQty:  '',
  adjustmentType: '',
  reason:         '',
  warehouse:      '',
  adjustedBy:     '',
  adjustmentDate: '',
  remarks:        '',
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder = 'Select…', required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

const TypeBadge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${type === 'IN' ? 'bg-emerald-500/10 text-[#6ee7b7]' : 'bg-red-500/10 text-[#991b1b]'}`}>
    {type === 'IN' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
    {type === 'IN' ? 'Stock In' : 'Stock Out'}
  </span>
);

export default function StockAdjustmentPage() {
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses]   = useState([]);
  const [form, setForm]               = useState(emptyForm);
  const [editId, setEditId]           = useState(null);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('ALL');
  const [filterWH, setFilterWH] = useState('ALL');
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [useApi, setUseApi]           = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadAdjustments(), loadWarehouses()]);
    setLoading(false);
  };

  // const loadAdjustments = async () => {
  //   try {
  //     const res = await fetch(API_ADJ);
  //     if (res.ok) { setAdjustments(await res.json()); setUseApi(true); return; }
  //   } catch {}
  //   try { const a = localStorage.getItem('mveng_stock_adjustments'); if (a) setAdjustments(JSON.parse(a)); } catch {}
  // };

  const loadAdjustments = async () => {
  try {
    const data = await getAllStockAdjustments();
    setAdjustments(Array.isArray(data) ? data : []);
    setUseApi(true);
  } catch (error) {
    console.error("Error loading stock adjustments:", error);

    try {
      const a = localStorage.getItem("mveng_stock_adjustments");
      if (a) setAdjustments(JSON.parse(a));
    } catch (err) {
      console.error("Local storage error:", err);
    }
  }
};

  // const loadWarehouses = async () => {
  //   try {
  //     const res = await fetch(API_WAREHOUSES);
  //     if (res.ok) { setWarehouses(await res.json()); return; }
  //   } catch {}
  //   try { const w = localStorage.getItem('mveng_warehouselist'); if (w) setWarehouses(JSON.parse(w)); } catch {}
  // };

  const loadWarehouses = async () => {
  try {
    const res = await fetch(API_WAREHOUSES);

    if (res.ok) {
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : []);
      return;
    }
  } catch (error) {
    console.error("Error loading warehouses:", error);
  }

  try {
    const w = localStorage.getItem("mveng_warehouselist");
    if (w) setWarehouses(JSON.parse(w));
  } catch (err) {
    console.error("Local storage warehouse error:", err);
  }
};

  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const handleSave = async () => {
  //   if (!form.adjustmentType || !form.adjustmentQty) {
  //     showToast('Type and Quantity are required.', 'error'); return;
  //   }
  //   setSaving(true);

  //   // Backend StockAdjustment payload — no itemId field in entity
  //   const payload = {
  //     adjustmentQty:  parseFloat(form.adjustmentQty) || 0,
  //     adjustmentType: form.adjustmentType,
  //     reason:         form.reason || null,
  //     warehouse:      form.warehouse || null,
  //     adjustedBy:     form.adjustedBy || null,
  //     adjustmentDate: form.adjustmentDate ? form.adjustmentDate : null,
  //     remarks:        form.remarks || null,
  //   };

  //   try {
  //     if (useApi) {
  //       const res = await fetch(API_ADJ, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //       if (res.ok) {
  //         showToast('Adjustment saved.');
  //         setForm(emptyForm);
  //         await loadAdjustments();
  //         setSaving(false);
  //         return;
  //       }
  //     }
  //   } catch {}

  //   // Fallback
  //   let stored = [];
  //   try { const a = localStorage.getItem('mveng_stock_adjustments'); if (a) stored = JSON.parse(a); } catch {}
  //   let updated;
  //   if (editId !== null) {
  //     updated = stored.map(a => a.id === editId ? { ...a, ...payload } : a);
  //     showToast('Adjustment updated.'); setEditId(null);
  //   } else {
  //     updated = [...stored, { ...payload, id: Date.now() }];
  //     showToast('Adjustment saved.');
  //   }
  //   setAdjustments(updated);
  //   try { localStorage.setItem('mveng_stock_adjustments', JSON.stringify(updated)); } catch {}
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.adjustmentType || !form.adjustmentQty) {
    showToast("Type and Quantity are required.", "error");
    return;
  }

  setSaving(true);

  const payload = {
    adjustmentQty: parseFloat(form.adjustmentQty) || 0,
    adjustmentType: form.adjustmentType,
    reason: form.reason || null,
    warehouse: form.warehouse || null,
    adjustedBy: form.adjustedBy || null,
    adjustmentDate: form.adjustmentDate || null,
    remarks: form.remarks || null,
  };

  try {
    if (editId !== null) {
      showToast("Backend update API not available yet.", "error");
    } else {
      await createStockAdjustment(payload);
      showToast("Adjustment saved successfully.");
    }

    setForm(emptyForm);
    setEditId(null);
    await loadAdjustments();
  } catch (error) {
    console.error("Error saving stock adjustment:", error);

    let errorMessage = "Failed to save adjustment.";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    showToast(errorMessage, "error");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (a) => {
    setForm({
      adjustmentQty:  a.adjustmentQty  ?? '',
      adjustmentType: a.adjustmentType ?? '',
      reason:         a.reason         ?? '',
      warehouse:      a.warehouse      ?? '',
      adjustedBy:     a.adjustedBy     ?? '',
      adjustmentDate: a.adjustmentDate ?? '',
      remarks:        a.remarks        ?? '',
    });
    setEditId(a.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = (id) => {
  //   const updated = adjustments.filter(a => a.id !== id);
  //   setAdjustments(updated);
  //   try { localStorage.setItem('mveng_stock_adjustments', JSON.stringify(updated)); } catch {}
  //   showToast('Adjustment deleted.');
  // };

  const handleDelete = async (id) => {
  try {
    const updated = adjustments.filter((a) => a.id !== id);
    setAdjustments(updated);

    localStorage.setItem(
      "mveng_stock_adjustments",
      JSON.stringify(updated)
    );

    showToast("Adjustment deleted.");
  } catch (error) {
    console.error("Error deleting adjustment:", error);
    showToast("Failed to delete adjustment.", "error");
  }
};

  const filtered = adjustments.filter(a => {
    const matchQ = !search || (a.warehouse || '').toLowerCase().includes(search.toLowerCase()) || (a.reason || '').toLowerCase().includes(search.toLowerCase()) || (a.adjustedBy || '').toLowerCase().includes(search.toLowerCase());
    const matchT = filterType === 'ALL' || a.adjustmentType === filterType;
    const matchW = filterWH === 'ALL' || (a.warehouse || '') === filterWH;
    return matchQ && matchT && matchW;
  });

  const totalIn  = adjustments.filter(a => a.adjustmentType === 'IN').reduce((s, a) => s + (a.adjustmentQty || 0), 0);
  const totalOut = adjustments.filter(a => a.adjustmentType === 'OUT').reduce((s, a) => s + (a.adjustmentQty || 0), 0);

  const warehouseOptions = warehouses.length > 0
    ? warehouses.map(w => w.name || w.warehouseName || w.code || w.warehouseCode)
    : ['WAREHOUSEA', 'WAREHOUSEB', 'WAREHOUSEC'];

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
            <Sliders size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Stock Adjustment</h1>
            <p className="text-xs text-gray-400 mt-0.5">Record stock-in, stock-out and corrections</p>
          </div>
        </div>
        <button onClick={loadAll} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Adjustments" value={adjustments.length} color="#8b5cf6" icon={Sliders} />
        <StatCard label="Stock In"   value={adjustments.filter(a => a.adjustmentType === 'IN').length}  color="#059669" icon={TrendingUp} />
        <StatCard label="Stock Out"  value={adjustments.filter(a => a.adjustmentType === 'OUT').length} color="#dc2626" icon={TrendingDown} />
        <StatCard label="Net Qty"    value={parseFloat((totalIn - totalOut).toFixed(2))} color="#d97706" icon={Package} />
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <Plus size={15} className="text-purple-300" />
          <h2 className="text-sm font-bold text-white">{editId !== null ? 'Update Adjustment' : 'Add Stock Adjustment'}</h2>
          {editId !== null && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SelectField label="Adjustment Type" value={form.adjustmentType} onChange={v => ff('adjustmentType', v)} options={ADJUSTMENT_TYPES} placeholder="Select Type…" required />
            <InputField  label="Adjustment Qty"  placeholder="Quantity" value={form.adjustmentQty} onChange={v => ff('adjustmentQty', v)} type="number" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Warehouse</label>
              <select value={form.warehouse} onChange={e => ff('warehouse', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
                <option value="">Select Warehouse…</option>
                {warehouseOptions.filter(Boolean).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <SelectField label="Reason" value={form.reason} onChange={v => ff('reason', v)} options={REASONS} placeholder="Select Reason…" />
            <InputField  label="Adjusted By" placeholder="User/Admin Name" value={form.adjustedBy} onChange={v => ff('adjustedBy', v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Adjustment Date</label>
              <input
                type="datetime-local"
                value={form.adjustmentDate}
                onChange={e => ff('adjustmentDate', e.target.value)}
                className="rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
          </div>
          <div className="mb-5">
            <InputField label="Remarks" placeholder="Optional remarks" value={form.remarks} onChange={v => ff('remarks', v)} />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId !== null ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by warehouse, reason or user…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none">
              <option value="ALL">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
            </select>
            <select value={filterWH} onChange={e => setFilterWH(e.target.value)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none">
            <option value="ALL">All Warehouses</option>
            {[...new Set(adjustments.map(a => a.warehouse).filter(Boolean))].map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                {['Type', 'Qty', 'Reason', 'Warehouse', 'Adjusted By', 'Date', 'Remarks', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No adjustments found.'}</td></tr>
              ) : filtered.map((a, idx) => (
                <tr key={a.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-4 py-3"><TypeBadge type={a.adjustmentType} /></td>
                  <td className="px-4 py-3 text-xs font-bold text-white">{a.adjustmentQty}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{a.reason || '—'}</td>
                  <td className="px-4 py-3 text-xs text-purple-300">{a.warehouse || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{a.adjustedBy || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {a.adjustmentDate ? new Date(a.adjustmentDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">{a.remarks || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(a)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(a.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors"><Trash2 size={12} /></button>
                    </div>
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