
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { getProfitLossReport } from "../../services/account/profitLoss.services";
import { exportReportToPdf, exportReportToCsv } from "../../utils/reportExport";

const FINANCIAL_YEARS   = ['2025-26','2024-25','2023-24','2022-23'];
const COMPARE_OPTIONS   = ['None','Previous Month','Previous Quarter','Previous Year'];
const BASIS_OPTIONS     = ['Accrual','Cash'];
const COST_CENTERS      = ['All','Head Office','Branch 1','Branch 2'];
const SHOW_PCT_OPTIONS  = ['No','Yes'];
const CURRENCIES        = ['INR','USD','EUR','GBP'];

const fmt = (v) =>
  v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—';

const sel = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';
const inp = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';

/* Static skeleton rows - populated from API response by matching particulars */
// const SKELETON = [
//   { section: 'Income',    label: 'Income',           isHeader: true },
//   { section: 'Income',    label: 'Sales Revenue',    key: 'sales_revenue' },
//   { section: 'Income',    label: 'Other Income',     key: 'other_income' },
//   { section: 'Income',    label: 'Gross Profit',     isSub: true, key: 'gross_profit' },
//   { section: 'Expenses',  label: 'Expenses',         isHeader: true },
//   { section: 'Expenses',  label: 'Operating Expenses', key: 'operating_expenses' },
//   { section: 'Expenses',  label: 'Depreciation',     key: 'depreciation' },
//   { section: 'Net',       label: 'Net Profit / Loss', isBold: true, key: 'net_profit' },
// ];

