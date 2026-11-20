// PurchaseVendorCategories.jsx — Purchase > Settings > Vendor Categories
// import React, { useState } from 'react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Trash2, Edit2, Save, X, Tag } from 'lucide-react';


import {
  createVendorCategory,
  updateVendorCategory,
  getAllVendorCategories,
   deleteVendorCategory,
   toggleVendorCategoryStatus,
} from "../../../services/purchase/settings/purchaseVendorCategories.services";
const CAT_COLORS = ['#8b5cf6','#ffffff','#c4b5fd','#3B7A8C','#5C8A6E','#8A6C5C','#7C5C8A','#8A7C3B','#5C6B8A','#8A3B5C','#3B8A6B','#8A5C3B'];
// const STORAGE_KEY = 'srivari_purchase_vendor_categories';
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

const FormModal = ({ initial, cats, onSave, onClose }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? { ...initial } : { name: '', description: '', isActive: true, color: CAT_COLORS[0] });
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!form.name.trim()) { setError('Category name is required'); return; }
    if (!isEdit && cats.some(c => c.name.toLowerCase() === form.name.toLowerCase())) { setError('Name already exists'); return; }
    // onSave({ ...form, id: initial?.id ?? Date.now() });
    onSave({
  ...form,
  ...(initial?.id ? { id: initial.id } : {}),
});
  };

  const inp = `w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all bg-[#140f2d]/80`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center"><Tag size={16} className="text-purple-300" /></div>
            <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Category' : 'New Category'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Category Name <span className="text-red-400">*</span></label>
            <input type="text" placeholder="e.g. Raw Materials" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(''); }} className={`${inp} ${error ? 'border-red-300' : ''}`} />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Description</label>
            <textarea rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-2">Accent Colour</label>
            <div className="flex gap-2 flex-wrap">
              {CAT_COLORS.map(col => (
                <button key={col} type="button" onClick={() => setForm(p => ({ ...p, color: col }))} className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === col ? 'border-white/10 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ background: col }} />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))} className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-emerald-500' : 'bg-white/10'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#140f2d]/80 shadow transition-all ${form.isActive ? 'left-4' : 'left-0.5'}`} />
            </button>
            <span className="text-sm font-medium text-white">Active</span>
          </label>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
          <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10">
            <Save size={14} />{isEdit ? 'Update' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PurchaseVendorCategories = () => {
  const navigate = useNavigate();
  // const [cats, setCats]       = useState(load);
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTgt, setEditTgt] = useState(null);
  const [delTgt, setDelTgt]   = useState(null);
  const [toast, setToast]     = useState(null);

  const flash = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
  fetchCategories();
}, []);

  const fetchCategories = async () => {
  try {
    const data = await getAllVendorCategories();

    console.log("Vendor Categories API Response:", data);

    const formattedCategories = data.map((item, index) => ({
      id: item.id,
      name: item.name ?? "",
      description: item.description ?? "",
      isActive:
        item.isActive !== undefined
          ? item.isActive
          : item.active !== undefined
          ? item.active
          : true,
      color: CAT_COLORS[index % CAT_COLORS.length],
    }));

    setCats(formattedCategories);
  } catch (error) {
    console.error("Error fetching vendor categories:", error);
    flash("Failed to load vendor categories", "error");
  }
};

  // const handleSave = (data) => {
  //   const updated = editTgt ? cats.map(c => c.id === data.id ? data : c) : [...cats, data];
  //   persist(updated); setCats(updated); setShowForm(false); setEditTgt(null);
  //   flash(editTgt ? `"${data.name}" updated` : `"${data.name}" added`);
  // };

  const handleSave = async (data) => {
  try {
    const categoryName = (data.name || "").trim().toLowerCase();

    const alreadyExists = cats.some(
      (c) =>
        (c.name || "").trim().toLowerCase() === categoryName &&
        c.id !== data.id
    );

    if (alreadyExists) {
      flash("Category already exists", "error");
      return;
    }

    if (editTgt) {
      const updated = await updateVendorCategory(data.id, data);

      setCats((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      flash(`"${updated.name}" updated`);
    } else {
      const created = await createVendorCategory(data);

      setCats((prev) => [...prev, created]);

      flash(`"${created.name}" added`);
    }

    setShowForm(false);
    setEditTgt(null);
  } catch (error) {
    console.error("Error saving vendor category:", error);
    flash("Failed to save vendor category", "error");
  }
};

  // const handleToggle = (cat) => {
  //   const updated = cats.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c);
  //   persist(updated); setCats(updated);
  //   flash(`"${cat.name}" ${cat.isActive ? 'deactivated' : 'activated'}`);
  // };

  const handleToggle = async (cat) => {
  try {
    await toggleVendorCategoryStatus(cat.id);

    setCats((prev) =>
      prev.map((c) =>
        c.id === cat.id
          ? { ...c, isActive: !c.isActive }
          : c
      )
    );

    flash(`"${cat.name}" ${cat.isActive ? 'deactivated' : 'activated'}`);
  } catch (error) {
    console.error("Error toggling vendor category:", error);
    flash("Failed to update category status", "error");
  }
};

  // const handleDelete = () => {
  //   const updated = cats.filter(c => c.id !== delTgt.id);
  //   persist(updated); setCats(updated); setDelTgt(null); flash(`"${delTgt.name}" deleted`);
  // };

  const handleDelete = async () => {
  try {
    await deleteVendorCategory(delTgt.id);

    setCats((prev) =>
      prev.filter((c) => c.id !== delTgt.id)
    );

    flash(`"${delTgt.name}" deleted`);
    setDelTgt(null);
  } catch (error) {
    console.error("Error deleting vendor category:", error);
    flash("Failed to delete vendor category", "error");
  }
};

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/settings')} className="hover:text-purple-300 transition-colors">Settings</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Vendor Categories</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/settings')} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.15)' }}>
          <Tag size={22} style={{ color: '#10b981' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Vendor Categories</h2>
          <p className="text-sm text-gray-400">Organise and tag your vendor directory</p>
        </div>
        <button onClick={() => { setEditTgt(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-sm">
          <Plus size={15} /> New Category
        </button>
      </div>

      {cats.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#140f2d]/80 overflow-hidden shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4"><Tag size={30} className="text-purple-300" /></div>
            <h3 className="text-base font-bold text-white mb-1">No Categories Yet</h3>
            <p className="text-sm text-gray-400 mb-5 max-w-xs">Create vendor categories to organise and filter your vendor list.</p>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-sm">
              <Plus size={14} /> New Category
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)] bg-[#140f2d]/80">
          {cats.map((cat, idx) => (
            <div key={cat.id || `cat-${idx}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-all duration-150 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color || '#8b5cf6'}18` }}>
                <Tag size={16} style={{ color: cat.color || '#8b5cf6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{cat.name}</p>
                {cat.description && <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>}
              </div>
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ background: cat.color || '#8b5cf6' }} />
              <button onClick={() => handleToggle(cat)} className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${cat.isActive ? 'bg-emerald-500' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#140f2d]/80 shadow transition-all ${cat.isActive ? 'left-4' : 'left-0.5'}`} />
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => { setEditTgt(cat); setShowForm(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-purple-300 transition-colors"><Edit2 size={13} /></button>
                <button onClick={() => setDelTgt(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
              <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {showForm && <FormModal initial={editTgt} cats={cats} onSave={handleSave} onClose={() => { setShowForm(false); setEditTgt(null); }} />}
      {delTgt && <ConfirmModal message={`Delete category "${delTgt.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDelTgt(null)} />}
      <Toast toast={toast} />
    </div>
  );
};

export default PurchaseVendorCategories;
