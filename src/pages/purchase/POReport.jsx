import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, FileText, Search,
  Download, Calendar, ShoppingCart, DollarSign,
  CheckCircle, XCircle, Clock, AlertCircle, User, CreditCard,
} from 'lucide-react';


import { getAllOrders } from "../../services/purchase/purchaseOrder.services";

// const DEMO_DATA = [
//   {
//     id: 1, orderNumber: 'PO-2026-001', supplierName: 'ABC Suppliers',
//     supplierContact: '9876543210', supplierEmail: 'abc@gmail.com',
//     orderDate: '2026-03-28', expectedDeliveryDate: '2026-04-05',
//     totalAmount: 50000, taxAmount: 9000, discount: 2000, netAmount: 57000,
//     currency: 'INR', paymentMethod: 'NNN', paymentStatus: 'PAID',
//     status: 'CANCELLED', createdBy: 'Manonmani', remarks: 'Order Cancelled',
//     createdAt: '2026-03-28T15:12:12.617347',
//   },
//   {
//     id: 2, orderNumber: 'PO-2222-22', supplierName: 'XYZ Corp',
//     supplierContact: '9988776655', supplierEmail: 'xyz@mail.com',
//     orderDate: '2026-03-28', expectedDeliveryDate: '2026-04-07',
//     totalAmount: 7000, taxAmount: 0, discount: 4, netAmount: 6986,
//     currency: 'INR', paymentMethod: 'Cash', paymentStatus: 'Unpaid',
//     status: 'CREATED', createdBy: 'Mano', remarks: '',
//     createdAt: '2026-03-28T15:17:44.613259',
//   },
// ];

