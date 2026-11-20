
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Save, Trash2, Building2,
  AlertCircle, CheckCircle, Search, Hash, Package, Barcode,
} from 'lucide-react';

import {
  createLocation,
  getAllLocations,
  deactivateLocation,
} from "../../../services/stock/location.services";

import { getAllWarehouses } from "../../../services/stock/wareHouse.services";

// const LS_KEY = 'mveng_locations';

const LOCATION_TYPES = ['STORAGE', 'PICKING', 'RECEIVING'];

const emptyForm = {
  locationCode: '', aisle: '', rack: '', bin: '',
  type: '', maxCapacity: '', currentCapacity: '',
  active: true, blocked: false,
  barcode: '', warehouseId: '', remarks: '',
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

const ToggleField = ({ label, value, onChange, trueLabel = 'Yes', falseLabel = 'No' }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="flex gap-2">
      <button onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${value ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10'}`}>
        {trueLabel}
      </button>
      <button onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${!value ? 'bg-purple-500 text-white border-purple-500/40' : 'bg-[#140f2d]/80 text-gray-400 border-white/10'}`}>
        {falseLabel}
      </button>
    </div>
  </div>
);

export default function LocationMappingPage() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations]   = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [search, setSearch]         = useState('');
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [deleteId, setDeleteId]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [wRes, lRes] = await Promise.all([
  //         fetch('/api/stock/warehouses'),
  //         fetch('/api/stock/locations'),
  //       ]);
  //       if (wRes.ok) setWarehouses(await wRes.json());
  //       if (lRes.ok) setLocations(await lRes.json());
  //     } catch {
  //       try {
  //         const raw = localStorage.getItem('mveng_warehouselist');
  //         if (raw) setWarehouses(JSON.parse(raw));
  //       } catch {}
  //       try {
  //         const raw = localStorage.getItem(LS_KEY);
  //         if (raw) setLocations(JSON.parse(raw));
  //       } catch {}
  //     }
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [warehouseData, locationData] = await Promise.all([
        getAllWarehouses(),
        getAllLocations(),
      ]);

      setWarehouses(
        Array.isArray(warehouseData) ? warehouseData : []
      );

      setLocations(
        Array.isArray(locationData) ? locationData : []
      );
    } catch (error) {
      console.error("Error fetching data:", error);

      try {
        const rawWarehouses = localStorage.getItem(
          "mveng_warehouselist"
        );
        if (rawWarehouses) {
          setWarehouses(JSON.parse(rawWarehouses));
        }
      } catch (err) {
        console.error("Warehouse local storage error:", err);
      }

      try {
        const rawLocations = localStorage.getItem(LS_KEY);
        if (rawLocations) {
          setLocations(JSON.parse(rawLocations));
        }
      } catch (err) {
        console.error("Location local storage error:", err);
      }
    }
  };

  fetchData();
}, []);

  // const handleSave = async () => {
  //   if (!form.warehouseId || !form.locationCode) { showToast('Warehouse and Location Code are required.', 'error'); return; }
  //   setSaving(true);
  //   const payload = {
  //     locationCode:    form.locationCode || null,
  //     aisle:           form.aisle        || null,
  //     rack:            form.rack         || null,
  //     bin:             form.bin          || null,
  //     type:            form.type         || null,
  //     maxCapacity:     form.maxCapacity     ? Number(form.maxCapacity)     : null,
  //     currentCapacity: form.currentCapacity ? Number(form.currentCapacity) : null,
  //     active:          form.active,
  //     blocked:         form.blocked,
  //     barcode:         form.barcode  || null,
  //     remarks:         form.remarks  || null,
  //     warehouse:       { id: Number(form.warehouseId) },
  //   };
  //   try {
  //     const res = await fetch('/api/stock/locations', {
  //       method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  //     });
  //     if (res.ok) {
  //       const saved = await res.json();
  //       setLocations(prev => [...prev, saved]);
  //       showToast('Location saved!');
  //     } else { throw new Error(); }
  //   } catch {
  //     const newLoc = { ...payload, id: Date.now(), warehouse: warehouses.find(w => w.id == form.warehouseId) };
  //     const updated = [...locations, newLoc];
  //     setLocations(updated);
  //     try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
  //     showToast('Location saved.');
  //   } finally {
  //     setForm(emptyForm);
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
  if (!form.warehouseId || !form.locationCode) {
    showToast(
      "Warehouse and Location Code are required.",
      "error"
    );
    return;
  }

  setSaving(true);

  const payload = {
    locationCode: form.locationCode || null,
    aisle: form.aisle || null,
    rack: form.rack || null,
    bin: form.bin || null,
    type: form.type || null,
    maxCapacity: form.maxCapacity
      ? Number(form.maxCapacity)
      : null,
    currentCapacity: form.currentCapacity
      ? Number(form.currentCapacity)
      : null,
    active: form.active,
    blocked: form.blocked,
    barcode: form.barcode || null,
    remarks: form.remarks || null,
    warehouse: {
      id: Number(form.warehouseId),
    },
  };

  try {
    const saved = await createLocation(payload);

    setLocations((prev) => [...prev, saved]);

    showToast("Location saved!");
  } catch (error) {
    console.error("Error saving location:", error);

    if (error.response?.data?.message) {
      showToast(error.response.data.message, "error");
    } else {
      showToast("Failed to save location.", "error");
    }
  } finally {
    setForm(emptyForm);
    setSaving(false);
  }
};

  // const handleDelete = async (id) => {
  //   try {
  //     const res = await fetch(`/api/stock/locations/${id}`, { method: 'DELETE' });
  //     if (res.ok) { setLocations(prev => prev.filter(l => l.id !== id)); showToast('Location deleted.'); }
  //     else throw new Error();
  //   } catch {
  //     const updated = locations.filter(l => l.id !== id);
  //     setLocations(updated);
  //     try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch {}
  //     showToast('Location deleted.');
  //   }
  //   setDeleteId(null);
  // };

  const handleDelete = async (id) => {
  try {
    await deactivateLocation(id);

    setLocations((prev) => prev.filter((l) => l.id !== id));

    showToast("Location deleted.");
  } catch (error) {
    console.error("Error deleting location:", error);
    showToast("Failed to delete location.", "error");
  }

  setDeleteId(null);
};

  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    return !q || l.locationCode?.toLowerCase().includes(q) || l.aisle?.toLowerCase().includes(q) || l.rack?.toLowerCase().includes(q);
  });

  const sel = "w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none";

  return (
    <div className="space-y-5 w-full">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/stock/warehouse')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <MapPin size={22} style={{ color: '#dc2626' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Location Mapping</h2>
          <p className="text-sm text-gray-400">Map locations to warehouses</p>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-white/5 flex items-center gap-2">
          <MapPin size={14} style={{ color: '#dc2626' }} />
          <p className="text-xs font-bold text-[#dc2626] uppercase tracking-widest">Add New Location</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Location Code" placeholder="e.g. A1-R2-B3" value={form.locationCode} onChange={v => set('locationCode', v)} icon={Hash} required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Warehouse <span className="text-red-400">*</span></label>
              <select value={form.warehouseId} onChange={e => set('warehouseId', e.target.value)} className={sel}>
                <option value="">-- Select Warehouse --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name || w.warehouseName} ({w.code || w.warehouseCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Physical Coordinates */}
          <div>
            <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-3">Physical Coordinates (Aisle / Rack / Bin)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Aisle" placeholder="e.g. A" value={form.aisle} onChange={v => set('aisle', v)} />
              <InputField label="Rack" placeholder="e.g. R2" value={form.rack} onChange={v => set('rack', v)} />
              <InputField label="Bin" placeholder="e.g. B3" value={form.bin} onChange={v => set('bin', v)} />
            </div>
          </div>

          {/* Type & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Location Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={sel}>
                <option value="">Select type…</option>
                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <InputField label="Max Capacity" placeholder="e.g. 100" value={form.maxCapacity} onChange={v => set('maxCapacity', v)} type="number" icon={Package} />
            <InputField label="Current Capacity" placeholder="e.g. 40" value={form.currentCapacity} onChange={v => set('currentCapacity', v)} type="number" icon={Package} />
          </div>

          {/* Barcode & Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Barcode" placeholder="Scan or enter barcode" value={form.barcode} onChange={v => set('barcode', v)} />
            <ToggleField label="Active" value={form.active} onChange={v => set('active', v)} trueLabel="Active" falseLabel="Inactive" />
            <ToggleField label="Blocked" value={form.blocked} onChange={v => set('blocked', v)} trueLabel="Blocked" falseLabel="Available" />
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Remarks</label>
            <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)}
              placeholder="Optional notes about this location…" rows={2}
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all resize-none" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <Save size={16} />{saving ? 'Saving…' : 'Save Location'}
          </button>
        </div>
      </div>

      {/* Location List */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-bold text-white">Mapped Locations ({filtered.length})</p>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-8 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 focus:outline-none w-48 focus:ring-2 focus:ring-[#dc2626]/20" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin size={28} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{search ? 'No results found' : 'No locations mapped yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #fff1f1, #fff8f8)' }}>
                  {['Code', 'Aisle', 'Rack', 'Bin', 'Type', 'Warehouse', 'Max Cap', 'Cur Cap', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(240,247,255,0.15)]">
                {filtered.map(loc => (
                  <tr key={loc.id} className="hover:bg-[rgba(255,248,248,0.12)] transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-white text-xs">{loc.locationCode}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{loc.aisle || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{loc.rack || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{loc.bin || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{loc.type || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{loc.warehouse?.name || loc.warehouse?.warehouseName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{loc.maxCapacity ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{loc.currentCapacity ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${loc.active !== false ? 'bg-green-100 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                          {loc.active !== false ? 'Active' : 'Inactive'}
                        </span>
                        {loc.blocked && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-400">Blocked</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(loc.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-100 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-center font-bold text-white text-lg mb-1">Remove Location?</h3>
            <p className="text-center text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}