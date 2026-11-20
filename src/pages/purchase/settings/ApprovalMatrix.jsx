import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldCheck, ChevronRight, AlertCircle, Plus, CheckCircle } from 'lucide-react';

const INITIAL_FORM = {
  department: '',
  costCenter: '',
  amountFrom: '',
  amountTo: '',
  approverRole: '',
  approvalLevel: 1,
  isSequential: false,
  isParallel: false,
  escalationTimeInHours: '',
  autoApproval: false,
  isActive: true,
};

const ApprovalMatrix = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddRule = () => {
    setRules([...rules, { ...form, id: Date.now() }]);
    setForm(INITIAL_FORM);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-[#140f2d]/80 text-white placeholder-gray-500 transition-colors";
  
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/settings')} className="hover:text-purple-300 transition-colors">Settings</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Approval Matrix</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <ShieldCheck size={22} style={{ color: '#7c3aed' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Approval Matrix</h2>
          <p className="text-sm text-gray-400">Configure purchase requisition and order approval workflows</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl mb-5 text-sm font-medium">
          <CheckCircle size={16} /> Rule added successfully!
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6 mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 pb-2 border-b border-white/10">Add New Approval Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Department</label>
            <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Production" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Cost Center</label>
            <input name="costCenter" value={form.costCenter} onChange={handleChange} placeholder="e.g. CC-1001" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Approver Role <span className="text-red-400">*</span></label>
            <input name="approverRole" value={form.approverRole} onChange={handleChange} placeholder="e.g. Department Manager" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Amount From (₹)</label>
            <input type="number" name="amountFrom" value={form.amountFrom} onChange={handleChange} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Amount To (₹)</label>
            <input type="number" name="amountTo" value={form.amountTo} onChange={handleChange} placeholder="100000.00" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Approval Level</label>
            <input type="number" name="approvalLevel" value={form.approvalLevel} onChange={handleChange} placeholder="1" className={inputCls} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input type="checkbox" name="isSequential" checked={form.isSequential} onChange={handleChange} className="w-4 h-4 accent-purple-600 rounded" />
            Sequential Approval
          </label>
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input type="checkbox" name="isParallel" checked={form.isParallel} onChange={handleChange} className="w-4 h-4 accent-purple-600 rounded" />
            Parallel Approval
          </label>
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input type="checkbox" name="autoApproval" checked={form.autoApproval} onChange={handleChange} className="w-4 h-4 accent-purple-600 rounded" />
            Auto Approval
          </label>
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-purple-600 rounded" />
            Active
          </label>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-purple-300 mb-1.5">Escalation Time (Hours)</label>
            <input type="number" name="escalationTimeInHours" value={form.escalationTimeInHours} onChange={handleChange} placeholder="e.g. 24" className={inputCls} />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleAddRule} disabled={!form.approverRole}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">
            <Plus size={16} /> Add Approval Rule
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Level</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Dept / Cost Center</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Amount Range</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rules.map(r => (
              <tr key={r.id} className="text-white hover:bg-white/5">
                <td className="px-4 py-3 font-semibold">{r.approvalLevel}</td>
                <td className="px-4 py-3">{r.approverRole}</td>
                <td className="px-4 py-3 text-gray-400">{r.department || 'All'} / {r.costCenter || 'All'}</td>
                <td className="px-4 py-3 text-emerald-400">₹{r.amountFrom || '0'} - ₹{r.amountTo || '∞'}</td>
                <td className="px-4 py-3 text-gray-300 text-xs">
                  {r.isSequential ? 'Sequential' : r.isParallel ? 'Parallel' : r.autoApproval ? 'Auto' : 'Standard'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No approval rules configured yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ApprovalMatrix;