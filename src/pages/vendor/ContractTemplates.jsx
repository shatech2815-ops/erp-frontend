
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, FileText, Copy, Eye, Trash2,
  Shield, Handshake, Truck, Wrench, BookOpen,
  X, ScrollText, Search, Save, Tag, Edit2
} from 'lucide-react';

// const BASE_URL = '/api/templates';
import {
  createTemplate,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
} from "../../services/vendor/contractTemplate.services";

// Enum values matching backend exactly
const CONTRACT_TYPES = ['service','supply','nda','mou','lease','purchase','maintenance','consulting','other'];
const CURRENCIES     = ['INR','USD','EUR','GBP','AED'];
const PAYMENT_TERMS  = ['onetime','weekly','monthly','quarterly','halfyearly','annually','milestone'];

const ICON_MAP = { Wrench, Shield, Truck, Handshake, BookOpen, FileText };
const TYPE_COLORS = {
  service:     'from-blue-500 to-blue-400',
  supply:      'from-purple-500 to-gray-500',
  nda:         'from-purple-500 to-purple-400',
  maintenance: 'from-amber-500 to-amber-400',
  consulting:  'from-teal-500 to-teal-400',
  mou:         'from-rose-400 to-rose-300',
  lease:       'from-green-500 to-green-400',
  purchase:    'from-indigo-500 to-indigo-400',
  other:       'from-gray-500 to-gray-400',
};

