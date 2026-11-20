// POTemplates.jsx — Purchase > Settings > PO Templates
// import React, { useState } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Trash2, Edit2, Save, X, FileText } from 'lucide-react';

import {
  createPOTemplate,
  getAllPOTemplates,
  updatePOTemplate,
  deletePOTemplate,
} from '../../../services/purchase/settings/poTemplate.services';

const CURRENCY_OPTIONS       = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
const PAYMENT_TERM_OPTIONS   = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate', 'COD'];
const DELIVERY_TERM_OPTIONS  = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP'];
const TAX_TYPE_OPTIONS       = ['GST', 'VAT', 'IGST', 'CGST+SGST', 'None'];
const SHIPPING_METHOD_OPTIONS = ['Road', 'Air', 'Sea', 'Rail', 'Courier'];

// const STORAGE_KEY = 'srivari_po_templates';
// const load    = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
// const persist = (d) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

const Toast = ({ toast }) => {
  if (!toast) return null;
  const err = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border ${err ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
      <span className={`w-2 h-2 rounded-full ${err ? 'bg-red-400' : 'bg-emerald-400'}`} />{toast.msg}
    </div>
  );
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onCancel()}>
    <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl w-full max-w-sm p-7">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-400" /></div>
      <p className="text-center text-white font-semibold mb-1">Confirm Delete</p>
      <p className="text-center text-xs text-gray-400 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
      </div>
    </div>
  </div>
);

const EMPTY = { templateName: '', description: '', currency: 'INR', paymentTerms: '', deliveryTerms: '', taxType: '', defaultTaxPercentage: '', defaultDiscount: '', shippingMethod: '', shippingAddress: '', termsAndConditions: '', notes: '', isActive: true };

const Section = ({ title, children }) => (
  <div>
    <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-3 border-b border-white/10 pb-1">{title}</p>
    {children}
  </div>
);

const FormModal = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? { ...initial, defaultTaxPercentage: initial.defaultTaxPercentage ?? '', defaultDiscount: initial.defaultDiscount ?? '' } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const handleSave = () => {
    if (!form.templateName.trim()) { setErrors({ templateName: 'Required' }); return; }
    onSave({
  ...form,
  ...(initial?.id ? { id: initial.id } : {}),
  defaultTaxPercentage:
    form.defaultTaxPercentage !== ''
      ? parseFloat(form.defaultTaxPercentage)
      : null,
  defaultDiscount:
    form.defaultDiscount !== ''
      ? parseFloat(form.defaultDiscount)
      : null,
});
  };

  const inp = (f) => `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-[#140f2d]/80 ${errors[f] ? 'border-red-300' : 'border-white/10'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center"><FileText size={16} className="text-purple-300" /></div>
            <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Template' : 'New PO Template'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10"><X size={15} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-5">
          <Section title="Basic Info">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Template Name <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Standard Purchase Template" value={form.templateName} onChange={e => set('templateName', e.target.value)} className={inp('templateName')} />
                {errors.templateName && <p className="text-xs text-red-400 mt-1">{errors.templateName}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Description</label>
                <textarea rows={2} placeholder="Brief description…" value={form.description} onChange={e => set('description', e.target.value)} className={`${inp('description')} resize-none`} />
              </div>
            </div>
          </Section>

          <Section title="Financial">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Currency</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)} className={inp('currency')}>
                  {CURRENCY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Payment Terms</label>
                <select value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} className={inp('paymentTerms')}>
                  <option value="">Select</option>{PAYMENT_TERM_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Delivery Terms</label>
                <select value={form.deliveryTerms} onChange={e => set('deliveryTerms', e.target.value)} className={inp('deliveryTerms')}>
                  <option value="">Select</option>{DELIVERY_TERM_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Default Discount (%)</label>
                <input type="number" min="0" max="100" step="0.01" placeholder="0.00" value={form.defaultDiscount} onChange={e => set('defaultDiscount', e.target.value)} className={inp('defaultDiscount')} />
              </div>
            </div>
          </Section>

          <Section title="Tax Configuration">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Tax Type</label>
                <select value={form.taxType} onChange={e => set('taxType', e.target.value)} className={inp('taxType')}>
                  <option value="">Select</option>{TAX_TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Default Tax (%)</label>
                <input type="number" min="0" max="100" step="0.01" placeholder="18.00" value={form.defaultTaxPercentage} onChange={e => set('defaultTaxPercentage', e.target.value)} className={inp('defaultTaxPercentage')} />
              </div>
            </div>
          </Section>

          <Section title="Shipping">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Shipping Method</label>
                <select value={form.shippingMethod} onChange={e => set('shippingMethod', e.target.value)} className={inp('shippingMethod')}>
                  <option value="">Select</option>{SHIPPING_METHOD_OPTIONS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Shipping Address</label>
                <input type="text" placeholder="Delivery address" value={form.shippingAddress} onChange={e => set('shippingAddress', e.target.value)} className={inp('shippingAddress')} />
              </div>
            </div>
          </Section>

          <Section title="Terms & Notes">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Terms & Conditions</label>
                <textarea rows={2} placeholder="Standard terms and conditions…" value={form.termsAndConditions} onChange={e => set('termsAndConditions', e.target.value)} className={`${inp('termsAndConditions')} resize-none`} />
              </div>
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Notes</label>
                <textarea rows={2} placeholder="Additional notes…" value={form.notes} onChange={e => set('notes', e.target.value)} className={`${inp('notes')} resize-none`} />
              </div>
            </div>
          </Section>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button type="button" onClick={() => set('isActive', !form.isActive)} className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-emerald-500' : 'bg-white/10'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#140f2d]/80 shadow transition-all ${form.isActive ? 'left-4' : 'left-0.5'}`} />
            </button>
            <span className="text-sm font-medium text-white">Active</span>
          </label>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10">
            <Save size={14} />{isEdit ? 'Update Template' : 'Add Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

const POTemplates = () => {
  const navigate = useNavigate();
  // const [templates, setTemplates] = useState(load);
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editTgt, setEditTgt]     = useState(null);
  const [delTgt, setDelTgt]       = useState(null);
  const [toast, setToast]         = useState(null);

  const flash = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
  fetchTemplates();
}, []);

