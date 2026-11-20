import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Send, CheckCircle2, AlertCircle, FileText, User } from 'lucide-react';

import { createPayment } from "../../services/account/payment.services";
import { getAllVendors } from "../../services/vendor/vendor.services";
import { getAllVendorInvoices } from "../../services/account/vendorInvoice.services";
import api from "../../interceptors/interceptors";

const PAYMENT_TYPES = ['OUTGOING', 'INCOMING'];
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'NEFT', 'RTGS', 'IMPS', 'Card'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];
const TDS_SECTIONS = ['194A', '194C', '194D', '194H', '194I', '194J', '194Q', '206C'];

export default function MakePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryBillNo = searchParams.get('billNo') || '';

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Dropdown Master Data
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendorInvoices, setVendorInvoices] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);

  const [form, setForm] = useState({
    referenceNo: `PAY-${Date.now().toString().slice(-5)}`,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'OUTGOING',
    status: 'COMPLETED',
    partyName: '',
    invoiceReference: queryBillNo,
    amount: '',
    currency: 'INR',
    paymentMode: 'Bank Transfer',
    bankAccount: '',
    transactionNumber: '',
    chequeDate: '',
    tdsApplicable: 'No',
    tdsSection: '',
    tdsAmount: '0.00',
    netAmount: '',
    attachment: null,
    notes: '',
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    // 1. Vendors
    getAllVendors()
      .then(res => setVendors(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setVendors([]));

    // 2. Clients
    api.get('/clients')
      .then(res => setClients(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => setClients([]));

    // 3. Vendor Invoices (Bills)
    getAllVendorInvoices()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        setVendorInvoices(list);
        if (queryBillNo) {
          const matched = list.find(b => b.billNo === queryBillNo);
          if (matched) {
            handleBillSelect(matched);
          }
        }
      })
      .catch(() => setVendorInvoices([]));

    // 4. Sales Invoices
    api.get('/invoices/get-all-invoices')
      .then(res => setSalesInvoices(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .catch(() => setSalesInvoices([]));
  };

  // When a Vendor Bill is selected
  const handleBillSelect = (bill) => {
    if (!bill) return;
    const net = Number(bill.netPayable || bill.subtotal || 0);
    setForm(prev => ({
      ...prev,
      invoiceReference: bill.billNo,
      partyName: bill.vendor || prev.partyName,
      amount: String(net),
      netAmount: String(net),
      tdsAmount: '0.00'
    }));
  };

  // When a Sales Invoice is selected
  const handleSalesInvoiceSelect = (inv) => {
    if (!inv) return;
    const net = Number(inv.totalAmount || inv.grandTotal || inv.netAmount || 0);
    const party = inv.clientName || inv.customerName || inv.client || '';
    setForm(prev => ({
      ...prev,
      invoiceReference: inv.invoiceNumber || `INV-${inv.id}`,
      partyName: party || prev.partyName,
      amount: String(net),
      netAmount: String(net),
      tdsAmount: '0.00'
    }));
  };

  // Recalculate Net Amount when Amount or TDS changes
  const handleAmountChange = (amtVal) => {
    const amt = parseFloat(amtVal) || 0;
    const tds = parseFloat(form.tdsAmount) || 0;
    const net = Math.max(0, amt - tds);
    setForm(prev => ({
      ...prev,
      amount: amtVal,
      netAmount: String(net)
    }));
  };

  const handleTdsChange = (tdsVal) => {
    const amt = parseFloat(form.amount) || 0;
    const tds = parseFloat(tdsVal) || 0;
    const net = Math.max(0, amt - tds);
    setForm(prev => ({
      ...prev,
      tdsAmount: tdsVal,
      netAmount: String(net)
    }));
  };

  const handleSave = async () => {
    if (!form.paymentDate || !form.partyName || !form.amount) {
      setMsg("Please fill all required fields (Payment Date, Party Name, and Amount).");
      return;
    }
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        referenceNo: form.referenceNo,
        paymentDate: form.paymentDate || null,
        paymentType: form.paymentType,
        status: form.status,
        partyName: form.partyName,
        invoiceReference: form.invoiceReference,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        paymentMode: form.paymentMode,
        bankAccount: form.bankAccount,
        transactionNumber: form.transactionNumber,
        chequeDate: form.chequeDate || null,
        tdsApplicable: form.tdsApplicable,
        tdsSection: form.tdsSection,
        tdsAmount: parseFloat(form.tdsAmount) || 0,
        netAmount: parseFloat(form.netAmount) || parseFloat(form.amount) || 0,
        notes: form.notes,
      };

      let response;
      if (form.attachment) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        formData.append("attachment", form.attachment);
        response = await createPayment(formData);
      } else {
        response = await createPayment(payload);
      }

      if (response) {
        setMsg("Payment recorded successfully! General Ledger updated.");
        setTimeout(() => {
          navigate("/dashboard/accounts/payments/list");
        }, 1200);
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      if (error.response?.data?.message) {
        setMsg(error.response.data.message);
      } else {
        setMsg("Failed to save payment.");
      }
    } finally {
      setSaving(false);
    }
  };

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[#1b1638] text-white";

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/accounts/payments/list')} className="hover:text-amber-300">Payment List</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Make Payment</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Send size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Make Payment</h2>
          <p className="text-sm text-gray-400">Record outgoing vendor payment or incoming client collection</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
          msg.includes('Error') || msg.includes('Failed') 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msg.includes('Error') || msg.includes('Failed') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {msg}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6 mb-6">
        <h3 className="text-sm font-bold text-purple-300 mb-5 pb-3 border-b border-white/10 flex items-center justify-between">
          <span>Payment Details</span>
          <span className="text-xs font-normal text-gray-400">Auto-fills amount & party when invoice is linked</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Reference No */}
          <div>
            <label className={lbl}>Reference No <span className="text-red-400">*</span></label>
            <input value={form.referenceNo} onChange={e => setField('referenceNo', e.target.value)} className={inp} placeholder="PAY-0001 (auto)" />
          </div>

          {/* Payment Date */}
          <div>
            <label className={lbl}>Payment Date <span className="text-red-400">*</span></label>
            <input type="date" value={form.paymentDate} onChange={e => setField('paymentDate', e.target.value)} className={inp} />
          </div>

          {/* Payment Type */}
          <div>
            <label className={lbl}>Payment Type <span className="text-red-400">*</span></label>
            <select 
              value={form.paymentType} 
              onChange={e => {
                setField('paymentType', e.target.value);
                setField('partyName', '');
                setField('invoiceReference', '');
              }} 
              className={inp}
            >
              {PAYMENT_TYPES.map(t => (
                <option key={t} value={t} className="bg-[#140f2d] text-white">
                  {t === 'OUTGOING' ? 'OUTGOING (Pay to Vendor)' : 'INCOMING (Receive from Client)'}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className={lbl}>Status</label>
            <select value={form.status} onChange={e => setField('status', e.target.value)} className={inp}>
              {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="bg-[#140f2d] text-white">{s}</option>)}
            </select>
          </div>

          {/* Invoice Reference / Bill Picker */}
          <div>
            <label className={lbl}>
              {form.paymentType === 'OUTGOING' ? 'Link Vendor Bill' : 'Link Customer Invoice'}
            </label>
            {form.paymentType === 'OUTGOING' ? (
              <select 
                value={form.invoiceReference} 
                onChange={e => {
                  const bill = vendorInvoices.find(b => b.billNo === e.target.value);
                  if (bill) handleBillSelect(bill);
                  else setField('invoiceReference', e.target.value);
                }} 
                className={inp}
              >
                <option value="">-- Choose Vendor Bill --</option>
                {vendorInvoices.map(b => (
                  <option key={b.id} value={b.billNo} className="bg-[#140f2d] text-white">
                    {b.billNo} - {b.vendor} (₹{Number(b.netPayable || 0).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            ) : (
              <select 
                value={form.invoiceReference} 
                onChange={e => {
                  const inv = salesInvoices.find(i => (i.invoiceNumber || `INV-${i.id}`) === e.target.value);
                  if (inv) handleSalesInvoiceSelect(inv);
                  else setField('invoiceReference', e.target.value);
                }} 
                className={inp}
              >
                <option value="">-- Choose Sales Invoice --</option>
                {salesInvoices.map(inv => (
                  <option key={inv.id} value={inv.invoiceNumber || `INV-${inv.id}`} className="bg-[#140f2d] text-white">
                    {inv.invoiceNumber || `INV-${inv.id}`} - {inv.clientName || 'Client'} (₹{Number(inv.totalAmount || 0).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Party Name Dropdown / Input */}
          <div>
            <label className={lbl}>
              {form.paymentType === 'OUTGOING' ? 'Vendor Name' : 'Client Name'} <span className="text-red-400">*</span>
            </label>
            {form.paymentType === 'OUTGOING' ? (
              <div className="relative">
                <input 
                  list="vendor-datalist"
                  value={form.partyName} 
                  onChange={e => setField('partyName', e.target.value)} 
                  className={inp} 
                  placeholder="Select or type vendor..." 
                />
                <datalist id="vendor-datalist">
                  {vendors.map(v => (
                    <option key={v.id} value={v.companyName || v.legalName || v.name} />
                  ))}
                </datalist>
              </div>
            ) : (
              <div className="relative">
                <input 
                  list="client-datalist"
                  value={form.partyName} 
                  onChange={e => setField('partyName', e.target.value)} 
                  className={inp} 
                  placeholder="Select or type client..." 
                />
                <datalist id="client-datalist">
                  {clients.map(c => (
                    <option key={c.id} value={c.name || c.clientName || c.companyName} />
                  ))}
                </datalist>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className={lbl}>Gross Amount <span className="text-red-400">*</span></label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              value={form.amount} 
              onChange={e => handleAmountChange(e.target.value)} 
              className={inp} 
              placeholder="0.00" 
            />
          </div>

          {/* Currency */}
          <div>
            <label className={lbl}>Currency</label>
            <select value={form.currency} onChange={e => setField('currency', e.target.value)} className={inp}>
              {CURRENCIES.map(c => <option key={c} value={c} className="bg-[#140f2d] text-white">{c}</option>)}
            </select>
          </div>

          {/* Payment Mode */}
          <div>
            <label className={lbl}>Payment Mode <span className="text-red-400">*</span></label>
            <select value={form.paymentMode} onChange={e => setField('paymentMode', e.target.value)} className={inp}>
              {PAYMENT_MODES.map(m => <option key={m} value={m} className="bg-[#140f2d] text-white">{m}</option>)}
            </select>
          </div>

          {/* Bank Account */}
          <div>
            <label className={lbl}>Bank Account</label>
            <input 
              value={form.bankAccount} 
              onChange={e => setField('bankAccount', e.target.value)} 
              className={inp} 
              placeholder="e.g. HDFC — A/C 9876543210" 
            />
          </div>

          {/* Transaction / UTR / Cheque No */}
          <div>
            <label className={lbl}>Transaction / UTR / Cheque No</label>
            <input 
              value={form.transactionNumber} 
              onChange={e => setField('transactionNumber', e.target.value)} 
              className={inp} 
              placeholder="UTR or Cheque number" 
            />
          </div>

          {/* Cheque Date */}
          <div>
            <label className={lbl}>Cheque Date</label>
            <input type="date" value={form.chequeDate} onChange={e => setField('chequeDate', e.target.value)} className={inp} />
          </div>

          {/* TDS Applicable */}
          <div>
            <label className={lbl}>TDS Applicable</label>
            <select 
              value={form.tdsApplicable} 
              onChange={e => {
                setField('tdsApplicable', e.target.value);
                if (e.target.value === 'No') {
                  handleTdsChange('0.00');
                }
              }} 
              className={inp}
            >
              {['No', 'Yes'].map(v => <option key={v} value={v} className="bg-[#140f2d] text-white">{v}</option>)}
            </select>
          </div>

          {form.tdsApplicable === 'Yes' && (
            <>
              <div>
                <label className={lbl}>TDS Section</label>
                <select value={form.tdsSection} onChange={e => setField('tdsSection', e.target.value)} className={inp}>
                  <option value="" className="bg-[#140f2d] text-gray-400">Select Section</option>
                  {TDS_SECTIONS.map(s => <option key={s} value={s} className="bg-[#140f2d] text-white">{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>TDS Amount (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={form.tdsAmount} 
                  onChange={e => handleTdsChange(e.target.value)} 
                  className={inp} 
                />
              </div>
            </>
          )}

          {/* Net Amount */}
          <div>
            <label className={lbl}>Net Amount (₹)</label>
            <input 
              type="number" 
              readOnly 
              value={form.netAmount} 
              className={inp + ' bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/30'} 
              placeholder="After TDS" 
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className={lbl}>Notes / Remarks</label>
            <input value={form.notes} onChange={e => setField('notes', e.target.value)} className={inp} placeholder="Payment purpose, clearance details..." />
          </div>

          {/* Attach Document */}
          <div className="sm:col-span-2">
            <label className={lbl}>Attach Bank Voucher / Receipt</label>
            <input 
              type="file" 
              accept=".pdf,.jpg,.png" 
              onChange={e => setField('attachment', e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-[#1b1638] text-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold" 
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-sm font-bold shadow-lg hover:opacity-90 disabled:opacity-60 transition-all" 
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />} 
          Save Payment & Update Ledger
        </button>
        <button 
          onClick={() => navigate('/dashboard/accounts/payments/list')} 
          className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}