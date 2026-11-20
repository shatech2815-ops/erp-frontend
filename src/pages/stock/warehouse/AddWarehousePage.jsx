
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Building2, MapPin, Mail, Phone,
  AlertCircle, CheckCircle, Warehouse, Hash, Package,
  Globe, Clock, FileText,
} from 'lucide-react';

import {
  createWarehouse,
  updateWarehouse,
} from "../../../services/stock/wareHouse.services";

const WAREHOUSE_TYPES = ['STORAGE', 'DISTRIBUTION', 'PRODUCTION', 'RETURNS'];

const emptyForm = {
  name: '', code: '', type: '',
  address: '', city: '', state: '', country: '', zipCode: '',
  contactPerson: '', phone: '', email: '',
  capacity: '', utilizedCapacity: '',
  active: true, defaultWarehouse: false,
  latitude: '', longitude: '',
  workingHours: '', remarks: '',
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
          ? <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
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

const ToggleField = ({ label, value, onChange, trueLabel = 'Yes', falseLabel = 'No' }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="flex gap-2">
      <button onClick={() => onChange(true)}
        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${value ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
        {trueLabel}
      </button>
      <button onClick={() => onChange(false)}
        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${!value ? 'bg-purple-500 text-white border-purple-500/40' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
        {falseLabel}
      </button>
    </div>
  </div>
);

export default function AddWarehousePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editWarehouse = location.state?.warehouse || null;

  const [form, setForm] = useState(editWarehouse ? {
    name:             editWarehouse.name             || '',
    code:             editWarehouse.code             || '',
    type:             editWarehouse.type             || '',
    address:          editWarehouse.address          || '',
    city:             editWarehouse.city             || '',
    state:            editWarehouse.state            || '',
    country:          editWarehouse.country          || '',
    zipCode:          editWarehouse.zipCode          || '',
    contactPerson:    editWarehouse.contactPerson    || '',
    phone:            editWarehouse.phone            || '',
    email:            editWarehouse.email            || '',
    capacity:         editWarehouse.capacity         ?? '',
    utilizedCapacity: editWarehouse.utilizedCapacity ?? '',
    active:           editWarehouse.active           ?? true,
    defaultWarehouse: editWarehouse.defaultWarehouse ?? false,
    latitude:         editWarehouse.latitude         ?? '',
    longitude:        editWarehouse.longitude        ?? '',
    workingHours:     editWarehouse.workingHours     || '',
    remarks:          editWarehouse.remarks          || '',
  } : emptyForm);

  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  // const handleSubmit = async () => {
  //   if (!form.name?.trim() && !form.code?.trim()) { showToast('Warehouse Name or Code is required', 'error'); return; }
  //   setSaving(true);
  //   const payload = {
  //     name:             form.name             || null,
  //     code:             form.code             || null,
  //     type:             form.type             || null,
  //     address:          form.address          || null,
  //     city:             form.city             || null,
  //     state:            form.state            || null,
  //     country:          form.country          || null,
  //     zipCode:          form.zipCode          || null,
  //     contactPerson:    form.contactPerson    || null,
  //     phone:            form.phone            || null,
  //     email:            form.email            || null,
  //     capacity:         form.capacity         ? Number(form.capacity)         : null,
  //     utilizedCapacity: form.utilizedCapacity ? Number(form.utilizedCapacity) : null,
  //     active:           form.active,
  //     defaultWarehouse: form.defaultWarehouse,
  //     latitude:         form.latitude         ? parseFloat(form.latitude)  : null,
  //     longitude:        form.longitude        ? parseFloat(form.longitude) : null,
  //     workingHours:     form.workingHours     || null,
  //     remarks:          form.remarks          || null,
  //   };
  //   try {
  //     const method = editWarehouse ? 'PUT' : 'POST';
  //     const url    = editWarehouse
  //       ? `/api/stock/warehouses/${editWarehouse.id}`
  //       : '/api/stock/warehouses';
  //     const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     if (!res.ok) throw new Error();
  //     const saved = await res.json();
  //     try {
  //       const raw  = localStorage.getItem('mveng_warehouselist');
  //       const list = raw ? JSON.parse(raw) : [];
  //       const updated = editWarehouse
  //         ? list.map(w => w.id === saved.id ? saved : w)
  //         : [...list, saved];
  //       localStorage.setItem('mveng_warehouselist', JSON.stringify(updated));
  //     } catch {}
  //     showToast(editWarehouse ? 'Warehouse updated!' : 'Warehouse saved!');
  //     setTimeout(() => navigate('/dashboard/stock/warehouse/warehouse-list'), 1200);
  //   } catch {
  //     try {
  //       const raw     = localStorage.getItem('mveng_warehouselist');
  //       const list    = raw ? JSON.parse(raw) : [];
  //       const newItem = { ...payload, id: editWarehouse?.id || Date.now() };
  //       const updated = editWarehouse
  //         ? list.map(w => w.id === newItem.id ? newItem : w)
  //         : [...list, newItem];
  //       localStorage.setItem('mveng_warehouselist', JSON.stringify(updated));
  //     } catch {}
  //     showToast(editWarehouse ? 'Warehouse updated (offline)!' : 'Warehouse saved (offline)!');
  //     setTimeout(() => navigate('/dashboard/stock/warehouse/warehouse-list'), 1200);
  //   } finally { setSaving(false); }
  // };

  const handleSubmit = async () => {
  if (!form.name?.trim() && !form.code?.trim()) {
    showToast("Warehouse Name or Code is required", "error");
    return;
  }

  setSaving(true);

  const payload = {
    name: form.name || null,
    code: form.code || null,
    type: form.type || null,
    address: form.address || null,
    city: form.city || null,
    state: form.state || null,
    country: form.country || null,
    zipCode: form.zipCode || null,
    contactPerson: form.contactPerson || null,
    phone: form.phone || null,
    email: form.email || null,
    capacity: form.capacity ? Number(form.capacity) : null,
    utilizedCapacity: form.utilizedCapacity
      ? Number(form.utilizedCapacity)
      : null,
    active: form.active,
    defaultWarehouse: form.defaultWarehouse,
    latitude: form.latitude ? parseFloat(form.latitude) : null,
    longitude: form.longitude ? parseFloat(form.longitude) : null,
    workingHours: form.workingHours || null,
    remarks: form.remarks || null,
  };

  try {
    let saved;

    if (editWarehouse?.id) {
      saved = await updateWarehouse(editWarehouse.id, payload);
    } else {
      saved = await createWarehouse(payload);
    }

    try {
      const raw = localStorage.getItem("mveng_warehouselist");
      const list = raw ? JSON.parse(raw) : [];

      const updated = editWarehouse
        ? list.map((w) => (w.id === saved.id ? saved : w))
        : [...list, saved];

      localStorage.setItem(
        "mveng_warehouselist",
        JSON.stringify(updated)
      );
    } catch (err) {
      console.error("Local storage update error:", err);
    }

    showToast(
      editWarehouse ? "Warehouse updated!" : "Warehouse saved!"
    );

    setTimeout(() => {
      navigate("/dashboard/stock/warehouse/warehouse-list");
    }, 1200);
  } catch (error) {
    console.error("Error saving warehouse:", error);

    if (error.response?.data?.message) {
      showToast(error.response.data.message, "error");
    } else {
      showToast("Failed to save warehouse", "error");
    }
  } finally {
    setSaving(false);
  }
};

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
        <button onClick={() => navigate('/dashboard/stock/warehouse/warehouse-list')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <Warehouse size={22} style={{ color: '#dc2626' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{editWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h2>
          <p className="text-sm text-gray-400">{editWarehouse ? 'Update warehouse details' : 'Register a new warehouse'}</p>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Warehouse Details" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Warehouse Name" placeholder="e.g. Main Storage" value={form.name} onChange={v => set('name', v)} icon={Building2} required />
          <InputField label="Warehouse Code" placeholder="e.g. WH-001" value={form.code} onChange={v => set('code', v)} icon={Hash} required />
          <SelectField label="Warehouse Type" value={form.type} onChange={v => set('type', v)} options={WAREHOUSE_TYPES} placeholder="Select type…" />
          <InputField label="Total Capacity" placeholder="e.g. 1000" value={form.capacity} onChange={v => set('capacity', v)} type="number" icon={Package} />
          <InputField label="Utilized Capacity" placeholder="e.g. 200" value={form.utilizedCapacity} onChange={v => set('utilizedCapacity', v)} type="number" icon={Package} />
          <InputField label="Working Hours" placeholder="e.g. 08:00 - 18:00" value={form.workingHours} onChange={v => set('workingHours', v)} icon={Clock} />
          <ToggleField label="Active" value={form.active} onChange={v => set('active', v)} trueLabel="Active" falseLabel="Inactive" />
          <ToggleField label="Default Warehouse" value={form.defaultWarehouse} onChange={v => set('defaultWarehouse', v)} trueLabel="Yes" falseLabel="No" />
        </div>
      </Section>

      {/* Address */}
      <Section title="Address" icon={MapPin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InputField label="Street Address" placeholder="Street, Building, Area" value={form.address} onChange={v => set('address', v)} icon={MapPin} />
          </div>
          <InputField label="City" placeholder="City" value={form.city} onChange={v => set('city', v)} icon={MapPin} />
          <InputField label="State" placeholder="State" value={form.state} onChange={v => set('state', v)} />
          <InputField label="Country" placeholder="Country" value={form.country} onChange={v => set('country', v)} icon={Globe} />
          <InputField label="Zip / PIN Code" placeholder="e.g. 600001" value={form.zipCode} onChange={v => set('zipCode', v)} />
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Info" icon={Mail}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Contact Person" placeholder="Name" value={form.contactPerson} onChange={v => set('contactPerson', v)} />
          <InputField label="Phone" placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={v => set('phone', v)} icon={Phone} type="tel" />
          <InputField label="Email" placeholder="email@example.com" value={form.email} onChange={v => set('email', v)} type="email" icon={Mail} />
        </div>
      </Section>

      {/* Geo Location */}
      <Section title="Geo Location" icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Latitude" placeholder="e.g. 13.0827" value={form.latitude} onChange={v => set('latitude', v)} type="number" />
          <InputField label="Longitude" placeholder="e.g. 80.2707" value={form.longitude} onChange={v => set('longitude', v)} type="number" />
        </div>
      </Section>

      {/* Remarks */}
      <Section title="Remarks" icon={FileText}>
        <div>
          <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Remarks / Notes</label>
          <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)}
            placeholder="Any additional notes about this warehouse…" rows={3}
            className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all resize-none" />
        </div>
      </Section>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <button onClick={() => navigate('/dashboard/stock/warehouse/warehouse-list')}
          className="flex-1 py-3 rounded-xl border border-white/10 text-purple-300 font-semibold hover:bg-white/10 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          <Save size={16} />
          {saving ? 'Saving…' : editWarehouse ? 'Update Warehouse' : 'Save Warehouse'}
        </button>
      </div>
    </div>
  );
}