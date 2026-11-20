import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CreditCard, Search, Download } from 'lucide-react';

// const BASE_URL = '/api/accounting';
import { getAllPayments } from "../../services/account/payment.services";
const PAYMENT_TYPES = ['All','OUTGOING','INCOMING'];
const PAYMENT_STATUSES = ['All','PENDING','COMPLETED','FAILED','CANCELLED'];
const PAYMENT_MODES_LIST = ['All','Cash','Cheque','Bank Transfer','UPI','NEFT','RTGS','IMPS'];

export default function PaymentList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'All', paymentType: 'All', paymentMode: 'All', dateFrom: '', dateTo: '' });

  // const fetchPayments = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/payments`);
  //     if (res.ok) { const d = await res.json(); setPayments(Array.isArray(d) ? d : []); }
  //   } catch {} finally { setLoading(false); }
  // };

  const fetchPayments = async () => {
  setLoading(true);

  try {
    const data = await getAllPayments();

    console.log("Payments Response:", data);

    setPayments(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching payments:", error);
    setPayments([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchPayments(); }, []);

  const filtered = payments.filter(p => {
    if (filters.status !== 'All' && p.status?.toUpperCase() !== filters.status) return false;
    if (filters.paymentType !== 'All' && p.paymentType?.toUpperCase() !== filters.paymentType) return false;
    if (filters.paymentMode !== 'All' && p.paymentMode !== filters.paymentMode) return false;
    if (filters.search && !`${p.referenceNo}${p.partyName}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleExportCsv = () => {
    const list = filtered.length > 0 ? filtered : payments;
    const headers = ['Ref No', 'Date', 'Type', 'Party', 'Invoice Ref', 'Amount (₹)', 'Mode', 'Status'];
    const rows = list.map(p => [
      `"${p.referenceNo || ''}"`,
      `"${p.paymentDate || ''}"`,
      `"${p.paymentType || ''}"`,
      `"${(p.partyName || '').replace(/"/g, '""')}"`,
      `"${p.invoiceReference || ''}"`,
      `"${Number(p.amount || 0).toFixed(2)}"`,
      `"${p.paymentMode || ''}"`,
      `"${p.status || ''}"`
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...(rows.length > 0 ? rows.map(r => r.join(',')) : ['"No payments found","","","","","","",""'])
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payment_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/accounts/payments')} className="hover:text-amber-300">Payments</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Payment List</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}><CreditCard size={22} style={{ color: '#d97706' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Payment List</h2><p className="text-sm text-gray-400">All outgoing and incoming payments</p></div>
        <button onClick={() => navigate('/dashboard/accounts/payments/make')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>+ Make Payment</button>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Search</label><input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className={inputCls} placeholder="Reference No / Party Name" /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Payment Type</label><select value={filters.paymentType} onChange={e => setFilters(p => ({ ...p, paymentType: e.target.value }))} className={inputCls}>{PAYMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Status</label><select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className={inputCls}>{PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Payment Mode</label><select value={filters.paymentMode} onChange={e => setFilters(p => ({ ...p, paymentMode: e.target.value }))} className={inputCls}>{PAYMENT_MODES_LIST.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Date From</label><input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} className={inputCls} /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Date To</label><input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} className={inputCls} /></div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPayments} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}><Search size={14} /> Filter</button>
          <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-purple-300 hover:bg-white/10"><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#8b5cf6' }}>{['Ref No','Date','Type','Party','Invoice Ref','Amount (₹)','Mode','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/10">
                {filtered.length === 0 ? <tr><td colSpan={9} className="text-center py-12 text-gray-400">No payments found.</td></tr>
                  : filtered.map((p, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{p.referenceNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-xs">{p.paymentType}</td>
                    <td className="px-4 py-3 text-xs">{p.partyName}</td>
                    <td className="px-4 py-3 text-xs text-purple-300">{p.invoiceReference}</td>
                    <td className="px-4 py-3 text-xs font-bold">₹{Number(p.amount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">{p.paymentMode}</td>
                    <td className="px-4 py-3 text-xs"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300">{p.status}</span></td>
                    <td className="px-4 py-3 text-xs"><button onClick={() => setSelectedPayment(p)} className="text-amber-300 hover:underline font-medium">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1636] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#140f2d]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard size={18} className="text-amber-400" />
                Payment Details
              </h3>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Reference No</p>
                  <p className="text-sm text-white font-medium">{selectedPayment.referenceNo}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Status</p>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300">
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Payment Date</p>
                  <p className="text-sm text-gray-300">{selectedPayment.paymentDate}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Payment Type</p>
                  <p className="text-sm text-gray-300">{selectedPayment.paymentType}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Party</p>
                  <p className="text-sm text-gray-300">{selectedPayment.partyName}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Invoice Reference</p>
                  <p className="text-sm text-purple-300">{selectedPayment.invoiceReference}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Amount</p>
                  <p className="text-lg font-bold text-amber-400">₹{Number(selectedPayment.amount||0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Payment Mode</p>
                  <p className="text-sm text-gray-300">{selectedPayment.paymentMode}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-white/10 bg-[#140f2d]/50 flex justify-end">
              <button onClick={() => setSelectedPayment(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
