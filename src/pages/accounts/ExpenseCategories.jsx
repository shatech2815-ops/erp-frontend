import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Tag, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

import {
  createExpenseCategory,
  getAllExpenseCategories,
  deleteExpenseCategory,
} from "../../services/account/expense.services";
// const BASE_URL = '/api/accounting';
const GST_OPTIONS = ['0%','5%','12%','18%','28%','Exempt'];
const ITC_OPTIONS = ['Yes','No','Partial'];
const STATUS_OPTIONS = ['Active','Inactive'];

export default function ExpenseCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [nameError, setNameError] = useState(false);
  const [form, setForm] = useState({
    categoryName: '', categoryCode: '', parentCategory: '',
    glAccount: '', defaultGst: '18%', itcEligible: 'Yes',
    budgetLimit: '', status: 'Active', description: '',
  });

  const setField = (k, v) => {
    if (k === 'categoryName' && v.trim()) {
      setNameError(false);
    }
    setForm(p => ({ ...p, [k]: v }));
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllExpenseCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch categories error:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    if (!form.categoryName || !form.categoryName.trim()) {
      setNameError(true);
      setMsg("Category Name is required. Please enter a category name before saving.");
      return;
    }

    setNameError(false);
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        ...form,
        categoryName: form.categoryName.trim(),
        budgetLimit: parseFloat(form.budgetLimit) || null,
      };

      await createExpenseCategory(payload);
      setMsg("Category saved successfully!");
      fetchCategories();

      setForm({
        categoryName: "",
        categoryCode: "",
        parentCategory: "",
        glAccount: "",
        defaultGst: "18%",
        itcEligible: "Yes",
        budgetLimit: "",
        status: "Active",
        description: "",
      });
    } catch (error) {
      console.error("Save category error:", error);
      if (error.response?.data?.message) {
        setMsg(error.response.data.message);
      } else {
        setMsg("Failed to save category.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const catId = category?.id;
    if (!catId) {
      setMsg("Error: Category ID not found.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete the expense category "${category.categoryName}"?`);
    if (!confirmed) return;

    setDeletingId(catId);
    setMsg("");
    try {
      await deleteExpenseCategory(catId);
      setMsg(`Category "${category.categoryName}" deleted successfully!`);
      fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      const errMsg = error.response?.data?.message || "Failed to delete expense category.";
      setMsg(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  const isErrorMsg = msg && (
    msg.toLowerCase().includes('error') ||
    msg.toLowerCase().includes('failed') ||
    msg.toLowerCase().includes('required') ||
    msg.toLowerCase().includes('please')
  );

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300 transition-colors">
          Accounts Management
        </button>
        <ChevronRight size={12} className="text-gray-400" />
        <button onClick={() => navigate('/dashboard/accounts/expenses')} className="hover:text-amber-300 transition-colors">
          Expenses
        </button>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-white font-semibold">Expense Categories</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/accounts/expenses')} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <Tag size={22} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Expense Categories</h2>
          <p className="text-sm text-gray-400">Manage expense classification and GL mapping</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
          isErrorMsg ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {isErrorMsg ? <AlertCircle size={16} className="flex-shrink-0" /> : <CheckCircle2 size={16} className="flex-shrink-0" />}
          <span>{msg}</span>
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">
          <Plus size={14} className="inline mr-1" />Add Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={lbl}>
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.categoryName}
              onChange={e => setField('categoryName', e.target.value)}
              className={`${inp} ${nameError ? 'border-red-500 ring-2 ring-red-500/30' : ''}`}
              placeholder="e.g. Travel, Office Supplies"
              required
            />
            {nameError && (
              <p className="text-xs text-red-400 mt-1 font-medium">Category name is required</p>
            )}
          </div>
          <div><label className={lbl}>Category Code</label><input value={form.categoryCode} onChange={e => setField('categoryCode', e.target.value)} className={inp} placeholder="e.g. TRVL-001" /></div>
          <div><label className={lbl}>Parent Category</label><input value={form.parentCategory} onChange={e => setField('parentCategory', e.target.value)} className={inp} placeholder="Parent category (if sub)" /></div>
          <div><label className={lbl}>GL Account</label><input value={form.glAccount} onChange={e => setField('glAccount', e.target.value)} className={inp} placeholder="GL account code" /></div>
          <div><label className={lbl}>Default GST %</label><select value={form.defaultGst} onChange={e => setField('defaultGst', e.target.value)} className={inp}>{GST_OPTIONS.map(g => <option key={g}>{g}</option>)}</select></div>
          <div><label className={lbl}>ITC Eligible</label><select value={form.itcEligible} onChange={e => setField('itcEligible', e.target.value)} className={inp}>{ITC_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label className={lbl}>Budget Limit (₹)</label><input type="number" value={form.budgetLimit} onChange={e => setField('budgetLimit', e.target.value)} className={inp} placeholder="Monthly / Annual limit" /></div>
          <div><label className={lbl}>Status</label><select value={form.status} onChange={e => setField('status', e.target.value)} className={inp}>{STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="sm:col-span-2"><label className={lbl}>Description</label><textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={2} className={inp + ' resize-none'} placeholder="Description of this category" /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={14} />} Save Category
        </button>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10"><h3 className="text-sm font-bold text-purple-300">All Categories</h3></div>
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#8b5cf6' }}>{['Name','Code','Parent','GL Account','Default GST','ITC','Budget Limit','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/10">
                {categories.length === 0 ? <tr><td colSpan={9} className="text-center py-12 text-gray-400">No categories found.</td></tr>
                  : categories.map((c, i) => (
                  <tr key={c.id || i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{c.categoryName}</td>
                    <td className="px-4 py-3 text-xs">{c.categoryCode}</td>
                    <td className="px-4 py-3 text-xs">{c.parentCategory || '—'}</td>
                    <td className="px-4 py-3 text-xs">{c.glAccount}</td>
                    <td className="px-4 py-3 text-xs">{c.defaultGst}</td>
                    <td className="px-4 py-3 text-xs">{c.itcEligible}</td>
                    <td className="px-4 py-3 text-xs">{c.budgetLimit ? `₹${Number(c.budgetLimit).toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3 text-xs"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status==='Active' ? 'bg-green-100 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>{c.status}</span></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Category"
                      >
                        {deletingId === c.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
