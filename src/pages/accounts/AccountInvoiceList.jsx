
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileText, Plus, Search, Download, Eye, Check } from 'lucide-react';

// const BASE_URL = '/api';
import {
  getAllAccountInvoices,
  updateInvoice,
} from "../../services/account/accountInvoice.services";

// const INVOICE_STATUSES_LIST = ['Draft','Sent','Pending','Paid','Overdue','Cancelled'];
const INVOICE_STATUSES_LIST = [
  "DRAFT",
  "SENT",
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

const STATUS_COLORS = {
  DRAFT:    { bg: '#f3f4f6', text: '#6b7280', label: 'Draft' },
  SENT:     { bg: 'rgba(59,130,246,0.15)', text: '#1d4ed8', label: 'Sent' },
  PENDING:  { bg: 'rgba(245,158,11,0.15)', text: '#d97706', label: 'Pending' },
  PAID:     { bg: 'rgba(16,185,129,0.15)', text: '#059669', label: 'Paid' },
  OVERDUE:  { bg: 'rgba(239,68,68,0.15)', text: '#dc2626', label: 'Overdue' },
  CANCELLED:{ bg: '#f3f4f6', text: '#6b7280', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status?.toUpperCase()] || STATUS_COLORS.DRAFT;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
};

export default function InvoiceListAccounts() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editStatusId, setEditStatusId] = useState(null);
  const [editStatusVal, setEditStatusVal] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [msg, setMsg] = useState('');
  const [filters, setFilters] = useState({
    search: '', status: 'All', customer: '', dateFrom: '', dateTo: '',
    amountFrom: '', amountTo: '', sortBy: 'Date (Newest)'
  });

  // const fetchInvoices = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/invoices`);
  //     if (res.ok) { const data = await res.json(); setInvoices(Array.isArray(data) ? data : []); }
  //   } catch {}
  //   finally { setLoading(false); }
  // };

  const fetchInvoices = async () => {
  try {
    setLoading(true);

    const data = await getAllAccountInvoices();

    console.log("Account Invoices:", data);

    setInvoices(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchInvoices(); }, []);

  const filtered = invoices.filter(inv => {
    if (filters.status !== 'All' && inv.status?.toUpperCase() !== filters.status.toUpperCase()) return false;
    if (filters.search && !`${inv.invoiceNumber}${inv.customerName}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.customer && !inv.customerName?.toLowerCase().includes(filters.customer.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const headers = ['Invoice No', 'Customer', 'Email', 'Invoice Date', 'Due Date', 'Total Amount', 'Status'];
    const rows = filtered.map(i => [i.invoiceNumber, i.customerName, i.email || '', i.invoiceDate, i.dueDate, i.totalAmount, i.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'invoices.csv'; a.click();
  };

  const startEditStatus = (inv) => {
    setEditStatusId(inv.id);
    setEditStatusVal(inv.status || 'DRAFT');
  };

  // const handleStatusUpdate = async (inv) => {
  //   setUpdatingStatus(true); setMsg('');
  //   try {
  //     const payload = { ...inv, status: editStatusVal.toUpperCase() };
  //     const res = await fetch(`${BASE_URL}/invoices/${inv.id}`, {
  //       method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  //     });
  //     if (res.ok) {
  //       setMsg('Status updated!');
  //       setEditStatusId(null);
  //       fetchInvoices();
  //     } else {
  //       setMsg('Failed to update status.');
  //     }
  //   } catch { setMsg('Error updating status.'); }
  //   finally { setUpdatingStatus(false); setTimeout(() => setMsg(''), 2000); }
  // };

  const handleStatusUpdate = async (inv) => {
  try {
    setUpdatingStatus(true);
    setMsg("");

    const payload = {
      ...inv,
      status: editStatusVal.toUpperCase(),
    };

    await updateInvoice(inv.id, payload);

    setMsg("Status updated successfully!");

    setEditStatusId(null);

    fetchInvoices();

  } catch (error) {
    console.error("Error updating invoice:", error);

    setMsg("Failed to update invoice status");
  } finally {
    setUpdatingStatus(false);

    setTimeout(() => setMsg(""), 2000);
  }
};

  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300 transition-colors">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Invoice List</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(59,130,246,0.15)' }}>
          <FileText size={22} style={{ color: '#1d4ed8' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Invoice List</h2>
          <p className="text-sm text-gray-400">Manage and track all customer invoices</p>
        </div>
        <button onClick={() => navigate('/dashboard/accounts/invoices/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          <Plus size={14} /> New Invoice
        </button>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Failed')||msg.includes('Error') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      {/* Search & Filter */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">Search &amp; Filter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Search</label>
            <input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              placeholder="Invoice no / Customer"
              className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Status</label>
            <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className={inp}>
              {[
  { label: "All", value: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Cancelled", value: "CANCELLED" },
].map((s) => (
  <option key={s.value} value={s.value}>
    {s.label}
  </option>
))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Customer</label>
            <input value={filters.customer} onChange={e => setFilters(p => ({ ...p, customer: e.target.value }))}
              placeholder="Filter by customer" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Date From</label>
            <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Date To</label>
            <input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Amount From (₹)</label>
            <input type="number" value={filters.amountFrom} onChange={e => setFilters(p => ({ ...p, amountFrom: e.target.value }))} placeholder="Min" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Amount To (₹)</label>
            <input type="number" value={filters.amountTo} onChange={e => setFilters(p => ({ ...p, amountTo: e.target.value }))} placeholder="Max" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Sort By</label>
            <select value={filters.sortBy} onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value }))} className={inp}>
              {['Date (Newest)','Date (Oldest)','Amount (High to Low)','Amount (Low to High)','Customer Name'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInvoices}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            <Search size={14} /> Filter
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Invoice No','Customer','GSTIN','Invoice Date','Due Date','Place of Supply','Payment Terms','Grand Total (₹)','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-16 text-gray-400">
                    <FileText size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No invoices found.</p>
                  </td></tr>
                ) : filtered.map((inv, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white text-xs">{inv.invoiceNumber || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{inv.customerName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{inv.gstNo || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{inv.invoiceDate || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{inv.dueDate || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{inv.deliveryAddress || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{inv.paymentMethod || '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">₹{Number(inv.totalAmount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {editStatusId === inv.id ? (
                        <div className="flex items-center gap-1">
                          <select value={editStatusVal} onChange={e => setEditStatusVal(e.target.value)}
                            className="px-2 py-1 rounded-lg border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[#140f2d]/80">
                            {INVOICE_STATUSES_LIST.map(s => <option key={s} value={s.toUpperCase()}>{s}</option>)}
                          </select>
                          <button onClick={() => handleStatusUpdate(inv)} disabled={updatingStatus}
                            className="p-1 rounded-lg bg-green-100 text-emerald-400 hover:bg-green-200">
                            {updatingStatus ? <div className="w-3 h-3 border border-green-700 border-t-transparent rounded-full animate-spin" /> : <Check size={12} />}
                          </button>
                          <button onClick={() => setEditStatusId(null)} className="text-xs text-gray-400 hover:text-gray-200 px-1">✕</button>
                        </div>
                      ) : (
                        <StatusBadge status={inv.status} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                       <button onClick={() => navigate(`/dashboard/accounts/invoices/${inv._id || inv.id}`)} className="text-xs text-[#1d4ed8] ...">
  <Eye size={12} /> View
</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => startEditStatus(inv)} className="text-xs text-amber-300 hover:underline font-medium">Change Status</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-xs text-gray-400">Showing {filtered.length} invoice(s)</p>
          </div>
        )}
      </div>
    </div>
  );
}