const STATUS_CONFIG = {
  CREATED:   { label: 'Created',   color: '#6366f1', bg: 'rgba(139,92,246,0.12)',  icon: FileText },
  APPROVED:  { label: 'Approved',  color: '#059669', bg: 'rgba(16,185,129,0.15)',  icon: CheckCircle },
  SHIPPED:   { label: 'Shipped',   color: '#2563eb', bg: 'rgba(59,130,246,0.15)',  icon: ShoppingCart },
  DELIVERED: { label: 'Delivered', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(239,68,68,0.15)',  icon: XCircle },
  PENDING:   { label: 'Pending',   color: '#d97706', bg: 'rgba(245,158,11,0.15)',  icon: Clock },
};

const PAYMENT_STATUS_CONFIG = {
  PAID:    { label: 'Paid',    color: '#059669', bg: 'rgba(16,185,129,0.15)' },
  Paid:    { label: 'Paid',    color: '#059669', bg: 'rgba(16,185,129,0.15)' },
  Unpaid:  { label: 'Unpaid',  color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
  UNPAID:  { label: 'Unpaid',  color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
  Pending: { label: 'Pending', color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
  PENDING: { label: 'Pending', color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
  Partial: { label: 'Partial', color: '#7c3aed', bg: 'rgba(139,92,246,0.12)' },
};

const StatusBadge = ({ status, configMap }) => {
  const cfg = configMap[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

export default function POReport() {
  const navigate = useNavigate();
  const [data, setData]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [supplier, setSupplier]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem('srivaari_pos');
  //     const arr = stored ? JSON.parse(stored) : DEMO_DATA;
  //     setData(arr);
  //     setFiltered(arr);
  //   } catch {
  //     setData(DEMO_DATA);
  //     setFiltered(DEMO_DATA);
  //   }
  //   setLoading(false);
  // }, []);

  useEffect(() => {
  fetchReports();
}, []);

const fetchReports = async () => {
  try {
    setLoading(true);

    const response = await getAllOrders();

    setData(response || []);
    setFiltered(response || []);
  } catch (error) {
    console.error("Error loading reports:", error);
    setData([]);
    setFiltered([]);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = () => {
    let f = [...data];
    if (supplier)     f = f.filter(r => r.supplierName?.toLowerCase().includes(supplier.toLowerCase()));
    if (statusFilter) f = f.filter(r => r.status === statusFilter);
    if (startDate)    f = f.filter(r => r.orderDate >= startDate);
    if (endDate)      f = f.filter(r => r.orderDate <= endDate);
    setFiltered(f);
  };

  const handleReset = () => {
    setSupplier(''); setStatusFilter(''); setStartDate(''); setEndDate('');
    setFiltered(data);
  };

  const totalNet    = filtered.reduce((s, r) => s + (r.netAmount || 0), 0);
  const totalTax    = filtered.reduce((s, r) => s + (r.taxAmount || 0), 0);
  // const totalDisc   = filtered.reduce((s, r) => s + (r.discount || 0), 0);
  // const uniqueSuppliers = [...new Set(filtered.map(r => r.supplierName).filter(Boolean))].length;

  const totalDisc = filtered.reduce((s, r) => s + (r.discountAmount || 0), 0);
  const uniqueSuppliers = [...new Set(filtered.map(r => r.supplier).filter(Boolean))].length;

  const handleExport = () => {
    const headers = ['Order No','Supplier','Order Date','Delivery Date','Total','Tax','Discount','Net','Currency','Payment Method','Payment Status','Status','Created By'];
    const rows = filtered.map(r => [
      r.orderNumber, r.supplierName, r.orderDate, r.expectedDeliveryDate,
      r.totalAmount, r.taxAmount, r.discount, r.netAmount,
      r.currency, r.paymentMethod, r.paymentStatus,
      r.status, r.createdBy
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'po-report.csv';
    a.click();
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/reports')} className="hover:text-purple-300 transition-colors">Reports</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">PO Report</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/reports')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <ShoppingCart size={22} style={{ color: '#7c3aed' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Purchase Order Report</h2>
          <p className="text-sm text-gray-400">Detailed purchase order analysis & history</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Orders',    value: filtered.length,                                   color: '#7c3aed', bg: 'rgba(139,92,246,0.12)',  icon: FileText },
          { label: 'Total Net (₹)',   value: `₹${(totalNet/1000).toFixed(1)}K`,                 color: '#059669', bg: 'rgba(16,185,129,0.15)',  icon: DollarSign },
          { label: 'Total Tax (₹)',   value: `₹${(totalTax/1000).toFixed(1)}K`,                 color: '#2563eb', bg: 'rgba(59,130,246,0.15)',  icon: CreditCard },
          { label: 'Unique Suppliers',value: uniqueSuppliers,                                    color: '#d97706', bg: 'rgba(245,158,11,0.15)',  icon: User },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Supplier</label>
            <input type="text" placeholder="Supplier name" value={supplier} onChange={e => setSupplier(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 w-44" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5">
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </div>
          <button onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
            <Search size={14} /> Search
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))' }}>
                  {['#', 'Order No', 'Supplier', 'Order Date', 'Delivery Date', 'Total (₹)', 'Tax (₹)', 'Discount (₹)', 'Net (₹)', 'Currency', 'Payment Method', 'Payment Status', 'Order Status', 'Created By'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.length === 0 ? (
                  <tr><td colSpan={15} className="text-center py-14 text-gray-400">
                    <FileText size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No records found</p>
                  </td></tr>
                ) : filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                    {/* <td className="px-4 py-3 font-bold text-[#7c3aed] text-xs whitespace-nowrap">{r.orderNo}</td> */}
                    <td className="px-4 py-3 font-bold text-[#7c3aed] text-xs whitespace-nowrap">{r.orderNumber}</td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap text-xs">
                      <div>{r.supplier}</div>
                      {r.supplierEmail && <div className="text-[10px] text-gray-400">{r.supplierEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
                      <span className="flex items-center gap-1"><Calendar size={11} className="text-gray-400" /> {r.orderDate}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
                      <span className="flex items-center gap-1"><Calendar size={11} className="text-gray-400" /> {r.expectedDeliveryDate}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold text-xs whitespace-nowrap">
                      ₹{(r.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-[#2563eb] text-xs whitespace-nowrap">
                      ₹{(r.taxAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-500 text-xs whitespace-nowrap">
                      ₹{(r.discount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#059669] text-xs whitespace-nowrap">
                      ₹{(r.netAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.currency}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.paymentStatus} configMap={PAYMENT_STATUS_CONFIG} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} configMap={STATUS_CONFIG} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.createdBy}</td>
                    {/* <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate" title={r.remarks}>{r.remarks || '—'}</td> */}
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-white/10" style={{ background: 'rgba(139,92,246,0.08)' }}>
                    <td colSpan={5} className="px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide">Total ({filtered.length} orders)</td>
                    <td className="px-4 py-3 text-right font-extrabold text-white text-xs">₹{filtered.reduce((s,r) => s+(r.totalAmount||0),0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#2563eb] text-xs">₹{totalTax.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-orange-500 text-xs">₹{totalDisc.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#059669] text-xs">₹{totalNet.toLocaleString()}</td>
                    <td colSpan={6} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {data.length} records</p>
        </div>
      </div>
    </div>
  );
}
