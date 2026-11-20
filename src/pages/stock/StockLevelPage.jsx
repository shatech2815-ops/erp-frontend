import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Warehouse, Package,
  TrendingUp, AlertCircle, Save, X, Edit2,
  CheckCircle, XCircle, Trash2, Tag, Filter, RefreshCw,
  LayoutGrid, List,
} from 'lucide-react';

const API_LEVELS     = '/api/stock/levels';
const API_ITEMS      = '/api/items';
const API_CATEGORIES = '/api/categories/getall';
const API_WAREHOUSES = '/api/warehouses';

import api from '../../interceptors/interceptors';

import {
  createStockLevel,
  getAllStockLevels,
  updateStockLevel,
  deleteStockLevel,
} from "../../services/stock/stock.services";

const STOCK_STATUSES = ['BELOW', 'MINIMUM', 'MAXIMUM'];

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const emptyForm = {
  itemId:        '',
  categoryId:    '',
  quantity:      '',
  warehouse:     '',
  minStockLevel: '',
  maxStockLevel: '',
  status:        '',
};

/* ─── tiny helpers ─── */
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

const autoStatus = (qty, min, max) => {
  if (!qty || !min) return '';
  if (Number(qty) < Number(min)) return 'BELOW';
  if (max && Number(qty) > Number(max)) return 'MAXIMUM';
  return 'MINIMUM';
};

