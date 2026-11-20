
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

import { getCashFlowReport } from "../../services/account/cashFlow.services";
import { exportReportToPdf, exportReportToCsv } from "../../utils/reportExport";


const FINANCIAL_YEARS  = ['2025-26','2024-25','2023-24','2022-23'];
const METHODS          = ['Indirect Method','Direct Method'];
const COMPARE_OPTIONS  = ['None','Previous Year','Previous Quarter'];
const BANK_ACCOUNTS    = ['All','Main Account','Savings Account','Current Account'];
const CURRENCIES       = ['INR','USD','EUR','GBP'];

const fmt = (v) =>
  v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—';

const sel = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';
const inp = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';

/* Skeleton matching the screenshot exactly */
const CASH_FLOW_SKELETON = [
  { section: 'A. Operating Activities', sectionHeader: true },
  { label: 'Net Profit',                        key: 'net_profit',                indent: true },
  { label: 'Add: Depreciation',                 key: 'add:_depreciation',         indent: true },
  { label: 'Changes in Working Capital',         key: 'changes_in_working_capital',indent: true },
  { label: 'Net Cash from Operations',           key: 'net_cash_from_operations',  bold: true },

  { section: 'B. Investing Activities', sectionHeader: true },
  { label: 'Purchase of Assets',                key: 'purchase_of_assets',        indent: true },
  { label: 'Net Cash from Investing',           key: 'net_cash_from_investing',   bold: true },

  { section: 'C. Financing Activities', sectionHeader: true },
  { label: 'Loans Received / Repaid',           key: 'loans_received_/_repaid',   indent: true },
  { label: 'Net Cash from Financing',           key: 'net_cash_from_financing',   bold: true },

  { label: 'Net Change in Cash',                key: 'net_change_in_cash',        bold: true, divider: true },
  { label: 'Closing Cash Balance',              key: 'closing_cash_balance',      bold: true },
];

export default function CashFlowReport() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    financialYear: '2025-26',
    periodFrom:    '',
    periodTo:      '',
    method:        'Indirect Method',
    compareWith:   'None',
    bankAccount:   'All',
    currency:      'INR',
  });
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError]     = useState('');

  const sf = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  /* Build lookup from CashFlowDTO: section, name, currentAmount, previousAmount */
  const buildLookup = (apiRows) => {
    const map = {};
    (apiRows || []).forEach(r => {
      const k = (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      map[k] = r;
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
  //       `/api/reports/cash-flow?from=${filter.periodFrom}&to=${filter.periodTo}`
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
    const response = await getCashFlowReport(
      filter.periodFrom,
      filter.periodTo
    );

    setRows(Array.isArray(response) ? response : []);
    setFetched(true);
  } catch (error) {
    console.error("Error generating cash flow report:", error);

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
    const headers = [
      'Particulars',
      `Current Period (${filter.currency})`,
      `Previous Period (${filter.currency})`
    ];

    const exportRows = [];
    for (const item of CASH_FLOW_SKELETON) {
      if (item.sectionHeader) {
        exportRows.push({
          cols: [item.section, '', ''],
          bold: true,
          isHeader: true
        });
      } else {
        const r = getRow(item.key);
        const cur = fetched && r ? fmt(r.currentAmount) : '—';
        const prev = fetched && r ? fmt(r.previousAmount) : '—';
        exportRows.push({
          cols: [item.label, cur, prev],
          bold: Boolean(item.bold)
        });
      }
    }
    return { headers, exportRows };
  };

  const getExportMeta = () => [
    `Financial Year: ${filter.financialYear}`,
    `Period: ${filter.periodFrom || 'All'} to ${filter.periodTo || 'All'}`,
    `Method: ${filter.method} | Bank Account: ${filter.bankAccount}`,
    `Currency: ${filter.currency}`,
  ];

  const handleExportPdf = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToPdf(`cash_flow_report_${dateStr}`, {
      title: 'Cash Flow Report',
      meta: getExportMeta(),
      headers,
      rows: exportRows,
      colWidths: [6, 3, 3]
    });
  };

  const handleExportExcel = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToCsv(`cash_flow_report_${dateStr}`, {
      title: 'Cash Flow Report',
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
        <span className="text-gray-300 font-semibold">Cash Flow Report</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
  <button
    onClick={() => navigate(-1)}
    className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm">
    <ArrowLeft size={15} />
  </button>
  <h2 className="text-lg font-bold text-gray-200">Cash Flow Report</h2>
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
            <label className="block text-xs font-semibold text-gray-300 mb-1">Method</label>
            <select value={filter.method} onChange={e => sf('method', e.target.value)} className={sel}>
              {METHODS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Compare With</label>
            <select value={filter.compareWith} onChange={e => sf('compareWith', e.target.value)} className={sel}>
              {COMPARE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Bank Account</label>
            <select value={filter.bankAccount} onChange={e => sf('bankAccount', e.target.value)} className={sel}>
              {BANK_ACCOUNTS.map(o => <option key={o}>{o}</option>)}
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
            </tr>
          </thead>
          <tbody>
            {CASH_FLOW_SKELETON.map((item, idx) => {
              if (item.sectionHeader) {
                return (
                  <tr key={idx} className="bg-white/5">
                    <td colSpan={3}
                      className="px-4 py-2 font-bold text-gray-200 text-sm border-b border-white/10">
                      {item.section}
                    </td>
                  </tr>
                );
              }
              const r = getRow(item.key);
              return (
                <tr key={idx}
                  className={`border-b border-white/10 hover:bg-white/10 ${item.divider ? 'border-t-2 border-white/10' : ''} ${item.bold ? 'bg-white/5' : ''}`}>
                  <td className={`py-2.5 text-sm ${item.bold ? 'px-4 font-bold text-gray-200' : 'px-8 text-gray-300'}`}>
                    {item.label}
                  </td>
                  <td className={`px-4 py-2.5 text-center text-sm ${item.bold ? 'font-semibold text-gray-200' : 'text-gray-300'}`}>
                    {fetched && r ? fmt(r.currentAmount) : '—'}
                  </td>
                  <td className={`px-4 py-2.5 text-center text-sm ${item.bold ? 'font-semibold text-gray-200' : 'text-gray-300'}`}>
                    {fetched && r ? fmt(r.previousAmount) : '—'}
                  </td>
                </tr>
              );
            })}

            {/* Extra API rows */}
            {fetched && rows.length > 0 && (() => {
              const knownKeys = CASH_FLOW_SKELETON.filter(s => s.key).map(s => s.key);
              const extras = rows.filter(r => {
                const k = (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
                return !knownKeys.includes(k);
              });
              return extras.map((r, i) => (
                <tr key={`extra-${i}`} className="border-b border-white/10 hover:bg-white/10">
                  <td className="px-8 py-2.5 text-sm text-gray-300">{r.name}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.currentAmount)}</td>
                  <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.previousAmount)}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}