
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

import { getBalanceSheetReport } from "../../services/account/balanceSheet.services";
import { exportReportToPdf, exportReportToCsv } from "../../utils/reportExport";


const FINANCIAL_YEARS    = ['2025-26','2024-25','2023-24','2022-23'];
const COMPARE_OPTIONS    = ['None','Previous Year','Previous Quarter'];
const DISPLAY_FORMATS    = ['Vertical','Horizontal'];
const CLOSING_OPTIONS    = ['Yes','No'];
const ZERO_BAL_OPTIONS   = ['No','Yes'];
const CURRENCIES         = ['INR','USD','EUR','GBP'];
const COST_CENTERS       = ['All','Head Office','Branch 1','Branch 2'];

const fmt = (v) =>
  v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—';

const sel = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';
const inp = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';

/* Skeleton rows for the two-column layout */
const LIABILITY_ROWS = [
  { label: 'Share Capital',          key: 'share_capital',       bold: true },
  { label: 'Reserves & Surplus',     key: 'reserves_surplus',    bold: true },
  { label: 'Retained Earnings',      key: 'retained_earnings',   indent: true },
  { label: 'Long-term Liabilities',  key: 'long_term_liabilities', bold: true },
  { label: 'Current Liabilities',    key: 'current_liabilities', bold: true },
  { label: 'Accounts Payable',       key: 'accounts_payable',    indent: true },
  { label: 'Total',                  key: 'total_liabilities',   bold: true, total: true },
];

const ASSET_ROWS = [
  { label: 'Fixed Assets',           key: 'fixed_assets',        bold: true },
  { label: 'Current Assets',         key: 'current_assets',      bold: true },
  { label: 'Cash & Bank',            key: 'cash_bank',           indent: true },
  { label: 'Accounts Receivable',    key: 'accounts_receivable', indent: true },
  { label: 'Inventory',              key: 'inventory',           indent: true },
  { label: 'Prepaid Expenses',       key: 'prepaid_expenses',    indent: true },
  { label: 'Total',                  key: 'total_assets',        bold: true, total: true },
];

