import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen, Scale, BarChart2 } from 'lucide-react';

// const BASE_URL = '/api/accounting';
import { getDashboardData } from "../../services/account/dashboard.services";
const FINANCIAL_YEARS = ['2025-26','2024-25','2023-24','2022-23'];
const PERIODS = ['This Month','Last Month','This Quarter','Last Quarter','This Year','Custom'];

const StatCard = ({ label, value }) => (
  <div className="bg-[#140f2d]/80 rounded-lg p-4 shadow-sm border border-white/10">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-xl font-bold text-white">₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
  </div>
);

export default function FinancialsDashboard() {
  const navigate = useNavigate();
  const [financialYear, setFinancialYear] = useState('2025-26');
  const [period, setPeriod] = useState('This Month');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, receivables: 0, payables: 0 });
  const [loading, setLoading] = useState(false);

  // const handleApply = async () => {
  //   setLoading(true);
  //   try {
  //     let url = `${BASE_URL}/financial-report?financialYear=${financialYear}&period=${encodeURIComponent(period)}`;
  //     if (fromDate) url += `&start=${fromDate}`;
  //     if (toDate) url += `&end=${toDate}`;
  //     const res = await fetch(url);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setStats({
  //         totalRevenue: data.totalIncome || data.totalRevenue || 0,
  //         totalExpenses: data.totalExpense || data.totalExpenses || 0,
  //         netProfit: data.netProfit || 0,
  //         receivables: data.receivables || 0,
  //         payables: data.payables || 0,
  //       });
  //     }
  //   } catch {} finally { setLoading(false); }
  // };

  const handleApply = async () => {
  setLoading(true);

  try {
    const data = await getDashboardData(fromDate, toDate);

    console.log("Dashboard Response:", data);

    const dashboardData = Array.isArray(data) ? data[0] : data;

    setStats({
      totalRevenue:
        dashboardData?.totalRevenue ||
        dashboardData?.totalIncome ||
        0,

      totalExpenses:
        dashboardData?.totalExpenses ||
        dashboardData?.totalExpense ||
        0,

      netProfit:
        dashboardData?.netProfit || 0,

      receivables:
        dashboardData?.receivables || 0,

      payables:
        dashboardData?.payables || 0,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);

    setStats({
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      receivables: 0,
      payables: 0,
    });
  } finally {
    setLoading(false);
  }
};

  const inp = "px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none bg-[#140f2d]/80";

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Financials</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">Dashboard</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm"><ArrowLeft size={15} /></button>
        <h2 className="text-xl font-bold text-gray-200">Financial Dashboard</h2>
      </div>
      <hr className="border-white/10 mb-5" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        <StatCard label="Total Revenue"   value={stats.totalRevenue} />
        <StatCard label="Total Expenses"  value={stats.totalExpenses} />
        <StatCard label="Net Profit"      value={stats.netProfit} />
        <StatCard label="Receivables"     value={stats.receivables} />
        <StatCard label="Payables"        value={stats.payables} />
      </div>

      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 p-5 mb-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Filter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Financial Year</label>
            <select value={financialYear} onChange={e => setFinancialYear(e.target.value)} className={inp + ' w-full'}>{FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}</select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Period</label>
            <select value={period} onChange={e => setPeriod(e.target.value)} className={inp + ' w-full'}>{PERIODS.map(p => <option key={p}>{p}</option>)}</select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inp + ' w-full'} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inp + ' w-full'} />
          </div>
        </div>
        <button onClick={handleApply} disabled={loading} className="px-6 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60" style={{ background: '#4C6BF5' }}>
          {loading ? 'Loading…' : 'Apply'}
        </button>
      </div>

      <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">Quick Navigation</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'General Ledger',    desc: 'View all ledger entries',      icon: BookOpen,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', route: '/dashboard/accounts/financials/ledger' },
          { label: 'Trial Balance',     desc: 'Debit & credit balances',      icon: Scale,     color: '#7c3aed', bg: 'rgba(139,92,246,0.12)', route: '/dashboard/accounts/financials/trial-balance' },
          { label: 'Financial Reports', desc: 'P&L and financial statements', icon: BarChart2, color: '#059669', bg: 'rgba(16,185,129,0.15)', route: '/dashboard/accounts/financials/reports' },
        ].map(({ label, desc, icon: Icon, color, bg, route }) => (
          <button key={label} onClick={() => navigate(route)} className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-md transition-all text-left flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}><Icon size={20} style={{ color }} /></div>
            <div className="flex-1"><p className="font-semibold text-white text-sm">{label}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
