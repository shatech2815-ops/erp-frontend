import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Scale, Search, Download, CheckCircle, AlertTriangle } from 'lucide-react';

// const BASE_URL = '/api/accounting';
import { getTrialBalance } from "../../services/account/TrialBalance.services";
const FINANCIAL_YEARS = ['2025-26','2024-25','2023-24','2022-23'];
const ACCOUNT_TYPES = ['All','Assets','Liabilities','Income','Expense','Equity'];
const SHOW_ACCOUNTS_WITH = ['All Balances','Non-Zero Balances','Debit Balances Only','Credit Balances Only'];
const COMPARE_PERIODS = ['None','Previous Month','Previous Quarter','Previous Year'];
const DISPLAY_FORMATS = ['Detailed','Summary','Condensed'];
const fmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function TrialBalance() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    financialYear: '2025-26', asOnDate: '', accountType: 'All',
    showAccountsWith: 'All Balances', fromAccountCode: '', toAccountCode: '',
    compareWithPeriod: 'None', displayFormat: 'Detailed',
  });
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [balanced, setBalanced] = useState(null);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');

  const setF = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  // const handleGenerate = async () => {
  //   setLoading(true); setError('');
  //   try {
  //     let url = `${BASE_URL}/trial-balance?financialYear=${filter.financialYear}`;
  //     if (filter.asOnDate) url += `&asOnDate=${filter.asOnDate}`;
  //     if (filter.accountType !== 'All') url += `&accountType=${filter.accountType}`;
  //     if (filter.fromAccountCode) url += `&fromCode=${filter.fromAccountCode}`;
  //     if (filter.toAccountCode) url += `&toCode=${filter.toAccountCode}`;
  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error(`Error ${res.status}`);
  //     const data = await res.json();
  //     const arr = Array.isArray(data) ? data : [];
  //     setRows(arr); setFetched(true);
  //     const t = arr.reduce((acc, row) => {
  //       acc.openingDebit  += row.openingDebit  || 0; acc.openingCredit += row.openingCredit || 0;
  //       acc.txnDebit      += row.transactionDebit || 0; acc.txnCredit += row.transactionCredit || 0;
  //       acc.closingDebit  += row.closingDebit  || 0; acc.closingCredit += row.closingCredit || 0;
  //       return acc;
  //     }, { openingDebit:0, openingCredit:0, txnDebit:0, txnCredit:0, closingDebit:0, closingCredit:0 });
  //     setTotals(t);
  //     setBalanced(Math.abs(t.closingDebit - t.closingCredit) < 0.01);
  //   } catch (err) { setError(err.message || 'Failed to load trial balance.'); setRows([]); setTotals(null); }
  //   finally { setLoading(false); }
  // };

  const handleGenerate = async () => {
  if (!filter.asOnDate) {
    setDateError('Please select an As on Date before generating the trial balance.');
    return;
  }

  setDateError('');
  setLoading(true);
  setError("");

  try {
    const data = await getTrialBalance(filter.asOnDate);

    console.log("Trial Balance Response:", data);

    const arr = Array.isArray(data) ? data : data?.data || [];

    setRows(arr);
    setFetched(true);

    const t = arr.reduce(
  (acc, row) => {
    acc.opening += Number(row.opening || 0);
    acc.debit += Number(row.debit || 0);
    acc.credit += Number(row.credit || 0);
    acc.closing += Number(row.closing || 0);

    return acc;
  },
  {
    opening: 0,
    debit: 0,
    credit: 0,
    closing: 0,
  }
);

    setTotals(t);
    setBalanced(Math.abs(t.debit - t.credit) < 0.01);
  } catch (err) {
    console.error("Trial balance fetch error:", err);

    setError(
      err?.response?.data?.message ||
        err.message ||
        "Failed to load trial balance."
    );

    setRows([]);
    setTotals(null);
  } finally {
    setLoading(false);
  }
};

  const inp = "w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none bg-[#140f2d]/80";

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Financials</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">Trial Balance</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm"><ArrowLeft size={15} /></button>
        <h2 className="text-xl font-bold text-gray-200">Trial Balance</h2>
      </div>
      <hr className="border-white/10 mb-5" />

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {balanced !== null && (
        <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-semibold ${balanced ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {balanced ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {balanced ? 'Trial Balance is balanced. ✓' : '⚠ Trial Balance mismatch!'}
        </div>
      )}

      {/* Filter */}
      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Filter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Financial Year *</label>
            <select value={filter.financialYear} onChange={e => setF('financialYear', e.target.value)} className={inp}>{FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">As on Date *</label>
            <input
              type="date"
              required
              value={filter.asOnDate}
              onChange={e => { setF('asOnDate', e.target.value); setDateError(''); }}
              aria-invalid={Boolean(dateError)}
              aria-describedby={dateError ? 'as-on-date-error' : undefined}
              className={`${inp} ${dateError ? 'border-red-500 focus:ring-red-500/30' : ''}`}
            />
            {dateError && <p id="as-on-date-error" className="mt-1 text-xs text-red-400">{dateError}</p>}
          </div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Account Type</label>
            <select value={filter.accountType} onChange={e => setF('accountType', e.target.value)} className={inp}>{ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Show Accounts With</label>
            <select value={filter.showAccountsWith} onChange={e => setF('showAccountsWith', e.target.value)} className={inp}>{SHOW_ACCOUNTS_WITH.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">From Account Code</label>
            <input value={filter.fromAccountCode} onChange={e => setF('fromAccountCode', e.target.value)} className={inp} placeholder="e.g. 1000" /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">To Account Code</label>
            <input value={filter.toAccountCode} onChange={e => setF('toAccountCode', e.target.value)} className={inp} placeholder="e.g. 9999" /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Compare With Period</label>
            <select value={filter.compareWithPeriod} onChange={e => setF('compareWithPeriod', e.target.value)} className={inp}>{COMPARE_PERIODS.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Display Format</label>
            <select value={filter.displayFormat} onChange={e => setF('displayFormat', e.target.value)} className={inp}>{DISPLAY_FORMATS.map(d => <option key={d}>{d}</option>)}</select></div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90" style={{ background: '#4C6BF5' }}><Search size={14} /> Generate Trial Balance</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10"><Download size={14} /> Export PDF</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10"><Download size={14} /> Export Excel</button>
          <button className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10">Print</button>
        </div>
      </div>

      {/* Report */}
      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-gray-300">Trial Balance Report</h3>
          {fetched && rows.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Period: 01-Apr-{filter.financialYear.split('-')[0]} to 31-Mar-{filter.financialYear.split('-')[1]} &nbsp;|&nbsp; All accounts &nbsp;|&nbsp; {filter.displayFormat} view
            </p>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: '#2d3748' }}>
                {['Account Code','Account Name','Account Type','Opening (₹)','Debit (₹)','Credit (₹)','Closing Balance (₹)'].map((h, index) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-white whitespace-nowrap ${index >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-white/10">
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    {fetched ? 'No data found for this period.' : 'Generate report to view data.'}
                  </td></tr>
                ) : rows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/10">
                    <td className="px-4 py-3 text-xs text-blue-400 font-medium">{r.accountCode}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-200">{r.accountName}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.accountType}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap">₹{fmt(r.opening)}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap text-emerald-400 font-semibold">₹{fmt(r.debit)}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap text-red-400 font-semibold">₹{fmt(r.credit)}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap font-bold text-gray-200">₹{fmt(r.closing)}</td>
                  </tr>
                ))}
              </tbody>
              {totals && rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-white/10 bg-white/5">
                    <td colSpan={3} className="px-4 py-3 text-xs font-bold text-gray-300 uppercase">Totals</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap font-bold text-gray-300">₹{fmt(totals.opening)}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap font-bold text-emerald-400">₹{fmt(totals.debit)}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap font-bold text-red-400">₹{fmt(totals.credit)}</td>
                    <td className="px-4 py-3 text-xs text-right tabular-nums whitespace-nowrap font-bold text-gray-200">₹{fmt(totals.closing)}</td>
                  </tr>
                  {/* <tr className="bg-white/5">
                    <td colSpan={2} className="px-4 py-3 text-xs font-bold text-gray-300 uppercase">Difference</td>
                    <td className="px-4 py-3 text-xs text-right font-bold text-gray-300">₹{fmt(totals.opening)}</td>
                    <td colSpan={2} />
                    <td className="px-4 py-3 text-xs text-right font-bold text-red-400">₹{fmt(totals.credit)}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: Math.abs(totals.debit - totals.credit) < 0.01 ? '#059669' : '#dc2626' }}>
                      ₹{fmt(Math.abs(totals.debit - totals.credit))} {Math.abs(totals.debit - totals.credit) < 0.01 ? '(Balanced)' : '(Difference)'}
                    </td>
                  </tr> */}

                  <tr className="bg-white/5">
                      <td
                        colSpan={6}
                        className="px-4 py-3 text-xs font-bold text-gray-300 uppercase text-right"
                      >
                        Difference
                      </td>

                      <td
                        className="px-4 py-3 text-xs font-bold text-right"
                        style={{
                          color:
                            Math.abs(totals.debit - totals.credit) < 0.01
                              ? "#059669"
                              : "#dc2626",
                        }}
                      >
                        ₹{fmt(Math.abs(totals.debit - totals.credit))}{" "}
                        {Math.abs(totals.debit - totals.credit) < 0.01
                          ? "(Balanced)"
                          : "(Difference)"}
                      </td>
                    </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        {!fetched && !loading && (
          <div className="px-4 py-3 border-t border-white/10 flex justify-between text-xs text-gray-400">
            <span>Total Debit &nbsp;&nbsp; ₹0.00</span>
            <span>Total Credit &nbsp;&nbsp; ₹0.00</span>
            <span>Difference &nbsp;&nbsp; <span className="text-emerald-400 font-semibold">₹0.00 (Balanced)</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
