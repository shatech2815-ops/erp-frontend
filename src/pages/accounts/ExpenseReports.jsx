
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, PieChart, Search, Download } from 'lucide-react';

// const BASE_URL = '/api/accounting';
import {
  getAllExpenseCategories,
  getExpenseReport,
} from "../../services/account/expense.services";
const REPORT_TYPES = ['Summary by Category','Detail by Vendor','Monthly Trend','GST Summary','Billable Expenses','Department Wise'];
const GROUP_BY_OPTIONS = ['Category','Vendor','Month','Payment Mode','Project'];

export default function ExpenseReports() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);

  // useEffect(() => {
  //   fetch('/api/accounting/expense-categories').then(r => r.ok ? r.json() : []).then(d => {
  //     setExpenseCategories(Array.isArray(d) ? d : []);
  //   }).catch(() => {});
  // }, []);

  useEffect(() => {
  loadExpenseCategories();
}, []);

const loadExpenseCategories = async () => {
  try {
    const data = await getAllExpenseCategories();
    setExpenseCategories(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error loading expense categories:', error);
    setExpenseCategories([]);
  }
}; 

  const [filters, setFilters] = useState({ reportType: 'Summary by Category', dateFrom: '', dateTo: '', category: '', vendor: '', groupBy: 'Category' });

  // const handleGenerate = async () => {
  //   setLoading(true);
  //   try {
  //     let url = `${BASE_URL}/expenses/report?`;
  //     if (filters.dateFrom) url += `start=${filters.dateFrom}&`;
  //     if (filters.dateTo) url += `end=${filters.dateTo}&`;
  //     if (filters.category) url += `category=${filters.category}&`;
  //     const res = await fetch(url);
  //     if (res.ok) { const d = await res.json(); setReport(d); setFetched(true); }
  //     else { setReport(null); setFetched(true); }
  //   } catch { setReport(null); setFetched(true); } finally { setLoading(false); }
  // };

  const handleGenerate = async () => {
  setLoading(true);

  try {
    const data = await getExpenseReport(
      filters.category,
      filters.vendor,
      filters.groupBy
    );

    if (data) {
      setReport(data);
      setFetched(true);
    } else {
      setReport(null);
      setFetched(true);
    }
  } catch (error) {
    console.error('Error generating expense report:', error);
    setReport(null);
    setFetched(true);
  } finally {
    setLoading(false);
  }
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
        <span className="text-white font-semibold">Expense Reports</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/accounts/expenses')} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}><PieChart size={22} style={{ color: '#dc2626' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Expense Reports</h2><p className="text-sm text-gray-400">Analyze expenses by category, vendor and period</p></div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Report Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Report Type</label><select value={filters.reportType} onChange={e => setFilters(p => ({ ...p, reportType: e.target.value }))} className={inp}>{REPORT_TYPES.map(r => <option key={r}>{r}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Date From</label><input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} className={inp} /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Date To</label><input type="date" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} className={inp} /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Category</label>
            <select value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} className={inp}>
              <option value="">All Categories</option>
              {expenseCategories.map(c => <option key={c.id || c.categoryName} value={c.categoryName}>{c.categoryName}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Vendor</label><input value={filters.vendor} onChange={e => setFilters(p => ({ ...p, vendor: e.target.value }))} className={inp} placeholder="All vendors" /></div>
          <div><label className="block text-xs font-semibold text-purple-300 mb-1">Group By</label><select value={filters.groupBy} onChange={e => setFilters(p => ({ ...p, groupBy: e.target.value }))} className={inp}>{GROUP_BY_OPTIONS.map(g => <option key={g}>{g}</option>)}</select></div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
            <Search size={14} /> Generate Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-purple-300 hover:bg-white/10"><Download size={14} /> Export PDF</button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-purple-300 hover:bg-white/10"><Download size={14} /> Export Excel</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" /></div>
      ) : fetched ? (
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6 text-center text-gray-400">
          <PieChart size={40} className="mx-auto mb-2 opacity-30" />
          <p>No report data found for the selected filters.</p>
        </div>
      ) : (
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-12 text-center text-gray-400">
          <PieChart size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">Configure filters and click Generate Report</p>
          <p className="text-xs mt-1">Select report type, date range and grouping options above</p>
        </div>
      )}
    </div>
  );
}