export default function ProfitLossReport() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    financialYear: '2025-26',
    periodFrom: '',
    periodTo: '',
    compareWith: 'None',
    basis: 'Accrual',
    costCenter: 'All',
    showPct: 'No',
    currency: 'INR',
  });
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError]     = useState('');

  const sf = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  /* Map API rows (by particulars) into keyed lookup */
  const buildLookup = (apiRows) => {
    const map = {};
    (apiRows || []).forEach(r => {
      if (r.particulars) map[r.particulars.toLowerCase().replace(/\s+/g, '_')] = r;
    });
    return map;
  };

  // const handleGenerate = async () => {
  //   if (!filter.periodFrom || !filter.periodTo) {
  //     setError('Please select Period From and Period To.'); return;
  //   }
  //   setLoading(true); setError('');
  //   try {
  //     const res = await fetch(
  //       `/api/reports/profit-loss?from=${filter.periodFrom}&to=${filter.periodTo}`
  //     );
  //     if (!res.ok) throw new Error(`Error ${res.status}`);
  //     setRows(await res.json());
  //     setFetched(true);
  //   } catch (e) {
  //     setError(e.message || 'Failed to generate report.');
  //     setRows([]);
  //   } finally { setLoading(false); }
  // };

  const handleGenerate = async () => {
  if (!filter.periodFrom || !filter.periodTo) {
    setError("Please select Period From and Period To.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await getProfitLossReport(
      filter.periodFrom,
      filter.periodTo
    );

    setRows(Array.isArray(response) ? response : []);
    setFetched(true);
  } catch (error) {
    console.error("Error generating profit & loss report:", error);

    if (error.response?.data?.message) {
      setError(error.response.data.message);
    } else {
      setError("Failed to generate report.");
    }

    setRows([]);
    setFetched(false);
  } finally {
    setLoading(false);
  }
};

  const lookup = buildLookup(rows);

  const getRow = (key) => lookup[key] || null;

  const getExportRowsAndHeaders = () => {
    const showPct = filter.showPct === 'Yes';
    const headers = showPct
      ? ['Particulars', `Current Period (${filter.currency})`, `Previous Period (${filter.currency})`, 'Change (%)']
      : ['Particulars', `Current Period (${filter.currency})`, `Previous Period (${filter.currency})`];

    const exportRows = [];

    // INCOME
    exportRows.push({ cols: ['INCOME', '', '', ...(showPct ? [''] : [])], bold: true, isHeader: true });
    const incomeItems = [
      { label: 'Sales Revenue', key: 'sales_revenue' },
      { label: 'Other Income', key: 'other_income' },
    ];
    for (const item of incomeItems) {
      const r = getRow(item.key);
      const cur = fetched && r ? fmt(r.currentAmount) : '—';
      const prev = fetched && r ? fmt(r.previousAmount) : '—';
      const pct = fetched && r && r.changePercent != null ? `${r.changePercent.toFixed(1)}%` : '—';
      exportRows.push({ cols: [item.label, cur, prev, ...(showPct ? [pct] : [])] });
    }

    const gp = getRow('gross_profit');
    exportRows.push({
      cols: [
        'Gross Profit',
        fetched && gp ? fmt(gp.currentAmount) : '—',
        fetched && gp ? fmt(gp.previousAmount) : '—',
        ...(showPct ? ['—'] : [])
      ],
      bold: true
    });

    // EXPENSES
    exportRows.push({ cols: ['EXPENSES', '', '', ...(showPct ? [''] : [])], bold: true, isHeader: true });
    const expenseItems = [
      { label: 'Operating Expenses', key: 'operating_expenses' },
      { label: 'Depreciation', key: 'depreciation' },
    ];
    for (const item of expenseItems) {
      const r = getRow(item.key);
      const cur = fetched && r ? fmt(r.currentAmount) : '—';
      const prev = fetched && r ? fmt(r.previousAmount) : '—';
      const pct = fetched && r && r.changePercent != null ? `${r.changePercent.toFixed(1)}%` : '—';
      exportRows.push({ cols: [item.label, cur, prev, ...(showPct ? [pct] : [])] });
    }

    const np = getRow('net_profit');
    exportRows.push({
      cols: [
        'Net Profit / Loss',
        fetched && np ? fmt(np.currentAmount) : '—',
        fetched && np ? fmt(np.previousAmount) : '—',
        ...(showPct ? ['—'] : [])
      ],
      bold: true
    });

    // Extra rows if any
    if (fetched && rows.length > 0) {
      rows
        .filter(r => {
          const k = (r.particulars || '').toLowerCase().replace(/\s+/g, '_');
          return !['sales_revenue','other_income','gross_profit','operating_expenses','depreciation','net_profit'].includes(k);
        })
        .forEach(r => {
          const cur = fmt(r.currentAmount);
          const prev = fmt(r.previousAmount);
          const pct = r.changePercent != null ? `${r.changePercent.toFixed(1)}%` : '—';
          exportRows.push({ cols: [r.particulars, cur, prev, ...(showPct ? [pct] : [])] });
        });
    }

    return { headers, exportRows };
  };

  const getExportMeta = () => [
    `Financial Year: ${filter.financialYear}`,
    `Period: ${filter.periodFrom || 'All'} to ${filter.periodTo || 'All'}`,
    `Accounting Basis: ${filter.basis} | Currency: ${filter.currency}`,
    `Cost Center: ${filter.costCenter}`,
  ];

  const handleExportPdf = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToPdf(`profit_loss_report_${dateStr}`, {
      title: 'Profit & Loss Report',
      meta: getExportMeta(),
      headers,
      rows: exportRows,
      colWidths: filter.showPct === 'Yes' ? [5, 3, 3, 2] : [6, 3, 3]
    });
  };

  const handleExportExcel = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToCsv(`profit_loss_report_${dateStr}`, {
      title: 'Profit & Loss Report',
      meta: getExportMeta(),
      headers,
      rows: exportRows
    });
  };

  /* Render a data cell */
  const Cell = ({ rowKey, field = 'currentAmount' }) => {
    const r = getRow(rowKey);
    return (
      <td className="px-4 py-2.5 text-center text-sm text-gray-300">
        {fetched && r ? fmt(r[field]) : '—'}
      </td>
    );
  };

  return (
    <div className="p-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
        <button onClick={() => navigate('/dashboard/accounts/reports')} className="hover:underline">Reports</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">P&L Report</span>
      </div>

          <div className="flex items-center gap-3 mb-3">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm">
        <ArrowLeft size={15} />
      </button>
      <h2 className="text-lg font-bold text-gray-200">Profit &amp; Loss Report</h2>
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
            <label className="block text-xs font-semibold text-gray-300 mb-1">Period From *</label>
            <input type="date" value={filter.periodFrom} onChange={e => sf('periodFrom', e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Period To *</label>
            <input type="date" value={filter.periodTo} onChange={e => sf('periodTo', e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Compare With</label>
            <select value={filter.compareWith} onChange={e => sf('compareWith', e.target.value)} className={sel}>
              {COMPARE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Basis</label>
            <select value={filter.basis} onChange={e => sf('basis', e.target.value)} className={sel}>
              {BASIS_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Cost Center</label>
            <select value={filter.costCenter} onChange={e => sf('costCenter', e.target.value)} className={sel}>
              {COST_CENTERS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Show % Column</label>
            <select value={filter.showPct} onChange={e => sf('showPct', e.target.value)} className={sel}>
              {SHOW_PCT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Currency</label>
            <select value={filter.currency} onChange={e => sf('currency', e.target.value)} className={sel}>
              {CURRENCIES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 rounded text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: '#3b5bdb' }}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button onClick={handleExportPdf} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Export PDF</button>
          <button onClick={handleExportExcel} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Export Excel</button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Print</button>
        </div>
      </div>

      {/* ── Report Table ── */}
      <div className="bg-[#140f2d]/80 border border-white/10 rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#2d3a5e' }} className="text-white">
              <th className="px-4 py-3 text-left font-semibold w-1/2">Particulars</th>
              <th className="px-4 py-3 text-center font-semibold">Current Period (₹)</th>
              <th className="px-4 py-3 text-center font-semibold">Previous Period (₹)</th>
              {filter.showPct === 'Yes' && (
                <th className="px-4 py-3 text-center font-semibold">Change (%)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* INCOME section */}
            <tr className="bg-white/5">
              <td colSpan={filter.showPct === 'Yes' ? 4 : 3}
                className="px-4 py-2 font-bold text-gray-200 text-sm border-b border-white/10">
                Income
              </td>
            </tr>
            {[
              { label: 'Sales Revenue',  key: 'sales_revenue' },
              { label: 'Other Income',   key: 'other_income' },
            ].map(({ label, key }) => (
              <tr key={key} className="border-b border-white/10 hover:bg-white/10">
                <td className="px-6 py-2.5 text-gray-300 text-sm">{label}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                  {fetched && getRow(key) ? fmt(getRow(key).currentAmount) : '—'}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                  {fetched && getRow(key) ? fmt(getRow(key).previousAmount) : '—'}
                </td>
                {filter.showPct === 'Yes' && (
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                    {fetched && getRow(key) ? (getRow(key).changePercent != null ? `${getRow(key).changePercent.toFixed(1)}%` : '—') : '—'}
                  </td>
                )}
              </tr>
            ))}
            {/* Gross Profit */}
            <tr className="border-b border-white/10 bg-white/5">
              <td className="px-4 py-2.5 font-bold text-gray-200 text-sm">Gross Profit</td>
              <td className="px-4 py-2.5 text-center text-sm font-semibold text-gray-200">
                {fetched && getRow('gross_profit') ? fmt(getRow('gross_profit').currentAmount) : '—'}
              </td>
              <td className="px-4 py-2.5 text-center text-sm font-semibold text-gray-200">
                {fetched && getRow('gross_profit') ? fmt(getRow('gross_profit').previousAmount) : '—'}
              </td>
              {filter.showPct === 'Yes' && <td className="px-4 py-2.5 text-center text-sm">—</td>}
            </tr>

            {/* EXPENSES section */}
            <tr className="bg-white/5">
              <td colSpan={filter.showPct === 'Yes' ? 4 : 3}
                className="px-4 py-2 font-bold text-gray-200 text-sm border-b border-white/10">
                Expenses
              </td>
            </tr>
            {[
              { label: 'Operating Expenses', key: 'operating_expenses' },
              { label: 'Depreciation',       key: 'depreciation' },
            ].map(({ label, key }) => (
              <tr key={key} className="border-b border-white/10 hover:bg-white/10">
                <td className="px-6 py-2.5 text-gray-300 text-sm">{label}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                  {fetched && getRow(key) ? fmt(getRow(key).currentAmount) : '—'}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                  {fetched && getRow(key) ? fmt(getRow(key).previousAmount) : '—'}
                </td>
                {filter.showPct === 'Yes' && (
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                    {fetched && getRow(key) ? (getRow(key).changePercent != null ? `${getRow(key).changePercent.toFixed(1)}%` : '—') : '—'}
                  </td>
                )}
              </tr>
            ))}

            {/* Net Profit */}
            <tr className="border-t-2 border-white/10">
              <td className="px-4 py-3 font-bold text-gray-200 text-sm">Net Profit / Loss</td>
              <td className="px-4 py-3 text-center text-sm font-bold text-gray-200">
                {fetched && getRow('net_profit') ? fmt(getRow('net_profit').currentAmount) : '—'}
              </td>
              <td className="px-4 py-3 text-center text-sm font-bold text-gray-200">
                {fetched && getRow('net_profit') ? fmt(getRow('net_profit').previousAmount) : '—'}
              </td>
              {filter.showPct === 'Yes' && <td className="px-4 py-3 text-center text-sm font-bold">—</td>}
            </tr>

            {/* If API returned extra rows not in skeleton, show them */}
            {fetched && rows.length > 0 && rows
              .filter(r => {
                const k = (r.particulars || '').toLowerCase().replace(/\s+/g, '_');
                return !['sales_revenue','other_income','gross_profit','operating_expenses','depreciation','net_profit'].includes(k);
              })
              .map((r, i) => (
                <tr key={`extra-${i}`} className="border-b border-white/10 hover:bg-white/10">
                  <td className="px-6 py-2.5 text-gray-300 text-sm">{r.particulars}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.currentAmount)}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.previousAmount)}</td>
                  {filter.showPct === 'Yes' && (
                    <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                      {r.changePercent != null ? `${r.changePercent.toFixed(1)}%` : '—'}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}