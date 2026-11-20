import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen, Plus, Trash2 } from 'lucide-react';
import { postJournalEntry } from '../../services/account/journal.services';

export default function JournalEntries() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
  });

  const [entries, setEntries] = useState([
    { accountId: '', type: 'DEBIT', amount: '' },
    { accountId: '', type: 'CREDIT', amount: '' }
  ]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  const addEntry = () => {
    setEntries([...entries, { accountId: '', type: 'DEBIT', amount: '' }]);
  };

  const updateEntry = (i, k, v) => {
    const copy = [...entries];
    copy[i][k] = v;
    setEntries(copy);
  };

  const removeEntry = (i) => {
    const copy = [...entries];
    copy.splice(i, 1);
    setEntries(copy);
  };

  const totalDebit = entries.filter(e => e.type === 'DEBIT').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalCredit = entries.filter(e => e.type === 'CREDIT').reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const handleSave = async () => {
    if (entries.length < 2) {
      setMsg("At least two entries are required.");
      return;
    }
    
    if (totalDebit !== totalCredit || totalDebit === 0) {
      setMsg("Total Debits must equal Total Credits, and must be greater than zero.");
      return;
    }

    if (entries.some(e => !e.accountId || !e.amount)) {
      setMsg("All lines must have an Account ID and an Amount.");
      return;
    }
    
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        ...form,
        entries: entries.map(e => ({
          accountId: parseInt(e.accountId),
          type: e.type,
          amount: parseFloat(e.amount)
        }))
      };
      await postJournalEntry(payload);
      setMsg("Manual Journal Entry posted successfully!");
      setForm({ transactionDate: new Date().toISOString().split('T')[0], reference: '', description: '' });
      setEntries([
        { accountId: '', type: 'DEBIT', amount: '' },
        { accountId: '', type: 'CREDIT', amount: '' }
      ]);
    } catch (error) {
      setMsg("Failed to post journal entry.");
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
        <span className="text-white font-semibold">Manual Journal Entry</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <BookOpen size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Post Journal Entry</h2>
          <p className="text-sm text-gray-400">Manually post multi-line debit/credit transactions to the GL</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Failed') || msg.includes('must') || msg.includes('required') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Header details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div><label className={lbl}>Transaction Date *</label><input type="date" value={form.transactionDate} onChange={e => setField('transactionDate', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Reference (e.g. JV-1029)</label><input value={form.reference} onChange={e => setField('reference', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Description / Narration</label><input value={form.description} onChange={e => setField('description', e.target.value)} className={inp} placeholder="Adjustment entry..." /></div>
        </div>

        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
          <h3 className="text-sm font-bold text-purple-300">Journal Lines</h3>
          <button onClick={addEntry} className="text-xs font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1 text-white border border-white/10"><Plus size={12}/> Add Line</button>
        </div>

        <div className="flex flex-col gap-3">
          {entries.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-end">
              <div>
                <label className={lbl}>Account ID *</label>
                <input value={e.accountId} onChange={ev => updateEntry(i, 'accountId', ev.target.value)} className={inp} placeholder="e.g. 5100" />
              </div>
              <div>
                <label className={lbl}>Type</label>
                <select value={e.type} onChange={ev => updateEntry(i, 'type', ev.target.value)} className={inp}>
                  <option value="DEBIT" className="text-black">DEBIT</option>
                  <option value="CREDIT" className="text-black">CREDIT</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Amount (₹) *</label>
                <input type="number" value={e.amount} onChange={ev => updateEntry(i, 'amount', ev.target.value)} className={inp} />
              </div>
              <button onClick={() => removeEntry(i)} className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/20 mb-0.5">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/5 flex justify-end gap-12 text-sm">
          <div className="text-right">
            <span className="text-gray-400 font-semibold mr-3">Total Debits:</span>
            <span className="text-white font-bold text-lg">₹{totalDebit.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 font-semibold mr-3">Total Credits:</span>
            <span className="text-white font-bold text-lg">₹{totalCredit.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Post Entry to Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
