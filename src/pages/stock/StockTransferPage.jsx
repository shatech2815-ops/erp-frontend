import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Package, ArrowLeftRight,
  CheckCircle, Clock, XCircle, Save, X, Edit2, Trash2, Filter, RefreshCw,
} from 'lucide-react';

// const API_TRANSFERS  = '/api/stock/transfers';
// const API_ITEMS      = '/api/items';
// const API_WAREHOUSES = '/api/warehouses';

import {
  createStockTransfer,
  getAllStockTransfers,
  completeStockTransfer,
} from "../../services/stock/stock.services";

import { getAllItems } from "../../services/stock/item.services";
import { getAllWarehouses } from "../../services/stock/wareHouse.services";

// Backend StockTransfer: item (ManyToOne), quantity, fromWarehouse, toWarehouse, transferDate, status, remarks
const STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED'];

const emptyForm = {
  itemId:        '',
  quantity:      '',
  fromWarehouse: '',
  toWarehouse:   '',
  transferDate:  '',
  status:        'PENDING',
  remarks:       '',
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

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:   { bg: 'rgba(245,158,11,0.15)', color: '#d97706', icon: Clock,       label: 'Pending'   },
    COMPLETED: { bg: 'rgba(16,185,129,0.15)', color: '#059669', icon: CheckCircle, label: 'Completed' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#dc2626', icon: XCircle,     label: 'Cancelled' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status || '—', icon: Clock };
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      <Icon size={11} />
      {s.label}
    </span>
  );
};

