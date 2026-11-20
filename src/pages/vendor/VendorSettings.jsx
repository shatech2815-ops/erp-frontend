// ─────────────────────────────────────────────────────────────────────────────
// VendorSettings.jsx
// Backend endpoints:
//   VendorType    : GET /api/vendor-types/get-all-vendor-types
//                   POST /api/vendor-types/create-vendor-type
//                   DELETE /api/vendor-types/delete-vendor-type/{id}
//   ContractTerm  : GET /api/contract-terms/get-all-contract-terms
//                   POST /api/contract-terms/create-contract-term
//                   DELETE /api/contract-terms/delete-contract-term/{id}
//   PaymentTerm   : GET /api/payment-terms/get-all-payment-terms
//                   POST /api/payment-terms/create-payment-term
//                   DELETE /api/payment-terms/delete-payment-term/{id}
//
// VendorTypeRequestDto   : { name, description, active }
// ContractTermRequestDto : { name, description, durationInDays (Integer), penaltyPercentage (Double), active }
// PaymentTermRequestDto  : { name, days (Integer), description, active }
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Plus, Trash2, Save, X,
  Tag, FileText, CreditCard, CheckCircle, AlertCircle,
} from 'lucide-react';

// const BASE_URL = '/api';
import {
  createVendorType,
  getAllVendorTypes,
  deleteVendorType,
} from "../../services/vendor/settings/vendorType.services";

import {
  createContractTerm,
  getAllContractTerms,
  deleteContractTerm,
} from "../../services/vendor/settings/contractTerm.services";

import {
  createPaymentTerm,
  getAllPaymentTerms,
  deletePaymentTerm,
} from "../../services/vendor/settings/paymentTerm.services";
// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border
      ${isErr ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}
    >
      <span className={`w-2 h-2 rounded-full ${isErr ? 'bg-red-400' : 'bg-emerald-400'}`} />
      {toast.msg}
    </div>
  );
};

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl w-full max-w-sm p-7">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-400" />
      </div>
      <p className="text-center text-white font-semibold mb-1">Confirm Delete</p>
      <p className="text-center text-xs text-gray-400 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

// ─── Field helpers ────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">{children}</label>
);

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
  />
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
        <Icon size={16} className="text-purple-300" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Tab button ───────────────────────────────────────────────────────────────
