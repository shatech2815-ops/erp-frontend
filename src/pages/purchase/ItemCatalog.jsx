// ItemCatalog.jsx — Purchase Management > Inventory > Item Catalog
// BUG FIXES vs backend Item entity:
//   1. form field was `name`  → must be `itemName`  (entity: private String itemName)
//   2. form field was `status`→ must be `active` Boolean (entity: private Boolean active)
//   3. API endpoint POST /api/inventory/items, GET /api/inventory/items, PUT /api/inventory/items/{id}, DELETE /api/inventory/items/{id}
//   4. Controller accepts `@RequestBody Item item` directly (not DTO), so JSON keys must match entity field names exactly
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Package, Tag, Layers,
  DollarSign, BarChart2, Edit2, Trash2, Save, X,
  CheckCircle, XCircle, AlertCircle, Filter,
} from 'lucide-react';

import {
  createItem,
  getItems,
  updateItem,
  deleteItem
} from "../../services/purchase/inventory.services";
// const API_BASE = `${import.meta.env.VITE_API_URL}/inventory/items`;

// Backend entity: Boolean active (true=Active, false=Inactive)
// No "Discontinued" in entity — removed from frontend to match
const CATEGORIES = ['Raw Material', 'Finished Good', 'Spare Parts', 'Consumable', 'Packaging', 'Equipment', 'Electronics'];
const UNITS      = ['kg', 'pcs', 'ltr', 'mtr', 'box', 'set', 'nos', 'Pieces'];

