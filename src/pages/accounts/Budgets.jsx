import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Plus, Search, BarChart } from 'lucide-react';
import { createBudget, getAllBudgets, getBudgetPerformance } from '../../services/account/budget.services';

export default function Budgets() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [form, setForm] = useState({
    financialYear: '2026-2027',
    department: '',
    costCenterId: '',
    allocatedAmount: '',
    accountId: '5100'
  });

  const [performance, setPerformance] = useState(null);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getAllBudgets();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMsg("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSave = async () => {
    if (!form.financialYear || !form.allocatedAmount) {
      setMsg("Year and Amount are required.");
      return;
    }
    
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        financialYear: form.financialYear,
        department: form.department,
        costCenterId: parseInt(form.costCenterId) || null,
        lines: [
          { accountId: parseInt(form.accountId), allocatedAmount: parseFloat(form.allocatedAmount) }
        ]
      };
      
      await createBudget(payload);
      setMsg("Budget created successfully!");
      setForm({ ...form, allocatedAmount: '' });
      fetchRecords();
    } catch (error) {
      setMsg("Failed to create budget.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewPerformance = async (budgetId) => {
    try {
      const res = await getBudgetPerformance(budgetId);
      setPerformance(res);
    } catch (e) {
      alert("Error calculating variance");
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Budget Management</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <TrendingUpIcon size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Budgets</h2>
          <p className="text-sm text-gray-400">Set targets and track actual vs budget variance</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Failed') || msg.includes('required') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Set New Budget</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div><label className={lbl}>Financial Year *</label><input value={form.financialYear} onChange={e => setField('financialYear', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Department</label><input value={form.department} onChange={e => setField('department', e.target.value)} className={inp} placeholder="e.g. Sales" /></div>
          <div><label className={lbl}>Account ID (Expense)</label><input value={form.accountId} onChange={e => setField('accountId', e.target.value)} className={inp} placeholder="e.g. 5100" /></div>
          <div><label className={lbl}>Total Amount (₹) *</label><input type="number" value={form.allocatedAmount} onChange={e => setField('allocatedAmount', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Status</label><input value="ACTIVE" readOnly className={`${inp} text-gray-500`} /></div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Save Budget
          </button>
        </div>
      </div>

      {performance && (
        <div className="bg-purple-900/20 rounded-2xl shadow-sm border border-purple-500/30 p-5 mb-4">
          <h3 className="text-sm font-bold text-amber-300 mb-2">Live Variance Analysis: Budget #{performance.budget.id}</h3>
          <div className="flex items-center gap-8 text-white">
            <div><p className="text-xs text-purple-300">Target Budget</p><p className="font-bold">₹{performance.budget.totalBudget}</p></div>
            <div><p className="text-xs text-purple-300">Actual (From GL)</p><p className="font-bold">₹{performance.budget.totalActual}</p></div>
            <div><p className="text-xs text-purple-300">Variance</p><p className={`font-bold ${performance.variance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>₹{performance.variance}</p></div>
            <div><p className="text-xs text-purple-300">Variance %</p><p className={`font-bold ${performance.variancePercentage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{performance.variancePercentage.toFixed(2)}%</p></div>
          </div>
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-sm font-bold text-purple-300">Active Budgets</h3>
           <button onClick={fetchRecords} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><Search size={12}/> Refresh</button>
        </div>
        
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['ID', 'Fin Year', 'Department', 'Total Budget (₹)', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No budgets found.</td></tr>
                  : records.map((r, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">#{r.id}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.financialYear}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.department}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">₹{r.totalBudget}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${r.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {r.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <button onClick={() => handleViewPerformance(r.id)} className="flex items-center gap-1 text-purple-400 hover:text-white">
                        <BarChart size={14} /> Calculate Variance
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

// Simple icon for header
const TrendingUpIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);