const TabBtn = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
      active
        ? 'border-purple-500/40 text-purple-300 bg-purple-500/10'
        : 'border-transparent text-purple-300 hover:text-purple-300 hover:bg-white/10'
    }`}
  >
    <Icon size={15} />
    {label}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VENDOR TYPES TAB
// ═══════════════════════════════════════════════════════════════════════════════
const VendorTypesTab = ({ showToast }) => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // VendorTypeRequestDto fields: name, description, active
  const [form, setForm] = useState({ name: '', description: '', active: true });
  const [error, setError] = useState('');

  // const load = () => {
  //   setLoading(true);
  //   fetch(`${BASE_URL}/vendor-types/get-all-vendor-types`)
  //     .then((r) => r.json())
  //     .then((d) => setItems(Array.isArray(d) ? d : []))
  //     .catch(() => setItems([]))
  //     .finally(() => setLoading(false));
  // };

  const load = async () => {
  setLoading(true);
  try {
    const data = await getAllVendorTypes();
    setItems(Array.isArray(data) ? data : []);
  } catch (error) {
    setItems([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, []);

  // const handleAdd = async () => {
  //   if (!form.name.trim()) { setError('Name is required.'); return; }
  //   setError(''); setSaving(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/vendor-types/create-vendor-type`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ name: form.name.trim(), description: form.description.trim(), active: true }),
  //     });
  //     if (!res.ok) throw new Error(await res.text());
  //     setForm({ name: '', description: '', active: true });
  //     load();
  //     showToast('Vendor type created.');
  //   } catch (err) {
  //     setError(err.message || 'Failed to create.');
  //   } finally { setSaving(false); }
  // };

  const handleAdd = async () => {
  if (!form.name.trim()) {
    setError("Name is required.");
    return;
  }

  setError("");
  setSaving(true);

  try {
    await createVendorType({
      name: form.name.trim(),
      description: form.description.trim(),
      active: true,
    });

    setForm({ name: "", description: "", active: true });
    load();
    showToast("Vendor type created.");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create.");
  } finally {
    setSaving(false);
  }
};

  // const handleDelete = async (id) => {
  //   try {
  //     const res = await fetch(`${BASE_URL}/vendor-types/delete-vendor-type/${id}`, { method: 'DELETE' });
  //     if (!res.ok) throw new Error('Delete failed');
  //     setItems((p) => p.filter((i) => i.id !== id));
  //     showToast('Vendor type deleted.');
  //   } catch { showToast('Failed to delete.', 'error'); }
  //   finally { setDeleteTarget(null); }
  // };

  const handleDelete = async (id) => {
  try {
    await deleteVendorType(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Vendor type deleted.");
  } catch (error) {
    showToast("Failed to delete.", "error");
  } finally {
    setDeleteTarget(null);
  }
};

  return (
    <div className="flex flex-col gap-5">
      {/* Add form */}
      <SectionCard title="Add Vendor Type" icon={Tag}>
        {error && <div className="mb-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Manufacturer" />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description" />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
            Add Type
          </button>
        </div>
      </SectionCard>

      {/* List */}
      <SectionCard title="Vendor Types" icon={Tag}>
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No vendor types yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-white/10">
                  <th className="pb-3 text-left">Code</th>
                  <th className="pb-3 text-left">Name</th>
                  <th className="pb-3 text-left">Description</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/10 transition-colors">
                    <td className="py-3 font-mono text-xs text-gray-400">{item.vendorTypeCode || `#${item.id}`}</td>
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3 text-purple-300">{item.description || '—'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {deleteTarget && (
        <ConfirmModal
          message={`Delete vendor type "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT TERMS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ContractTermsTab = ({ showToast }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // ContractTermRequestDto: name, description, durationInDays (Integer), penaltyPercentage (Double), active
  const [form, setForm] = useState({ name: '', description: '', durationInDays: '', penaltyPercentage: '' });
  const [error, setError] = useState('');

  // const load = () => {
  //   setLoading(true);
  //   fetch(`${BASE_URL}/contract-terms/get-all-contract-terms`)
  //     .then((r) => r.json())
  //     .then((d) => setItems(Array.isArray(d) ? d : []))
  //     .catch(() => setItems([]))
  //     .finally(() => setLoading(false));
  // };

  const load = async () => {
  setLoading(true);
  try {
    const data = await getAllContractTerms();
    setItems(Array.isArray(data) ? data : []);
  } catch (error) {
    setItems([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { load(); }, []);

  // const handleAdd = async () => {
  //   if (!form.name.trim()) { setError('Name is required.'); return; }
  //   if (!form.durationInDays || Number(form.durationInDays) < 0) { setError('Duration Days is required (>= 0).'); return; }
  //   setError(''); setSaving(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/contract-terms/create-contract-term`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         name: form.name.trim(),
  //         description: form.description.trim(),
  //         durationInDays: Number(form.durationInDays),
  //         penaltyPercentage: form.penaltyPercentage ? Number(form.penaltyPercentage) : 0,
  //         active: true,
  //       }),
  //     });
  //     if (!res.ok) throw new Error(await res.text());
  //     setForm({ name: '', description: '', durationInDays: '', penaltyPercentage: '' });
  //     load();
  //     showToast('Contract term created.');
  //   } catch (err) {
  //     setError(err.message || 'Failed to create.');
  //   } finally { setSaving(false); }
  // };

  const handleAdd = async () => {
  if (!form.name.trim()) {
    setError("Name is required.");
    return;
  }

  if (!form.durationInDays || Number(form.durationInDays) < 0) {
    setError("Duration Days is required (>= 0).");
    return;
  }

  setError("");
  setSaving(true);

  try {
    await createContractTerm({
      name: form.name.trim(),
      description: form.description.trim(),
      durationInDays: Number(form.durationInDays),
      penaltyPercentage: form.penaltyPercentage
        ? Number(form.penaltyPercentage)
        : 0,
      active: true,
    });

    setForm({
      name: "",
      description: "",
      durationInDays: "",
      penaltyPercentage: "",
    });

    load();
    showToast("Contract term created.");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create.");
  } finally {
    setSaving(false);
  }
};

  // const handleDelete = async (id) => {
  //   try {
  //     const res = await fetch(`${BASE_URL}/contract-terms/delete-contract-term/${id}`, { method: 'DELETE' });
  //     if (!res.ok) throw new Error('Delete failed');
  //     setItems((p) => p.filter((i) => i.id !== id));
  //     showToast('Contract term deleted.');
  //   } catch { showToast('Failed to delete.', 'error'); }
  //   finally { setDeleteTarget(null); }
  // };

  const handleDelete = async (id) => {
  try {
    await deleteContractTerm(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Contract term deleted.");
  } catch (error) {
    showToast("Failed to delete.", "error");
  } finally {
    setDeleteTarget(null);
  }
};

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Add Contract Term" icon={FileText}>
        {error && <div className="mb-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div><Label>Name *</Label><Input value={form.name} onChange={set('name')} placeholder="e.g. Standard 30-Day" /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={set('description')} placeholder="Brief description" /></div>
          <div><Label>Duration (Days) *</Label><Input type="number" value={form.durationInDays} onChange={set('durationInDays')} placeholder="e.g. 30" /></div>
          <div><Label>Penalty %</Label><Input type="number" value={form.penaltyPercentage} onChange={set('penaltyPercentage')} placeholder="e.g. 2.5" /></div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-60"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
          Add Term
        </button>
      </SectionCard>

      <SectionCard title="Contract Terms" icon={FileText}>
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No contract terms yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-white/10">
                  <th className="pb-3 text-left">Name</th>
                  <th className="pb-3 text-left">Description</th>
                  <th className="pb-3 text-right">Duration (Days)</th>
                  <th className="pb-3 text-right">Penalty %</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/10 transition-colors">
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3 text-purple-300">{item.description || '—'}</td>
                    <td className="py-3 text-right text-white font-mono">{item.durationInDays}</td>
                    <td className="py-3 text-right text-white font-mono">{item.penaltyPercentage ?? '—'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => setDeleteTarget(item)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {deleteTarget && (
        <ConfirmModal
          message={`Delete contract term "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT TERMS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const PaymentTermsTab = ({ showToast }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // PaymentTermRequestDto: name, days (Integer), description, active
  const [form, setForm] = useState({ name: '', days: '', description: '' });
  const [error, setError] = useState('');

  // const load = () => {
  //   setLoading(true);
  //   fetch(`${BASE_URL}/payment-terms/get-all-payment-terms`)
  //     .then((r) => r.json())
  //     .then((d) => setItems(Array.isArray(d) ? d : []))
  //     .catch(() => setItems([]))
  //     .finally(() => setLoading(false));
  // };

  const load = async () => {
  setLoading(true);
  try {
    const data = await getAllPaymentTerms();
    setItems(Array.isArray(data) ? data : []);
  } catch (error) {
    setItems([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, []);

  // const handleAdd = async () => {
  //   if (!form.name.trim()) { setError('Name is required.'); return; }
  //   if (form.days === '' || Number(form.days) < 0) { setError('Days is required (>= 0).'); return; }
  //   setError(''); setSaving(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/payment-terms/create-payment-term`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         name: form.name.trim(),
  //         days: Number(form.days),
  //         description: form.description.trim(),
  //         active: true,
  //       }),
  //     });
  //     if (!res.ok) throw new Error(await res.text());
  //     setForm({ name: '', days: '', description: '' });
  //     load();
  //     showToast('Payment term created.');
  //   } catch (err) {
  //     setError(err.message || 'Failed to create.');
  //   } finally { setSaving(false); }
  // };

  const handleAdd = async () => {
  if (!form.name.trim()) {
    setError("Name is required.");
    return;
  }

  if (form.days === "" || Number(form.days) < 0) {
    setError("Days is required (>= 0).");
    return;
  }

  setError("");
  setSaving(true);

  try {
    await createPaymentTerm({
      name: form.name.trim(),
      days: Number(form.days),
      description: form.description.trim(),
      active: true,
    });

    setForm({
      name: "",
      days: "",
      description: "",
    });

    load();
    showToast("Payment term created.");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create.");
  } finally {
    setSaving(false);
  }
};


  // const handleDelete = async (id) => {
  //   try {
  //     const res = await fetch(`${BASE_URL}/payment-terms/delete-payment-term/${id}`, { method: 'DELETE' });
  //     if (!res.ok) throw new Error('Delete failed');
  //     setItems((p) => p.filter((i) => i.id !== id));
  //     showToast('Payment term deleted.');
  //   } catch { showToast('Failed to delete.', 'error'); }
  //   finally { setDeleteTarget(null); }
  // };

  const handleDelete = async (id) => {
  try {
    await deletePaymentTerm(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Payment term deleted.");
  } catch (error) {
    showToast("Failed to delete.", "error");
  } finally {
    setDeleteTarget(null);
  }
};

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Add Payment Term" icon={CreditCard}>
        {error && <div className="mb-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div><Label>Name * (e.g. Net 30)</Label><Input value={form.name} onChange={set('name')} placeholder="e.g. Net 30" /></div>
          <div><Label>Days *</Label><Input type="number" value={form.days} onChange={set('days')} placeholder="e.g. 30" /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={set('description')} placeholder="Optional" /></div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-60"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
          Add Payment Term
        </button>
      </SectionCard>

      <SectionCard title="Payment Terms" icon={CreditCard}>
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No payment terms yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-white/10">
                  <th className="pb-3 text-left">Name</th>
                  <th className="pb-3 text-right">Days</th>
                  <th className="pb-3 text-left">Description</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/10 transition-colors">
                    <td className="py-3 font-semibold text-white">{item.name}</td>
                    <td className="py-3 text-right font-mono text-white">{item.days}</td>
                    <td className="py-3 text-purple-300">{item.description || '—'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => setDeleteTarget(item)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {deleteTarget && (
        <ConfirmModal
          message={`Delete payment term "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN VendorSettings
// ═══════════════════════════════════════════════════════════════════════════════
const VendorSettings = ({ context }) => {
  const navigate    = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [activeTab, setActiveTab] = useState('vendorTypes');
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { key: 'vendorTypes',    label: 'Vendor Types',    icon: Tag },
    { key: 'contractTerms',  label: 'Contract Terms',  icon: FileText },
    { key: 'paymentTerms',   label: 'Payment Terms',   icon: CreditCard },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300">{moduleLabel}</button>
        <span>/</span>
        <span className="text-white font-semibold">Settings</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-purple-300 mt-0.5">Vendor types, contract and payment terms</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden mb-5">
        <div className="flex border-b border-white/10 overflow-x-auto">
          {tabs.map((t) => (
            <TabBtn
              key={t.key}
              label={t.label}
              icon={t.icon}
              active={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
            />
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'vendorTypes'   && <VendorTypesTab    showToast={showToast} />}
      {activeTab === 'contractTerms' && <ContractTermsTab  showToast={showToast} />}
      {activeTab === 'paymentTerms'  && <PaymentTermsTab   showToast={showToast} />}

      <Toast toast={toast} />
    </div>
  );
};

export default VendorSettings;
