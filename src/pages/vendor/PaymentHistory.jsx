// ─────────────────────────────────────────────────────────────────────────────
// PaymentHistory.jsx — Connected to backend API
// PaymentMethod enum: CASH, BANK_TRANSFER, UPI
// ─────────────────────────────────────────────────────────────────────────────
// import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, CreditCard, Save, X, FileText
} from 'lucide-react';

import { makePayment, getPaymentHistoryById } from '../../services/vendor/payment.services';
import { getAllVendorInvoices } from '../../services/vendor/vendorInvoice.services';
// const BASE_URL = '/api';

// PaymentMethod enum values from backend
const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH',          label: 'Cash' },
  { value: 'UPI',           label: 'UPI' },
];

const METHOD_LABELS = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI',
};

const formatDate = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return val; }
};

// ─── AddPaymentModal ──────────────────────────────────────────────────────────
const AddPaymentModal = ({ invoices, onClose, onSaved }) => {
  // form matches PaymentRequestDto: invoiceId, amount, paymentMethod, referenceNumber
  const [form, setForm] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  // const handleSave = async () => {
  //   if (!form.invoiceId) { setError('Please select an invoice.'); return; }
  //   if (!form.amount || Number(form.amount) <= 0) { setError('Amount must be greater than 0.'); return; }
  //   setError('');
  //   setSaving(true);

  //   try {
  //     const payload = {
  //       invoiceId: Number(form.invoiceId),
  //       amount: Number(form.amount),
  //       paymentMethod: form.paymentMethod,   // CASH, BANK_TRANSFER, UPI
  //       referenceNumber: form.referenceNumber.trim() || null,
  //     };

  //     const res = await fetch(`${BASE_URL}/payments/make-payment`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       const msg = await res.text();
  //       throw new Error(msg || 'Payment failed');
  //     }

  //     const saved = await res.json();
  //     onSaved(saved);
  //     onClose();
  //   } catch (err) {
  //     setError(err.message || 'Failed to record payment.');
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {

  if (!form.invoiceId) {
    setError('Please select an invoice.');
    return;
  }

  if (!form.amount || Number(form.amount) <= 0) {
    setError('Amount must be greater than 0.');
    return;
  }

  setError('');
  setSaving(true);

  try {

    // =========================
    // FIND SELECTED INVOICE
    // =========================
    const selectedInvoice = invoices.find(
      (inv) => inv.id === Number(form.invoiceId)
    );

    console.log("Selected Invoice:", selectedInvoice);

    // =========================
    // USE CORRECT BACKEND FIELDS
    // =========================
    const total =
      Number(
        selectedInvoice?.totalAmount ||
        selectedInvoice?.total ||
        selectedInvoice?.amount ||
        0
      );

    const paid =
      Number(
        selectedInvoice?.paidAmount ||
        selectedInvoice?.paid ||
        0
      );

    const remainingAmount = total - paid;

    console.log("Total:", total);
    console.log("Paid:", paid);
    console.log("Remaining:", remainingAmount);

    // =========================
    // VALIDATE PAYMENT
    // =========================
    if (Number(form.amount) > remainingAmount) {

      setError(
        `Payment exceeds remaining amount of ₹${remainingAmount}`
      );

      setSaving(false);
      return;
    }

    // =========================
    // API PAYLOAD
    // =========================
    const payload = {

      invoiceId: Number(form.invoiceId),

      amount: Number(form.amount),

      paymentMethod: form.paymentMethod,

      referenceNumber:
        form.referenceNumber.trim() || null,
    };

    // =========================
    // SAVE PAYMENT
    // =========================
    const saved = await makePayment(payload);

    onSaved(saved);

    onClose();

  } catch (err) {

    console.error(err);

    setError(
      err?.response?.data?.message ||
      err?.message ||
      'Failed to record payment.'
    );

  } finally {

    setSaving(false);

  }
}; 


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CreditCard size={16} className="text-purple-300" />
            </div>
            <h2 className="text-base font-bold text-white">Record Payment</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">{error}</div>
          )}
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Invoice</label>
            <select
              value={form.invoiceId}
              onChange={set('invoiceId')}
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.customerName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={set('amount')}
              placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>
          <div>
            {/* PaymentMethod enum: CASH, BANK_TRANSFER, UPI */}
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={set('paymentMethod')}
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Reference Number (optional)</label>
            <input
              type="text"
              value={form.referenceNumber}
              onChange={set('referenceNumber')}
              placeholder="e.g. UTR123456"
              className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PaymentRow ───────────────────────────────────────────────────────────────
