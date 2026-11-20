import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Landmark, Plus, Trash2 } from 'lucide-react';

// const BASE_URL = '/api/accounting';
import {
  createPaymentMode,
  getAllPaymentModes,
  deletePaymentMode,
} from "../../services/account/paymentMode.services";
const MODE_TYPES = ['Cash','Bank','UPI','Cheque','Card','Wallet','Other'];

export default function PaymentModes() {
  const navigate = useNavigate();
  const [modes, setModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    modeName: '', type: 'Cash', bankName: '', accountHolderName: '',
    accountNumber: '', ifscCode: '', upiId: '', isDefault: 'No',
    glAccount: '', status: 'Active', notes: '',
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const fetchModes = async () => {
  //   setLoading(true);
  //   try { const res = await fetch(`${BASE_URL}/payment-modes`); if (res.ok) { const d = await res.json(); setModes(Array.isArray(d) ? d : []); } }
  //   catch {} finally { setLoading(false); }
  // };

  const fetchModes = async () => {
  setLoading(true);

  try {
    const data = await getAllPaymentModes();

    console.log("Payment Modes Response:", data);

    setModes(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching payment modes:", error);
    setModes([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchModes(); }, []);

  // const handleSave = async () => {
  //   setSaving(true); setMsg('');
  //   try {
  //     const res = await fetch(`${BASE_URL}/payment-modes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
  //     if (res.ok) { setMsg('Payment mode saved!'); fetchModes(); setForm({ modeName: '', type: 'Cash', bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '', isDefault: 'No', glAccount: '', status: 'Active', notes: '' }); }
  //     else { setMsg('Error saving.'); }
  //   } catch { setMsg('Failed.'); } finally { setSaving(false); }
  // };

  const handleSave = async () => {
  setSaving(true);
  setMsg("");

  try {
    const payload = {
      modeName: form.modeName,
      type: form.type,
      bankName: form.bankName,
      accountHolderName: form.accountHolderName,
      accountNumber: form.accountNumber,
      ifscCode: form.ifscCode,
      upiId: form.upiId,
      isDefault: form.isDefault,
      glAccount: form.glAccount,
      status: form.status,
      notes: form.notes,
    };

    const response = await createPaymentMode(payload);

    console.log("Payment Mode Saved:", response);

    setMsg("Payment mode saved successfully!");

    fetchModes();

    setForm({
      modeName: "",
      type: "Cash",
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      isDefault: "No",
      glAccount: "",
      status: "Active",
      notes: "",
    });
  } catch (error) {
    console.error("Error saving payment mode:", error);

    setMsg(
      error?.response?.data?.message ||
      "Failed to save payment mode."
    );
  } finally {
    setSaving(false);
  }
};

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Payment Modes</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}><Landmark size={22} style={{ color: '#d97706' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Payment Modes</h2><p className="text-sm text-gray-400">Manage bank accounts and payment methods</p></div>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Error')||msg.includes('Failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10"><Plus size={14} className="inline mr-1" />Add Payment Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Mode Name *</label><input value={form.modeName} onChange={e => setField('modeName', e.target.value)} className={inp} placeholder="e.g. HDFC Current Account" /></div>
          <div><label className={lbl}>Type *</label><select value={form.type} onChange={e => setField('type', e.target.value)} className={inp}>{MODE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className={lbl}>Bank Name</label><input value={form.bankName} onChange={e => setField('bankName', e.target.value)} className={inp} placeholder="HDFC Bank" /></div>
          <div><label className={lbl}>Account Holder Name</label><input value={form.accountHolderName} onChange={e => setField('accountHolderName', e.target.value)} className={inp} placeholder="Account holder" /></div>
          <div><label className={lbl}>Account Number</label><input value={form.accountNumber} onChange={e => setField('accountNumber', e.target.value)} className={inp} placeholder="Account number" /></div>
          <div><label className={lbl}>IFSC Code</label><input value={form.ifscCode} onChange={e => setField('ifscCode', e.target.value)} className={inp} placeholder="HDFC0001234" /></div>
          <div><label className={lbl}>UPI ID</label><input value={form.upiId} onChange={e => setField('upiId', e.target.value)} className={inp} placeholder="business@upi" /></div>
          <div><label className={lbl}>Is Default</label><select value={form.isDefault} onChange={e => setField('isDefault', e.target.value)} className={inp}>{['Yes','No'].map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label className={lbl}>GL Account</label><input value={form.glAccount} onChange={e => setField('glAccount', e.target.value)} className={inp} placeholder="GL account code" /></div>
          <div><label className={lbl}>Status</label><select value={form.status} onChange={e => setField('status', e.target.value)} className={inp}>{['Active','Inactive'].map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="sm:col-span-2"><label className={lbl}>Notes</label><input value={form.notes} onChange={e => setField('notes', e.target.value)} className={inp} placeholder="Additional notes" /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={14} />} Save Mode
        </button>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10"><h3 className="text-sm font-bold text-purple-300">Configured Payment Modes</h3></div>
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#8b5cf6' }}>{['Mode Name','Type','Bank','Account No','IFSC','UPI ID','Default','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/10">
                {modes.length === 0 ? <tr><td colSpan={9} className="text-center py-12 text-gray-400">No payment modes configured.</td></tr>
                  : modes.map((m, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{m.modeName}</td>
                    <td className="px-4 py-3 text-xs">{m.type}</td>
                    <td className="px-4 py-3 text-xs">{m.bankName}</td>
                    <td className="px-4 py-3 text-xs">{m.accountNumber}</td>
                    <td className="px-4 py-3 text-xs">{m.ifscCode}</td>
                    <td className="px-4 py-3 text-xs">{m.upiId}</td>
                    <td className="px-4 py-3 text-xs">{m.isDefault}</td>
                    <td className="px-4 py-3 text-xs"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.status==='Active' ? 'bg-green-100 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>{m.status}</span></td>
                    {/* <td className="px-4 py-3 text-xs"><button className="text-red-400 hover:text-red-400"><Trash2 size={13} /></button></td> */}
                    <td className="px-4 py-3 text-xs">
                        <button
                          onClick={async () => {
                            try {
                              await deletePaymentMode(m.id);
                              setMsg("Payment mode deleted successfully!");
                              fetchModes();
                            } catch (error) {
                              console.error("Delete payment mode error:", error);
                              setMsg("Failed to delete payment mode.");
                            }
                          }}
                          className="text-red-400 hover:text-red-400"
                        >
                          <Trash2 size={13} />
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
