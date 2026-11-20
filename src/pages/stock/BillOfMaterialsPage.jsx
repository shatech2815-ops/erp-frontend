import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Package, Edit2, Trash2,
  Save, X, CheckCircle, XCircle, RefreshCw, FileText,
  DollarSign, ChevronDown, ChevronUp, Layers,
} from 'lucide-react';

import {
  createBOM,
  getAllBOMs,
  updateBOM,
  deleteBOM,
} from "../../services/stock/bom.services";
import { getAllItems } from "../../services/stock/item.services";

const UNITS = ['KG', 'LITER', 'NOS', 'BOX', 'PACK', 'METER', 'TON'];

// Backend BOM entity: product(Item), component(Item), quantityRequired, unit, componentCost, version, active, scrapPercentage, remarks
const emptyForm = {
  productId:       '',
  componentId:     '',
  quantityRequired:'',
  unit:            '',
  componentCost:   '',
  scrapPercentage: '',
  remarks:         '',
  active:          true,
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
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder = 'Select…', required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 pr-8 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-[#140f2d] text-gray-400">{placeholder}</option>
        {options.map(o =>
          typeof o === 'string'
            ? <option key={o} value={o} className="bg-[#140f2d] text-white">{o}</option>
            : <option key={o.value} value={o.value} className="bg-[#140f2d] text-white">{o.label}</option>
        )}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const StatusBadge = ({ active }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    style={active ? { background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' } : { background: 'rgba(241,245,249,0.14)', color: '#64748b' }}>
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? '#10b981' : '#94a3b8' }} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

export default function BillOfMaterialsPage() {
  const navigate = useNavigate();
  const [boms, setBoms]           = useState([]);
  const [items, setItems]         = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [search, setSearch]       = useState('');
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);
  // const [expandedId, setExpandedId] = useState(null);
  // const [useApi, setUseApi]       = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { loadBoms(); loadItems(); }, []);

  // const loadBoms = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${API_BOM}/getall`);
  //     if (res.ok) { setBoms(await res.json()); setUseApi(true); setLoading(false); return; }
  //   } catch {}
  //   try { const d = localStorage.getItem('srivaari_bom'); if (d) setBoms(JSON.parse(d)); } catch {}
  //   setLoading(false);
  // };

  const loadBoms = async () => {
  setLoading(true);
  try {
    const data = await getAllBOMs();
    setBoms(data || []);
  } catch (error) {
    console.error("Error loading BOMs:", error);
    showToast("Failed to load BOMs", "error");
  } finally {
    setLoading(false);
  }
};

  // const loadItems = async () => {
  //   try {
  //     const res = await fetch(API_ITEMS);
  //     if (res.ok) { setItems(await res.json()); return; }
  //   } catch {}
  //   try { const d = localStorage.getItem('srivaari_itemslist'); if (d) setItems(JSON.parse(d)); } catch {}
  // };

  const loadItems = async () => {
    try {
      const data = await getAllItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading items:", error);
      showToast("Failed to load catalog items", "error");
    }
  };
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const getItemName = (id) => {
    const item = items.find(i => String(i.id) === String(id));
    return item ? (item.name || item.itemName) : `Item #${id}`;
  };

  // const handleSave = async () => {
  //   if (!form.productId || !form.componentId || !form.quantityRequired) {
  //     showToast('Product, Component and Quantity are required.', 'error'); return;
  //   }
  //   if (form.productId === form.componentId) {
  //     showToast('Product and Component cannot be the same item.', 'error'); return;
  //   }
  //   setSaving(true);

  //   // Backend BOM payload: product and component are Item references
  //   const payload = {
  //     product:          { id: parseInt(form.productId) },
  //     component:        { id: parseInt(form.componentId) },
  //     quantityRequired: parseInt(form.quantityRequired) || 0,
  //     unit:             form.unit || null,
  //     componentCost:    form.componentCost !== '' ? parseFloat(form.componentCost) : null,
  //     scrapPercentage:  form.scrapPercentage !== '' ? parseFloat(form.scrapPercentage) : null,
  //     remarks:          form.remarks || null,
  //     active:           form.active,
  //   };

  //   try {
  //     if (useApi) {
  //       const url = editId !== null ? `${API_BOM}/${editId}` : `${API_BOM}/create`;
  //       const method = editId !== null ? 'PUT' : 'POST';
  //       const res = await fetch(url, {
  //         method,
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //       if (res.ok) {
  //         showToast(editId !== null ? 'BOM updated.' : 'BOM created.');
  //         setEditId(null); setForm(emptyForm);
  //         await loadBoms();
  //         setSaving(false);
  //         return;
  //       }
  //     }
  //   } catch {}

  //   // Fallback localStorage
  //   let stored = [];
  //   try { const d = localStorage.getItem('srivaari_bom'); if (d) stored = JSON.parse(d); } catch {}
  //   const lsPayload = {
  //     ...payload,
  //     productId: parseInt(form.productId),
  //     componentId: parseInt(form.componentId),
  //     productName: getItemName(form.productId),
  //     componentName: getItemName(form.componentId),
  //   };
  //   let updated;
  //   if (editId !== null) {
  //     updated = stored.map(b => b.id === editId ? { ...b, ...lsPayload } : b);
  //     showToast('BOM updated.'); setEditId(null);
  //   } else {
  //     updated = [...stored, { ...lsPayload, id: Date.now(), version: 1 }];
  //     showToast('BOM created.');
  //   }
  //   setBoms(updated);
  //   try { localStorage.setItem('srivaari_bom', JSON.stringify(updated)); } catch {}
  //   setForm(emptyForm);
  //   setSaving(false);
  // };


  const handleSave = async () => {
  if (!form.productId || !form.componentId || !form.quantityRequired) {
    showToast("Product, Component and Quantity are required.", "error");
    return;
  }

  if (form.productId === form.componentId) {
    showToast("Product and Component cannot be the same item.", "error");
    return;
  }

  setSaving(true);

  const payload = {
    product: {
      id: parseInt(form.productId),
    },
    component: {
      id: parseInt(form.componentId),
    },
    quantityRequired: parseInt(form.quantityRequired) || 0,
    unit: form.unit || null,
    componentCost:
      form.componentCost !== ""
        ? parseFloat(form.componentCost)
        : null,
    scrapPercentage:
      form.scrapPercentage !== ""
        ? parseFloat(form.scrapPercentage)
        : null,
    remarks: form.remarks || null,
    active: form.active,
  };

  try {
    if (editId !== null) {
      await updateBOM(editId, payload);
      showToast("BOM updated successfully.");
    } else {
      await createBOM(payload);
      showToast("BOM created successfully.");
    }

    setEditId(null);
    setForm(emptyForm);
    await loadBoms();
  } catch (error) {
    console.error("Error saving BOM:", error);
    showToast("Failed to save BOM", "error");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (bom) => {
    setForm({
      productId:        String(bom.product?.id   || bom.productId   || ''),
      componentId:      String(bom.component?.id || bom.componentId || ''),
      quantityRequired: bom.quantityRequired ?? '',
      unit:             bom.unit             || '',
      componentCost:    bom.componentCost    ?? '',
      scrapPercentage:  bom.scrapPercentage  ?? '',
      remarks:          bom.remarks          || '',
      active:           bom.active           ?? true,
    });
    setEditId(bom.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm('Delete this BOM entry?')) return;
  //   try {
  //     if (useApi) {
  //       const res = await fetch(`${API_BOM}/${id}`, { method: 'DELETE' });
  //       if (res.ok) { showToast('BOM deleted.'); await loadBoms(); return; }
  //     }
  //   } catch {}
  //   const updated = boms.filter(b => b.id !== id);
  //   setBoms(updated);
  //   try { localStorage.setItem('srivaari_bom', JSON.stringify(updated)); } catch {}
  //   showToast('BOM deleted.');
  // };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this BOM entry?")) return;

  try {
    await deleteBOM(id);
    showToast("BOM deleted.");
    await loadBoms();
  } catch (error) {
    console.error("Error deleting BOM:", error);
    showToast("Failed to delete BOM", "error");
  }
};

  const getProductName = (bom) => bom.product?.name || bom.product?.itemName || bom.productName || `Product #${bom.product?.id || bom.productId}`;
  const getComponentName = (bom) => bom.component?.name || bom.component?.itemName || bom.componentName || `Component #${bom.component?.id || bom.componentId}`;

  const filtered = boms.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getProductName(b).toLowerCase().includes(q) || getComponentName(b).toLowerCase().includes(q);
  });

  const itemOptions = items.map(i => ({ 
    value: String(i.id), 
    label: `${i.name || i.itemName || 'Item'} (${i.sku || 'ID: ' + i.id})` 
  }));

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
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center">
            <FileText size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Bill of Materials (BOM)</h1>
            <p className="text-xs text-gray-400 mt-0.5">Define product structures and raw material requirements</p>
          </div>
        </div>
        <button onClick={loadBoms} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total BOMs',  value: boms.length,                        color: '#ef4444', icon: FileText },
          { label: 'Active',      value: boms.filter(b => b.active).length,  color: '#059669', icon: CheckCircle },
          { label: 'Inactive',    value: boms.filter(b => !b.active).length, color: '#d97706', icon: XCircle },
          { label: 'Products',    value: new Set(boms.map(b => b.product?.id || b.productId).filter(Boolean)).size, color: '#6366f1', icon: Package },
        ].map(s => (
          <div key={s.label} className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: s.color }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* BOM Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
            {editId ? <Edit2 size={15} className="text-[#ef4444]" /> : <Plus size={15} className="text-[#ef4444]" />}
          </div>
          <h2 className="text-sm font-bold text-white">{editId ? 'Edit BOM Entry' : 'Create BOM Entry'}</h2>
          {editId && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <SelectField label="Finished Product" value={form.productId} onChange={v => f('productId', v)} options={itemOptions} placeholder="Select Product…" required />
            <SelectField label="Component / Raw Material" value={form.componentId} onChange={v => f('componentId', v)} options={itemOptions} placeholder="Select Component…" required />
            <InputField label="Quantity Required" placeholder="e.g. 5" value={form.quantityRequired} onChange={v => f('quantityRequired', v)} type="number" icon={Layers} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <SelectField label="Unit" value={form.unit} onChange={v => f('unit', v)} options={UNITS} placeholder="Select Unit" />
            <InputField label="Component Cost (₹)" placeholder="Cost per unit (₹)" value={form.componentCost} onChange={v => f('componentCost', v)} type="number" />
            <InputField label="Scrap %" placeholder="e.g. 2.5" value={form.scrapPercentage} onChange={v => f('scrapPercentage', v)} type="number" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Remarks</label>
              <input
                type="text"
                placeholder="Notes or instructions…"
                value={form.remarks}
                onChange={e => f('remarks', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => f('active', true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${form.active ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                Active
              </button>
              <button type="button" onClick={() => f('active', false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${!form.active ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                Inactive
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ef4444] text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-md disabled:opacity-60"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId ? 'Update BOM' : 'Save BOM'}
            </button>
          </div>
        </div>
      </div>

      {/* BOM List */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by product or component…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white text-xs uppercase tracking-wide">
                {['Product', 'Component', 'Qty Required', 'Unit', 'Cost (₹)', 'Scrap %', 'Version', 'Remarks', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-14 text-gray-400 text-sm">{loading ? 'Loading…' : 'No BOM entries found.'}</td></tr>
              ) : filtered.map((bom, idx) => (
                <tr key={bom.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Package size={13} className="text-[#ef4444]" />
                      </div>
                      <span className="font-semibold text-white text-xs">{getProductName(bom)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Layers size={11} className="text-purple-300" />
                      </div>
                      <span className="text-xs text-purple-300 font-medium">{getComponentName(bom)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-white">{bom.quantityRequired}</td>
                  <td className="px-5 py-3.5">
                    {bom.unit ? <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">{bom.unit}</span> : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-white">
                    {bom.componentCost != null ? `₹${Number(bom.componentCost).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{bom.scrapPercentage != null ? `${bom.scrapPercentage}%` : '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold">v{bom.version || 1}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 max-w-[120px] truncate">{bom.remarks || '—'}</td>
                  <td className="px-5 py-3.5"><StatusBadge active={bom.active} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate('/dashboard/stock/production/work-orders')} 
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Create or view Work Orders for this production item"
                      >
                        <Layers size={11} /> Work Order
                      </button>
                      <button onClick={() => handleEdit(bom)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors" title="Edit BOM"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(bom.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors" title="Delete BOM"><Trash2 size={12} /></button>
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
