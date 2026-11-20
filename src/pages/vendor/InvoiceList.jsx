
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, ArrowLeft, FileText, Calendar,
  DollarSign, X, ChevronRight, User, Mail,
  MapPin, CreditCard, Trash2, Printer
} from 'lucide-react';

// const BASE_URL = '/api';
import {

  getAllVendorInvoices,
   getInvoiceById,
  deleteInvoice,

  updateInvoice

} from "../../services/vendor/vendorInvoice.services";

// InvoiceStatus enum values from backend
const STATUS_CONFIG = {
  DRAFT:     { label: 'Draft',     bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  SENT:      { label: 'Sent',      bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  PAID:      { label: 'Paid',      bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  OVERDUE:   { label: 'Overdue',   bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-white/5',   text: 'text-gray-400',    dot: 'bg-gray-400' },
};

// PaymentMethod enum values from backend
const PAYMENT_METHOD_LABELS = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI',
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return val; }
};

// ─── InvoiceDetailModal ───────────────────────────────────────────────────────
const InvoiceDetailModal = ({ invoice, onClose, onDelete, onStatusUpdate  }) => {
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

const handleStatusChange = async (newStatus) => {
  setUpdatingStatus(true);
  try {
    const res = await updateInvoice(

  invoice.id,

  {
    ...invoice,
    status: newStatus
  }

);
    if (!res.ok) throw new Error('Update failed');
    invoice.status = newStatus;
    onStatusUpdate(invoice.id, newStatus);
  } catch (err) {
    alert('Failed to update status: ' + err.message);
  } finally {
    setUpdatingStatus(false);
  }
};

  // const handleDelete = async () => {
  //   if (!window.confirm('Delete this invoice? This cannot be undone.')) return;
  //   setDeleting(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/invoices/delete-invoice/${invoice.id}`, { method: 'DELETE' });
  //     if (!res.ok) throw new Error('Delete failed');
  //     onDelete(invoice.id);
  //     onClose();
  //   } catch (err) {
  //     alert('Failed to delete: ' + err.message);
  //   } finally {
  //     setDeleting(false);
  //   }
  // };

  const handleDelete = async () => {

  if (
    !window.confirm(
      'Delete this invoice? This cannot be undone.'
    )
  ) return;

  setDeleting(true);

  try {

    await deleteInvoice(
      invoice.id
    );

    onDelete(invoice.id);

    onClose();

  } catch (err) {

    console.error(
      "Delete Error:",
      err
    );

    alert(

      err.response?.data?.message ||

      err.message ||

      "Failed to delete invoice"

    );

  } finally {

    setDeleting(false);
  }
};

  const total = invoice.items?.reduce((s, it) => s + (it.quantity * (it.price ?? it.unitPrice ?? 0)), 0) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">{invoice.invoiceNumber}</h2>
            <p className="text-xs text-purple-300">{invoice.customerName}</p>
          </div>
          <div className="flex items-center gap-2">
  <button
    onClick={() => {
      const w = window.open('', '_blank');
      w.document.write(`<html><head><title>${invoice.invoiceNumber}</title>
      <style>body{font-family:Arial;padding:20px;color:#111}
      table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #b0bcd8;padding:6px 8px;font-size:12px}
      th{background:#4F46E5;color:#fff}
      .title{font-size:20px;font-weight:900;color:#4F46E5;margin-bottom:4px}
      .sub{font-size:12px;color:#555;margin-bottom:16px}
      .row{display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px}
      .label{color:#888;font-weight:600}.val{font-weight:700;color:#4F46E5}
      .total{text-align:right;font-size:18px;font-weight:900;color:#4F46E5;margin-top:12px}
      </style></head><body>
      <div class="title">${invoice.invoiceNumber}</div>
      <div class="sub">${invoice.customerName} — ${invoice.email || ''}</div>
      <div class="row"><span class="label">Invoice Date:</span><span class="val">${formatDate(invoice.invoiceDate)}</span></div>
      <div class="row"><span class="label">Due Date:</span><span class="val">${formatDate(invoice.dueDate)}</span></div>
      <div class="row"><span class="label">Status:</span><span class="val">${invoice.status}</span></div>
      <div class="row"><span class="label">Payment:</span><span class="val">${PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod}</span></div>
      <br/>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
      <tbody>${(invoice.items||[]).map(it=>`<tr>
        <td>${it.itemName||it.description||'—'}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">₹${(it.price??it.unitPrice??0).toLocaleString('en-IN')}</td>
        <td style="text-align:right">₹${(it.quantity*(it.price??it.unitPrice??0)).toLocaleString('en-IN')}</td>
      </tr>`).join('')}</tbody></table>
      <div class="total">Total: ₹${(invoice.items||[]).reduce((s,it)=>s+(it.quantity*(it.price??it.unitPrice??0)),0).toLocaleString('en-IN')}</div>
      </body></html>`);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(214,234,248,0.12)] transition-colors"
  >
    <Printer size={14} />
  </button>
  <button
    onClick={handleDelete}
    disabled={deleting}
    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
  >
    <Trash2 size={14} />
  </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-7 py-5 flex-1">
         <div className="flex items-center gap-3 mb-4">
  <select
    value={invoice.status}
    onChange={(e) => handleStatusChange(e.target.value)}
    disabled={updatingStatus}
    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 bg-[#140f2d]/80 text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60 cursor-pointer"
  >
    <option value="DRAFT">Draft</option>
    <option value="SENT">Sent</option>
    <option value="PAID">Paid</option>
    <option value="OVERDUE">Overdue</option>
    <option value="CANCELLED">Cancelled</option>
  </select>
  {updatingStatus && <div className="w-4 h-4 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin"/>}
  <span className="text-xs text-gray-400">Due: {formatDate(invoice.dueDate)}</span>
</div>

          <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium">Invoice Date</p>
              <p className="font-semibold text-white">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Payment Method</p>
              <p className="font-semibold text-white">{PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Customer</p>
              <p className="font-semibold text-white">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Email</p>
              <p className="font-semibold text-white">{invoice.email || '—'}</p>
            </div>
          </div>

          {invoice.items?.length > 0 && (
            <>
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 pb-1 border-b border-white/10">Line Items</h4>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-xs text-gray-400 font-semibold uppercase border-b border-white/10">
                    <th className="pb-2 text-left">Item Name</th>
                    <th className="pb-2 text-right w-16">Qty</th>
                    <th className="pb-2 text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 text-white">{item.itemName || item.description}</td>
                      <td className="py-2 text-right text-purple-300">{item.quantity}</td>
                      <td className="py-2 text-right font-semibold text-white">₹{(item.quantity * (item.price ?? item.unitPrice ?? 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-2xl font-extrabold text-white">₹{total.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── InvoiceRow ───────────────────────────────────────────────────────────────

const InvoiceRow = ({ invoice, onClick }) => {
  const navigate = useNavigate();
  const total = invoice.items?.reduce((s, it) => s + (it.quantity * (it.price ?? it.unitPrice ?? 0)), 0) || 0;
  return (
    <div
      onClick={() => navigate(`/dashboard/vendor/invoices/${invoice.id}`)}
      className="bg-[#140f2d]/80 border-b border-white/10 hover:bg-white/10 transition-all duration-150 cursor-pointer group flex items-center gap-4 px-5 py-4"
    >
      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-purple-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors truncate">{invoice.invoiceNumber}</p>
        <p className="text-xs text-gray-400 truncate">{invoice.customerName}</p>
      </div>
      <div className="hidden sm:block text-xs text-purple-300 w-24 flex-shrink-0">{formatDate(invoice.invoiceDate)}</div>
      <div className="hidden md:block text-xs text-purple-300 w-24 flex-shrink-0">Due: {formatDate(invoice.dueDate)}</div>
      <div className="hidden sm:block text-sm font-semibold text-white w-28 flex-shrink-0 text-right">₹{total.toLocaleString('en-IN')}</div>
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <StatusBadge status={invoice.status} />
        <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-300 transition-colors" />
      </div>
    </div>
  );
};

// ─── InvoiceList ──────────────────────────────────────────────────────────────
const InvoiceList = ({ context }) => {
  const navigate = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const addPath     = context?.addPath     || '/dashboard/vendor/invoices/generate';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // const loadInvoices = () => {
  //   setLoading(true);
  //   fetch(`${BASE_URL}/invoices/get-all-invoices`)
  //     .then((r) => r.json())
  //     .then((data) => setInvoices(Array.isArray(data) ? data : []))
  //     .catch(() => setInvoices([]))
  //     .finally(() => setLoading(false));
  // };

  const loadInvoices = async () => {

  try {

    setLoading(true);

    const response =
      await getAllVendorInvoices();

    console.log(
      "Invoice API Response:",
      response
    );

    setInvoices(

      Array.isArray(response)
        ? response
        : []

    );

  } catch (error) {

    console.error(
      "Error loading invoices:",
      error
    );

    setInvoices([]);

  } finally {

    setLoading(false);
  }
};

  useEffect(() => { loadInvoices(); }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.customerName?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300">{moduleLabel}</button>
        <span>/</span>
        <span className="text-white font-semibold">Invoice List</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Invoice List</h1>
            <p className="text-sm text-purple-300 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => navigate(addPath)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md">
          <Plus size={15} /> Generate Invoice
        </button>
      </div>

      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-4 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
            <FileText size={36} className="text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Invoices Yet</h3>
          <p className="text-sm text-purple-300 mb-6 max-w-xs">Generate your first invoice to get started.</p>
          <button onClick={() => navigate(addPath)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md">
            <Plus size={16} /> Generate Invoice
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">No invoices match your search.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)]">
          {filtered.map((inv) => (
            <InvoiceRow key={inv.id} invoice={inv} onClick={() => setSelectedInvoice(inv)} />
          ))}
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetailModal
  invoice={selectedInvoice}
  onClose={() => setSelectedInvoice(null)}
  onDelete={handleDelete}
  onStatusUpdate={(id, newStatus) =>
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: newStatus } : inv
    ))
  }
/>
      )}
    </div>
  );
};

export default InvoiceList;
