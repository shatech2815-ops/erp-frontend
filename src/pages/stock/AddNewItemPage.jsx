import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Package, Tag, DollarSign,
  Layers, AlertCircle, Hash, CheckCircle, XCircle, Settings, Box, BarChart2
} from 'lucide-react';

import {
  createItem,
  updateItem,
} from "../../services/stock/item.services";
import { getAllCategories } from "../../services/stock/category.services";

const UNITS = ['KG', 'LITER', 'NOS', 'BOX', 'PACK', 'CARTON', 'PIECE', 'SET'];
const ITEM_TYPES = ['Raw Material', 'Finished Goods', 'Semi-Finished Goods', 'Consumables', 'Spare Parts', 'Trading Items', 'Services', 'Packaging Materials'];

const emptyForm = {
  name: '', sku: '', itemCode: '', description: '',
  price: '', costPrice: '', quantity: '',
  categoryId: '', subcategory: '', brand: '', itemType: '',
  unit: '', purchaseUom: '', salesUom: '', stockUom: '', conversionFactor: '',
  barcode: '', hsnSac: '', taxCategory: '',
  minimumStock: '', maximumStock: '', reorderLevel: '', reorderQuantity: '', safetyStock: '', leadTime: '',
  batchTracking: false, serialTracking: false, expiryTracking: false,
  status: 'Active',
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={14} /></span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all`}
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
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all appearance-none"
    >
      <option value="" className="bg-[#140f2d]">{placeholder}</option>
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o} className="bg-[#140f2d]">{o}</option>
          : <option key={o.value} value={o.value} className="bg-[#140f2d]">{o.label}</option>
      )}
    </select>
  </div>
);

const ToggleField = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between bg-[#140f2d]/80 border border-white/10 rounded-xl px-4 py-3">
    <span className="text-xs font-semibold text-gray-300 uppercase">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-600'}`}
    >
      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden mb-5">
    <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-white/5">
      <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">{title}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function AddNewItemPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const editItem  = location.state?.item || null;

  const [form, setForm] = useState(editItem ? {
    ...emptyForm,
    ...editItem,
    categoryId: editItem.category?.id ?? editItem.categoryId ?? '',
  } : emptyForm);
  
  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data || []);
      } catch (error) {
        showToast("Failed to load categories", "error");
      }
    };
    loadCategories();
  }, []);

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.sku.trim() || !form.name.trim()) {
      showToast("SKU and Item Name are required.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      price: form.price !== "" ? parseFloat(form.price) : null,
      costPrice: form.costPrice !== "" ? parseFloat(form.costPrice) : null,
      quantity: form.quantity !== "" ? parseInt(form.quantity) : null,
      reorderLevel: form.reorderLevel !== "" ? parseInt(form.reorderLevel) : null,
      reorderQuantity: form.reorderQuantity !== "" ? parseInt(form.reorderQuantity) : null,
      minimumStock: form.minimumStock !== "" ? parseInt(form.minimumStock) : null,
      maximumStock: form.maximumStock !== "" ? parseInt(form.maximumStock) : null,
      safetyStock: form.safetyStock !== "" ? parseInt(form.safetyStock) : null,
      leadTime: form.leadTime !== "" ? parseInt(form.leadTime) : null,
      conversionFactor: form.conversionFactor !== "" ? parseFloat(form.conversionFactor) : null,
      category: form.categoryId ? categories.find(c => String(c.id) === String(form.categoryId))?.name || null : null,
    };

    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        showToast("Item updated successfully!");
      } else {
        await createItem(payload);
        showToast("Item created successfully!");
      }
      setTimeout(() => navigate("/dashboard/stock/items/item-list"), 1200);
    } catch (error) {
      showToast(error?.response?.data?.error || "Failed to save item.", "error");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f87171] flex items-center justify-center shadow-md">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{editItem ? 'Edit Master Item' : 'Add New Master Item'}</h1>
            <p className="text-xs text-gray-400">Complete Inventory Setup</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <InputField label="SKU" placeholder="e.g. ITM-001" value={form.sku} onChange={v => f('sku', v)} icon={Hash} required />
          <InputField label="Item Code" placeholder="Barcode / Part No" value={form.itemCode} onChange={v => f('itemCode', v)} icon={Hash} />
          <InputField label="Item Name" placeholder="Item Name" value={form.name} onChange={v => f('name', v)} icon={Package} required />
          <InputField label="Brand" placeholder="Brand Name" value={form.brand} onChange={v => f('brand', v)} icon={Tag} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          <SelectField label="Category" value={form.categoryId} onChange={v => f('categoryId', v)} options={catOptions} />
          <InputField label="Subcategory" placeholder="Subcategory" value={form.subcategory} onChange={v => f('subcategory', v)} />
          <SelectField label="Item Type" value={form.itemType} onChange={v => f('itemType', v)} options={ITEM_TYPES} />
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Description</label>
          <textarea
            placeholder="Item description…"
            value={form.description}
            onChange={e => f('description', e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all resize-none"
          />
        </div>
      </Section>

      {/* Units & Dimensions */}
      <Section title="Units of Measure (UOM)">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <SelectField label="Base Unit" value={form.unit} onChange={v => f('unit', v)} options={UNITS} required />
          <SelectField label="Purchase UOM" value={form.purchaseUom} onChange={v => f('purchaseUom', v)} options={UNITS} />
          <SelectField label="Sales UOM" value={form.salesUom} onChange={v => f('salesUom', v)} options={UNITS} />
          <SelectField label="Stock UOM" value={form.stockUom} onChange={v => f('stockUom', v)} options={UNITS} />
          <InputField label="Conversion Factor" placeholder="e.g. 10" value={form.conversionFactor} onChange={v => f('conversionFactor', v)} type="number" />
        </div>
      </Section>

      {/* Pricing & Tax */}
      <Section title="Pricing & Tax Details">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <InputField label="Purchase Cost (₹)" placeholder="0.00" value={form.costPrice} onChange={v => f('costPrice', v)} type="number" icon={DollarSign} />
          <InputField label="Selling Price (₹)" placeholder="0.00" value={form.price} onChange={v => f('price', v)} type="number" icon={DollarSign} />
          <InputField label="HSN/SAC Code" placeholder="HSN Code" value={form.hsnSac} onChange={v => f('hsnSac', v)} />
          <SelectField label="Tax Category" value={form.taxCategory} onChange={v => f('taxCategory', v)} options={['GST 0%', 'GST 5%', 'GST 12%', 'GST 18%', 'GST 28%']} />
        </div>
      </Section>

      {/* Inventory Control */}
      <Section title="Inventory Control & Reorder Rules">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <InputField label="Minimum Stock" placeholder="Min" value={form.minimumStock} onChange={v => f('minimumStock', v)} type="number" icon={BarChart2} />
          <InputField label="Maximum Stock" placeholder="Max" value={form.maximumStock} onChange={v => f('maximumStock', v)} type="number" />
          <InputField label="Reorder Level" placeholder="Reorder point" value={form.reorderLevel} onChange={v => f('reorderLevel', v)} type="number" icon={AlertCircle} />
          <InputField label="Reorder Qty" placeholder="Qty to order" value={form.reorderQuantity} onChange={v => f('reorderQuantity', v)} type="number" />
          <InputField label="Safety Stock" placeholder="Safety stock" value={form.safetyStock} onChange={v => f('safetyStock', v)} type="number" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">
           <InputField label="Lead Time (Days)" placeholder="Vendor delay" value={form.leadTime} onChange={v => f('leadTime', v)} type="number" />
           <ToggleField label="Batch Tracking" checked={form.batchTracking} onChange={v => f('batchTracking', v)} />
           <ToggleField label="Serial Tracking" checked={form.serialTracking} onChange={v => f('serialTracking', v)} />
           <ToggleField label="Expiry Tracking" checked={form.expiryTracking} onChange={v => f('expiryTracking', v)} />
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#ef4444] text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg disabled:opacity-60"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
          {editItem ? 'Update Item' : 'Save Master Item'}
        </button>
      </div>
    </div>
  );
}
