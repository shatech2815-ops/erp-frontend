
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BarChart2, Search, Download, Plus, FileText } from 'lucide-react';

// const BASE_URL = '/api/accounting';

import { getAllExpenses } from "../../services/account/expense.services";

const PAYMENT_MODES = ['All','Cash','Cheque','Bank Transfer','UPI','NEFT','Credit Card'];
const GST_TYPES = ['All','CGST+SGST','IGST','Exempt','Nil Rated','Not Applicable'];

export default function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', dateFrom: '', dateTo: '', paymentMode: 'All', gstType: 'All', vendor: '' });

  // const fetchExpenses = async () => {
  //   setLoading(true);
  //   try { const res = await fetch(`${BASE_URL}/expenses`); if (res.ok) { const d = await res.json(); setExpenses(Array.isArray(d) ? d : []); } }
  //   catch {} finally { setLoading(false); }
  // };

  // useEffect(() => { fetchExpenses(); }, []);

   const fetchExpenses = async () => {
  setLoading(true);

  try {
    const data = await getAllExpenses();
    setExpenses(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    setExpenses([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchExpenses(); }, []);

  const filtered = expenses.filter(e => {
    if (filters.search && !`${e.expenseNo}${e.description}${e.vendor}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.vendor && !e.vendor?.toLowerCase().includes(filters.vendor.toLowerCase())) return false;
    if (filters.paymentMode !== 'All' && e.paymentMode !== filters.paymentMode) return false;
    if (filters.gstType !== 'All' && e.gstType !== filters.gstType) return false;
    return true;
  });

  // When "All" is selected, total excludes "Not Applicable" (non-GST) expenses
  const totalAmt = filtered.reduce((s, e) => {
    if (filters.gstType === 'All' && e.gstType === 'Not Applicable') return s;
    return s + (parseFloat(e.totalAmount)||0);
  }, 0);
  const notApplicableAmt = filtered.filter(e => e.gstType === 'Not Applicable').reduce((s, e) => s + (parseFloat(e.totalAmount)||0), 0);
  const notApplicableCount = filtered.filter(e => e.gstType === 'Not Applicable').length;

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      alert("No expense records available to export.");
      return;
    }
    const headers = [
      'Expense No',
      'Expense Date',
      'Category',
      'Sub Category',
      'Vendor',
      'Amount (INR)',
      'GST Type',
      'GST Amount (INR)',
      'Total Amount (INR)',
      'Payment Mode',
      'Billable'
    ];
    const rows = filtered.map(e => [
      e.expenseNo ?? '',
      e.expenseDate ?? '',
      e.category ?? '',
      e.subCategory ?? '',
      e.vendor ?? '',
      Number(e.amount || 0),
      e.gstType ?? '',
      Number(e.gstAmount || 0),
      Number(e.totalAmount || 0),
      e.paymentMode ?? '',
      e.billable ?? ''
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense-list-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        <span className="text-white font-semibold">Expense List</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/accounts/expenses')} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}><BarChart2 size={22} style={{ color: '#dc2626' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Expense List</h2><p className="text-sm text-gray-400">Track and manage all business expenses</p></div>
        <button onClick={() => navigate('/dashboard/accounts/expenses/add')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}><Plus size={14} /> Add Expense</button>
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10">
            <p className="text-xs text-gray-400 mb-1">{filters.gstType === 'All' ? 'Total Expenses (GST Applicable)' : 'Total Expenses'}</p>
            <p className="text-xl font-bold text-[#dc2626]">₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Total Records</p>
            <p className="text-xl font-bold text-white">{filtered.length}</p>
          </div>
          {(filters.gstType === 'All' || filters.gstType === 'Not Applicable') && notApplicableCount > 0 && (
            <div className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10">
              <p className="text-xs text-gray-400 mb-1">Non-GST Expenses (Not Applicable) — {notApplicableCount} record(s)</p>
              <p className="text-xl font-bold text-[#7c3aed]">₹{notApplicableAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Search</label><input value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className={inp} placeholder="Expense No / Description / Vendor" /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Category</label><input value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} className={inp} placeholder="Filter by category" /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Vendor</label><input value={filters.vendor} onChange={e => setFilters(p => ({ ...p, vendor: e.target.value }))} className={inp} placeholder="Filter by vendor" /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Payment Mode</label><select value={filters.paymentMode} onChange={e => setFilters(p => ({ ...p, paymentMode: e.target.value }))} className={inp}>{PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Date From</label><input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} className={inp} /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Date To</label><input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} className={inp} /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">GST Type</label><select value={filters.gstType} onChange={e => setFilters(p => ({ ...p, gstType: e.target.value }))} className={inp}>{GST_TYPES.map(g => <option key={g}>{g}</option>)}</select></div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchExpenses} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}><Search size={14} /> Filter</button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-purple-300 hover:bg-white/10 transition-colors cursor-pointer"><Download size={14} /> Export CSV</button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#8b5cf6' }}>{['Exp No','Date','Category','Sub Category','Vendor','Amount (₹)','GST Type','GST (₹)','Total (₹)','Payment Mode','Billable','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/10">
                {filtered.length === 0 ? <tr><td colSpan={12} className="text-center py-12 text-gray-400">No expenses found.</td></tr>
                  : filtered.map((e, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{e.expenseNo}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{e.expenseDate}</td>
                    <td className="px-4 py-3 text-xs">{e.category}</td>
                    <td className="px-4 py-3 text-xs">{e.subCategory}</td>
                    <td className="px-4 py-3 text-xs">{e.vendor}</td>
                    <td className="px-4 py-3 text-xs font-semibold">₹{Number(e.amount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">{e.gstType}</td>
                    <td className="px-4 py-3 text-xs">₹{Number(e.gstAmount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs font-bold">₹{Number(e.totalAmount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs">{e.paymentMode}</td>
                    <td className="px-4 py-3 text-xs">{e.billable}</td>
                    <td className="px-4 py-3 text-xs"><button onClick={() => setSelectedExpense(e)} className="text-amber-300 hover:underline font-medium">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1636] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#140f2d]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-amber-400" />
                Expense Details
              </h3>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Expense No</p>
                  <p className="text-sm text-white font-medium">{selectedExpense.expenseNo}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Expense Date</p>
                  <p className="text-sm text-gray-300">{selectedExpense.expenseDate}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Category</p>
                  <p className="text-sm text-gray-300">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Sub Category</p>
                  <p className="text-sm text-gray-300">{selectedExpense.subCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Vendor</p>
                  <p className="text-sm text-gray-300">{selectedExpense.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Amount</p>
                  <p className="text-sm text-gray-300">₹{Number(selectedExpense.amount||0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">GST Amount</p>
                  <p className="text-sm text-gray-300">₹{Number(selectedExpense.gstAmount||0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-amber-400">₹{Number(selectedExpense.totalAmount||0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Payment Mode</p>
                  <p className="text-sm text-gray-300">{selectedExpense.paymentMode}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Billable</p>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300">
                    {selectedExpense.billable}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-white/10 bg-[#140f2d]/50 flex justify-end">
              <button onClick={() => setSelectedExpense(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}