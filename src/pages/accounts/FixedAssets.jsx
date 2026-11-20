import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, Briefcase, Calculator } from 'lucide-react';
import { createFixedAsset, getAllFixedAssets, runDepreciation } from '../../services/account/fixedAsset.services';

export default function FixedAssets() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [form, setForm] = useState({
    assetName: '',
    assetCode: '',
    purchaseCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    depreciationMethod: 'Straight_Line',
    usefulLifeYears: '5'
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getAllFixedAssets();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMsg("Failed to load fixed assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSave = async () => {
    if (!form.assetName || !form.assetCode || !form.purchaseCost) {
      setMsg("Name, Code, and Purchase Cost are required.");
      return;
    }
    
    setSaving(true);
    setMsg("");
    try {
      await createFixedAsset({
        ...form,
        purchaseCost: parseFloat(form.purchaseCost),
        usefulLifeYears: parseInt(form.usefulLifeYears)
      });
      setMsg("Fixed Asset registered successfully!");
      setForm({ assetName: '', assetCode: '', purchaseCost: '', purchaseDate: form.purchaseDate, depreciationMethod: 'Straight_Line', usefulLifeYears: '5' });
      fetchRecords();
    } catch (error) {
      setMsg("Failed to register fixed asset.");
    } finally {
      setSaving(false);
    }
  };

  const handleRunDepreciation = async (id) => {
    try {
      await runDepreciation(id);
      alert("Depreciation successfully calculated and posted to Ledger!");
      fetchRecords();
    } catch (error) {
      alert("Failed to run depreciation.");
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 text-white";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Fixed Assets</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Briefcase size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Fixed Assets Register</h2>
          <p className="text-sm text-gray-400">Track company assets and calculate depreciation</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Failed') || msg.includes('required') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Register New Asset</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className={lbl}>Asset Code *</label><input value={form.assetCode} onChange={e => setField('assetCode', e.target.value)} className={inp} placeholder="e.g. LAP-001" /></div>
          <div><label className={lbl}>Asset Name *</label><input value={form.assetName} onChange={e => setField('assetName', e.target.value)} className={inp} placeholder="e.g. MacBook Pro" /></div>
          <div><label className={lbl}>Purchase Date *</label><input type="date" value={form.purchaseDate} onChange={e => setField('purchaseDate', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Purchase Cost (₹) *</label><input type="number" value={form.purchaseCost} onChange={e => setField('purchaseCost', e.target.value)} className={inp} /></div>
          <div>
            <label className={lbl}>Depreciation Method</label>
            <select value={form.depreciationMethod} onChange={e => setField('depreciationMethod', e.target.value)} className={inp}>
              <option value="Straight_Line" className="text-black">Straight Line</option>
              <option value="Declining_Balance" className="text-black">Declining Balance</option>
            </select>
          </div>
          <div><label className={lbl}>Useful Life (Years)</label><input type="number" value={form.usefulLifeYears} onChange={e => setField('usefulLifeYears', e.target.value)} className={inp} /></div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Register Asset
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-sm font-bold text-purple-300">Asset Register</h3>
           <button onClick={fetchRecords} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><Search size={12}/> Refresh</button>
        </div>
        
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Code', 'Name', 'Purchase Date', 'Cost (₹)', 'Accumulated Dep. (₹)', 'Net Book Value (₹)', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No fixed assets found.</td></tr>
                  : records.map((r, i) => {
                  const nbv = (parseFloat(r.purchaseCost) - parseFloat(r.accumulatedDepreciation || 0)).toFixed(2);
                  return (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{r.assetCode}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.assetName}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.purchaseDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">₹{r.purchaseCost}</td>
                    <td className="px-4 py-3 text-xs text-amber-400 font-bold">₹{r.accumulatedDepreciation || 0}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">₹{nbv}</td>
                    <td className="px-4 py-3 text-xs">
                      <button onClick={() => handleRunDepreciation(r.id)} className="flex items-center gap-1 text-purple-400 hover:text-white" title="Run Monthly Depreciation">
                        <Calculator size={14} /> Depreciate
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