const StatusBadge = ({ status }) => {
  const norm = String(status || '').toUpperCase();
  const map = {
    BELOW:   { bg: 'rgba(239,68,68,0.15)', color: '#dc2626', label: 'Below Min' },
    MINIMUM: { bg: 'rgba(16,185,129,0.15)', color: '#059669', label: 'Normal' },
    NORMAL:  { bg: 'rgba(16,185,129,0.15)', color: '#059669', label: 'Normal' },
    MAXIMUM: { bg: 'rgba(245,158,11,0.15)', color: '#d97706', label: 'Overstock' },
  };
  const s = map[norm] || { bg: '#f1f5f9', color: '#64748b', label: status || '—' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

/* ─── tile card ─── */
const StockTile = ({ stock, itemName, categoryName, onEdit, onDelete }) => {
  const norm = String(stock?.status || '').toUpperCase();
  const statusMap = {
    BELOW:   { bg: 'rgba(239,68,68,0.15)', border: '#fca5a5', text: '#dc2626', label: 'Below Min' },
    MINIMUM: { bg: 'rgba(16,185,129,0.15)', border: '#6ee7b7', text: '#059669', label: 'Normal' },
    NORMAL:  { bg: 'rgba(16,185,129,0.15)', border: '#6ee7b7', text: '#059669', label: 'Normal' },
    MAXIMUM: { bg: 'rgba(245,158,11,0.15)', border: '#fcd34d', text: '#d97706', label: 'Overstock' },
  };
  const s = statusMap[norm] || { bg: '#f1f5f9', border: '#e2e8f0', text: '#64748b', label: stock?.status || 'Unknown' };
  const pct = Number(stock?.maxStockLevel) > 0
    ? Math.min(100, Math.round((Number(stock?.quantity || 0) / Number(stock.maxStockLevel)) * 100))
    : 0;

  return (
    <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border-2 p-5 transition-all hover:shadow-md flex flex-col gap-3"
      style={{ borderColor: s.border }}>
      {/* header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: s.bg }}>
            <Package size={16} style={{ color: s.text }} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">
              {itemName || `Stock #${stock.id}`}
            </p>
            {categoryName && (
              <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                <Tag size={9} /> {categoryName}
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">
              <Warehouse size={9} className="inline mr-0.5" />{stock.warehouse || '—'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ml-2"
          style={{ background: s.bg, color: s.text }}>
          {s.label}
        </span>
      </div>

      {/* qty row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xl font-extrabold text-white">{stock.quantity ?? '—'}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Current</p>
        </div>
        <div className="border-x border-white/10">
          <p className="text-xl font-extrabold text-purple-300">{stock.minStockLevel ?? '—'}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Min</p>
        </div>
        <div>
          <p className="text-xl font-extrabold text-purple-300">{stock.maxStockLevel ?? '—'}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Max</p>
        </div>
      </div>

      {/* progress bar */}
      {stock.maxStockLevel > 0 && (
        <div>
          <div className="w-full h-1.5 rounded-full bg-purple-500/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.text }} />
          </div>
          <p className="text-[10px] text-gray-400 text-right mt-0.5">{pct}% of max</p>
        </div>
      )}

      {/* actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
        <button onClick={() => onEdit(stock)}
          className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors">
          <Edit2 size={12} />
        </button>
        <button onClick={() => onDelete(stock.id)}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════ MAIN PAGE ══════════════════════════════════════════ */
export default function StockLevelPage() {
  const navigate = useNavigate();

  const [stocks, setStocks]         = useState([]);
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [form, setForm]     = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const [search, setSearch]       = useState('');
  const [filterWH, setFilterWH]   = useState('ALL');
  const [filterItem, setFilterItem]     = useState('ALL');
  const [filterCat, setFilterCat]       = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const [useApi, setUseApi]   = useState(false);
  const [viewMode, setViewMode] = useState('tile'); // 'tile' | 'table'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { loadAll(); }, []);

  /* ── loaders ── */
  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStocks(), loadItems(), loadCategories(), loadWarehouses()]);
    setLoading(false);
  };

  // const loadStocks = async () => {
  //   try {
  //     const res = await fetch(API_LEVELS);
  //     if (res.ok) { setStocks(await res.json()); setUseApi(true); return; }
  //   } catch {}
  //   try { const d = localStorage.getItem('srivaari_stock_levels'); if (d) setStocks(JSON.parse(d)); } catch {}
  // };

const loadStocks = async () => {
  try {
    const data = await getAllStockLevels();
    setStocks(asArray(data));
    setUseApi(true);
  } catch (error) {
    console.error("Error loading stock levels:", error);
    setStocks([]);
  }
};

  const loadItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(asArray(res.data));
    } catch { setItems([]); }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/getall').catch(() => api.get('/categories'));
      setCategories(asArray(res.data));
    } catch { setCategories([]); }
  };

  const loadWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(asArray(res.data));
    } catch { setWarehouses([]); }
  };

  /* ── helpers ── */
  const getItemById = (id) => items.find(i => String(i.id) === String(id));

  // const getItemName = (stock) => {
  //   const item = getItemById(stock.itemId);
  //   return item ? (item.name || item.itemName) : (stock.itemName || null);
  // };

  const getItemName = (stock) => {
  if (stock.item) {
    return stock.item.name || stock.item.itemName;
  }

  const item = getItemById(stock.itemId);
  return item ? (item.name || item.itemName) : null;
};

  // const getCategoryNameForItem = (stock) => {
  //   const item = getItemById(stock.itemId);
  //   const catId = item?.category?.id || item?.categoryId;
  //   if (!catId) return null;
  //   const cat = categories.find(c => String(c.id) === String(catId));
  //   return cat?.name || null;
  // };

  const getCategoryNameForItem = (stock) => {
  if (stock.category) {
    return stock.category.name;
  }

  const item = getItemById(stock.itemId);
  const catId = item?.category?.id || item?.categoryId;

  if (!catId) return null;

  const cat = categories.find(c => String(c.id) === String(catId));
  return cat?.name || null;
};

  const defaultWarehouses = ['Main Warehouse', 'Secondary Warehouse', 'Cold Storage', 'Distribution Center'];
  const warehouseOptions = (warehouses.length > 0 ? warehouses : defaultWarehouses).map((w, idx) => {
    if (typeof w === 'string') return { id: `wh-${idx}`, label: w };
    return {
      id: String(w?.id ?? idx),
      label: w?.name || w?.warehouseName || w?.code || `WH #${w?.id ?? idx}`
    };
  });

  const ff = (k, v) => {
    setForm(p => {
      const next = { ...p, [k]: v };
      // When category changes, reset item selection
      if (k === 'categoryId') next.itemId = '';
      // Auto-calculate status
      if (['quantity', 'minStockLevel', 'maxStockLevel'].includes(k)) {
        next.status = autoStatus(
          k === 'quantity' ? v : next.quantity,
          k === 'minStockLevel' ? v : next.minStockLevel,
          k === 'maxStockLevel' ? v : next.maxStockLevel,
        );
      }
      return next;
    });
  };

  const formItemOptions = form.categoryId
    ? items.filter(i => {
        const matchedCategory = categories.find(
          c => c.name === i.category || String(c.id) === String(i.categoryId || i.category?.id)
        );
        return String(matchedCategory?.id || i.categoryId || i.category?.id || '') === String(form.categoryId);
      })
    : items;

  /* ── save ── */
  // const handleSave = async () => {
  //   if (!form.warehouse) { showToast('Warehouse is required.', 'error'); return; }
  //   setSaving(true);

  //   const selectedItem = getItemById(form.itemId);
  //   const payload = {
  //     quantity:      form.quantity !== '' ? parseFloat(form.quantity) : null,
  //     warehouse:     form.warehouse,
  //     minStockLevel: form.minStockLevel !== '' ? parseFloat(form.minStockLevel) : null,
  //     maxStockLevel: form.maxStockLevel !== '' ? parseFloat(form.maxStockLevel) : null,
  //     status:        form.status || autoStatus(form.quantity, form.minStockLevel, form.maxStockLevel) || null,
  //   };

  //   try {
  //     if (useApi) {
  //       const url = editId !== null ? `${API_LEVELS}/${editId}` : API_LEVELS;
  //       const method = editId !== null ? 'PUT' : 'POST';
  //       const res = await fetch(url, {
  //         method,
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //       if (res.ok) {
  //         showToast(editId !== null ? 'Stock level updated.' : 'Stock level added.');
  //         setEditId(null); setForm(emptyForm);
  //         await loadStocks();
  //         setSaving(false); return;
  //       }
  //     }
  //   } catch {}

  //   // Fallback localStorage
  //   let stored = [];
  //   try { const d = localStorage.getItem('srivaari_stock_levels'); if (d) stored = JSON.parse(d); } catch {}
  //   const lsPayload = {
  //     ...payload,
  //     itemId:    form.itemId || null,
  //     itemName:  selectedItem ? (selectedItem.name || selectedItem.itemName) : null,
  //   };
  //   let updated;
  //   if (editId !== null) {
  //     updated = stored.map(s => s.id === editId ? { ...s, ...lsPayload } : s);
  //     showToast('Stock level updated.'); setEditId(null);
  //   } else {
  //     updated = [...stored, { ...lsPayload, id: Date.now() }];
  //     showToast('Stock level added.');
  //   }
  //   setStocks(updated);
  //   try { localStorage.setItem('srivaari_stock_levels', JSON.stringify(updated)); } catch {}
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.itemId) {
    showToast("Item is required.", "error");
    return;
  }

  if (!form.warehouse) {
    showToast("Warehouse is required.", "error");
    return;
  }

  setSaving(true);

  try {
    const payload = {
      item: {
        id: Number(form.itemId),
      },
      category: form.categoryId
        ? {
            id: Number(form.categoryId),
          }
        : null,
      quantity:
        form.quantity !== "" ? parseFloat(form.quantity) : null,
      warehouse: form.warehouse,
      minStockLevel:
        form.minStockLevel !== ""
          ? parseFloat(form.minStockLevel)
          : null,
      maxStockLevel:
        form.maxStockLevel !== ""
          ? parseFloat(form.maxStockLevel)
          : null,
      status:
        form.status ||
        autoStatus(
          form.quantity,
          form.minStockLevel,
          form.maxStockLevel
        ),
    };

    if (editId !== null) {
      await updateStockLevel(editId, payload);
      showToast("Stock level updated successfully.");
    } else {
      await createStockLevel(payload);
      showToast("Stock level created successfully.");
    }

    setForm(emptyForm);
    setEditId(null);
    await loadStocks();
  } catch (error) {
    console.error("Error saving stock level:", error);
    showToast("Failed to save stock level.", "error");
  } finally {
    setSaving(false);
  }
};

  // const handleEdit = (s) => {
  //   setForm({
  //     itemId:        s.itemId        ?? '',
  //     categoryId:    getItemById(s.itemId)?.category?.id ?? getItemById(s.itemId)?.categoryId ?? '',
  //     quantity:      s.quantity      ?? '',
  //     warehouse:     s.warehouse     ?? '',
  //     minStockLevel: s.minStockLevel ?? '',
  //     maxStockLevel: s.maxStockLevel ?? '',
  //     status:        s.status        ?? '',
  //   });
  //   setEditId(s.id);
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // };

  const handleEdit = (s) => {
  setForm({
    itemId: s.item?.id || s.itemId || "",
    categoryId:
      s.category?.id ||
      s.item?.category?.id ||
      s.item?.categoryId ||
      "",
    quantity: s.quantity ?? "",
    warehouse: s.warehouse ?? "",
    minStockLevel: s.minStockLevel ?? "",
    maxStockLevel: s.maxStockLevel ?? "",
    status: s.status ?? "",
  });

  setEditId(s.id);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stock entry?')) return;
    try {
      if (useApi) {
        await deleteStockLevel(id);
      }
      const updated = stocks.filter(s => s.id !== id);
      setStocks(updated);
      try { localStorage.setItem('srivaari_stock_levels', JSON.stringify(updated)); } catch {}
      showToast('Entry deleted successfully.');
    } catch (err) {
      console.error('Error deleting stock level:', err);
      showToast('Failed to delete stock level.', 'error');
    }
  };

  /* ── filtering ── */
  // const filtered = stocks.filter(s => {
  //   const item     = getItemById(s.itemId);
  //   const catId    = item?.category?.id || item?.categoryId;
  //   const itemName = item ? (item.name || item.itemName) : (s.itemName || '');

  //   const matchQ    = !search || itemName.toLowerCase().includes(search.toLowerCase()) || (s.warehouse || '').toLowerCase().includes(search.toLowerCase());
  //   const matchWH   = filterWH === 'ALL' || s.warehouse === filterWH;
  //   const matchItem = filterItem === 'ALL' || String(s.itemId || '') === filterItem;
  //   const matchCat  = filterCat === 'ALL' || String(catId || '') === filterCat;
  //   const matchStat = filterStatus === 'ALL' || s.status === filterStatus;
  //   return matchQ && matchWH && matchItem && matchCat && matchStat;
  // });

  const filtered = stocks.filter((s) => {
  const itemId = s.item?.id || s.itemId;
  const categoryId =
    s.category?.id ||
    s.item?.category?.id ||
    s.item?.categoryId;

  const itemName =
    s.item?.name ||
    s.item?.itemName ||
    getItemName(s) ||
    "";

  const matchQ =
    !search ||
    itemName.toLowerCase().includes(search.toLowerCase()) ||
    (s.warehouse || "").toLowerCase().includes(search.toLowerCase());

  const matchWH = filterWH === "ALL" || s.warehouse === filterWH;
  const matchItem =
    filterItem === "ALL" || String(itemId) === filterItem;
  const matchCat =
    filterCat === "ALL" || String(categoryId) === filterCat;
  const matchStat =
    filterStatus === "ALL" || s.status === filterStatus;

  return matchQ && matchWH && matchItem && matchCat && matchStat;
});

  const total  = stocks.length;
  const below  = stocks.filter(s => String(s?.status || '').toUpperCase() === 'BELOW').length;
  const over   = stocks.filter(s => String(s?.status || '').toUpperCase() === 'MAXIMUM').length;
  const normal = stocks.filter(s => ['MINIMUM', 'NORMAL'].includes(String(s?.status || '').toUpperCase())).length;

  /* ══════════════════════════════ RENDER ══════════════════════════════ */
  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
            <Warehouse size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Stock Levels</h1>
            <p className="text-xs text-gray-400 mt-0.5">Monitor stock quantities across warehouses</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <button onClick={() => setViewMode('tile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'tile' ? 'bg-purple-500 text-white' : 'bg-[#140f2d]/80 text-purple-300 border border-white/10 hover:bg-white/10'}`}>
            <LayoutGrid size={13} /> Tiles
          </button>
          <button onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-purple-500 text-white' : 'bg-[#140f2d]/80 text-purple-300 border border-white/10 hover:bg-white/10'}`}>
            <List size={13} /> Table
          </button>
          <button onClick={loadAll}
            className="w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors" title="Refresh">
            <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Entries" value={total}  color="#8b5cf6" icon={Warehouse} />
        <StatCard label="Normal"        value={normal} color="#059669" icon={TrendingUp} />
        <StatCard label="Below Min"     value={below}  color="#dc2626" icon={AlertCircle} />
        <StatCard label="Overstock"     value={over}   color="#d97706" icon={CheckCircle} />
      </div>

      {/* ── Add / Edit Form ── */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <Plus size={15} className="text-purple-300" />
          <h2 className="text-sm font-bold text-white">
            {editId !== null ? 'Update Stock Level' : 'Add Stock Level'}
          </h2>
          {editId !== null && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }}
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">

          {/* Row 1: Item Category, Item List, Warehouse */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

            {/* Item Category dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-1">
                <Tag size={11} /> Item Category
              </label>
              <select
                value={form.categoryId}
                onChange={e => ff('categoryId', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Item List dropdown (filtered by selected category) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-1">
                <Package size={11} /> Item List
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Package size={13} />
                </span>
                <select
                  value={form.itemId}
                  onChange={e => ff('itemId', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 pl-8 pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none"
                >
                  <option value="">Select Item…</option>
                  {formItemOptions.map(i => (
                    <option key={i.id} value={String(i.id)}>{i.name || i.itemName}</option>
                  ))}
                </select>
              </div>
              {form.categoryId && formItemOptions.length === 0 && (
                <p className="text-[10px] text-amber-500 mt-0.5">No items in this category</p>
              )}
            </div>

            {/* Warehouse */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-1">
                <Warehouse size={11} /> Warehouse <span className="text-red-400">*</span>
              </label>
              <select
                value={form.warehouse}
                onChange={e => ff('warehouse', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none"
              >
                <option value="">Select Warehouse…</option>
                {warehouseOptions.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.label}>{warehouse.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Qty, Min, Max, Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <InputField label="Quantity"        placeholder="Current Quantity"  value={form.quantity}      onChange={v => ff('quantity', v)}      type="number" />
            <InputField label="Min Stock Level" placeholder="Minimum Level"     value={form.minStockLevel} onChange={v => ff('minStockLevel', v)} type="number" />
            <InputField label="Max Stock Level" placeholder="Maximum Level"     value={form.maxStockLevel} onChange={v => ff('maxStockLevel', v)} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={e => ff('status', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none"
              >
                <option value="">Auto (calculated)</option>
                {STOCK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Auto status preview */}
          {form.quantity && form.minStockLevel && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-purple-500/10 text-xs text-purple-300 font-semibold inline-flex items-center gap-2">
              <CheckCircle size={12} />
              Auto Status: <span className="font-bold">{autoStatus(form.quantity, form.minStockLevel, form.maxStockLevel) || '—'}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save size={15} />}
              {editId !== null ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 px-6 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by item or warehouse…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 bg-transparent text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-gray-400" />
            {/* Item List filter */}
            <select value={filterItem} onChange={e => setFilterItem(e.target.value)}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]/80">
              <option value="ALL">All Items</option>
              {items.map(i => <option key={i.id} value={String(i.id)}>{i.name || i.itemName}</option>)}
            </select>
            {/* Category filter */}
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]/80">
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
            {/* Warehouse filter */}
            <select value={filterWH} onChange={e => setFilterWH(e.target.value)}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]/80">
              <option value="ALL">All Warehouses</option>
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.label}>{warehouse.label}</option>
              ))}
            </select>
            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]/80">
              <option value="ALL">All Statuses</option>
              <option value="BELOW">Below Min</option>
              <option value="MINIMUM">Normal</option>
              <option value="MAXIMUM">Overstock</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
        </div>
      </div>

      {/* ── TILE VIEW ── */}
      {viewMode === 'tile' ? (
        <>
          {/* Category quick-filter chips */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-semibold text-purple-300">Category:</span>
              <button
                onClick={() => setFilterCat('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${filterCat === 'ALL' ? 'bg-purple-500 text-white border-purple-500/40' : 'bg-[#140f2d]/80 text-purple-300 border-white/10 hover:bg-white/10'}`}>
                All
              </button>
              {categories.map(c => (
                <button key={c.id}
                  onClick={() => setFilterCat(String(c.id))}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${filterCat === String(c.id) ? 'bg-purple-500 text-white border-purple-500/40' : 'bg-[#140f2d]/80 text-purple-300 border-white/10 hover:bg-white/10'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Item quick-filter chips */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs font-semibold text-purple-300">Item:</span>
              <button
                onClick={() => setFilterItem('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${filterItem === 'ALL' ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-[#140f2d]/80 text-purple-300 border-white/10 hover:bg-white/10'}`}>
                All
              </button>
              {(filterCat === 'ALL'? items: items.filter(i => {const matchedCategory = categories.find( c => c.name === i.category);return String(matchedCategory?.id || '') === filterCat;}))
                .slice(0, 12)
                .map(i => (
                  <button key={i.id}
                    onClick={() => setFilterItem(String(i.id))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${filterItem === String(i.id) ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-[#140f2d]/80 text-purple-300 border-white/10 hover:bg-white/10'}`}>
                    {i.name || i.itemName}
                  </button>
                ))}
            </div>
          )}

          {/* Tiles grid */}
          {filtered.length === 0 ? (
            <div className="bg-[#140f2d]/80 rounded-2xl p-14 text-center text-gray-400 text-sm shadow-sm border border-white/10">
              {loading ? 'Loading stock levels…' : 'No stock entries found. Add one above.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(s => (
                <StockTile
                  key={s.id}
                  stock={s}
                  itemName={getItemName(s)}
                  categoryName={getCategoryNameForItem(s)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                  {['Item', 'Category', 'Warehouse', 'Quantity', 'Min Level', 'Max Level', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-gray-400 text-sm">
                      {loading ? 'Loading…' : 'No stock entries found.'}
                    </td>
                  </tr>
                ) : filtered.map((s, idx) => (
                  <tr key={s.id}
                    className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                    <td className="px-4 py-3 text-xs font-semibold text-white">
                      {getItemName(s) || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-purple-300">
                      {getCategoryNameForItem(s) || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-purple-300">{s.warehouse}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">{s.quantity ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{s.minStockLevel ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{s.maxStockLevel ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(s)}
                          className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
