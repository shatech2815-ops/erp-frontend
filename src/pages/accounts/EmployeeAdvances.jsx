import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, Users } from 'lucide-react';
import { createEmployeeAdvance, getAllEmployeeAdvances } from '../../services/account/employeeAdvance.services';

export default function EmployeeAdvances() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [form, setForm] = useState({
    employeeId: '',
    employeeName: '',
    requestDate: new Date().toISOString().split('T')[0],
    advanceAmount: ''
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getAllEmployeeAdvances();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading employee advances:", error);
      setMsg(error?.response?.data?.message || "Failed to load employee advances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSave = async () => {
    if (!form.employeeId || !form.employeeName || !form.advanceAmount) {
      setMsg("Employee ID, Name, and Amount are required.");
      return;
    }
    
    setSaving(true);
    setMsg("");
    try {
      await createEmployeeAdvance({
        ...form,
        advanceAmount: parseFloat(form.advanceAmount)
      });
      setMsg("Employee Advance created and posted successfully!");
      setForm({ employeeId: '', employeeName: '', requestDate: form.requestDate, advanceAmount: '' });
      await fetchRecords();
    } catch (error) {
      console.error("Error creating employee advance:", error);
      setMsg(error?.response?.data?.message || "Failed to create employee advance.");
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
        <span className="text-white font-semibold">Employee Advances</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Users size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Employee Advances</h2>
          <p className="text-sm text-gray-400">Manage salary advances and automatic GL deduction</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Failed') || msg.includes('required') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Request Advance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Employee ID *</label><input value={form.employeeId} onChange={e => setField('employeeId', e.target.value)} className={inp} placeholder="e.g. EMP-001" /></div>
          <div><label className={lbl}>Employee Name *</label><input value={form.employeeName} onChange={e => setField('employeeName', e.target.value)} className={inp} placeholder="e.g. John Doe" /></div>
          <div><label className={lbl}>Request Date *</label><input type="date" value={form.requestDate} onChange={e => setField('requestDate', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Advance Amount (₹) *</label><input type="number" value={form.advanceAmount} onChange={e => setField('advanceAmount', e.target.value)} className={inp} /></div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Approve & Post Advance
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-sm font-bold text-purple-300">Active Employee Advances</h3>
           <button onClick={fetchRecords} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><Search size={12}/> Refresh</button>
        </div>
        
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['ID', 'Emp ID', 'Name', 'Date', 'Amount (₹)', 'Used (₹)', 'Remaining (₹)', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No advances found.</td></tr>
                  : records.map((r, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">#{r.id}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.employeeId}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.employeeName}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.requestDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-300">₹{r.advanceAmount}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 font-bold">₹{r.usedAmount}</td>
                    <td className="px-4 py-3 text-xs font-bold text-purple-300">₹{r.remainingAmount}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${r.status === 'ACTIVE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {r.status || 'ACTIVE'}
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