export default function StockTransferPage() {
  const navigate = useNavigate();
  const [transfers, setTransfers]   = useState([]);
  const [items, setItems]           = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const [useApi, setUseApi]         = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadTransfers(), loadItems(), loadWarehouses()]);
    setLoading(false);
  };

  // const loadTransfers = async () => {
  //   try {
  //     const res = await fetch(API_TRANSFERS);
  //     if (res.ok) { setTransfers(await res.json()); setUseApi(true); return; }
  //   } catch {}
  //   try { const t = localStorage.getItem('srivaari_stock_transfers'); if (t) setTransfers(JSON.parse(t)); } catch {}
  // };

  const loadTransfers = async () => {
  try {
    const data = await getAllStockTransfers();
    setTransfers(Array.isArray(data) ? data : []);
    setUseApi(true);
  } catch (error) {
    console.error("Error loading stock transfers:", error);
    showToast("Failed to load stock transfers", "error");
    setTransfers([]);
  }
};

  // const loadItems = async () => {
  //   try {
  //     const res = await fetch(API_ITEMS);
  //     if (res.ok) { setItems(await res.json()); return; }
  //   } catch {}
  //   try { const i = localStorage.getItem('srivaari_itemslist'); if (i) setItems(JSON.parse(i)); } catch {}
  // };

  const loadItems = async () => {
  try {
    const data = await getAllItems();
    setItems(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error loading items:", error);
    showToast("Failed to load items", "error");
    setItems([]);
  }
};

  // const loadWarehouses = async () => {
  //   try {
  //     const res = await fetch(API_WAREHOUSES);
  //     if (res.ok) { setWarehouses(await res.json()); return; }
  //   } catch {}
  //   try { const w = localStorage.getItem('srivaari_warehouselist'); if (w) setWarehouses(JSON.parse(w)); } catch {}
  // };

  const loadWarehouses = async () => {
  try {
    const data = await getAllWarehouses();
    setWarehouses(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error loading warehouses:", error);
    showToast("Failed to load warehouses", "error");
    setWarehouses([]);
  }
};

  // const getItemName = (transfer) => {
  //   // backend returns item as nested object
  //   if (transfer.item?.name) return transfer.item.name;
  //   if (transfer.item?.itemName) return transfer.item.itemName;
  //   const found = items.find(i => String(i.id) === String(transfer.itemId || transfer.item?.id));
  //   return found ? (found.name || found.itemName) : `Item #${transfer.itemId || '?'}`;
  // };

  const getItemName = (transfer) => {
  const itemId = transfer.item?.id || transfer.itemId;

  const found = items.find(
    (i) => String(i.id) === String(itemId)
  );

  if (found) {
    return (
      found.name ||
      found.itemName ||
      found.productName ||
      found.itemCode ||
      found.code ||
      `Item #${found.id}`
    );
  }

  if (transfer.item) {
    return (
      transfer.item.name ||
      transfer.item.itemName ||
      transfer.item.productName ||
      transfer.item.itemCode ||
      transfer.item.code ||
      `Item #${transfer.item.id || "?"}`
    );
  }

  return `Item #${itemId || "?"}`;
};  


  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const handleSave = async () => {
  //   if (!form.itemId || !form.fromWarehouse || !form.toWarehouse || !form.quantity) {
  //     showToast('Item, From/To Warehouse and Quantity are required.', 'error'); return;
  //   }
  //   if (form.fromWarehouse === form.toWarehouse) {
  //     showToast('From and To Warehouse cannot be the same.', 'error'); return;
  //   }
  //   setSaving(true);

  //   // Backend StockTransfer payload — item is ManyToOne
  //   const payload = {
  //     item:          { id: parseInt(form.itemId) },
  //     quantity:      parseFloat(form.quantity) || 0,
  //     fromWarehouse: form.fromWarehouse,
  //     toWarehouse:   form.toWarehouse,
  //     transferDate:  form.transferDate ? form.transferDate : null,
  //     status:        form.status || 'PENDING',
  //     remarks:       form.remarks || null,
  //   };

  //   try {
  //     if (useApi) {
  //       const url = editId !== null ? `${API_TRANSFERS}/${editId}` : API_TRANSFERS;
  //       const method = editId !== null ? 'PUT' : 'POST';
  //       const res = await fetch(url, {
  //         method,
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //       if (res.ok) {
  //         showToast(editId !== null ? 'Transfer updated.' : 'Transfer created.');
  //         setEditId(null); setForm(emptyForm);
  //         await loadTransfers();
  //         setSaving(false);
  //         return;
  //       }
  //     }
  //   } catch {}

  //   // Fallback localStorage
  //   let stored = [];
  //   try { const t = localStorage.getItem('srivaari_stock_transfers'); if (t) stored = JSON.parse(t); } catch {}
  //   let updated;
  //   const itemName = items.find(i => String(i.id) === String(form.itemId))?.name || '';
  //   const lsPayload = { ...payload, item: { id: parseInt(form.itemId), name: itemName }, itemId: parseInt(form.itemId) };
  //   if (editId !== null) {
  //     updated = stored.map(t => t.id === editId ? { ...t, ...lsPayload } : t);
  //     showToast('Transfer updated.'); setEditId(null);
  //   } else {
  //     updated = [...stored, { ...lsPayload, id: Date.now() }];
  //     showToast('Transfer created.');
  //   }
  //   setTransfers(updated);
  //   try { localStorage.setItem('srivaari_stock_transfers', JSON.stringify(updated)); } catch {}
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.itemId || !form.fromWarehouse || !form.toWarehouse || !form.quantity) {
    showToast('Item, From/To Warehouse and Quantity are required.', 'error');
    return;
  }

  if (form.fromWarehouse === form.toWarehouse) {
    showToast('From and To Warehouse cannot be the same.', 'error');
    return;
  }

  setSaving(true);

  const payload = {
    item: {
      id: parseInt(form.itemId),
    },
    quantity: parseFloat(form.quantity) || 0,
    fromWarehouse: form.fromWarehouse,
    toWarehouse: form.toWarehouse,
    transferDate: form.transferDate || null,
    status: form.status || 'PENDING',
    remarks: form.remarks || null,
  };

  try {
    await createStockTransfer(payload);

    showToast(
      editId !== null
        ? 'Transfer updated successfully'
        : 'Transfer created successfully'
    );

    setForm(emptyForm);
    setEditId(null);

    await loadTransfers();
  } catch (error) {
    console.error('Error saving stock transfer:', error);
    showToast('Failed to save stock transfer', 'error');
  } finally {
    setSaving(false);
  }
};

  // const handleComplete = async (id) => {
  //   try {
  //     if (useApi) {
  //       const res = await fetch(`${API_TRANSFERS}/${id}/complete`, { method: 'PATCH' });
  //       if (res.ok) { showToast('Transfer completed.'); await loadTransfers(); return; }
  //     }
  //   } catch {}
  //   const updated = transfers.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t);
  //   setTransfers(updated);
  //   try { localStorage.setItem('srivaari_stock_transfers', JSON.stringify(updated)); } catch {}
  //   showToast('Transfer completed.');
  // };

  const handleComplete = async (id) => {
  try {
    await completeStockTransfer(id);
    showToast('Transfer completed successfully');
    await loadTransfers();
  } catch (error) {
    console.error('Error completing transfer:', error);
    showToast('Failed to complete transfer', 'error');
  }
};

  const handleEdit = (t) => {
    setForm({
      itemId:        t.item?.id ?? t.itemId ?? '',
      quantity:      t.quantity      ?? '',
      fromWarehouse: t.fromWarehouse ?? '',
      toWarehouse:   t.toWarehouse   ?? '',
      transferDate:  t.transferDate  ?? '',
      status:        t.status        ?? 'PENDING',
      remarks:       t.remarks       ?? '',
    });
    setEditId(t.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = (id) => {
  //   const updated = transfers.filter(t => t.id !== id);
  //   setTransfers(updated);
  //   try { localStorage.setItem('srivaari_stock_transfers', JSON.stringify(updated)); } catch {}
  //   showToast('Transfer deleted.');
  // };

  const handleDelete = (id) => {
  const updated = transfers.filter((t) => t.id !== id);
  setTransfers(updated);
  showToast('Transfer removed from view.');
};

  const filtered = transfers.filter(t => {
    const matchQ = !search ||
      getItemName(t).toLowerCase().includes(search.toLowerCase()) ||
      (t.fromWarehouse || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.toWarehouse || '').toLowerCase().includes(search.toLowerCase());
    const matchS = filterStatus === 'ALL' || t.status === filterStatus;
    return matchQ && matchS;
  });

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
            <ArrowLeftRight size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Stock Transfer</h1>
            <p className="text-xs text-gray-400 mt-0.5">Transfer stock between warehouses</p>
          </div>
        </div>
        <button onClick={loadAll} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Transfers" value={transfers.length}                                  color="#8b5cf6" icon={ArrowLeftRight} />
        <StatCard label="Pending"         value={transfers.filter(t => t.status === 'PENDING').length}   color="#d97706" icon={Clock} />
        <StatCard label="Completed"       value={transfers.filter(t => t.status === 'COMPLETED').length} color="#059669" icon={CheckCircle} />
        <StatCard label="Cancelled"       value={transfers.filter(t => t.status === 'CANCELLED').length} color="#dc2626" icon={XCircle} />
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <Plus size={15} className="text-purple-300" />
          <h2 className="text-sm font-bold text-white">{editId !== null ? 'Update Transfer' : 'Create Stock Transfer'}</h2>
          {editId !== null && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Item <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Package size={13} /></span>
                <select
                  value={form.itemId}
                  onChange={e => ff('itemId', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 pl-8 pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none"
                >
                  <option value="">Select Item…</option>
                  {/* {items.map(i => <option key={i.id} value={i.id}>{i.name || i.itemName}</option>)} */}
                  {items.map((i) => (<option key={i.id} value={i.id}>{i.name || i.itemName || i.productName || i.itemCode || i.code || `Item #${i.id}`}</option>))}
                </select>
              </div>
            </div>
            <InputField label="Quantity" placeholder="Quantity to Transfer" value={form.quantity} onChange={v => ff('quantity', v)} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => ff('status', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">From Warehouse <span className="text-red-400">*</span></label>
              <select value={form.fromWarehouse} onChange={e => ff('fromWarehouse', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
                <option value="">Select Warehouse…</option>
                {warehouseOptions.filter(Boolean).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">To Warehouse <span className="text-red-400">*</span></label>
              <select value={form.toWarehouse} onChange={e => ff('toWarehouse', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
                <option value="">Select Warehouse…</option>
                {warehouseOptions.filter(Boolean).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Transfer Date</label>
              <input
                type="datetime-local"
                value={form.transferDate}
                onChange={e => ff('transferDate', e.target.value)}
                className="rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
            <InputField label="Remarks" placeholder="Optional remarks" value={form.remarks} onChange={v => ff('remarks', v)} />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId !== null ? 'Update Transfer' : 'Create Transfer'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by item or warehouse…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none">
              <option value="ALL">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} transfers</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                {['Item', 'Qty', 'From', 'To', 'Date', 'Status', 'Remarks', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No transfers found.'}</td></tr>
              ) : filtered.map((t, idx) => (
                <tr key={t.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{getItemName(t)}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white">{t.quantity}</td>
                  <td className="px-4 py-3 text-xs text-purple-300">{t.fromWarehouse}</td>
                  <td className="px-4 py-3 text-xs text-purple-300">{t.toWarehouse}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {t.transferDate ? new Date(t.transferDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">{t.remarks || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.status === 'PENDING' && (
                        <button onClick={() => handleComplete(t.id)} title="Mark Complete" className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 flex items-center justify-center transition-colors"><CheckCircle size={12} /></button>
                      )}
                      <button onClick={() => handleEdit(t)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(t.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors"><Trash2 size={12} /></button>
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
