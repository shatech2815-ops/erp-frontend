import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Ruler, Trash2, Save, X,
  Edit2, Search, RefreshCw, ArrowRightLeft,
  Package, Calculator, CheckCircle, AlertCircle,
} from 'lucide-react';

import {
  createUOM,
  getAllUOMs,
  updateUOM,
  deleteUOM,
} from "../../../services/stock/settings/uomManagement.services";
const UOM_TYPES = ['COUNT', 'WEIGHT', 'VOLUME', 'LENGTH', 'AREA'];
// const LS_KEY = 'mveng_uoms';

const emptyForm = {
  name: '', symbol: '', type: 'COUNT',
  baseUnit: true,
  // dimension fields (used instead of a plain conversionFactor for AREA/VOLUME/LENGTH)
  conversionFactor: '',   // used for COUNT & WEIGHT
  dimLength: '',          // used for LENGTH, AREA, VOLUME
  dimBreadth: '',         // used for AREA, VOLUME
  dimHeight: '',          // used for VOLUME
  baseUomId: '',
};

/* ─── helpers ─── */
const fmt = (n) => {
  if (n == null || n === '') return '—';
  const num = parseFloat(n);
  return isNaN(num) ? '—' : (Number.isInteger(num) ? num.toLocaleString('en-IN') : parseFloat(num.toFixed(4)).toLocaleString('en-IN'));
};

/** Given the form state, compute the final conversionFactor to store */
const computeFactor = (form) => {
  const t = form.type;
  if (t === 'COUNT' || t === 'WEIGHT') {
    const v = parseFloat(form.conversionFactor);
    return isNaN(v) || v <= 0 ? null : v;
  }
  if (t === 'LENGTH') {
    const l = parseFloat(form.dimLength);
    return isNaN(l) || l <= 0 ? null : l;
  }
  if (t === 'AREA') {
    const l = parseFloat(form.dimLength), b = parseFloat(form.dimBreadth);
    return (isNaN(l) || l <= 0 || isNaN(b) || b <= 0) ? null : l * b;
  }
  if (t === 'VOLUME') {
    const l = parseFloat(form.dimLength), b = parseFloat(form.dimBreadth), h = parseFloat(form.dimHeight);
    return (isNaN(l) || l <= 0 || isNaN(b) || b <= 0 || isNaN(h) || h <= 0) ? null : l * b * h;
  }
  return null;
};

/** Check if conversion fields are fully filled */
const conversionComplete = (form) => computeFactor(form) !== null;

