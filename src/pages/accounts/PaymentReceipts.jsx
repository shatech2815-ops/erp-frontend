import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Receipt, Search, Download,
  Printer, FileText, RefreshCw, CheckCircle2, AlertTriangle,
  User, IndianRupee, Clock
} from 'lucide-react';

import {
  createPaymentReceipt,
  getAllPaymentReceipts,
} from "../../services/account/paymentReceipt.services";

import api from '../../interceptors/interceptors';

const PAYMENT_MODES = ['Cash','Cheque','Bank Transfer','UPI','NEFT','RTGS','IMPS','Card'];
const BANK_ACCOUNTS = ['HDFC — ****1234','ICICI — ****5678','SBI — ****9012','Axis — ****3456'];

export default function PaymentReceipts() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [fetching, setFetching] = useState(true);

  // Master Data
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);         // All invoices from backend
  const [filteredInvoices, setFilteredInvoices] = useState([]); // Filtered by customer

  const [form, setForm] = useState({
    receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
    receiptDate: new Date().toISOString().split('T')[0],
    customerId: '',
    customerName: '',
    invoiceId: '',
    invoiceReference: '',
    invoiceAmount: '0.00',
    amountAlreadyPaid: '0.00',
    amountReceivedNow: '',
    paymentMode: 'Cash',
    transactionNumber: '',
    bankAccount: 'HDFC — ****1234',
    tdsAmount: '0.00',
    discountAllowed: '0.00',
    notes: '',
    attachProof: null,
  });

  const [filter, setFilter] = useState({ receiptNo: '', customer: '', paymentMode: 'All', dateFrom: '', dateTo: '' });

  const balanceDue = Math.max(
    0,
    parseFloat(form.invoiceAmount || 0)
    - parseFloat(form.amountAlreadyPaid || 0)
    - parseFloat(form.amountReceivedNow || 0)
  );

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Load clients and invoices
  const loadMasterData = async () => {
    setFetching(true);
    try {
      const [clientsRes, invoicesRes] = await Promise.allSettled([
        api.get('/clients'),
        api.get('/invoices/get-all-invoices'),
      ]);
      if (clientsRes.status === 'fulfilled') {
        setClients(Array.isArray(clientsRes.value.data) ? clientsRes.value.data : []);
      }
      if (invoicesRes.status === 'fulfilled') {
        const allInvoices = Array.isArray(invoicesRes.value.data) ? invoicesRes.value.data : [];
        setInvoices(allInvoices);
      }
    } catch (err) {
      console.error('Error loading master data:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await getAllPaymentReceipts();
      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
    fetchReceipts();
  }, []);

  // When customer changes — filter their invoices
  const handleCustomerChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => String(c.id) === String(clientId));

    setForm(p => ({
      ...p,
      customerId: clientId,
      customerName: client ? (client.companyName || client.name || '') : '',
      invoiceId: '',
      invoiceReference: '',
      invoiceAmount: '0.00',
      amountAlreadyPaid: '0.00',
    }));

    if (clientId) {
      // Filter invoices by customer name match (invoices have customerName string field)
      const customerName = client ? (client.companyName || client.name || '') : '';
      const matched = invoices.filter(inv =>
        inv.customerName?.toLowerCase().includes(customerName.toLowerCase()) ||
        inv.customerId === clientId
      );
      setFilteredInvoices(matched);
    } else {
      setFilteredInvoices([]);
    }
  };

  // When invoice changes — auto-fill amounts
  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;
    const invoice = invoices.find(inv => String(inv.id) === String(invoiceId));

    if (invoice) {
      // Calculate already paid from existing receipts
      const paid = receipts
        .filter(r => r.invoiceReference === invoice.invoiceNumber)
        .reduce((sum, r) => sum + parseFloat(r.amountReceivedNow || 0), 0);

      setForm(p => ({
        ...p,
        invoiceId,
        invoiceReference: invoice.invoiceNumber || `INV-${invoiceId}`,
        invoiceAmount: Number(invoice.totalAmount || 0).toFixed(2),
        amountAlreadyPaid: paid.toFixed(2),
        amountReceivedNow: '', // Let user enter now
      }));
    } else {
      setForm(p => ({
        ...p,
        invoiceId: '',
        invoiceReference: '',
        invoiceAmount: '0.00',
        amountAlreadyPaid: '0.00',
      }));
    }
  };

  const handleSave = async () => {
    if (!form.customerName) return setMsg({ type: 'error', text: 'Please select a customer.' });
    if (!form.invoiceReference) return setMsg({ type: 'error', text: 'Please select an invoice.' });
    if (!form.amountReceivedNow || parseFloat(form.amountReceivedNow) <= 0) {
      return setMsg({ type: 'error', text: 'Amount Received Now must be greater than 0.' });
    }

    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        receiptNo: form.receiptNo,
        receiptDate: form.receiptDate || null,
        customerName: form.customerName,
        invoiceReference: form.invoiceReference,
        invoiceAmount: parseFloat(form.invoiceAmount) || 0,
        amountAlreadyPaid: parseFloat(form.amountAlreadyPaid) || 0,
        amountReceivedNow: parseFloat(form.amountReceivedNow) || 0,
        balanceDue,
        paymentMode: form.paymentMode,
        transactionNumber: form.transactionNumber,
        bankAccount: form.bankAccount,
        tdsAmount: parseFloat(form.tdsAmount) || 0,
        discountAllowed: parseFloat(form.discountAllowed) || 0,
        notes: form.notes,
      };

      await createPaymentReceipt(payload);

      // --- Auto-update Invoice Status ---
      if (form.invoiceId) {
        const newBalance = balanceDue;
        const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
        try {
          await api.put(`/invoices/${form.invoiceId}`, {
            status: newStatus,
          });
        } catch (e) {
          console.warn('Could not update invoice status:', e);
        }
      }

      setMsg({ type: 'success', text: `✅ Receipt saved! Invoice marked as ${balanceDue <= 0 ? 'PAID' : 'PARTIALLY PAID'}.` });
      
      // Reset form
      setForm(p => ({
        ...p,
        receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
        amountReceivedNow: '',
        transactionNumber: '',
        notes: '',
      }));

      fetchReceipts();
      // Reload invoices to get updated statuses
      const invoicesRes = await api.get('/invoices/get-all-invoices').catch(() => ({ data: [] }));
      setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);

    } catch (error) {
      console.error('Save receipt error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        'Failed to save receipt.';
      setMsg({ type: 'error', text: `Error: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "block text-xs font-semibold text-purple-300 mb-1";
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[#1b1638] text-white";
  const readOnlyCls = "w-full px-3 py-2.5 rounded-xl border border-white/5 text-sm bg-white/[0.02] text-amber-400 font-bold cursor-not-allowed";

  // Filtered receipts for the list
  const displayedReceipts = receipts.filter(r => {
    if (filter.receiptNo && !r.receiptNo?.toLowerCase().includes(filter.receiptNo.toLowerCase())) return false;
    if (filter.customer && !r.customerName?.toLowerCase().includes(filter.customer.toLowerCase())) return false;
    if (filter.paymentMode !== 'All' && r.paymentMode !== filter.paymentMode) return false;
    return true;
  });

  // Invoice status badge
  const statusBadge = (status) => {
    const s = (status || '').toUpperCase();
    const colors = {
      PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      PARTIALLY_PAID: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      DRAFT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      PENDING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return `text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[s] || colors.DRAFT}`;
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Payment Receipts</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Receipt size={22} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Payment Receipts</h2>
            <p className="text-sm text-gray-400">Record customer payments against invoices</p>
          </div>
        </div>
        <button
          onClick={() => { loadMasterData(); fetchReceipts(); }}
          disabled={fetching}
          className="px-4 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-amber-400' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert */}
      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border flex items-start gap-3 ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
          <span className="flex-1">{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="text-gray-400 hover:text-white text-xs shrink-0">✕</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Receipts', value: receipts.length, icon: Receipt, color: 'text-purple-400' },
          { label: 'Total Collected', value: `₹${receipts.reduce((s, r) => s + parseFloat(r.amountReceivedNow||0), 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-400' },
          { label: 'Open Invoices', value: invoices.filter(i => !['PAID'].includes((i.status||'').toUpperCase())).length, icon: Clock, color: 'text-amber-400' },
          { label: 'Paid Invoices', value: invoices.filter(i => (i.status||'').toUpperCase() === 'PAID').length, icon: CheckCircle2, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#140f2d]/80 rounded-xl border border-white/10 p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-base font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Receipt Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
          <Receipt size={15} className="text-amber-400" /> Create Receipt
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Receipt No */}
          <div>
            <label className={labelCls}>Receipt No *</label>
            <input value={form.receiptNo} onChange={e => setField('receiptNo', e.target.value)} className={inputCls} placeholder="RCP-XXXX" />
          </div>

          {/* Receipt Date */}
          <div>
            <label className={labelCls}>Receipt Date *</label>
            <input type="date" value={form.receiptDate} onChange={e => setField('receiptDate', e.target.value)} className={inputCls} />
          </div>

          {/* Customer Dropdown */}
          <div>
            <label className={labelCls + ' flex items-center gap-1'}>
              <User size={11} /> Select Customer *
            </label>
            <select value={form.customerId} onChange={handleCustomerChange} className={inputCls}>
              <option value="">-- Choose Customer --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.companyName || c.name || `Client #${c.id}`}</option>
              ))}
            </select>
          </div>

          {/* Invoice Dropdown — filtered by customer */}
          <div>
            <label className={labelCls}>Invoice Reference *</label>
            <select
              value={form.invoiceId}
              onChange={handleInvoiceChange}
              disabled={!form.customerId}
              className={inputCls + (!form.customerId ? ' opacity-50 cursor-not-allowed' : '')}
            >
              <option value="">-- Select Invoice --</option>
              {(form.customerId ? filteredInvoices : invoices).map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — ₹{Number(inv.totalAmount||0).toLocaleString('en-IN')} [{inv.status || 'PENDING'}]
                </option>
              ))}
            </select>
            {form.customerId && filteredInvoices.length === 0 && (
              <p className="text-[10px] text-amber-400 mt-1">No invoices found for this customer.</p>
            )}
          </div>

          {/* Invoice Amount (Auto-filled, read-only) */}
          <div>
            <label className={labelCls}>Invoice Amount (₹)</label>
            <input type="number" readOnly value={form.invoiceAmount} className={readOnlyCls} />
          </div>

          {/* Amount Already Paid (Auto-calculated) */}
          <div>
            <label className={labelCls}>Amount Already Paid (₹)</label>
            <input type="number" readOnly value={form.amountAlreadyPaid} className={readOnlyCls} />
          </div>

          {/* Amount Received Now */}
          <div>
            <label className={labelCls + ' text-emerald-400'}>Amount Received Now (₹) *</label>
            <input
              type="number"
              value={form.amountReceivedNow}
              onChange={e => setField('amountReceivedNow', e.target.value)}
              className={inputCls + ' text-emerald-400 font-bold text-base focus:ring-emerald-500/30 focus:border-emerald-500'}
              placeholder="0.00"
            />
          </div>

          {/* Balance Due (Auto-calculated) */}
          <div>
            <label className={labelCls}>Balance Due (₹)</label>
            <div className={readOnlyCls + (balanceDue > 0 ? ' text-red-400' : ' text-emerald-400')}>
              {balanceDue.toFixed(2)}
              <span className="ml-2 text-[10px] font-semibold">{balanceDue <= 0 ? '✅ FULLY PAID' : '⏳ Pending'}</span>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className={labelCls}>Payment Mode *</label>
            <select value={form.paymentMode} onChange={e => setField('paymentMode', e.target.value)} className={inputCls}>
              {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Transaction No */}
          <div>
            <label className={labelCls}>Transaction / Cheque No</label>
            <input value={form.transactionNumber} onChange={e => setField('transactionNumber', e.target.value)} className={inputCls} placeholder="UTR / Cheque no" />
          </div>

          {/* Bank Account */}
          <div>
            <label className={labelCls}>Bank Account Received In</label>
            <select value={form.bankAccount} onChange={e => setField('bankAccount', e.target.value)} className={inputCls}>
              {BANK_ACCOUNTS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          {/* TDS */}
          <div>
            <label className={labelCls}>TDS Deducted by Customer (₹)</label>
            <input type="number" value={form.tdsAmount} onChange={e => setField('tdsAmount', e.target.value)} className={inputCls} />
          </div>

          {/* Discount */}
          <div>
            <label className={labelCls}>Discount Allowed (₹)</label>
            <input type="number" value={form.discountAllowed} onChange={e => setField('discountAllowed', e.target.value)} className={inputCls} />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <input value={form.notes} onChange={e => setField('notes', e.target.value)} className={inputCls} placeholder="e.g. Advance / partial payment" />
          </div>

          {/* Attach Proof */}
          <div>
            <label className={labelCls}>Attach Proof</label>
            <input type="file" accept=".pdf,.jpg,.png" onChange={e => setField('attachProof', e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-[#1b1638] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold text-gray-400" />
            <p className="text-xs text-gray-400 mt-1">Bank screenshot, payment slip</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Receipt size={14} />}
            Save Receipt
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
            <Printer size={14} /> Print Receipt
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
            Send to Customer
          </button>
        </div>
      </div>

      {/* Receipt List */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-sm font-bold text-purple-300 mb-3">Receipt List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input value={filter.receiptNo} onChange={e => setFilter(p => ({ ...p, receiptNo: e.target.value }))} className={inputCls} placeholder="RCP-XXXX" />
            <input value={filter.customer} onChange={e => setFilter(p => ({ ...p, customer: e.target.value }))} className={inputCls} placeholder="Customer name" />
            <select value={filter.paymentMode} onChange={e => setFilter(p => ({ ...p, paymentMode: e.target.value }))} className={inputCls}>
              {['All', ...PAYMENT_MODES].map(m => <option key={m}>{m}</option>)}
            </select>
            <input type="date" value={filter.dateFrom} onChange={e => setFilter(p => ({ ...p, dateFrom: e.target.value }))} className={inputCls} />
            <input type="date" value={filter.dateTo} onChange={e => setFilter(p => ({ ...p, dateTo: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={fetchReceipts} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <Search size={14} /> Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Receipt No','Date','Customer','Invoice Ref','Amount Received','Balance Due','Mode','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {displayedReceipts.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No records found</td></tr>
                ) : displayedReceipts.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{r.receiptNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.receiptDate}</td>
                    <td className="px-4 py-3 text-xs">{r.customerName}</td>
                    <td className="px-4 py-3 text-xs text-purple-300">{r.invoiceReference}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">₹{Number(r.amountReceivedNow||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-bold text-red-400">₹{Number(r.balanceDue||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">{r.paymentMode}</td>
                    <td className="px-4 py-3 text-xs">
                      <button onClick={() => setSelectedReceipt(r)} className="text-amber-300 hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1636] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#140f2d]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-amber-400" />
                Receipt — {selectedReceipt.receiptNo}
              </h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-white transition-colors text-lg">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Receipt No', value: selectedReceipt.receiptNo },
                  { label: 'Receipt Date', value: selectedReceipt.receiptDate },
                  { label: 'Customer', value: selectedReceipt.customerName },
                  { label: 'Invoice Ref', value: selectedReceipt.invoiceReference },
                  { label: 'Invoice Amount', value: `₹${Number(selectedReceipt.invoiceAmount||0).toLocaleString('en-IN')}` },
                  { label: 'Already Paid', value: `₹${Number(selectedReceipt.amountAlreadyPaid||0).toLocaleString('en-IN')}` },
                  { label: 'Received Now', value: `₹${Number(selectedReceipt.amountReceivedNow||0).toLocaleString('en-IN')}`, highlight: 'text-emerald-400 text-base font-bold' },
                  { label: 'Balance Due', value: `₹${Number(selectedReceipt.balanceDue||0).toLocaleString('en-IN')}`, highlight: parseFloat(selectedReceipt.balanceDue||0) > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold' },
                  { label: 'Payment Mode', value: selectedReceipt.paymentMode },
                  { label: 'Transaction No', value: selectedReceipt.transactionNumber || '—' },
                ].map(({ label, value, highlight }) => (
                  <div key={label}>
                    <p className="text-xs text-purple-300 font-semibold mb-1">{label}</p>
                    <p className={`text-sm text-gray-300 ${highlight || ''}`}>{value}</p>
                  </div>
                ))}
              </div>
              {selectedReceipt.notes && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-purple-300 font-semibold mb-1">Notes</p>
                  <p className="text-xs text-gray-400">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-white/10 bg-[#140f2d]/50 flex justify-end">
              <button onClick={() => setSelectedReceipt(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}