// emptyForm keys match entity field names exactly
const emptyForm = {
  itemName: '',     // entity: String itemName
  category: '',     // entity: String category
  brand: '',        // entity: String brand
  sku: '',          // entity: String sku
  price: '',        // entity: Double price
  reorderLevel: '', // entity: Integer reorderLevel
  unit: '',         // entity: String unit
  active: true,     // entity: Boolean active
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input
        type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all`}
      />
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

const StatusBadge = ({ active }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    style={active ? { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' } : { background: 'rgba(241,245,249,0.14)', color: '#64748b' }}>
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active ? '#10b981' : '#94a3b8' }} />
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

export default function ItemCatalog() {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(emptyForm);
  const [editId, setEditId]   = useState(null);
  const [search, setSearch]   = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterActive, setFilterActive] = useState('ALL');
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // // Load items from backend
  // const fetchItems = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(API_BASE);
  //     const data = await res.json();
  //     setItems(Array.isArray(data) ? data : []);
  //   } catch {
  //     showToast('Could not reach backend. Showing offline data.', 'error');
  //     // fallback demo data with correct field names matching entity
  //     setItems([
  //       { id: 1, itemName: 'Steel Rod 12mm',    category: 'Raw Material', brand: 'TATA Steel', sku: 'SR-12-001',  price: 850,  reorderLevel: 100, unit: 'kg',  active: true },
  //       { id: 2, itemName: 'Copper Wire 2.5sq', category: 'Raw Material', brand: 'Polycab',    sku: 'CW-25-002',  price: 1200, reorderLevel: 50,  unit: 'mtr', active: true },
  //       { id: 3, itemName: 'Bearing 6205',      category: 'Spare Parts',  brand: 'SKF',        sku: 'BR-6205-003',price: 320,  reorderLevel: 200, unit: 'pcs', active: true },
  //       { id: 4, itemName: 'Hydraulic Oil 46',  category: 'Consumable',   brand: 'Servo',      sku: 'HO-46-004',  price: 210,  reorderLevel: 30,  unit: 'ltr', active: true },
  //       { id: 5, itemName: 'Electric Motor 5HP',category: 'Equipment',    brand: 'Kirloskar',  sku: 'EM-5HP-006', price: 18500,reorderLevel: 5,   unit: 'nos', active: false },
  //     ]);
  //   }
  //   setLoading(false);
  // };

  const fetchItems = async () => {
  setLoading(true);

  try {
    const data = await getItems();
    setItems(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(error);
    showToast('Could not reach backend.', 'error');
    setItems([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!form.itemName || !form.category || !form.sku) {
      showToast('Item Name, Category and SKU are required.', 'error');
      return;
    }
    setSaving(true);
    // try {
    //   // Build payload matching entity field names exactly
    //   const payload = {
    //     itemName:     form.itemName,
    //     category:     form.category,
    //     brand:        form.brand     || null,
    //     sku:          form.sku,
    //     price:        form.price        !== '' ? parseFloat(form.price)        : null,
    //     reorderLevel: form.reorderLevel !== '' ? parseInt(form.reorderLevel)   : null,
    //     unit:         form.unit         || null,
    //     active:       form.active,  // Boolean — matches entity field `active`
    //   };

    //   let res;
    //   if (editId) {
    //     res = await fetch(`${API_BASE}/${editId}`, {
    //       method: 'PUT',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(payload),
    //     });
    //   } else {
    //     res = await fetch(API_BASE, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify(payload),
    //     });
    //   }
    //   if (!res.ok) throw new Error('Save failed');
    //   const saved = await res.json();
    //   if (editId) {
    //     setItems(prev => prev.map(i => i.id === editId ? saved : i));
    //     showToast('Item updated successfully.');
    //   } else {
    //     setItems(prev => [...prev, saved]);
    //     showToast('Item added successfully.');
    //   }
    //   setForm(emptyForm);
    //   setEditId(null);
    // } catch {
    //   showToast('Failed to save item. Check backend connection.', 'error');
    // }
    try {
  const payload = {
    itemName: form.itemName,
    category: form.category,
    brand: form.brand || null,
    sku: form.sku,
    price: form.price !== '' ? parseFloat(form.price) : null,
    reorderLevel:
      form.reorderLevel !== '' ? parseInt(form.reorderLevel) : null,
    unit: form.unit || null,
    active: form.active,
  };

  let saved;

  if (editId) {
    saved = await updateItem(editId, payload);

    setItems(prev =>
      prev.map(item => (item.id === editId ? saved : item))
    );

    showToast('Item updated successfully.');
  } else {
    saved = await createItem(payload);

    setItems(prev => [...prev, saved]);

    showToast('Item added successfully.');
  }

  setForm(emptyForm);
  setEditId(null);
} catch (error) {
  console.error(error);
  showToast('Failed to save item. Check backend connection.', 'error');
}
    setSaving(false);
  };

  const handleEdit = (item) => {
    setForm({
      itemName:     item.itemName     || '',
      category:     item.category     || '',
      brand:        item.brand        || '',
      sku:          item.sku          || '',
      price:        item.price        ?? '',
      reorderLevel: item.reorderLevel ?? '',
      unit:         item.unit         || '',
      active:       item.active       ?? true,
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = async (id) => {
  //   try {
  //     await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  //     setItems(prev => prev.filter(i => i.id !== id));
  //     showToast('Item deleted.');
  //   } catch {
  //     showToast('Delete failed.', 'error');
  //   }
  // };
  const handleDelete = async (id) => {
  try {
    await deleteItem(id);

    setItems(prev => prev.filter(item => item.id !== id));

    showToast('Item deleted successfully.');
  } catch (error) {
    console.error(error);
    showToast('Delete failed.', 'error');
  }
};

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || (i.itemName || '').toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q) || (i.brand || '').toLowerCase().includes(q);
    const matchC = filterCat === 'ALL' || i.category === filterCat;
    const matchA = filterActive === 'ALL' || (filterActive === 'Active' ? i.active : !i.active);
    return matchQ && matchC && matchA;
  });

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const stats = [
    { label: 'Total Items', value: items.length,                        color: '#8b5cf6', icon: Package },
    { label: 'Active',      value: items.filter(i => i.active).length,  color: '#059669', icon: CheckCircle },
    { label: 'Inactive',    value: items.filter(i => !i.active).length, color: '#d97706', icon: AlertCircle },
    { label: 'Categories',  value: [...new Set(items.map(i => i.category).filter(Boolean))].length, color: '#6366f1', icon: Tag },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      {/* Toast */}
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
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
              <Package size={15} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Item Catalog</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-10">Manage all inventory items, SKUs and categories</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Create / Update Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            {editId ? <Edit2 size={15} className="text-purple-300" /> : <Plus size={15} className="text-purple-300" />}
          </div>
          <h2 className="text-sm font-bold text-white">{editId ? 'Update Item' : 'Create / Update Item'}</h2>
          {editId && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
              <X size={13} /> Cancel Edit
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* FIXED: field key is `itemName` not `name` */}
            <InputField label="Item Name"  placeholder="Item Name"  value={form.itemName}  onChange={v => f('itemName', v)}  icon={Package} />
            <SelectField label="Category"  value={form.category}    onChange={v => f('category', v)} options={CATEGORIES} />
            <InputField label="Brand"      placeholder="Brand"      value={form.brand}     onChange={v => f('brand', v)}     icon={Tag} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <InputField label="SKU"           placeholder="SKU"           value={form.sku}           onChange={v => f('sku', v)}           icon={Layers} />
            <InputField label="Price (₹)"     placeholder="Price"         value={form.price}         onChange={v => f('price', v)}         type="number" icon={DollarSign} />
            <InputField label="Reorder Level" placeholder="Reorder Level" value={form.reorderLevel}  onChange={v => f('reorderLevel', v)}  type="number" icon={BarChart2} />
            <SelectField label="Unit"         value={form.unit}           onChange={v => f('unit', v)} options={UNITS} />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* FIXED: active is Boolean — show as toggle matching entity */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Status</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => f('active', true)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${form.active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Active
                </button>
                <button type="button" onClick={() => f('active', false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${!form.active ? 'bg-purple-500 text-white border-purple-500/40' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Inactive
                </button>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters + List */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search by name, SKU or brand…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-400" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30">
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30">
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Name</th>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3 text-left font-semibold">Brand</th>
                  <th className="px-5 py-3 text-right font-semibold">Price (₹)</th>
                  <th className="px-5 py-3 text-center font-semibold">Stock Unit</th>
                  <th className="px-5 py-3 text-center font-semibold">Status</th>
                  <th className="px-5 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-14 text-gray-400 text-sm">No items found.</td></tr>
                ) : filtered.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-[rgba(255,255,255,0.10)] flex items-center justify-center flex-shrink-0">
                          <Package size={13} className="text-purple-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{item.itemName}</p>
                          <p className="text-[10px] text-gray-400">SKU: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-purple-300 text-xs font-medium">{item.category}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{item.brand || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-white text-xs">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">{item.unit}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center"><StatusBadge active={item.active} /></td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors">
                          <Trash2 size={12} />
                        </button>
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
