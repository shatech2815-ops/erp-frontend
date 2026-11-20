import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createExpense } from "../../services/account/expense.services";
// const BASE_URL = '/api/accounting';
const GST_TYPES = ['CGST+SGST','IGST','Exempt','Nil Rated','Not Applicable'];
const PAYMENT_MODES = ['Cash','Cheque','Bank Transfer','UPI','NEFT','RTGS','IMPS','Credit Card','Debit Card'];
// const BANK_ACCOUNTS = ['HDFC — ****1234','ICICI — ****5678','SBI — ****9012','Axis — ****3456'];
const BILLABLE_OPTIONS = ['Yes','No'];
const ITC_OPTIONS = ['Yes','No','Partial'];

export default function AddExpense() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    expenseNo: '',
    expenseDate: '',
    category: '',
    subCategory: '',
    description: '',
    vendor: '',
    amount: '',
    gstType: 'CGST+SGST',
    gstAmount: '',
    totalAmount: '',
    itcEligible: 'Yes',
    hsnSac: '',
    paymentMode: 'Cash',
    bankAccount: 'HDFC — ****1234',
    referenceNo: '',
    project: '',
    billable: 'No',
    customer: '',
    attachBill: null,
    notes: '',
  });

  const setField = (k, v) => {
    setForm(p => {
      const updated = { ...p, [k]: v };
      if (k === 'amount' || k === 'gstAmount') {
        const amt = parseFloat(k === 'amount' ? v : updated.amount) || 0;
        const gst = parseFloat(k === 'gstAmount' ? v : updated.gstAmount) || 0;
        updated.totalAmount = (amt + gst).toFixed(2);
      }
      return updated;
    });
  };

  // const handleSave = async () => {
  //   setSaving(true); setMsg('');
  //   try {
  //     const payload = {
  //       expenseNo: form.expenseNo,
  //       expenseDate: form.expenseDate || null,
  //       category: form.category,
  //       subCategory: form.subCategory,
  //       description: form.description,
  //       vendor: form.vendor,
  //       amount: parseFloat(form.amount) || 0,
  //       gstType: form.gstType,
  //       gstAmount: parseFloat(form.gstAmount) || 0,
  //       totalAmount: parseFloat(form.totalAmount) || 0,
  //       itcEligible: form.itcEligible,
  //       hsnSac: form.hsnSac,
  //       paymentMode: form.paymentMode,
  //       bankAccount: form.bankAccount,
  //       referenceNo: form.referenceNo,
  //       project: form.project,
  //       billable: form.billable,
  //       customer: form.customer,
  //       notes: form.notes,
  //     };
  //     const res = await fetch(`${BASE_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     if (res.ok) { setMsg('Expense saved successfully!'); setTimeout(() => navigate('/dashboard/accounts/expenses/list'), 1000); }
  //     else { setMsg('Error saving expense.'); }
  //   } catch { setMsg('Failed to save.'); } finally { setSaving(false); }
  // };

  const handleSave = async () => {
    if (!form.expenseDate) {
      setMsg("Please enter Expense Date.");
      return;
    }
    if (!form.category?.trim()) {
      setMsg("Please enter Category.");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0 || isNaN(parseFloat(form.amount))) {
      setMsg("Please enter a valid Amount greater than 0.");
      return;
    }
    if (!form.paymentMode) {
      setMsg("Please select Payment Mode.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      const generatedExpNo = form.expenseNo || `EXP-${Date.now().toString().slice(-6)}`;
      const payload = {
        expenseNo: generatedExpNo,
        expenseDate: form.expenseDate || null,
        category: form.category.trim(),
        subCategory: form.subCategory,
        description: form.description,
        vendor: form.vendor,
        amount: parseFloat(form.amount) || 0,
        gstType: form.gstType,
        gstAmount: parseFloat(form.gstAmount) || 0,
        totalAmount: parseFloat(form.totalAmount) || parseFloat(form.amount) || 0,
        itcEligible: form.itcEligible,
        hsnSac: form.hsnSac,
        paymentMode: form.paymentMode,
        bankAccount: form.bankAccount,
        referenceNo: form.referenceNo,
        project: form.project,
        billable: form.billable,
        customer: form.customer,
        notes: form.notes,
      };

      await createExpense(payload);

      setMsg("Expense saved successfully!");

      setTimeout(() => {
        navigate("/dashboard/accounts/expenses/list");
      }, 1000);
    } catch (error) {
      console.error("Save expense error:", error);

      if (error.response?.data?.message) {
        setMsg(error.response.data.message);
      } else {
        setMsg("Failed to save expense.");
      }
    } finally {
      setSaving(false);
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

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
        <span className="text-white font-semibold">Add Expense</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/accounts/expenses')} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}><PlusCircle size={22} style={{ color: '#dc2626' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Add Expense</h2><p className="text-sm text-gray-400">Record a new business expense</p></div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
          msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please') || msg.toLowerCase().includes('validation')
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please') || msg.toLowerCase().includes('validation') ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {msg}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Expense Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Expense No</label><input value={form.expenseNo} onChange={e => setField('expenseNo', e.target.value)} className={inp} placeholder="EXP-0001 (auto)" /></div>
          <div><label className={lbl}>Expense Date *</label><input type="date" value={form.expenseDate} onChange={e => setField('expenseDate', e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Category *</label><input value={form.category} onChange={e => setField('category', e.target.value)} className={inp} placeholder="e.g. Office Supplies, Travel" /></div>
          <div><label className={lbl}>Sub Category</label><input value={form.subCategory} onChange={e => setField('subCategory', e.target.value)} className={inp} placeholder="Sub-category" /></div>
          <div className="sm:col-span-2"><label className={lbl}>Description</label><input value={form.description} onChange={e => setField('description', e.target.value)} className={inp} placeholder="Brief description of expense" /></div>
          <div><label className={lbl}>Vendor</label><input value={form.vendor} onChange={e => setField('vendor', e.target.value)} className={inp} placeholder="Vendor name" /></div>
          <div><label className={lbl}>HSN / SAC Code</label><input value={form.hsnSac} onChange={e => setField('hsnSac', e.target.value)} className={inp} placeholder="HSN or SAC code" /></div>
        </div>
      </div>

      {/* Amount & GST */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Amount &amp; GST</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setField('amount', e.target.value)} className={inp} placeholder="0.00" /></div>
          <div><label className={lbl}>GST Type</label><select value={form.gstType} onChange={e => setField('gstType', e.target.value)} className={inp}>{GST_TYPES.map(g => <option key={g}>{g}</option>)}</select></div>
          <div><label className={lbl}>GST Amount (₹)</label><input type="number" value={form.gstAmount} onChange={e => setField('gstAmount', e.target.value)} className={inp} placeholder="0.00" /></div>
          <div><label className={lbl}>Total Amount (₹)</label><input type="number" value={form.totalAmount} readOnly className={inp + ' bg-gray-100 cursor-not-allowed'} /></div>
          <div><label className={lbl}>ITC Eligible</label><select value={form.itcEligible} onChange={e => setField('itcEligible', e.target.value)} className={inp}>{ITC_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></div>
        </div>
      </div>

      {/* Payment & Other */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Payment &amp; Additional Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Payment Mode *</label><select value={form.paymentMode} onChange={e => setField('paymentMode', e.target.value)} className={inp}>{PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label className={lbl}>Bank Account</label><input value={form.bankAccount} onChange={e => setField('bankAccount', e.target.value)} className={inp} placeholder="e.g. HDFC — **1234" /></div>
          <div><label className={lbl}>Reference No</label><input value={form.referenceNo} onChange={e => setField('referenceNo', e.target.value)} className={inp} placeholder="Cheque / transaction ref" /></div>
          <div><label className={lbl}>Project / Cost Center</label><input value={form.project} onChange={e => setField('project', e.target.value)} className={inp} placeholder="Project name" /></div>
          <div><label className={lbl}>Billable to Customer</label><select value={form.billable} onChange={e => setField('billable', e.target.value)} className={inp}>{BILLABLE_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></div>
          {form.billable === 'Yes' && <div><label className={lbl}>Customer Name</label><input value={form.customer} onChange={e => setField('customer', e.target.value)} className={inp} placeholder="Customer to bill" /></div>}
          <div>
            <label className={lbl}>Attach Bill</label>
            <input type="file" accept=".pdf,.jpg,.png" onChange={e => setField('attachBill', e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-white/5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold" />
          </div>
          <div className="sm:col-span-2"><label className={lbl}>Notes</label><textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={2} className={inp + ' resize-none'} placeholder="Additional notes" /></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Save Expense
        </button>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/10">Cancel</button>
      </div>
    </div>
  );
}
