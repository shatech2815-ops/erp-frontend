import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Warehouse, Package, TrendingDown, TrendingUp, AlertCircle, Save, X, Edit2, CheckCircle, XCircle, Filter } from 'lucide-react';

import {
  getStock,
  getItems,
  createStock
} from "../../services/purchase/inventory.services";
// const LS_STOCK  = 'srivaari_stock';
// const LS_ITEMS  = 'srivaari_items';

const WAREHOUSES = ['Main Warehouse', 'Secondary Warehouse', 'Cold Storage', 'Distribution Center'];
const STORES     = ['Store A', 'Store B', 'Store C', 'Store D'];

const emptyForm = {
  itemId: '',
  warehouseName: '',
  storeName: '',
  quantity: '',
  reservedQuantity: '',
  availableQuantity: '',
  lastUpdatedBy: '',
  date: '',
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all`} />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
      <option value="">Select…</option>
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

const AvailabilityBar = ({ total, reserved }) => {
  const available = Math.max(0, total - reserved);
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#dc2626';
  return (
    <div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>{available} avail</span><span>{pct}%</span></div>
      <div className="h-1.5 bg-purple-500/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

export default function StockLevels() {
  const navigate = useNavigate();
  const [stocks, setStocks]   = useState([]);
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(emptyForm);
  const [editId, setEditId]   = useState(null);
  const [search, setSearch]   = useState('');
  const [filterWH, setFilterWH] = useState('ALL');
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // useEffect(() => {
  //   try {
  //     const s = localStorage.getItem(LS_STOCK);
  //     if (s) setStocks(JSON.parse(s));
  //   } catch {}
  //   try {
  //     const i = localStorage.getItem(LS_ITEMS);
  //     if (i) setItems(JSON.parse(i));
  //   } catch {}
  // }, []);

  useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const stockData = await getStock();
    const itemData = await getItems();

    setStocks(stockData || []);
    setItems(itemData || []);
  } catch (error) {
    console.error("Error loading stock data:", error);
    showToast("Failed to load stock data", "error");
  }
};

  // const persist = (data) => {
  //   try { localStorage.setItem(LS_STOCK, JSON.stringify(data)); } catch {}
  // };

  const getItemName = (itemId) => {
    const item = items.find(i => i.id === parseInt(itemId));
    return item ? item.itemName : `Item #${itemId}`;
  };

  // const handleSave = () => {
  //   if (!form.itemId || !form.warehouseName) { showToast('Item ID and Warehouse are required.', 'error'); return; }
  //   setSaving(true);
  //   const qty = parseInt(form.quantity) || 0;
  //   const resQty = parseInt(form.reservedQuantity) || 0;
  //   const entry = {
  //     itemId:            parseInt(form.itemId),
  //     warehouseName:     form.warehouseName,
  //     storeName:         form.storeName,
  //     quantity:          qty,
  //     reservedQuantity:  resQty,
  //     availableQuantity: form.availableQuantity !== '' ? parseInt(form.availableQuantity) : Math.max(0, qty - resQty),
  //     lastUpdatedBy:     form.lastUpdatedBy || null,
  //     date:              form.date || null,
  //   };

  //   let updated;
  //   if (editId !== null) {
  //     updated = stocks.map(s => s.id === editId ? { ...s, ...entry } : s);
  //     showToast('Stock updated.');
  //     setEditId(null);
  //   } else {
  //     updated = [...stocks, { ...entry, id: Date.now() }];
  //     showToast('Stock entry added.');
  //   }
  //   setStocks(updated);
  //   persist(updated);
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.itemId || !form.warehouseName) {
    showToast('Item ID and Warehouse are required.', 'error');
    return;
  }

  setSaving(true);

  try {
    const qty = parseInt(form.quantity) || 0;
    const resQty = parseInt(form.reservedQuantity) || 0;

    const payload = {
      itemId: parseInt(form.itemId),
      warehouseName: form.warehouseName,
      storeName: form.storeName,
      quantity: qty,
      reservedQuantity: resQty,
      availableQuantity:
        form.availableQuantity !== ''
          ? parseInt(form.availableQuantity)
          : Math.max(0, qty - resQty),
      lastUpdatedBy: form.lastUpdatedBy || null,
      date: form.date || null,
    };

    await createStock(payload);

    showToast(
      editId !== null ? "Stock updated successfully" : "Stock added successfully"
    );

    setForm(emptyForm);
    setEditId(null);

    // Reload latest data from backend
    fetchData();
  } catch (error) {
    console.error("Error saving stock:", error);
    showToast("Failed to save stock", "error");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (s) => {
    setForm({ itemId: s.itemId ?? '', warehouseName: s.warehouseName ?? '', storeName: s.storeName ?? '', quantity: s.quantity ?? '', reservedQuantity: s.reservedQuantity ?? '', availableQuantity: s.availableQuantity ?? '', lastUpdatedBy: s.lastUpdatedBy ?? '', date: s.date ?? '' });
    setEditId(s.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const filtered = stocks.filter(s => {
    const matchQ = !search || getItemName(s.itemId).toLowerCase().includes(search.toLowerCase()) || s.warehouseName?.toLowerCase().includes(search.toLowerCase());
    const matchW = filterWH === 'ALL' || s.warehouseName === filterWH;
    return matchQ && matchW;
  });

  const totalQty = stocks.reduce((a, s) => a + (s.quantity || 0), 0);
  const totalReserved = stocks.reduce((a, s) => a + (s.reservedQuantity || 0), 0);

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
            <Warehouse size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Stock Levels</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track warehouse stock quantities and availability</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Entries', value: stocks.length,    color: '#8b5cf6', icon: Warehouse },
          { label: 'Total Qty',     value: totalQty,         color: '#059669', icon: TrendingUp },
          { label: 'Reserved',      value: totalReserved,    color: '#d97706', icon: AlertCircle },
          { label: 'Available',     value: Math.max(0, totalQty - totalReserved), color: '#6366f1', icon: CheckCircle },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <Plus size={15} className="text-purple-300" />
          <h2 className="text-sm font-bold text-white">{editId !== null ? 'Update Stock Entry' : 'Add Stock Entry'}</h2>
          {editId !== null && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Item ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Package size={13} /></span>
                <select value={form.itemId} onChange={e => ff('itemId', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 pl-8 pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
                  <option value="">Select Item...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.id} — {i.itemName}</option>)}
                </select>
              </div>
            </div>
            <SelectField label="Warehouse"   value={form.warehouseName}     onChange={v => ff('warehouseName', v)} options={WAREHOUSES} />
            <SelectField label="Store"       value={form.storeName}         onChange={v => ff('storeName', v)}     options={STORES} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <InputField label="Quantity"           placeholder="Total Qty"      value={form.quantity}          onChange={v => ff('quantity', v)}          type="number" />
            <InputField label="Reserved Quantity"  placeholder="Reserved"       value={form.reservedQuantity}  onChange={v => ff('reservedQuantity', v)}  type="number" />
            <InputField label="Available Quantity" placeholder="Available (auto)"value={form.availableQuantity} onChange={v => ff('availableQuantity', v)} type="number" />
            <InputField label="Last Updated By"    placeholder="Username"       value={form.lastUpdatedBy}     onChange={v => ff('lastUpdatedBy', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Date</label>
              <input type="date" value={form.date} onChange={e => ff('date', e.target.value)}
                className="rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId !== null ? 'Update Stock' : 'Save Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search by item or warehouse…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
          </div>
          <select value={filterWH} onChange={e => setFilterWH(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none">
            <option value="ALL">All Warehouses</option>
            {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                {['Item', 'Warehouse', 'Store', 'Quantity', 'Reserved', 'Available', 'Updated By', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-14 text-gray-400 text-sm">No stock entries found.</td></tr>
              ) : filtered.map((s, idx) => (
                <tr key={s.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{getItemName(s.itemId)}<br/><span className="text-[10px] text-gray-400">ID: {s.itemId}</span></td>
                  <td className="px-4 py-3 text-xs text-purple-300">{s.warehouseName}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{s.storeName}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white text-right">{s.quantity}</td>
                  <td className="px-4 py-3 text-xs text-amber-300 text-right">{s.reservedQuantity}</td>
                  <td className="px-4 py-3 text-xs">
                    <AvailabilityBar total={s.quantity || 0} reserved={s.reservedQuantity || 0} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{s.lastUpdatedBy || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{s.date || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(s)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors"><Edit2 size={12} /></button>
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
