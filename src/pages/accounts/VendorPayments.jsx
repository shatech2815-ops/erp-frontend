
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ArrowUpCircle, Search, Download, Plus } from 'lucide-react';

import {
  createVendorPayment,
  getAllVendorPayments
} from "../../services/account/vendorPayment.services";


// const BASE_URL = '/api/accounting';
const PAYMENT_MODES = ['Cash','Cheque','Bank Transfer','UPI','NEFT','RTGS','IMPS'];
const BANK_ACCOUNTS = ['HDFC — ****1234','ICICI — ****5678','SBI — ****9012','Axis — ****3456'];
const TDS_SECTIONS = ['194A','194C','194D','194H','194I','194J','194Q','Not Applicable'];

export default function VendorPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchPay, setSearchPay]       = useState('');
const [filterPayMode, setFilterPayMode] = useState('ALL');
const [filterPayDate, setFilterPayDate] = useState('');
  const [form, setForm] = useState({
    paymentNo: '', paymentDate: '', vendor: '', billReference: '',
    billAmount: '', amountPending: '', amountPayingNow: '', balanceAfterPayment: '',
    paymentMode: 'Cash', paidFromAccount: 'HDFC — ****1234',
    transactionNumber: '', chequeDate: '',
    tdsDeducted: '0', tdsSection: 'Not Applicable',
    discountReceived: '0', netAmountPaid: '',
    attachProof: null, notes: '',
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const fetchPayments = async () => {
  //   setLoading(true);
  //   try { const res = await fetch(`${BASE_URL}/vendor-payments`); if (res.ok) { const d = await res.json(); setPayments(Array.isArray(d) ? d : []); } }
  //   catch {} finally { setLoading(false); }
  // };

  const fetchPayments = async () => {
  setLoading(true);

  try {
    const response = await getAllVendorPayments();

    const paymentList = Array.isArray(response)
      ? response
      : response?.data || [];

    setPayments(paymentList);
  } catch (error) {
    console.error("Error fetching vendor payments:", error);
    setPayments([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchPayments(); }, []);

  // const handleSave = async () => {
  //   setSaving(true); setMsg('');
  //   try {
  //     const payload = {
  //       paymentNo: form.paymentNo, paymentDate: form.paymentDate || null,
  //       vendor: form.vendor, billReference: form.billReference,
  //       billAmount: parseFloat(form.billAmount)||0, amountPending: parseFloat(form.amountPending)||0,
  //       amountPayingNow: parseFloat(form.amountPayingNow)||0, balanceAfterPayment: parseFloat(form.balanceAfterPayment)||0,
  //       paymentMode: form.paymentMode, paidFromAccount: form.paidFromAccount,
  //       transactionNumber: form.transactionNumber, chequeDate: form.chequeDate || null,
  //       tdsDeducted: parseFloat(form.tdsDeducted)||0, tdsSection: form.tdsSection,
  //       discountReceived: parseFloat(form.discountReceived)||0,
  //       netAmountPaid: parseFloat(form.netAmountPaid)||parseFloat(form.amountPayingNow)||0,
  //       notes: form.notes,
  //     };
  //     const res = await fetch(`${BASE_URL}/vendor-payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     if (res.ok) { setMsg('Vendor payment saved!'); setShowForm(false); fetchPayments(); }
  //     else { setMsg('Error saving.'); }
  //   } catch { setMsg('Failed.'); } finally { setSaving(false); }
  // };

  const handleSave = async () => {
    if (!form.paymentDate) {
      setMsg('Error: Please fill in Payment Date.');
      return;
    }
    if (!form.vendor?.trim()) {
      setMsg('Error: Please fill in Vendor.');
      return;
    }
    if (!form.amountPayingNow || parseFloat(form.amountPayingNow) <= 0 || isNaN(parseFloat(form.amountPayingNow))) {
      setMsg('Error: Please enter a valid Amount Paying Now.');
      return;
    }
    if (!form.paymentMode) {
      setMsg('Error: Please select Payment Mode.');
      return;
    }

    setSaving(true);
    setMsg('');

    try {
      const generatedPayNo = form.paymentNo || `VP-${String(1001 + payments.length)}`;
      const payload = {
        paymentNo: generatedPayNo,
        paymentDate: form.paymentDate || null,
        vendor: form.vendor.trim(),
        billReference: form.billReference,
        billAmount: parseFloat(form.billAmount) || 0,
        amountPending: parseFloat(form.amountPending) || 0,
        amountPayingNow: parseFloat(form.amountPayingNow) || 0,
        balanceAfterPayment: parseFloat(form.balanceAfterPayment) || 0,
        paymentMode: form.paymentMode,
        paidFromAccount: form.paidFromAccount,
        transactionNumber: form.transactionNumber,
        chequeDate: form.chequeDate || null,
        tdsDeducted: parseFloat(form.tdsDeducted) || 0,
        tdsSection: form.tdsSection,
        discountReceived: parseFloat(form.discountReceived) || 0,
        netAmountPaid:
          parseFloat(form.netAmountPaid) ||
          parseFloat(form.amountPayingNow) ||
          0,
        notes: form.notes,
      };

      await createVendorPayment(payload);

      setMsg('Vendor payment saved successfully!');
      setShowForm(false);
      setForm({
        paymentNo: '', paymentDate: '', vendor: '', billReference: '',
        billAmount: '', amountPending: '', amountPayingNow: '', balanceAfterPayment: '',
        paymentMode: 'Cash', paidFromAccount: 'HDFC — ****1234',
        transactionNumber: '', chequeDate: '',
        tdsDeducted: '0', tdsSection: 'Not Applicable',
        discountReceived: '0', netAmountPaid: '',
        attachProof: null, notes: '',
      });

      fetchPayments();
    } catch (error) {
      console.error("Error saving vendor payment:", error);
      setMsg('Failed to save vendor payment: ' + (error?.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const listToExport = filteredPayments.length > 0 ? filteredPayments : payments;
    if (!listToExport || listToExport.length === 0) {
      setMsg('Error: No payment history available to export.');
      return;
    }

    const headers = [
      'Payment No',
      'Payment Date',
      'Vendor',
      'Bill Reference',
      'Bill Amount',
      'Amount Paid',
      'Balance After Payment',
      'Payment Mode',
      'Paid From Account',
      'Transaction Number',
      'Cheque Date',
      'TDS Deducted',
      'TDS Section',
      'Discount Received',
      'Net Amount Paid',
      'Notes'
    ];

    const csvRows = [
      headers.join(','),
      ...listToExport.map(p => [
        `"${(p.paymentNo || '').replace(/"/g, '""')}"`,
        `"${(p.paymentDate || '').replace(/"/g, '""')}"`,
        `"${(p.vendor || '').replace(/"/g, '""')}"`,
        `"${(p.billReference || '').replace(/"/g, '""')}"`,
        p.billAmount || 0,
        p.amountPayingNow || 0,
        p.balanceAfterPayment || 0,
        `"${(p.paymentMode || '').replace(/"/g, '""')}"`,
        `"${(p.paidFromAccount || '').replace(/"/g, '""')}"`,
        `"${(p.transactionNumber || '').replace(/"/g, '""')}"`,
        `"${(p.chequeDate || '').replace(/"/g, '""')}"`,
        p.tdsDeducted || 0,
        `"${(p.tdsSection || '').replace(/"/g, '""')}"`,
        p.discountReceived || 0,
        p.netAmountPaid || 0,
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vendor_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredPayments = payments.filter(p => {
    const matchQ    = !searchPay || (p.paymentNo || '').toLowerCase().includes(searchPay.toLowerCase()) || (p.vendor || '').toLowerCase().includes(searchPay.toLowerCase());
    const matchMode = filterPayMode === 'ALL' || p.paymentMode === filterPayMode;
    const matchDate = !filterPayDate || (p.paymentDate || '').startsWith(filterPayDate);
    return matchQ && matchMode && matchDate;
  });

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Vendor Payments</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}><ArrowUpCircle size={22} style={{ color: '#d97706' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Vendor Payments</h2><p className="text-sm text-gray-400">Record payments made to vendors against bills</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}><Plus size={14} /> New Payment</button>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.toLowerCase().includes('error')||msg.toLowerCase().includes('failed')||msg.toLowerCase().includes('please') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      {showForm && (
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
          <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">New Vendor Payment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className={lbl}>Payment No</label><input value={form.paymentNo} onChange={e => setField('paymentNo', e.target.value)} className={inp} placeholder="VP-0001 (auto)" /></div>
            <div><label className={lbl}>Payment Date *</label><input type="date" value={form.paymentDate} onChange={e => setField('paymentDate', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Vendor *</label><input value={form.vendor} onChange={e => setField('vendor', e.target.value)} className={inp} placeholder="Vendor name" /></div>
            <div><label className={lbl}>Bill Reference</label><input value={form.billReference} onChange={e => setField('billReference', e.target.value)} className={inp} placeholder="BILL-XXXX" /></div>
            <div><label className={lbl}>Bill Amount (₹)</label><input type="number" value={form.billAmount} onChange={e => setField('billAmount', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Amount Pending (₹)</label><input type="number" value={form.amountPending} onChange={e => setField('amountPending', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Amount Paying Now (₹) *</label><input type="number" value={form.amountPayingNow} onChange={e => setField('amountPayingNow', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Balance After Payment (₹)</label><input type="number" value={form.balanceAfterPayment} onChange={e => setField('balanceAfterPayment', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Payment Mode *</label><select value={form.paymentMode} onChange={e => setField('paymentMode', e.target.value)} className={inp}>{PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}</select></div>
            <div><label className={lbl}>Paid From Account</label><select value={form.paidFromAccount} onChange={e => setField('paidFromAccount', e.target.value)} className={inp}>{BANK_ACCOUNTS.map(b => <option key={b}>{b}</option>)}</select></div>
            <div><label className={lbl}>Transaction / Cheque No</label><input value={form.transactionNumber} onChange={e => setField('transactionNumber', e.target.value)} className={inp} placeholder="UTR / Cheque no" /></div>
            <div><label className={lbl}>Cheque Date</label><input type="date" value={form.chequeDate} onChange={e => setField('chequeDate', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>TDS Deducted (₹)</label><input type="number" value={form.tdsDeducted} onChange={e => setField('tdsDeducted', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>TDS Section</label><select value={form.tdsSection} onChange={e => setField('tdsSection', e.target.value)} className={inp}>{TDS_SECTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className={lbl}>Discount Received (₹)</label><input type="number" value={form.discountReceived} onChange={e => setField('discountReceived', e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Net Amount Paid (₹)</label><input type="number" value={form.netAmountPaid} onChange={e => setField('netAmountPaid', e.target.value)} className={inp} /></div>
            <div className="sm:col-span-2"><label className={lbl}>Notes</label><input value={form.notes} onChange={e => setField('notes', e.target.value)} className={inp} placeholder="Payment remarks" /></div>
            <div>
              <label className={lbl}>Attach Proof</label>
              <input type="file" accept=".pdf,.jpg,.png" onChange={e => setField('attachProof', e.target.files[0])}
                className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-white/5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Save Payment
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/10">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-purple-300">Payment History</h3>
            <div className="flex gap-2">
              <button onClick={fetchPayments} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-purple-300 hover:bg-white/10"><Search size={12} /> Refresh</button>
              <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-purple-300 hover:bg-white/10"><Download size={12} /> Export</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchPay} onChange={e => setSearchPay(e.target.value)} placeholder="Search payment no / vendor…"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5" />
            </div>
            <select value={filterPayMode} onChange={e => setFilterPayMode(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none bg-white/5 text-white">
              <option value="ALL">All Modes</option>
              {['Cash','Cheque','Bank Transfer','UPI','NEFT','RTGS'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="month" value={filterPayDate} onChange={e => setFilterPayDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none bg-white/5 text-white" />
            {(searchPay || filterPayMode !== 'ALL' || filterPayDate) &&
              <button onClick={() => { setSearchPay(''); setFilterPayMode('ALL'); setFilterPayDate(''); }}
                className="px-3 py-2 rounded-xl border border-white/10 text-xs text-red-400 hover:bg-red-500/10">Clear</button>}
          </div>
        </div>
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#8b5cf6' }}>{['Payment No','Date','Vendor','Bill Ref','Bill Amount','Amount Paid','Balance','Mode','TDS','Net Paid'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/10">
                {filteredPayments.length === 0 ? <tr><td colSpan={10} className="text-center py-12 text-gray-400">No vendor payments found.</td></tr>
                 : filteredPayments.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{p.paymentNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-xs">{p.vendor}</td>
                    <td className="px-4 py-3 text-xs text-purple-300">{p.billReference}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(p.billAmount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-semibold">₹{Number(p.amountPayingNow||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(p.balanceAfterPayment||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">{p.paymentMode}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(p.tdsDeducted||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#059669]">₹{Number(p.netAmountPaid||0).toLocaleString('en-IN')}</td>
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