export default function BalanceSheet() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    financialYear:   '2025-26',
    asOnDate:        '',
    compareWith:     'None',
    displayFormat:   'Vertical',
    includeClosing:  'Yes',
    showZeroBalance: 'No',
    currency:        'INR',
    costCenter:      'All',
  });
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError]     = useState('');

  const sf = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  /* Build lookup from API BalanceSheetDTO: category, name, amount */
  const buildLookup = (apiRows) => {
    const map = {};
    (apiRows || []).forEach(r => {
      const key = (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      map[key] = r;
    });
    return map;
  };

  // const handleGenerate = async () => {
  //   if (!filter.asOnDate) { setError('Please select As on Date.'); return; }
  //   setLoading(true); setError('');
  //   try {
  //     const res = await fetch(`/api/reports/balance-sheet?date=${filter.asOnDate}`);
  //     if (!res.ok) throw new Error(`Error ${res.status}`);
  //     setRows(await res.json());
  //     setFetched(true);
  //   } catch (e) {
  //     setError(e.message || 'Failed to generate balance sheet.');
  //     setRows([]);
  //   } finally { setLoading(false); }
  // };

  const handleGenerate = async () => {
  if (!filter.asOnDate) {
    setError("Please select As on Date.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await getBalanceSheetReport(filter.asOnDate);

    setRows(Array.isArray(response) ? response : []);
    setFetched(true);
  } catch (error) {
    console.error("Error generating balance sheet:", error);

    if (error.response?.data?.message) {
      setError(error.response.data.message);
    } else {
      setError("Failed to generate balance sheet.");
    }

    setRows([]);
    setFetched(false);
  } finally {
    setLoading(false);
  }
};

  const lookup = buildLookup(rows);
  const getAmt = (key) => {
    const r = lookup[key];
    return fetched && r ? fmt(r.amount) : '—';
  };

  const getExportRowsAndHeaders = () => {
    const headers = [
      'Liabilities & Equity',
      `Amount (${filter.currency})`,
      'Assets',
      `Amount (${filter.currency})`
    ];

    const maxLen = Math.max(LIABILITY_ROWS.length, ASSET_ROWS.length);
    const exportRows = [];

    for (let i = 0; i < maxLen; i++) {
      const lr = LIABILITY_ROWS[i];
      const ar = ASSET_ROWS[i];
      const lAmt = lr ? getAmt(lr.key) : '';
      const aAmt = ar ? getAmt(ar.key) : '';

      exportRows.push({
        cols: [
          lr ? lr.label : '',
          lAmt,
          ar ? ar.label : '',
          aAmt
        ],
        bold: Boolean((lr && lr.bold) || (ar && ar.bold))
      });
    }

    return { headers, exportRows };
  };

  const getExportMeta = () => [
    `Financial Year: ${filter.financialYear}`,
    `As on Date: ${filter.asOnDate || 'All'}`,
    `Display Format: ${filter.displayFormat} | Currency: ${filter.currency}`,
    `Cost Center: ${filter.costCenter}`,
  ];

  const handleExportPdf = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToPdf(`balance_sheet_${dateStr}`, {
      title: 'Balance Sheet',
      meta: getExportMeta(),
      headers,
      rows: exportRows,
      colWidths: [4, 2, 4, 2]
    });
  };

  const handleExportExcel = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToCsv(`balance_sheet_${dateStr}`, {
      title: 'Balance Sheet',
      meta: getExportMeta(),
      headers,
      rows: exportRows
    });
  };

  return (
    <div className="p-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
        <button onClick={() => navigate('/dashboard/accounts/reports')} className="hover:underline">Reports</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">Balance Sheet</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
  <button
    onClick={() => navigate(-1)}
    className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm">
    <ArrowLeft size={15} />
  </button>
  <h2 className="text-lg font-bold text-gray-200">Balance Sheet</h2>
</div>
<hr className="border-white/10 mb-4" />

      {error && (
        <div className="mb-3 px-4 py-2 rounded bg-red-500/10 border border-red-300 text-red-400 text-sm">{error}</div>
      )}

      {/* ── Filter Card ── */}
      <div className="bg-[#140f2d]/80 border border-white/10 rounded p-5 mb-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-300 mb-4">Filter</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Financial Year *</label>
            <select value={filter.financialYear} onChange={e => sf('financialYear', e.target.value)} className={sel}>
              {FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">As on Date *</label>
            <input type="date" value={filter.asOnDate} onChange={e => sf('asOnDate', e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Compare With</label>
            <select value={filter.compareWith} onChange={e => sf('compareWith', e.target.value)} className={sel}>
              {COMPARE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Display Format</label>
            <select value={filter.displayFormat} onChange={e => sf('displayFormat', e.target.value)} className={sel}>
              {DISPLAY_FORMATS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Include Closing Entries</label>
            <select value={filter.includeClosing} onChange={e => sf('includeClosing', e.target.value)} className={sel}>
              {CLOSING_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Show Zero Balances</label>
            <select value={filter.showZeroBalance} onChange={e => sf('showZeroBalance', e.target.value)} className={sel}>
              {ZERO_BAL_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Currency</label>
            <select value={filter.currency} onChange={e => sf('currency', e.target.value)} className={sel}>
              {CURRENCIES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Cost Center</label>
            <select value={filter.costCenter} onChange={e => sf('costCenter', e.target.value)} className={sel}>
              {COST_CENTERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 rounded text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: '#3b5bdb' }}>
            {loading ? 'Generating…' : 'Generate Balance Sheet'}
          </button>
          <button onClick={handleExportPdf} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Export PDF</button>
          <button onClick={handleExportExcel} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Export Excel</button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Print</button>
        </div>
      </div>

      {/* ── Two-column Balance Sheet Table ── */}
      <div className="bg-[#140f2d]/80 border border-white/10 rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#2d3a5e' }} className="text-white">
              <th className="px-4 py-3 text-left font-semibold w-[35%]">Liabilities &amp; Equity</th>
              <th className="px-4 py-3 text-center font-semibold w-[15%]">Amount (₹)</th>
              <th className="px-4 py-3 text-left font-semibold w-[35%] border-l border-white/20">Assets</th>
              <th className="px-4 py-3 text-center font-semibold w-[15%]">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {LIABILITY_ROWS.map((lr, i) => {
              const ar = ASSET_ROWS[i] || null;
              const isTotal = lr.total;
              return (
                <tr key={lr.key}
                  className={`border-b border-white/10 ${isTotal ? 'bg-white/5 border-t-2 border-white/10' : 'hover:bg-white/10'}`}>
                  {/* Liabilities side */}
                  <td className={`px-4 py-2.5 text-sm ${lr.bold ? 'font-bold text-gray-200' : lr.indent ? 'pl-8 text-gray-300' : 'text-gray-300'}`}>
                    {lr.label}
                  </td>
                  <td className={`px-4 py-2.5 text-center text-sm ${lr.bold ? 'font-semibold text-gray-200' : 'text-gray-300'}`}>
                    {getAmt(lr.key)}
                  </td>
                  {/* Assets side */}
                  <td className={`px-4 py-2.5 text-sm border-l border-white/10 ${ar ? (ar.bold ? 'font-bold text-gray-200' : ar.indent ? 'pl-8 text-gray-300' : 'text-gray-300') : ''}`}>
                    {ar ? ar.label : ''}
                  </td>
                  <td className={`px-4 py-2.5 text-center text-sm ${ar ? (ar.bold ? 'font-semibold text-gray-200' : 'text-gray-300') : ''}`}>
                    {ar ? getAmt(ar.key) : ''}
                  </td>
                </tr>
              );
            })}

            {/* Extra API rows if returned */}
            {fetched && rows.length > 0 && (() => {
              const knownKeys = [...LIABILITY_ROWS, ...ASSET_ROWS].map(r => r.key);
              const extras = rows.filter(r => {
                const k = (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
                return !knownKeys.includes(k);
              });
              return extras.map((r, i) => (
                <tr key={`extra-${i}`} className="border-b border-white/10 hover:bg-white/10">
                  <td className="px-4 py-2.5 text-sm text-gray-300">{r.category}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.amount)}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-300 border-l border-white/10">{r.name}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.amount)}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}