import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Layers, Edit2, Trash2,
  Save, X, CheckCircle, XCircle, RefreshCw, Tag,
} from 'lucide-react';

import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../../services/stock/category.services";

// const API_BASE = '/api/categories';

const emptyForm = {
  name:        '',
  code:        '',
  description: '',
  active:      true,
};

const InputField = ({ label, placeholder, value, onChange, icon: Icon, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/30 focus:border-[#ef4444] transition-all`}
      />
    </div>
  </div>
);

export default function ItemCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [search, setSearch]         = useState('');
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const [useApi, setUseApi]         = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { loadCategories(); }, []);

  // const loadCategories = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${API_BASE}/getall`);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setCategories(data);
  //       setUseApi(true);
  //       setLoading(false);
  //       return;
  //     }
  //   } catch {}
  //   // Fallback localStorage
  //   try {
  //     const d = localStorage.getItem('mveng_categories');
  //     if (d) setCategories(JSON.parse(d));
  //   } catch {}
  //   setLoading(false);
  // };

  const loadCategories = async () => {
  setLoading(true);

  try {
    const data = await getAllCategories();
    setCategories(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error loading categories:", error);
    showToast("Failed to load categories", "error");
  } finally {
    setLoading(false);
  }
};

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // const handleSave = async () => {
  //   if (!form.name.trim()) { showToast('Category Name is required.', 'error'); return; }
  //   setSaving(true);

  //   // Build payload matching backend Category entity
  //   const payload = {
  //     name:        form.name.trim(),
  //     code:        form.code.trim() || null,
  //     description: form.description.trim() || null,
  //     active:      form.active,
  //   };

  //   try {
  //     if (useApi) {
  //       const url = editId !== null ? `${API_BASE}/${editId}` : `${API_BASE}/create`;
  //       const method = editId !== null ? 'PUT' : 'POST';
  //       const res = await fetch(url, {
  //         method,
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(payload),
  //       });
  //       if (res.ok) {
  //         showToast(editId !== null ? 'Category updated.' : 'Category saved.');
  //         setEditId(null);
  //         setForm(emptyForm);
  //         await loadCategories();
  //         setSaving(false);
  //         return;
  //       }
  //     }
  //   } catch {}

  //   // Fallback localStorage
  //   let stored = [];
  //   try { const d = localStorage.getItem('mveng_categories'); if (d) stored = JSON.parse(d); } catch {}
  //   let updated;
  //   if (editId !== null) {
  //     updated = stored.map(c => c.id === editId ? { ...c, ...payload, id: c.id } : c);
  //     showToast('Category updated.');
  //     setEditId(null);
  //   } else {
  //     updated = [...stored, { ...payload, id: Date.now() }];
  //     showToast('Category saved.');
  //   }
  //   setCategories(updated);
  //   try { localStorage.setItem('mveng_categories', JSON.stringify(updated)); } catch {}
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.name.trim()) {
    showToast("Category Name is required.", "error");
    return;
  }

  setSaving(true);

  const payload = {
    name: form.name.trim(),
    code: form.code.trim() || null,
    description: form.description.trim() || null,
    active: form.active,
  };

  try {
    if (editId !== null) {
      await updateCategory(editId, payload);
      showToast("Category updated.");
    } else {
      await createCategory(payload);
      showToast("Category saved.");
    }

    setEditId(null);
    setForm(emptyForm);
    loadCategories();
  } catch (error) {
    console.error("Save category error:", error);
    showToast(editId !== null ? "Update failed." : "Save failed.", "error");
  } finally {
    setSaving(false);
  }
};

  const handleEdit = (cat) => {
    setForm({
      name:        cat.name        || '',
      code:        cat.code        || '',
      description: cat.description || '',
      active:      cat.active      ?? true,
    });
    setEditId(cat.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm('Delete this category?')) return;
  //   try {
  //     if (useApi) {
  //       const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  //       if (res.ok || res.status === 204) {
  //         showToast('Category deleted.');
  //         await loadCategories();
  //         return;
  //       }
  //     }
  //   } catch {}
  //   const updated = categories.filter(c => c.id !== id);
  //   setCategories(updated);
  //   try { localStorage.setItem('mveng_categories', JSON.stringify(updated)); } catch {}
  //   showToast('Category deleted.');
  // };


  const handleDelete = async (id) => {
  if (!window.confirm("Delete this category?")) return;

  try {
    await deleteCategory(id);
    showToast("Category deleted.");
    loadCategories();
  } catch (error) {
    console.error("Delete category error:", error);
    showToast("Delete failed.", "error");
  }
};

  const filtered = categories.filter(c =>
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  );

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
            <Layers size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Item Categories</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage item classification categories</p>
          </div>
        </div>
        <button onClick={loadCategories} className="ml-auto w-8 h-8 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={`text-purple-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
            <Layers size={18} className="text-[#ef4444]" />
          </div>
          <p className="text-3xl font-extrabold text-white">{categories.length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">Total Categories</p>
        </div>
        <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: '#6366f1' }}>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
            <Tag size={18} className="text-[#6366f1]" />
          </div>
          <p className="text-3xl font-extrabold text-white">{categories.filter(c => !c.parent).length}</p>
          <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">Root Categories</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
            {editId ? <Edit2 size={15} className="text-[#ef4444]" /> : <Plus size={15} className="text-[#ef4444]" />}
          </div>
          <h2 className="text-sm font-bold text-white">{editId ? 'Edit Category' : 'Add New Category'}</h2>
          {editId && (
            <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
              <X size={13} /> Cancel
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <InputField label="Category Name" placeholder="e.g. Raw Material" value={form.name} onChange={v => f('name', v)} icon={Layers} required />
            <InputField label="Category Code" placeholder="e.g. CAT001" value={form.code} onChange={v => f('code', v)} icon={Tag} />
            <InputField label="Description" placeholder="Short description…" value={form.description} onChange={v => f('description', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide mr-2">Status</label>
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
              {editId ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} categories</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white text-xs uppercase tracking-wide">
                {['#', 'Category Name', 'Code', 'Description', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-14 text-gray-400 text-sm">No categories found.</td></tr>
              ) : filtered.map((cat, idx) => {
                return (
                  <tr key={cat.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                    <td className="px-5 py-3.5">
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#ef4444]">{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <Layers size={12} className="text-purple-300" />
                        </div>
                        <span className="font-semibold text-white text-xs">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-purple-300 font-mono">{cat.code || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 max-w-[180px] truncate">{cat.description || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cat.active !== false ? 'bg-emerald-500/10 text-[#6ee7b7]' : 'bg-white/5 text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.active !== false ? 'bg-[#10b981]' : 'bg-[#94a3b8]'}`} />
                        {cat.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(cat)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors"><Edit2 size={12} /></button>
                        <button onClick={() => handleDelete(cat.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 flex items-center justify-center transition-colors"><Trash2 size={12} /></button>
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