const PaymentRow = ({ payment }) => (
  <div className="bg-[#140f2d]/80 border-b border-white/10 flex items-center gap-4 px-5 py-4">
    <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
      <CreditCard size={16} className="text-purple-300" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-white text-sm truncate">
        {payment.referenceNumber || `Payment #${payment.id}`}
      </p>
      <p className="text-xs text-gray-400">{METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</p>
    </div>
    <div className="hidden sm:block text-xs text-purple-300 w-28 flex-shrink-0">
      {formatDate(payment.paymentDate)}
    </div>
    <div className="text-sm font-bold text-white flex-shrink-0">
      ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
    </div>
  </div>
);

// ─── PaymentHistory ───────────────────────────────────────────────────────────
const PaymentHistory = ({ context }) => {
  const navigate = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

  // Load invoices for dropdown
  // useEffect(() => {
  //   fetch(`${BASE_URL}/invoices/get-all-invoices`)
  //     .then((r) => r.json())
  //     .then((data) => setInvoices(Array.isArray(data) ? data : []))
  //     .catch(() => setInvoices([]));
  // }, []);

  useEffect(() => {
  getAllVendorInvoices()
    .then((data) => setInvoices(Array.isArray(data) ? data : []))
    .catch(() => setInvoices([]));
}, []);

  // Load payments for selected invoice, or show empty until one is selected
  // useEffect(() => {
  //   if (!selectedInvoiceId) {
  //     setPayments([]);
  //     setLoading(false);
  //     return;
  //   }
  //   setLoading(true);
  //   fetch(`${BASE_URL}/payments/history/${selectedInvoiceId}`)
  //     .then((r) => r.json())
  //     .then((data) => setPayments(Array.isArray(data) ? data : []))
  //     .catch(() => setPayments([]))
  //     .finally(() => setLoading(false));
  // }, [selectedInvoiceId]);

  useEffect(() => {
  if (!selectedInvoiceId) {
    setPayments([]);
    setLoading(false);
    return;
  }

  setLoading(true);

  getPaymentHistoryById(selectedInvoiceId)
    .then((data) => setPayments(Array.isArray(data) ? data : []))
    .catch(() => setPayments([]))
    .finally(() => setLoading(false));
}, [selectedInvoiceId]);

  const handlePaymentSaved = (newPayment) => {
    // Refresh history for the relevant invoice
    if (newPayment.invoiceId) {
      setSelectedInvoiceId(String(newPayment.invoiceId));
    } else {
      setPayments((prev) => [newPayment, ...prev]);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300">{moduleLabel}</button>
        <span>/</span>
        <span className="text-white font-semibold">Payment History</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Payment History</h1>
            <p className="text-sm text-purple-300 mt-0.5">Track all vendor payments</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md"
        >
          <Plus size={15} /> Record Payment
        </button>
      </div>

      {/* Invoice filter */}
      <div className="mb-5 max-w-sm">
        <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Filter by Invoice</label>
        <select
          value={selectedInvoiceId}
          onChange={(e) => setSelectedInvoiceId(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
        >
          <option value="">-- Select Invoice to view payments --</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.customerName}</option>
          ))}
        </select>
      </div>

      {!selectedInvoiceId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
            <FileText size={28} className="text-purple-300" />
          </div>
          <p className="text-sm text-purple-300">Select an invoice above to view its payment history.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
            <CreditCard size={28} className="text-purple-300" />
          </div>
          <p className="text-sm text-purple-300">No payments recorded for this invoice yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)]">
          {payments.map((pay) => (
            <PaymentRow key={pay.id} payment={pay} />
          ))}
        </div>
      )}

      {showModal && (
        <AddPaymentModal
          invoices={invoices}
          onClose={() => setShowModal(false)}
          onSaved={handlePaymentSaved}
        />
      )}
    </div>
  );
};

export default PaymentHistory;
