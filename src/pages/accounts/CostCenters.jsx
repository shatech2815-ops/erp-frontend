import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Search, Check, X } from 'lucide-react';
import { createCostCenter, getAllCostCenters } from '../../services/account/costCenter.services';

export default function CostCenters() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    name: '',
    department: '',
    description: '',
    status: 'ACTIVE'
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getAllCostCenters();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMsg("Failed to load cost centers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.name) {
      setMsg("Code and Name are required.");
      return;
    }
    
    setSaving(true);
    setMsg("");
    try {
      await createCostCenter(form);
      setMsg("Cost Center created successfully!");
      setForm({ code: '', name: '', department: '', description: '', status: 'ACTIVE' });
      fetchRecords();
    } catch (error) {
      setMsg("Failed to create cost center.");
    } finally {
      setSaving(false);
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Cost Centers</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Plus size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Cost Centers</h2>
          <p className="text-sm text-gray-400">Manage organizational cost centers</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Failed') || msg.includes('required') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Create Cost Center</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Code *</label><input value={form.code} onChange={e => setField('code', e.target.value)} className={inp} placeholder="e.g. MKT-01" /></div>
          <div><label className={lbl}>Name *</label><input value={form.name} onChange={e => setField('name', e.target.value)} className={inp} placeholder="e.g. Marketing" /></div>
          <div><label className={lbl}>Department</label><input value={form.department} onChange={e => setField('department', e.target.value)} className={inp} placeholder="e.g. Sales & Marketing" /></div>
          <div>
            <label className={lbl}>Status</label>
            <select value={form.status} onChange={e => setField('status', e.target.value)} className={inp}>
              <option value="ACTIVE" className="text-black">Active</option>
              <option value="INACTIVE" className="text-black">Inactive</option>
            </select>
          </div>
          <div className="lg:col-span-4">
             <label className={lbl}>Description</label>
             <input value={form.description} onChange={e => setField('description', e.target.value)} className={inp} placeholder="Optional details..." />
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Save Cost Center
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-sm font-bold text-purple-300">Cost Center List</h3>
           <button onClick={fetchRecords} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><Search size={12}/> Refresh</button>
        </div>
        
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Code', 'Name', 'Department', 'Description', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No cost centers found.</td></tr>
                  : records.map((r, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{r.code}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.department}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.description}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${r.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {r.status}
                      </span>
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
