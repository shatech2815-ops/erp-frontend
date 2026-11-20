 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Activity, Search, Bell, Download } from 'lucide-react';

// const BASE_URL = '/api/accounting';

import {
  getAllAccountInvoices,
  getAllInvoiceTracking,
  createInvoiceTracking,
  updateInvoiceTrackingStatus,
  getInvoiceTrackingById
} from '../../services/account/accountInvoice.services';

const TRACKING_STATUSES = ['All','SENT','VIEWED','PARTIALLY_PAID','PAID','OVERDUE'];
const FOLLOW_UP_METHODS = ['Phone Call','Email','WhatsApp','In Person','SMS'];
const NEW_STATUSES = ['Sent','Viewed','Partially Paid','Paid','Overdue','Disputed'];
const DUE_DATE_RANGES = ['All','Today','This Week','This Month','Overdue'];

export default function InvoiceTracking() {
  const navigate = useNavigate();
  const [trackLog, setTrackLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [invoiceNos, setInvoiceNos] = useState([]);

  const [search, setSearch] = useState({ invoiceNo: '', customer: '', trackingStatus: 'All', dueDateRange: 'All', dateFrom: '', dateTo: '', overdueBy: '', minPending: '0' });
  const [update, setUpdate] = useState({ invoiceNo: '', newStatus: 'Sent', statusDate: '', remarks: '', nextFollowUpDate: '', followUpMethod: 'Phone Call', assignedTo: '' });

  // useEffect(() => {
  //   fetch(`${BASE_URL}/invoices`)
  //     .then(r => r.ok ? r.json() : [])
  //     .then(d => {
  //       const nos = (Array.isArray(d) ? d : []).map(i => i.invoiceNumber).filter(Boolean);
  //       setInvoiceNos(nos);
  //       if (nos.length > 0) {
  //         setSearch(p => ({ ...p, invoiceNo: nos[0] }));
  //         setUpdate(p => ({ ...p, invoiceNo: nos[0] }));
  //       }
  //     })
  //     .catch(() => {});
  // }, []);

  useEffect(() => {
  loadInvoices();
  handleSearch();
}, []);

const loadInvoices = async () => {
  try {
    const data = await getAllAccountInvoices();

    const nos = (Array.isArray(data) ? data : [])
      .map((item) => item.invoiceNumber)
      .filter(Boolean);

    setInvoiceNos(nos);

    if (nos.length > 0) {
      setSearch((prev) => ({ ...prev, invoiceNo: nos[0] }));
      setUpdate((prev) => ({ ...prev, invoiceNo: nos[0] }));
    }
  } catch (error) {
    console.error('Error loading invoices:', error);
  }
};

  // const handleSearch = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/invoice-tracking`);
  //     if (res.ok) { const d = await res.json(); setTrackLog(Array.isArray(d) ? d : []); }
  //   } catch {}
  //   finally { setLoading(false); }
  // };
  
  const handleSearch = async () => {
  setLoading(true);

  try {
   const trackingData = await getAllInvoiceTracking();
const invoiceData = await getAllAccountInvoices();

    let filteredData = Array.isArray(trackingData)
  ? trackingData
  : [];

   if (search.invoiceNo) {
  filteredData = filteredData.filter((item) => {
    const invoiceValue =
      item.invoiceNo ||
      item.invoiceNumber ||
      item.invoice?.invoiceNumber ||
      "";

    return (
      String(invoiceValue).trim().toLowerCase() ===
      String(search.invoiceNo).trim().toLowerCase()
    );
  });
}

    if (search.customer) {
      filteredData = filteredData.filter((item) =>
        (item.customer || "")
          .toLowerCase()
          .includes(search.customer.toLowerCase())
      );
    }

    if (search.trackingStatus !== "All") {
      filteredData = filteredData.filter(
        (item) =>
          String(item.status || "").toUpperCase() ===
          String(search.trackingStatus || "").toUpperCase()
      );
    }

    if (search.minPending) {
      filteredData = filteredData.filter(
        (item) => Number(item.balance || 0) >= Number(search.minPending)
      );
    }

    if (search.overdueBy) {
      filteredData = filteredData.filter(
        (item) => Number(item.overdueDays || 0) >= Number(search.overdueBy)
      );
    }

    console.log("Filtered Data:", filteredData);

    const formattedData = filteredData.map((track) =>  {

  const invoice = invoiceData.find(
    (inv) =>
      inv.invoiceNumber ===
      (track.invoiceNo || track.invoice?.invoiceNumber)
  );

  const total = invoice?.total || 0;
  const paid = invoice?.paidAmount || 0;

  return {
    invoiceNo:
      invoice?.invoiceNumber ||
      track.invoiceNo ||
      "",

    customer:
      invoice?.customerName ||
      "N/A",

    total: total,

    paid: paid,

    balance: total - paid,

    overdueDays:
      invoice?.dueDate
        ? Math.max(
            Math.floor(
              (new Date() - new Date(invoice.dueDate)) /
              (1000 * 60 * 60 * 24)
            ),
            0
          )
        : 0,

    status: track.status || "SENT",

    nextFollowUpDate:
      track.nextFollowUpDate || null,
  };
});

setTrackLog(formattedData);
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    setTrackLog([]);
  } finally {
    setLoading(false);
  }
};

  // const handleUpdateStatus = async () => {
  //   setUpdating(true); setMsg('');
  //   try {
  //     const payload = {
  //       invoiceNo: update.invoiceNo,
  //       status: update.newStatus.toUpperCase().replace(/ /g, '_'),
  //       statusDate: update.statusDate || null,
  //       remarks: update.remarks,
  //       nextFollowUpDate: update.nextFollowUpDate || null,
  //       followUpMethod: update.followUpMethod.toUpperCase().replace(/ /g, '_'),
  //       assignedTo: update.assignedTo,
  //     };
  //     const res = await fetch(`${BASE_URL}/invoice-tracking`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     if (res.ok) { setMsg('Status updated successfully!'); handleSearch(); }
  //     else { setMsg('Failed to update status.'); }
  //   } catch { setMsg('Error updating status.'); }
  //   finally { setUpdating(false); }
  // };

  const handleUpdateStatus = async () => {

  if (!update.invoiceNo) {
    setMsg('Please select invoice number');
    return;
  }

  setUpdating(true);
  setMsg('');

  try {

    const payload = {
      invoiceNo: update.invoiceNo,
      status: update.newStatus.toUpperCase().replace(/ /g, '_'),
      statusDate: update.statusDate || null,
      remarks: update.remarks,
      nextFollowUpDate: update.nextFollowUpDate || null,
      followUpMethod: update.followUpMethod.toUpperCase().replace(/ /g, '_'),
      assignedTo: update.assignedTo,
    };

    await updateInvoiceTrackingStatus(payload);

    setMsg('Status updated successfully!');

    handleSearch();

  } catch (error) {

    console.error('Error updating status:', error);
    setMsg('Failed to update status');

  } finally {

    setUpdating(false);

  }
};

  const labelCls = "block text-xs font-semibold text-purple-300 mb-1";
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Invoice Tracking</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Activity size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Invoice Tracking</h2>
          <p className="text-sm text-gray-400">Track payment status and follow-ups for invoices</p>
        </div>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Error') || msg.includes('Failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      {/* Track & Search */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Track &amp; Search</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Invoice No</label>
            <select
              value={search.invoiceNo}
              onChange={e => setSearch(p => ({ ...p, invoiceNo: e.target.value }))}
              className={inputCls}
            >
              <option value="">All Invoices</option>
              {invoiceNos.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Customer</label>
            <input value={search.customer} onChange={e => setSearch(p => ({ ...p, customer: e.target.value }))} className={inputCls} placeholder="Customer name" />
          </div>
          <div>
            <label className={labelCls}>Tracking Status</label>
            <select value={search.trackingStatus} onChange={e => setSearch(p => ({ ...p, trackingStatus: e.target.value }))} className={inputCls}>
              {TRACKING_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Due Date Range</label>
            <select value={search.dueDateRange} onChange={e => setSearch(p => ({ ...p, dueDateRange: e.target.value }))} className={inputCls}>
              {DUE_DATE_RANGES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date From</label>
            <input type="date" value={search.dateFrom} onChange={e => setSearch(p => ({ ...p, dateFrom: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date To</label>
            <input type="date" value={search.dateTo} onChange={e => setSearch(p => ({ ...p, dateTo: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Overdue By (Days)</label>
            <input type="number" value={search.overdueBy} onChange={e => setSearch(p => ({ ...p, overdueBy: e.target.value }))} className={inputCls} placeholder="e.g. 30" />
          </div>
          <div>
            <label className={labelCls}>Min Pending Amount (₹)</label>
            <input type="number" value={search.minPending} onChange={e => setSearch(p => ({ ...p, minPending: e.target.value }))} className={inputCls} defaultValue="0" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            <Search size={14} /> Search
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
            <Bell size={14} /> Send Bulk Reminder
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Update Invoice Status */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Update Invoice Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Invoice No *</label>
            <select
              value={update.invoiceNo}
              onChange={e => setUpdate(p => ({ ...p, invoiceNo: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select Invoice</option>
              {invoiceNos.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>New Status *</label>
            <select value={update.newStatus} onChange={e => setUpdate(p => ({ ...p, newStatus: e.target.value }))} className={inputCls}>
              {NEW_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status Date</label>
            <input type="date" value={update.statusDate} onChange={e => setUpdate(p => ({ ...p, statusDate: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Remarks</label>
            <input value={update.remarks} onChange={e => setUpdate(p => ({ ...p, remarks: e.target.value }))} className={inputCls} placeholder="e.g. Follow-up call done" />
          </div>
          <div>
            <label className={labelCls}>Next Follow-up Date</label>
            <input type="date" value={update.nextFollowUpDate} onChange={e => setUpdate(p => ({ ...p, nextFollowUpDate: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Follow-up Method</label>
            <select value={update.followUpMethod} onChange={e => setUpdate(p => ({ ...p, followUpMethod: e.target.value }))} className={inputCls}>
              {FOLLOW_UP_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Assigned To</label>
            <input value={update.assignedTo} onChange={e => setUpdate(p => ({ ...p, assignedTo: e.target.value }))} className={inputCls} placeholder="Staff / salesperson name" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpdateStatus} disabled={updating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            {updating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Update Status
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
            <Bell size={14} /> Send Reminder Email
          </button>
        </div>
      </div>

      {/* Tracking Log */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-purple-300">Tracking Log</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Invoice No','Customer','Total','Paid','Balance','Overdue Days','Status','Next Follow-up','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {trackLog.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No records found</td></tr>
                ) : trackLog.map((t, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)] transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{t.invoiceNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{t.customer}</td>
                    <td className="px-4 py-3 text-xs font-semibold">₹{Number(t.total || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-[#059669]">₹{Number(t.paid || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-[#dc2626]">₹{Number(t.balance || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-center">{t.overdueDays ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">{t.status}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{t.nextFollowUpDate ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-amber-300 hover:underline font-medium">View</button>
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