const fetchTemplates = async () => {
  try {
    const data = await getAllPOTemplates();
    setTemplates(data);
  } catch (error) {
    console.error("Error fetching templates:", error);
    flash("Failed to load templates", "error");
  }
};
  // const handleSave = (data) => {
  //   const updated = editTgt ? templates.map(t => t.id === data.id ? data : t) : [...templates, data];
  //   persist(updated); setTemplates(updated); setShowForm(false); setEditTgt(null);
  //   flash(editTgt ? `"${data.templateName}" updated` : `"${data.templateName}" added`);
  // };

  const handleSave = async (data) => {
  try {
    if (editTgt) {
      const updated = await updatePOTemplate(data.id, data);

      setTemplates((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );

      flash(`"${updated.templateName}" updated`);
    } else {
      const created = await createPOTemplate(data);

      setTemplates((prev) => [...prev, created]);

      flash(`"${created.templateName}" added`);
    }

    setShowForm(false);
    setEditTgt(null);
  } catch (error) {
    console.error("Error saving template:", error);
    flash("Failed to save template", "error");
  }
};

  // const handleDelete = () => {
  //   const updated = templates.filter(t => t.id !== delTgt.id);
  //   persist(updated); setTemplates(updated); setDelTgt(null); flash(`"${delTgt.templateName}" deleted`);
  // };

  const handleDelete = async () => {
  try {
    await deletePOTemplate(delTgt.id);

    setTemplates((prev) =>
      prev.filter((t) => t.id !== delTgt.id)
    );

    flash(`"${delTgt.templateName}" deleted`);
    setDelTgt(null);
  } catch (error) {
    console.error("Error deleting template:", error);
    flash("Failed to delete template", "error");
  }
};

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/settings')} className="hover:text-purple-300 transition-colors">Settings</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">PO Templates</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/settings')} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <FileText size={22} style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">PO Templates</h2>
          <p className="text-sm text-gray-400">Define reusable purchase order templates</p>
        </div>
        <button onClick={() => { setEditTgt(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-sm">
          <Plus size={15} /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#140f2d]/80 overflow-hidden shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4"><FileText size={30} className="text-purple-300" /></div>
            <h3 className="text-base font-bold text-white mb-1">No Templates Yet</h3>
            <p className="text-sm text-gray-400 mb-5 max-w-xs">Create PO templates to pre-fill currency, tax, payment and shipping settings.</p>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-sm">
              <Plus size={14} /> New Template
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)] bg-[#140f2d]/80">
          {templates.map((tpl, idx) => (
            <div key={tpl.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-all duration-150 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.12)' }}>
                <span className="text-xs font-bold text-purple-300">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{tpl.templateName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap mt-0.5">
                  {tpl.currency && <span>{tpl.currency}</span>}
                  {tpl.paymentTerms && <span>{tpl.paymentTerms}</span>}
                  {tpl.taxType && <span>{tpl.taxType}{tpl.defaultTaxPercentage != null ? ` ${tpl.defaultTaxPercentage}%` : ''}</span>}
                  {tpl.shippingMethod && <span>{tpl.shippingMethod}</span>}
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${tpl.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-white/5 text-gray-400'}`}>
                {tpl.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => { setEditTgt(tpl); setShowForm(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-purple-300 transition-colors"><Edit2 size={13} /></button>
                <button onClick={() => setDelTgt(tpl)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
              <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {showForm && <FormModal initial={editTgt} onSave={handleSave} onClose={() => { setShowForm(false); setEditTgt(null); }} />}
      {delTgt && <ConfirmModal message={`Delete template "${delTgt.templateName}"?`} onConfirm={handleDelete} onCancel={() => setDelTgt(null)} />}
      <Toast toast={toast} />
    </div>
  );
};

export default POTemplates;
