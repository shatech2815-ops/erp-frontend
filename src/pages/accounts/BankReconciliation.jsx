

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';

// const BASE_URL = '/api/accounting';
// const BANK_ACCOUNTS = ['HDFC — ****1234','ICICI — ****5678','SBI — ****9012','Axis — ****3456'];

import {
  createBankReconciliation,
  getAllBankReconciliations,
  deleteBankReconciliation,
  autoMatchBankTransactions
} from "../../services/account/bankReconciliation.services";

export default function BankReconciliation() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    bankAccount: '',
    startDate: '', endDate: '',
    openingBalance: '0.00',
    closingBalance: '0.00',
    bookBalance: '0.00',
    statementFile: null,
  });
  
  const [statementText, setStatementText] = useState("");
  const [matchResults, setMatchResults] = useState(null);

  const difference = (parseFloat(form.closingBalance)||0) - (parseFloat(form.bookBalance)||0);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const fetchRecords = async () => {
  //   setLoading(true);
  //   try { const res = await fetch(`${BASE_URL}/bank-reconciliation`); if (res.ok) { const d = await res.json(); setRecords(Array.isArray(d) ? d : []); } }
  //   catch {} finally { setLoading(false); }
  // };

  const fetchRecords = async () => {
  setLoading(true);

  try {
    const data = await getAllBankReconciliations();

    setRecords(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching reconciliation records:", error);
    setMsg("Failed to load reconciliation records.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchRecords(); }, []);

  // const handleSave = async () => {
  //   setSaving(true); setMsg('');
  //   try {
  //     const payload = {
  //       bankAccount: form.bankAccount,
  //       startDate: form.startDate || null,
  //       endDate: form.endDate || null,
  //       openingBalance: parseFloat(form.openingBalance) || 0,
  //       closingBalance: parseFloat(form.closingBalance) || 0,
  //       bookBalance: parseFloat(form.bookBalance) || 0,
  //       difference,
  //     };
  //     let res;
  //     if (form.statementFile) {
  //       const fd = new FormData();
  //       Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
  //       fd.append('statementFile', form.statementFile);
  //       res = await fetch(`${BASE_URL}/bank-reconciliation`, { method: 'POST', body: fd });
  //     } else {
  //       res = await fetch(`${BASE_URL}/bank-reconciliation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     }
  //     if (res.ok) { setMsg('Bank reconciliation saved!'); fetchRecords(); }
  //     else { setMsg('Error saving.'); }
  //   } catch { setMsg('Failed to save.'); } finally { setSaving(false); }
  // };

  const handleSave = async () => {
  setSaving(true);
  setMsg("");

  try {
    const payload = {
      bankAccount: form.bankAccount,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      openingBalance: parseFloat(form.openingBalance) || 0,
      closingBalance: parseFloat(form.closingBalance) || 0,
      bookBalance: parseFloat(form.bookBalance) || 0,
      difference,
    };

    let response;

    if (form.statementFile) {
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      formData.append("statementFile", form.statementFile);

      response = await createBankReconciliation(formData);
    } else {
      response = await createBankReconciliation(payload);
    }

    if (response) {
      setMsg("Bank reconciliation saved successfully!");

      setForm({
        bankAccount: "",
        startDate: "",
        endDate: "",
        openingBalance: "0.00",
        closingBalance: "0.00",
        bookBalance: "0.00",
        statementFile: null,
      });

      fetchRecords();
    }
  } catch (error) {
    console.error("Error saving bank reconciliation:", error);

    if (error.response?.data?.message) {
      setMsg(error.response.data.message);
    } else {
      setMsg("Failed to save reconciliation.");
    }
  } finally {
    setSaving(false);
  }
};

  const handleMatch = async () => {
    if (!form.bankAccount) {
      setMsg("Please select a bank account first (e.g. 1120).");
      return;
    }
    
    setLoading(true);
    try {
      // Parse CSV-like text (Format: Date,Amount,Description)
      const lines = statementText.split('\n').filter(l => l.trim().length > 0).map(l => {
        const parts = l.split(',');
        return { date: parts[0], amount: parts[1], description: parts[2] };
      });
      
      const payload = {
        accountCode: form.bankAccount,
        statementLines: lines
      };
      
      const response = await autoMatchBankTransactions(payload);
      setMatchResults(response);
      setMsg(`Matched ${response.matched} transactions. ${response.unmatched} unmatched.`);
    } catch (err) {
      setMsg("Auto-match failed.");
    } finally {
      setLoading(false);
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";


  
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Bank Reconciliation</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}><RefreshCw size={22} style={{ color: '#d97706' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Bank Reconciliation</h2><p className="text-sm text-gray-400">Match bank statement with book balances</p></div>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Error')||msg.includes('Failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Reconciliation Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Bank Account *</label><input value={form.bankAccount} onChange={e => setField('bankAccount', e.target.value)} className={inp} placeholder="e.g. HDFC — Account No" /></div>
          <div><label className={lbl}>Statement Start Date *</label><input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Statement End Date *</label><input type="date" value={form.endDate} onChange={e => setField('endDate', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Opening Balance (₹)</label><input type="number" value={form.openingBalance} onChange={e => setField('openingBalance', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Closing Balance (Bank Statement) (₹)</label><input type="number" value={form.closingBalance} onChange={e => setField('closingBalance', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Book Balance (₹)</label><input type="number" value={form.bookBalance} onChange={e => setField('bookBalance', e.target.value)} className={inp} /></div>
          <div>
            <label className={lbl}>Difference (₹)</label>
            <input value={difference.toFixed(2)} readOnly className={`${inp} ${Math.abs(difference) < 0.01 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'} cursor-not-allowed`} />
            {Math.abs(difference) < 0.01 && <p className="text-xs text-emerald-400 mt-1">✓ Balanced</p>}
          </div>
          <div>
            <label className={lbl}>Upload Bank Statement</label>
            <input type="file" accept=".pdf,.csv,.xlsx" onChange={e => setField('statementFile', e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-white/5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Save Reconciliation
          </button>
          <button onClick={fetchRecords} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-purple-300 hover:bg-white/10"><Search size={14} /> Load Records</button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Auto-Match Statement Lines</h3>
        <p className="text-xs text-gray-400 mb-3">Paste statement lines (Date,Amount,Description) eg: 2026-10-01,1500,Deposit</p>
        <textarea 
          value={statementText}
          onChange={e => setStatementText(e.target.value)}
          className={`${inp} h-24 mb-4`} 
          placeholder="2026-10-01,1500.00,Client Payment&#10;2026-10-05,-500.00,Vendor Payment"
        />
        <button onClick={handleMatch} disabled={loading} className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm bg-purple-600 hover:bg-purple-500">
           Run Auto-Match
        </button>
        
        {matchResults && (
          <div className="mt-4 border border-white/10 rounded-xl overflow-hidden">
             <table className="w-full text-sm">
                <thead><tr className="bg-purple-900/30">
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-white">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-white">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-white">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-white/10">
                  {matchResults.results.map((r, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-xs text-gray-300">{r.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">{r.description}</td>
                      <td className="px-4 py-3 text-xs text-right text-gray-300">{r.amount}</td>
                      <td className="px-4 py-3 text-xs text-center">
                        <span className={`px-2 py-1 rounded-md ${r.status === 'MATCHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
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

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10"><h3 className="text-sm font-bold text-purple-300">Reconciliation History</h3></div>
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#8b5cf6' }}>{['Bank Account','Period','Opening Balance','Closing Balance (Bank)','Book Balance','Difference'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No reconciliation records found.</td></tr>
                  : records.map((r, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{r.bankAccount}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.startDate} – {r.endDate}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(r.openingBalance||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(r.closingBalance||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(r.bookBalance||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: Math.abs(r.difference||0) < 0.01 ? '#059669' : '#dc2626' }}>₹{Number(r.difference||0).toFixed(2)}</td>
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