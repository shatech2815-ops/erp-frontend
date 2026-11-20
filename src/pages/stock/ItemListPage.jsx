import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Package, Tag,
  DollarSign, Edit2, Trash2, Save, X,
  CheckCircle, XCircle, AlertCircle, Filter,
  Hash, Layers, RefreshCw,
} from 'lucide-react';

import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
} from "../../services/stock/item.services";

import { getAllCategories } from "../../services/stock/category.services";
// const API_ITEMS      = '/api/items';
// const API_CATEGORIES = '/api/categories/getall';
const UNITS = ['KG', 'LITER', 'NOS', 'BOX', 'PACK'];

const emptyForm = {
  name:         '',
  sku:          '',
  description:  '',
  price:        '',
  costPrice:    '',
  quantity:     '',
  reorderLevel: '',
  unit:         '',
  brand:        '',
  categoryId:   '',
  active:       true,
  discontinued: false,
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
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
      <option value="" className="bg-[#140f2d]">{placeholder}</option>
      {options.map(o => (
        typeof o === 'string'
          ? <option key={o} value={o} className="bg-[#140f2d]">{o}</option>
          : <option key={o.value} value={o.value} className="bg-[#140f2d]">{o.label}</option>
      ))}
    </select>
  </div>
);

const StatusBadge = ({ active }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    style={active ? { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' } : { background: 'rgba(241,245,249,0.14)', color: '#64748b' }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#10b981' : '#94a3b8' }} />
    {active ? 'Active' : 'Inactive'}
  </span>
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

export default function ItemListPage() {
  const navigate = useNavigate();
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [search, setSearch]         = useState('');
  const [filterActive, setFilterActive] = useState('ALL');
  const [filterUnit, setFilterUnit]     = useState('ALL');
  const [filterCat, setFilterCat]       = useState('ALL');
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  // const [useApi, setUseApi]         = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { loadItems(); loadCategories(); }, []);

  // const loadItems = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(API_ITEMS);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setItems(data);
  //       setUseApi(true);
  //       setLoading(false);
  //       return;
  //     }
  //   } catch {}
  //   try { const d = localStorage.getItem('srivaari_itemslist'); if (d) setItems(JSON.parse(d)); } catch {}
  //   setLoading(false);
  // };

  const loadItems = async () => {
    setLoading(true);

    try {
      const data = await getAllItems();
      const normalized = (data || []).map(i => ({
        ...i,
        active: i.active !== undefined 
          ? Boolean(i.active) 
          : (i.status ? i.status.toLowerCase() === 'active' : true),
        discontinued: i.discontinued !== undefined 
          ? Boolean(i.discontinued) 
          : (i.status ? i.status.toLowerCase() === 'discontinued' : false),
      }));
      setItems(normalized);
    } catch (error) {
      console.error("Error loading items:", error);
      showToast("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  };

  // const loadCategories = async () => {
  //   try {
  //     const res = await fetch(API_CATEGORIES);
  //     if (res.ok) { setCategories(await res.json()); return; }
  //   } catch {}
  //   try { const d = localStorage.getItem('srivaari_categories'); if (d) setCategories(JSON.parse(d)); } catch {}
  // };

  const loadCategories = async () => {
  try {
    const data = await getAllCategories();
    setCategories(data || []);
  } catch (error) {
    console.error("Error loading categories:", error);
    showToast("Failed to load categories", "error");
  }
};

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // const handleSave = async () => {
  //   if (!form.sku.trim() || !form.name.trim()) {
  //     showToast('SKU and Item Name are required.', 'error'); return;
  //   }
  //   setSaving(true);

  //   // Build payload matching backend Item entity exactly
  //   const payload = {
  //     name:         form.name.trim(),
  //     sku:          form.sku.trim(),
  //     description:  form.description.trim() || null,
  //     price:        form.price !== '' ? parseFloat(form.price) : null,
  //     costPrice:    form.costPrice !== '' ? parseFloat(form.costPrice) : null,
  //     quantity:     form.quantity !== '' ? parseInt(form.quantity) : null,
  //     reorderLevel: form.reorderLevel !== '' ? parseInt(form.reorderLevel) : null,
  //     unit:         form.unit || null,
  //     brand:        form.brand.trim() || null,
  //     active:       form.active,
  //     discontinued: form.discontinued,
  //     category:     form.categoryId ? { id: parseInt(form.categoryId) } : null,
  //   };

  //   try {
  //     if (useApi) {
  //       const url = editId !== null ? `${API_ITEMS}/${editId}` : API_ITEMS;
  //       const method = editId !== null ? 'PUT' : 'POST';
  //       const res = await fetch(url, {
  //         method,
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //       if (res.ok) {
  //         showToast(editId !== null ? 'Item updated.' : 'Item saved.');
  //         setEditId(null);
  //         setForm(emptyForm);
  //         await loadItems();
  //         setSaving(false);
  //         return;
  //       }
  //     }
  //   } catch {}

  //   // Fallback localStorage
  //   let stored = [];
  //   try { const d = localStorage.getItem('srivaari_itemslist'); if (d) stored = JSON.parse(d); } catch {}
  //   const catName = categories.find(c => String(c.id) === String(form.categoryId))?.name || '';
  //   let updated;
  //   if (editId !== null) {
  //     updated = stored.map(it => it.id === editId ? { ...it, ...payload, categoryName: catName } : it);
  //     showToast('Item updated.');
  //     setEditId(null);
  //   } else {
  //     updated = [...stored, { ...payload, id: Date.now(), categoryName: catName }];
  //     showToast('Item saved.');
  //   }
  //   setItems(updated);
  //   try { localStorage.setItem('srivaari_itemslist', JSON.stringify(updated)); } catch {}
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.sku.trim() || !form.name.trim()) {
    showToast("SKU and Item Name are required.", "error");
    return;
  }

  setSaving(true);

  const selectedCategory = categories.find(
  c => String(c.id) === String(form.categoryId)
);

const payload = {
  name: form.name.trim(),
  sku: form.sku.trim(),
  description: form.description.trim() || null,
  price: form.price !== "" ? parseFloat(form.price) : null,
  costPrice: form.costPrice !== "" ? parseFloat(form.costPrice) : null,
  quantity: form.quantity !== "" ? parseInt(form.quantity) : null,
  reorderLevel:
    form.reorderLevel !== "" ? parseInt(form.reorderLevel) : null,
  unit: form.unit || null,
  brand: form.brand.trim() || null,
  active: form.active,
  discontinued: form.discontinued,
  status: form.discontinued ? 'Discontinued' : (form.active ? 'Active' : 'Inactive'),
  category: selectedCategory ? selectedCategory.name : null,
};

  try {
    if (editId !== null) {
      await updateItem(editId, payload);
      showToast("Item updated successfully!");
    } else {
      await createItem(payload);
      showToast("Item created successfully!");
    }

    setEditId(null);
    setForm(emptyForm);
    await loadItems();
  } catch (error) {
    console.error("Error saving item:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Failed to save item.";

    showToast(errorMessage, "error");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (item) => {
    setForm({
      name:         item.name         || item.item_name || '',
      sku:          item.sku          || '',
      description:  item.description  || '',
      price:        item.price        ?? '',
      costPrice:    item.costPrice    ?? '',
      quantity:     item.quantity     ?? '',
      reorderLevel: item.reorderLevel ?? '',
      unit:         item.unit         || '',
      brand:        item.brand        || '',
      categoryId:categories.find(c => c.name === item.category)?.id || '',
      active:       item.active       ?? true,
      discontinued: item.discontinued ?? false,
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm('Delete this item?')) return;
  //   try {
  //     if (useApi) {
  //       await fetch(`${API_ITEMS}/${id}`, { method: 'DELETE' });
  //       showToast('Item deleted.');
  //       await loadItems();
  //       return;
  //     }
  //   } catch {}
  //   const updated = items.filter(it => it.id !== id);
  //   setItems(updated);
  //   try { localStorage.setItem('srivaari_itemslist', JSON.stringify(updated)); } catch {}
  //   showToast('Item deleted.');
  // };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteItem(id);
      showToast("Item deleted successfully!");
      await loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);

      let errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to delete item.";

      if (
        typeof errorMessage === "string" &&
        (errorMessage.toLowerCase().includes("foreign key") ||
          errorMessage.toLowerCase().includes("constraint") ||
          errorMessage.toLowerCase().includes("referenced") ||
          errorMessage.toLowerCase().includes("parent row"))
      ) {
        errorMessage =
          "Cannot delete this item because it is referenced by other records (such as orders, stock, or invoices). Please mark it as Inactive instead.";
      }

      showToast(errorMessage, "error");
    }
  };


  const getCategoryName = (item) =>
    item.category?.name || item.categoryName || categories.find(c => c.id === item.categoryId)?.name || item.category || '—';

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || (i.name || '').toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q);
    const matchA = filterActive === 'ALL' || (filterActive === 'Active' ? i.active : !i.active);
    const matchU = filterUnit === 'ALL' || i.unit === filterUnit;
    const matchC = filterCat === 'ALL' ||categories.find(c => c.name === i.category)?.id?.toString() === filterCat;
    return matchQ && matchA && matchU && matchC;
  });

  const lowStock = items.filter(i => i.reorderLevel != null && i.quantity != null && i.quantity <= i.reorderLevel).length;

  const stats = [
    { label: 'Total Items',  value: items.length,                        color: '#8b5cf6', icon: Package    },
    { label: 'Active',       value: items.filter(i => i.active).length,  color: '#059669', icon: CheckCircle },
    { label: 'Low Stock',    value: lowStock,                             color: '#d97706', icon: AlertCircle },
    { label: 'Categories',   value: categories.length,                   color: '#6366f1', icon: Layers      },
  ];

  const catOptions = categories.map(c => ({ value: String(c.id), label: c.name }));

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center">
            <Package size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Item List</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage all inventory items</p>
          </div>
        </div>
        <button onClick={loadItems} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
            {editId ? <Edit2 size={15} className="text-[#ef4444]" /> : <Plus size={15} className="text-[#ef4444]" />}
          </div>
          <h2 className="text-sm font-bold text-white">{editId ? 'Update Item' : 'Add New Item'}</h2>
          {editId && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          {/* Row 1: SKU, Name, Brand */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InputField label="SKU" placeholder="e.g. ITM-001" value={form.sku} onChange={v => f('sku', v)} icon={Hash} required />
            <InputField label="Item Name" placeholder="Item Name" value={form.name} onChange={v => f('name', v)} icon={Package} required />
            <InputField label="Brand" placeholder="Brand Name" value={form.brand} onChange={v => f('brand', v)} icon={Tag} />
          </div>
          {/* Row 2: Price, Cost Price, Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InputField label="Price (₹)" placeholder="Selling Price" value={form.price} onChange={v => f('price', v)} type="number" icon={DollarSign} />
            <InputField label="Cost Price (₹)" placeholder="Purchase Cost" value={form.costPrice} onChange={v => f('costPrice', v)} type="number" icon={DollarSign} />
            <SelectField label="Unit" value={form.unit} onChange={v => f('unit', v)} options={UNITS} placeholder="Select Unit" />
          </div>
          {/* Row 3: Qty, Reorder Level, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <InputField label="Quantity" placeholder="Current Stock" value={form.quantity} onChange={v => f('quantity', v)} type="number" icon={Layers} />
            <InputField label="Reorder Level" placeholder="Min Stock Before Reorder" value={form.reorderLevel} onChange={v => f('reorderLevel', v)} type="number" icon={AlertCircle} />
            <SelectField label="Category" value={form.categoryId} onChange={v => f('categoryId', v)} options={catOptions} placeholder="Select Category" />
          </div>
          {/* Row 4: Description, Status, Discontinued */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Description</label>
              <textarea
                placeholder="Item description…"
                value={form.description}
                onChange={e => f('description', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
              <div className="flex items-center gap-2 mt-1">
                <button type="button" onClick={() => f('active', true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${form.active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Active
                </button>
                <button type="button" onClick={() => f('active', false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${!form.active ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Inactive
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Discontinued</label>
              <div className="flex items-center gap-2 mt-1">
                <button type="button" onClick={() => f('discontinued', false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${!form.discontinued ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  In Production
                </button>
                <button type="button" onClick={() => f('discontinued', true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${form.discontinued ? 'bg-amber-500 text-white border-amber-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Discontinued
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ef4444] text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-md disabled:opacity-60"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]">
              <option value="ALL" className="bg-[#140f2d]">All Categories</option>
              {categories.map(c => <option key={c.id} value={String(c.id)} className="bg-[#140f2d]">{c.name}</option>)}
            </select>
            <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]">
              <option value="ALL" className="bg-[#140f2d]">All Units</option>
              {UNITS.map(u => <option key={u} value={u} className="bg-[#140f2d]">{u}</option>)}
            </select>
            <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none bg-[#140f2d]">
              <option value="ALL" className="bg-[#140f2d]">All Statuses</option>
              <option value="Active" className="bg-[#140f2d]">Active</option>
              <option value="Inactive" className="bg-[#140f2d]">Inactive</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white text-xs uppercase tracking-wide">
                {['Item', 'SKU', 'Brand', 'Category', 'Unit', 'Price', 'Cost', 'Qty', 'Reorder', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No items found.'}</td></tr>
              ) : filtered.map((item, idx) => {
                const isLow = item.reorderLevel != null && item.quantity != null && item.quantity <= item.reorderLevel;
                return (
                  <tr key={item.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgba(239,68,68,0.15)] to-[rgba(254,202,202,0.12)] flex items-center justify-center flex-shrink-0">
                          <Package size={13} className="text-[#ef4444]" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{item.name || item.item_name}</p>
                          {item.discontinued && <span className="text-[10px] text-amber-400 font-semibold">Discontinued</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-purple-300 font-mono">{item.sku}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{item.brand || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-purple-300">{getCategoryName(item)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">{item.unit || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-white text-xs">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">₹{Number(item.costPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-bold ${isLow ? 'text-orange-500' : 'text-white'}`}>{item.quantity ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{item.reorderLevel ?? '—'}</td>
                    <td className="px-4 py-3.5"><StatusBadge active={item.active} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors"><Edit2 size={12} /></button>
                        <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