/* ─── Toast ─── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border
      ${isErr ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
      {isErr ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {toast.msg}
    </div>
  );
};

/* ─── Input ─── */
const InputField = ({ label, placeholder, value, onChange, type = 'text', required, hint, unit }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300
          focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all
          ${unit ? 'pr-14' : ''}`}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 bg-[rgba(240,247,255,0.12)] px-2 py-0.5 rounded-lg">
          {unit}
        </span>
      )}
    </div>
    {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

const sel = "w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all appearance-none";

/* ════════════════════════════════════════════════════════ */
export default function UOMManagementPage() {
  const navigate = useNavigate();
  const [uoms, setUoms]         = useState([]);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [calcDerivedId, setCalcDerivedId] = useState('');
  const [calcQty, setCalcQty]             = useState('');
  const [calcResult, setCalcResult]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const loadUOMs = () => {
  //   try { setUoms(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
  //   catch { setUoms([]); }
  // };
  // const persistUOMs = (list) => { localStorage.setItem(LS_KEY, JSON.stringify(list)); setUoms(list); };

  const loadUOMs = async () => {
  try {
    const data = await getAllUOMs();

    const uomList = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
      ? data.data
      : [];

    setUoms(uomList);
  } catch (error) {
    console.error("Error loading UOMs:", error);
    showToast("Failed to load UOMs", "error");
  }
};

  useEffect(() => { loadUOMs(); }, []);

  const baseUoms        = uoms.filter(u => u.baseUnit === true);
  const derivedUoms     = uoms.filter(u => u.baseUnit === false);
  const selectedBaseUom = baseUoms.find(u => String(u.id) === String(form.baseUomId));
  const factor          = computeFactor(form);

  /* ── Auto-calculate ── */
  useEffect(() => {
    if (!calcDerivedId || !calcQty) { setCalcResult(null); return; }
    const uom = uoms.find(u => String(u.id) === String(calcDerivedId));
    if (!uom || uom.baseUnit || !uom.conversionFactor) { setCalcResult(null); return; }
    const qty = parseFloat(calcQty);
    if (isNaN(qty) || qty <= 0) { setCalcResult(null); return; }
    setCalcResult({ inputQty: qty, inputUnit: uom, outputQty: qty * uom.conversionFactor, outputUnit: uom.baseUom, factor: uom.conversionFactor });
  }, [calcDerivedId, calcQty, uoms]);

  /* ── Save ── */
  // const handleSave = () => {
  //   if (!form.name.trim() || !form.symbol.trim()) { showToast('Name and Symbol are required.', 'error'); return; }
  //   if (!form.baseUnit && !form.baseUomId) { showToast('Select a base UOM.', 'error'); return; }
  //   if (!form.baseUnit && !conversionComplete(form)) { showToast('Please fill all dimension/conversion fields.', 'error'); return; }
  //   setSaving(true);

  //   const baseUomObj = !form.baseUnit && form.baseUomId
  //     ? baseUoms.find(u => String(u.id) === String(form.baseUomId)) || null : null;

  //   const cf = computeFactor(form);

  //   const entry = {
  //     id:               editId ?? Date.now(),
  //     name:             form.name.trim(),
  //     symbol:           form.symbol.trim(),
  //     type:             form.type,
  //     baseUnit:         form.baseUnit,
  //     conversionFactor: cf,
  //     // store dimension breakdown for display purposes
  //     dimLength:        form.dimLength  || null,
  //     dimBreadth:       form.dimBreadth || null,
  //     dimHeight:        form.dimHeight  || null,
  //     baseUom:          baseUomObj ? { id: baseUomObj.id, name: baseUomObj.name, symbol: baseUomObj.symbol } : null,
  //   };

  //   persistUOMs(editId ? uoms.map(u => u.id === editId ? entry : u) : [...uoms, entry]);
  //   showToast(editId ? 'UOM updated!' : 'UOM created!');
  //   setForm(emptyForm); setEditId(null); setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.name.trim() || !form.symbol.trim()) {
    showToast("Name and Symbol are required.", "error");
    return;
  }

  if (!form.baseUnit && !form.baseUomId) {
    showToast("Select a base UOM.", "error");
    return;
  }

  if (!form.baseUnit && !conversionComplete(form)) {
    showToast("Please fill all dimension/conversion fields.", "error");
    return;
  }

  setSaving(true);

  try {
    const cf = computeFactor(form);

    const payload = {
      name: form.name.trim(),
      symbol: form.symbol.trim(),
      type: form.type,
      baseUnit: form.baseUnit,
      conversionFactor: cf,
      dimLength: form.dimLength || null,
      dimBreadth: form.dimBreadth || null,
      dimHeight: form.dimHeight || null,
      baseUom: !form.baseUnit && form.baseUomId
        ? { id: Number(form.baseUomId) }
        : null,
    };

    if (editId) {
      await updateUOM(editId, payload);
      showToast("UOM updated successfully!");
    } else {
      await createUOM(payload);
      showToast("UOM created successfully!");
    }

    setForm(emptyForm);
    setEditId(null);
    await loadUOMs();
  } catch (error) {
    console.error("Error saving UOM:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Failed to save UOM";

    showToast(errorMessage, "error");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (u) => {
    setForm({
      name:             u.name             || '',
      symbol:           u.symbol           || '',
      type:             u.type             || 'COUNT',
      baseUnit:         u.baseUnit         ?? true,
      conversionFactor: (u.type === 'COUNT' || u.type === 'WEIGHT') ? (u.conversionFactor ?? '') : '',
      dimLength:        u.dimLength  || '',
      dimBreadth:       u.dimBreadth || '',
      dimHeight:        u.dimHeight  || '',
      // baseUomId:        u.baseUom?.id ?? '',
      baseUomId: u.baseUom?.id ? String(u.baseUom.id) : '',
    });
    setEditId(u.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = (id) => {
  //   persistUOMs(uoms.filter(u => u.id !== id));
  //   showToast('UOM deleted.'); setDeleteId(null);
  // };

  const handleDelete = async (id) => {
  try {
    await deleteUOM(id);
    showToast("UOM deleted successfully!");
    setDeleteId(null);
    await loadUOMs();
  } catch (error) {
    console.error("Error deleting UOM:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      "Failed to delete UOM";

    showToast(errorMessage, "error");
  }
};

  const filtered = uoms.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.symbol?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Conversion fields UI based on type ── */
  const renderConversionFields = () => {
    const t = form.type;
    const derivedLabel = form.name || 'derived unit';

    if (t === 'COUNT' || t === 'WEIGHT') {
      return (
        <InputField
          label={`1 ${derivedLabel} contains how many ${t === 'WEIGHT' ? 'base weight units' : 'base units'}?`}
          placeholder="e.g. 10"
          value={form.conversionFactor}
          onChange={v => set('conversionFactor', v)}
          type="number"
          hint={`Enter the number of base units per 1 ${derivedLabel}.`}
          required
        />
      );
    }

    if (t === 'LENGTH') {
      return (
        <InputField
          label={`Length of 1 ${derivedLabel}`}
          placeholder="e.g. 10"
          value={form.dimLength}
          onChange={v => set('dimLength', v)}
          type="number"
          hint="e.g. 1 Roll = 10 metres → enter 10"
          unit="units"
          required
        />
      );
    }

    if (t === 'AREA') {
      return (
        <div className="space-y-3">
          <p className="text-xs text-purple-300">
            Enter the <strong>length</strong> and <strong>breadth</strong> of 1 {derivedLabel}.
            The area (L × B) will be the conversion factor stored.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Length" placeholder="e.g. 10"
              value={form.dimLength} onChange={v => set('dimLength', v)}
              type="number" unit="units" required
            />
            <InputField
              label="Breadth" placeholder="e.g. 5"
              value={form.dimBreadth} onChange={v => set('dimBreadth', v)}
              type="number" unit="units" required
            />
          </div>
          {form.dimLength && form.dimBreadth && (
            <div className="text-xs bg-blue-500/10 border border-blue-100 rounded-xl px-4 py-2 text-blue-400 font-semibold">
              Area = {form.dimLength} × {form.dimBreadth} = <strong>{parseFloat(form.dimLength) * parseFloat(form.dimBreadth) || '?'} sq. units</strong>
            </div>
          )}
        </div>
      );
    }

    if (t === 'VOLUME') {
      return (
        <div className="space-y-3">
          <p className="text-xs text-purple-300">
            Enter the <strong>length</strong>, <strong>breadth</strong> and <strong>height</strong> of 1 {derivedLabel}.
            The volume (L × B × H) will be the conversion factor stored.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <InputField
              label="Length" placeholder="e.g. 10"
              value={form.dimLength} onChange={v => set('dimLength', v)}
              type="number" unit="units" required
            />
            <InputField
              label="Breadth" placeholder="e.g. 5"
              value={form.dimBreadth} onChange={v => set('dimBreadth', v)}
              type="number" unit="units" required
            />
            <InputField
              label="Height" placeholder="e.g. 4"
              value={form.dimHeight} onChange={v => set('dimHeight', v)}
              type="number" unit="units" required
            />
          </div>
          {form.dimLength && form.dimBreadth && form.dimHeight && (
            <div className="text-xs bg-blue-500/10 border border-blue-100 rounded-xl px-4 py-2 text-blue-400 font-semibold">
              Volume = {form.dimLength} × {form.dimBreadth} × {form.dimHeight} = <strong>
                {parseFloat(form.dimLength) * parseFloat(form.dimBreadth) * parseFloat(form.dimHeight) || '?'} cu. units
              </strong>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  /* ── Conversion preview row ── */
  const renderPreview = () => {
    if (!factor || !selectedBaseUom) return null;
    const nameOk = form.name.trim() && form.symbol.trim();
    if (!nameOk) {
      return (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-400">
          <AlertCircle size={14} className="flex-shrink-0" />
          Fill in <strong className="mx-1">UOM Name</strong> and <strong className="mx-1">Symbol</strong> above to confirm the conversion rule.
        </div>
      );
    }
    const t = form.type;
    let formula = '';
    if (t === 'AREA')   formula = ` (${form.dimLength} × ${form.dimBreadth})`;
    if (t === 'VOLUME') formula = ` (${form.dimLength} × ${form.dimBreadth} × ${form.dimHeight})`;

    return (
      <div className="flex items-center gap-3 bg-[#140f2d]/80 border border-white/10 rounded-xl px-5 py-3 flex-wrap">
        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
        <span className="text-sm font-bold text-white">
          1 {form.name} ({form.symbol})
        </span>
        <span className="text-gray-400">=</span>
        <span className="text-sm font-bold text-[#dc2626]">
          {factor}{formula} {selectedBaseUom.name} ({selectedBaseUom.symbol})
        </span>
        <span className="ml-auto text-xs text-gray-400">Conversion rule confirmed ✓</span>
      </div>
    );
  };

  /* ── Type info card ── */
  const typeInfoCard = () => {
    const t = form.type;
    if (form.baseUnit) {
      return (
        <div className="rounded-xl p-3 border bg-emerald-500/10 border-emerald-100 text-emerald-400 text-xs">
          <p className="font-bold mb-1">📦 Base Unit Examples:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Piece (pcs)</li><li>Kilogram (kg)</li><li>Metre (m)</li><li>Litre (ltr)</li>
          </ul>
        </div>
      );
    }
    const cards = {
      COUNT:  { bg: 'bg-amber-500/10 border-amber-100 text-amber-400',   title: '📦 COUNT Derived Examples:', items: ['Box = 10 Pieces', 'Carton = 24 Pieces', 'Dozen = 12 Pieces'] },
      WEIGHT: { bg: 'bg-orange-50 border-orange-100 text-orange-700', title: '⚖️ WEIGHT Derived Examples:', items: ['Ton = 1000 kg', 'Quintal = 100 kg'] },
      LENGTH: { bg: 'bg-purple-500/10 border-purple-100 text-purple-400', title: '📏 LENGTH Derived Examples:', items: ['Roll = 10 metres', 'Coil = 50 metres'] },
      AREA:   { bg: 'bg-sky-50 border-sky-100 text-sky-700',          title: '⬜ AREA Derived Examples:', items: ['Sheet (2m × 1m) = 2 sq.m', 'Panel (3m × 2m) = 6 sq.m'] },
      VOLUME: { bg: 'bg-teal-50 border-teal-100 text-teal-700',       title: '📦 VOLUME Derived Examples:', items: ['Crate (2×2×2) = 8 cu.m', 'Barrel (1×1×1.5) = 1.5 cu.m'] },
    };
    const c = cards[t] || cards.COUNT;
    return (
      <div className={`rounded-xl p-3 border text-xs ${c.bg}`}>
        <p className="font-bold mb-1">{c.title}</p>
        <ul className="space-y-0.5 list-disc list-inside">{c.items.map(i => <li key={i}>{i}</li>)}</ul>
      </div>
    );
  };

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div className="space-y-5 w-full">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/stock/settings')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <Ruler size={22} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">UOM Management</h2>
          <p className="text-sm text-gray-400">Define units and calculate stock quantities</p>
        </div>
        <button onClick={loadUOMs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(255,255,255,0.10)]">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── STEP 1 ── */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler size={14} style={{ color: '#dc2626' }} />
            <p className="text-xs font-bold text-[#dc2626] uppercase tracking-widest">
              {editId ? 'Edit UOM' : 'Step 1 — Add New UOM'}
            </p>
          </div>
          {editId && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }}
              className="w-7 h-7 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:bg-white/10">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Row 1: Name / Symbol / Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="UOM Name" placeholder="e.g. Box, Kilogram, Roll"
              value={form.name} onChange={v => set('name', v)} required
              hint='Full name, e.g. "Box"'
            />
            <InputField
              label="Symbol (short code)" placeholder="e.g. bx, kg, roll"
              value={form.symbol} onChange={v => set('symbol', v)} required
              hint='Short code, e.g. "bx" for Box'
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.type}
                onChange={e => {
                  // reset dimension fields when type changes
                  setForm(p => ({ ...p, type: e.target.value, conversionFactor: '', dimLength: '', dimBreadth: '', dimHeight: '' }));
                }}
                className={sel}>
                {UOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <p className="text-xs text-gray-400">
                {form.type === 'COUNT'  && 'Countable items (boxes, pieces, dozens)'}
                {form.type === 'WEIGHT' && 'Weight-based units (kg, ton, quintal)'}
                {form.type === 'LENGTH' && 'Linear/length-based units (metres, rolls)'}
                {form.type === 'AREA'   && 'Area-based units (sq. metres, sheets)'}
                {form.type === 'VOLUME' && 'Volume-based units (litres, cubic metres, crates)'}
              </p>
            </div>
          </div>

          {/* Row 2: Unit type toggle + example card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Unit Type</label>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => { set('baseUnit', true); setForm(p => ({ ...p, baseUnit: true, conversionFactor: '', dimLength: '', dimBreadth: '', dimHeight: '', baseUomId: '' })); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors
                    ${form.baseUnit ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Base Unit
                </button>
                <button type="button"
                  onClick={() => set('baseUnit', false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors
                    ${!form.baseUnit ? 'bg-[#dc2626] text-white border-[#dc2626]' : 'bg-[#140f2d]/80 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                  Derived Unit
                </button>
              </div>
              <p className="text-xs text-gray-400">
                {form.baseUnit
                  ? 'Base unit is the smallest measurable unit (e.g. Piece, kg, metre).'
                  : 'Derived unit is made up of multiple base units.'}
              </p>
            </div>
            {typeInfoCard()}
          </div>

          {/* Row 3: Conversion rule (only for derived) */}
          {!form.baseUnit && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">
                {form.type === 'AREA'   && '⬜ Area Dimensions — How big is 1 ' + (form.name || 'derived unit') + '?'}
                {form.type === 'VOLUME' && '📦 Volume Dimensions — How big is 1 ' + (form.name || 'derived unit') + '?'}
                {form.type === 'LENGTH' && '📏 Length — How long is 1 ' + (form.name || 'derived unit') + '?'}
                {(form.type === 'COUNT' || form.type === 'WEIGHT') && 'Conversion Rule — How many base units make 1 ' + (form.name || 'derived unit') + '?'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dynamic dimension inputs */}
                <div>{renderConversionFields()}</div>

                {/* Base UOM selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                    Of which Base UOM? <span className="text-red-400">*</span>
                  </label>
                  <select value={form.baseUomId} onChange={e => set('baseUomId', e.target.value)} className={sel}>
                    <option value="">-- Select Base UOM --</option>
                    {baseUoms.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
                  </select>
                  {baseUoms.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">⚠ No base UOMs yet. First save a base unit (e.g. Piece).</p>
                  )}
                </div>
              </div>

              {/* Preview */}
              {renderPreview()}
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <Save size={16} />{saving ? 'Saving…' : editId ? 'Update UOM' : 'Save UOM'}
          </button>
        </div>
      </div>

      {/* ── STEP 2: Calculator ── */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,246,255,0.12)] to-white/5 flex items-center gap-2">
          <Calculator size={14} style={{ color: '#2563eb' }} />
          <p className="text-xs font-bold text-[#2563eb] uppercase tracking-widest">
            Step 2 — Stock Quantity Calculator
          </p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-purple-300">
            Select a derived unit, enter your stock quantity, and instantly see the equivalent in base units.
            <span className="font-semibold text-white"> Example: 100 Boxes × 10 = 1,000 Pieces</span>
          </p>

          {derivedUoms.length === 0 ? (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-400">
              <Package size={16} />
              No derived UOMs defined yet. Add a derived unit above to use the calculator.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Select Derived Unit</label>
                  <select value={calcDerivedId}
                    onChange={e => { setCalcDerivedId(e.target.value); setCalcQty(''); setCalcResult(null); }}
                    className={sel}>
                    <option value="">-- Select Unit --</option>
                    {derivedUoms.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol}) — factor: {u.conversionFactor} {u.baseUom?.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                    Stock Quantity{calcDerivedId ? ` (in ${uoms.find(u => String(u.id) === String(calcDerivedId))?.symbol || 'units'})` : ''}
                  </label>
                  <input type="number" min="0"
                    placeholder="e.g. 100"
                    value={calcQty}
                    onChange={e => setCalcQty(e.target.value)}
                    disabled={!calcDerivedId}
                    className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300
                      focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all
                      disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                {calcDerivedId && (() => {
                  const u = uoms.find(x => String(x.id) === String(calcDerivedId));
                  return u ? (
                    <div className="flex flex-col justify-end gap-1">
                      <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Formula</label>
                      <div className="rounded-xl border border-blue-100 bg-blue-500/10 px-4 py-2.5 text-xs text-blue-400 font-semibold">
                        Qty × {u.conversionFactor} = total {u.baseUom?.name || 'base units'}
                        {(u.type === 'AREA')   && <span className="block text-blue-400 mt-0.5">Area: {u.dimLength} × {u.dimBreadth}</span>}
                        {(u.type === 'VOLUME') && <span className="block text-blue-400 mt-0.5">Vol: {u.dimLength} × {u.dimBreadth} × {u.dimHeight}</span>}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {calcResult ? (
                <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 p-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[120px] bg-[#140f2d]/80 rounded-xl border border-blue-100 px-5 py-4 text-center shadow-sm">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">You have</p>
                      <p className="text-3xl font-black text-white">{fmt(calcResult.inputQty)}</p>
                      <p className="text-sm font-bold text-blue-400 mt-0.5">{calcResult.inputUnit.name} ({calcResult.inputUnit.symbol})</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center shadow">
                        <ArrowRightLeft size={16} className="text-white" />
                      </div>
                      <p className="text-xs text-gray-400 font-semibold whitespace-nowrap">× {calcResult.factor}</p>
                    </div>
                    <div className="flex-1 min-w-[120px] bg-[#140f2d]/80 rounded-xl border border-emerald-500/30 px-5 py-4 text-center shadow-sm">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Equals</p>
                      <p className="text-3xl font-black text-emerald-600">{fmt(calcResult.outputQty)}</p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">{calcResult.outputUnit?.name} ({calcResult.outputUnit?.symbol})</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-[#140f2d]/80 rounded-xl border border-blue-100 px-4 py-3 text-sm text-white text-center">
                    <span className="font-bold text-blue-400">{fmt(calcResult.inputQty)} {calcResult.inputUnit.name}(s)</span>
                    {' '}contains a total of{' '}
                    <span className="font-bold text-emerald-600">{fmt(calcResult.outputQty)} {calcResult.outputUnit?.name}(s)</span>
                    {' '}<span className="text-gray-400 text-xs">(since 1 {calcResult.inputUnit.symbol} = {calcResult.factor} {calcResult.outputUnit?.symbol})</span>
                  </div>
                </div>
              ) : calcDerivedId && calcQty ? (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-100 rounded-xl px-4 py-3">
                  Please enter a valid quantity greater than 0.
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs text-gray-400">
                  <Calculator size={16} />
                  Select a derived unit and enter a quantity to see the conversion result here.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── UOM List ── */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-bold text-white">UOM List ({filtered.length})</p>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search UOMs…"
              className="pl-8 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 focus:outline-none w-48" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ruler size={28} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">{search ? 'No UOMs match your search' : 'No UOMs created yet. Add one above!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #fff1f1, #fff8f8)' }}>
                  {['#', 'Name', 'Symbol', 'Type', 'Unit Type', 'Conversion Rule', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(240,247,255,0.15)]">
                {filtered.map((u, i) => (
                  <tr key={u.id} className="hover:bg-[rgba(255,248,248,0.12)] transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-white">{u.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-purple-300">{u.symbol}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 font-semibold">{u.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${u.baseUnit ? 'bg-emerald-100 text-emerald-400' : 'bg-amber-100 text-amber-400'}`}>
                        {u.baseUnit ? '✓ Base' : '⇄ Derived'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {!u.baseUnit && u.conversionFactor && u.baseUom ? (
                        <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-100 px-3 py-1 rounded-lg text-blue-400 font-semibold whitespace-nowrap">
                          1 {u.name} ({u.symbol}) = {u.conversionFactor} {u.baseUom.name} ({u.baseUom.symbol})
                          {u.type === 'AREA'   && <span className="text-blue-400 ml-1">[ {u.dimLength}×{u.dimBreadth} ]</span>}
                          {u.type === 'VOLUME' && <span className="text-blue-400 ml-1">[ {u.dimLength}×{u.dimBreadth}×{u.dimHeight} ]</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Base unit — no conversion needed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg text-purple-300 hover:bg-white/10"><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 size={13} /></button>
                      </div>
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
            <h3 className="text-center font-bold text-white text-lg mb-1">Delete UOM?</h3>
            <p className="text-center text-sm text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}