// ─── FormModal (Create / Edit) ────────────────────────────────────────────────
const FormModal = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? { ...initial, tags: (initial.tags || []).join(', ') } : {
    id: '', name: '', type: 'service', icon: 'FileText',
    description: '', tags: '', termsConditions: '',
    currency: 'INR', paymentTerms: 'monthly', isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.id.trim())   { setError('ID is required.'); return; }
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setError(''); setSaving(true);

    // Build payload explicitly — enum values must match backend exactly (case-sensitive)
    // ContractType: service, supply, nda, mou, lease, purchase, maintenance, consulting, other (lowercase)
    // Currency: INR, USD, EUR, GBP, AED (UPPERCASE)
    // PaymentTerms: onetime, weekly, monthly, quarterly, halfyearly, annually, milestone (lowercase)
    const payload = {
      id:              form.id.trim(),
      name:            form.name.trim(),
      type:            form.type,            // already lowercase from CONTRACT_TYPES array
      icon:            form.icon,
      description:     form.description.trim(),
      tags:            form.tags.split(',').map(t => t.trim()).filter(Boolean),
      termsConditions: form.termsConditions.trim(),
      currency:        form.currency,        // already UPPERCASE from CURRENCIES array
      paymentTerms:    form.paymentTerms,    // already lowercase from PAYMENT_TERMS array
      isDefault:       form.isDefault === true || form.isDefault === 'true',
    };

    try {
      // const url    = isEdit ? `${BASE_URL}/${form.id}` : BASE_URL;
      // const method = isEdit ? 'PUT' : 'POST';
      // const res = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // if (!res.ok) {
      //   const errText = await res.text();
      //   // Try to extract a readable message from Spring error JSON
      //   let msg = errText;
      //   try {
      //     const errJson = JSON.parse(errText);
      //     msg = errJson.message || errJson.error || errJson.detail || errText;
      //   } catch { /* use raw text */ }
      //   throw new Error(`Server error (${res.status}): ${msg}`);
      // }
      // const saved = await res.json();
      // onSave(saved);

      const saved = isEdit
      ? await updateTemplate(form.id, payload)
      : await createTemplate(payload);
      onSave(saved);
    } catch (err) {
      setError(err.message || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full rounded-xl border border-white/10 bg-[#140f2d] px-4 py-2.5 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500';
  const lbl = 'text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#140f2d] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={16} className="text-purple-300" />
            </div>
            <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Template' : 'New Template'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10"><X size={14} /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          {error && <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-h-24 overflow-y-auto break-words">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Template ID *</label>
              <input className={inp} value={form.id} onChange={set('id')} placeholder="e.g. tpl-service-01" disabled={isEdit} />
            </div>
            <div>
              <label className={lbl}>Name *</label>
              <input className={inp} value={form.name} onChange={set('name')} placeholder="Template name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Type</label>
              <select className={inp} value={form.type} onChange={set('type')}>
                {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Icon</label>
              <select className={inp} value={form.icon} onChange={set('icon')}>
                {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Description</label>
            <textarea className={inp} rows={2} value={form.description} onChange={set('description')} placeholder="Brief description..." />
          </div>
          <div>
            <label className={lbl}>Tags (comma separated)</label>
            <input className={inp} value={form.tags} onChange={set('tags')} placeholder="e.g. Service, SLA, Recurring" />
          </div>
          <div>
            <label className={lbl}>Terms & Conditions</label>
            <textarea className={inp} rows={4} value={form.termsConditions} onChange={set('termsConditions')} placeholder="Enter terms and conditions..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Currency</label>
              <select className={inp} value={form.currency} onChange={set('currency')}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Payment Terms</label>
              <select className={inp} value={form.paymentTerms} onChange={set('paymentTerms')}>
                {PAYMENT_TERMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={!!form.isDefault}
              onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
              className="w-4 h-4 rounded border-white/10 text-purple-300" />
            <label htmlFor="isDefault" className="text-sm text-purple-300 font-medium">Mark as Default Template</label>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PreviewModal ─────────────────────────────────────────────────────────────
const PreviewModal = ({ template, onClose, onUse }) => {
  const IconComp = ICON_MAP[template.icon] || FileText;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#140f2d] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TYPE_COLORS[template.type] || TYPE_COLORS.other} flex items-center justify-center flex-shrink-0`}>
              <IconComp size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{template.name}</h2>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {(template.tags || []).map(tag => (
                  <span key={tag} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto px-7 py-5 flex-1">
          <p className="text-sm text-purple-300 leading-relaxed mb-5">{template.description}</p>
          <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 pb-1 border-b border-white/10">Terms & Conditions</h4>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            {(template.termsConditions || '').split('\n').map((line, i) => (
              <p key={i} className="text-sm text-gray-300 leading-relaxed mb-1">{line}</p>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-gray-400">Currency</p>
              <p className="text-sm font-bold text-white">{template.currency}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-gray-400">Payment</p>
              <p className="text-sm font-bold text-white capitalize">{template.paymentTerms}</p>
            </div>
          </div>
        </div>
        <div className="px-7 py-4 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Close</button>
          <button onClick={() => onUse(template)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 shadow-md">
            <Copy size={14} /> Use This Template
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TemplateCard ─────────────────────────────────────────────────────────────
const TemplateCard = ({ template, onPreview, onUse, onEdit, onDelete }) => {
  const IconComp = ICON_MAP[template.icon] || FileText;
  return (
    <div className="bg-[#140f2d]/80 rounded-2xl border border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      <div className={`h-1.5 bg-gradient-to-r ${TYPE_COLORS[template.type] || TYPE_COLORS.other}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${TYPE_COLORS[template.type] || TYPE_COLORS.other} flex items-center justify-center flex-shrink-0`}>
              <IconComp size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors leading-tight">{template.name}</h3>
              {template.isDefault && <span className="text-xs text-gray-400 font-medium">Default Template</span>}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => { e.stopPropagation(); onEdit(template); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-300 hover:bg-white/10 transition-colors">
              <Edit2 size={13} />
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(template.id); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <p className="text-xs text-purple-300 leading-relaxed mb-3 line-clamp-2">{template.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(template.tags || []).map(tag => (
            <span key={tag} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full font-medium">{tag}</span>
          ))}
        </div>
        <div className="flex gap-2 pt-3 border-t border-white/10">
          <button onClick={() => onPreview(template)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-purple-300 text-xs font-semibold hover:bg-white/10 transition-colors">
            <Eye size={13} /> Preview
          </button>
          <button onClick={() => onUse(template)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-white/10 transition-colors">
            <Copy size={13} /> Use Template
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ContractTemplates ────────────────────────────────────────────────────────
const ContractTemplates = () => {
  const navigate = useNavigate();
  const [templates,    setTemplates]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [previewTpl,   setPreviewTpl]   = useState(null);
  const [formModal,    setFormModal]    = useState(null); // null | 'new' | template-object
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // const loadTemplates = () => {
  //   setLoading(true);
  //   fetch(BASE_URL)
  //     .then(r => r.ok ? r.json() : [])
  //     .then(data => setTemplates(Array.isArray(data) ? data : []))
  //     .catch(() => setTemplates([]))
  //     .finally(() => setLoading(false));
  // };

  const loadTemplates = async () => {
  setLoading(true);

  try {
    const data = await getAllTemplates();
    setTemplates(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error loading templates:", error);
    setTemplates([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { loadTemplates(); }, []);

  const handleSaved = (saved) => {
    setFormModal(null);
    loadTemplates();
    showToast(saved.name ? `"${saved.name}" saved successfully.` : 'Template saved.');
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm('Delete this template? This cannot be undone.')) return;
  //   try {
  //     const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  //     if (!res.ok) throw new Error();
  //     setTemplates(prev => prev.filter(t => t.id !== id));
  //     showToast('Template deleted.');
  //   } catch {
  //     showToast('Failed to delete template.', 'error');
  //   }
  // };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this template? This cannot be undone.")) return;

  try {
    await deleteTemplate(id);

    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Template deleted.");
  } catch (error) {
    console.error("Delete failed:", error);
    showToast("Failed to delete template.", "error");
  }
};


  const handleUse = (template) => {
    navigate('/dashboard/vendor/contracts/add', {
      state: {
        prefill: {
          contractType:    template.type,
          termsConditions: template.termsConditions,
          currency:        template.currency,
          paymentTerms:    template.paymentTerms,
        }
      }
    });
  };

  const filtered = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border ${toast.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`} />
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate('/dashboard/vendor')} className="hover:text-purple-300">Vendor Management</button>
        <span>/</span>
        <button onClick={() => navigate('/dashboard/vendor/contracts')} className="hover:text-purple-300">Contracts</button>
        <span>/</span>
        <span className="text-white font-semibold">Contract Templates</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Contract Templates</h1>
            <p className="text-sm text-purple-300 mt-0.5">{templates.length} template{templates.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
        <button onClick={() => setFormModal('new')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 shadow-md">
          <Plus size={15} /> New Template
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-white/5 border border-white/10 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ScrollText size={15} className="text-purple-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Using a template pre-fills your contract form</p>
          <p className="text-xs text-gray-400 mt-0.5">Select a template and click <strong className="text-purple-300">Use Template</strong> to open the Add Contract form with type, terms, currency and payment already filled in.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{search ? 'No templates match your search.' : 'No templates yet. Click "New Template" to create one.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <TemplateCard key={template.id} template={template}
              onPreview={setPreviewTpl}
              onUse={handleUse}
              onEdit={t => setFormModal(t)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {previewTpl && (
        <PreviewModal template={previewTpl} onClose={() => setPreviewTpl(null)}
          onUse={t => { setPreviewTpl(null); handleUse(t); }} />
      )}

      {formModal && (
        <FormModal
          initial={formModal === 'new' ? null : formModal}
          onSave={handleSaved}
          onClose={() => setFormModal(null)}
        />
      )}
    </div>
  );
};

export default ContractTemplates;