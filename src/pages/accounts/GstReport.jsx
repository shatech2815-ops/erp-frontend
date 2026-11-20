
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

import { getGstReport } from "../../services/account/gstReport.services";
import { exportReportToPdf, exportReportToCsv } from "../../utils/reportExport";


const REPORT_TYPES      = ['GSTR-1 (Outward Sales)','GSTR-2 (Inward Purchases)','GSTR-3B (Summary)'];
const FINANCIAL_YEARS   = ['2025-26','2024-25','2023-24','2022-23'];
const INVOICE_TYPE_OPTS = ['All','B2B','B2C Large','B2C Small','Export','Nil Rated'];
const TAX_RATE_OPTS     = ['All','0%','5%','12%','18%','28%'];
const FILING_STATUS     = ['All','Filed','Pending','Not Applicable'];
const STATES_OF_SUPPLY  = ['All','Tamil Nadu','Karnataka','Maharashtra','Delhi','Gujarat','Rajasthan','Uttar Pradesh','West Bengal'];

const fmt = (v) =>
  v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—';

const fmtCount = (v) => v != null ? Number(v).toLocaleString('en-IN') : '—';

const sel = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';
const inp = 'w-full px-3 py-2 rounded border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none';

/* Default invoice types matching screenshot */
const DEFAULT_TYPES = ['B2B','B2C Large','B2C Small'];

export default function GstReport() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    reportType:    'GSTR-1 (Outward Sales)',
    gstin:         '',
    returnPeriod:  '',
    financialYear: '2025-26',
    invoiceType:   'All',
    taxRate:       'All',
    filingStatus:  'All',
    stateOfSupply: 'All',
  });
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError]     = useState('');

  const sf = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  // const handleGenerate = async () => {
  //   setLoading(true); setError('');
  //   try {
  //     const params = new URLSearchParams();
  //     const type = filter.reportType.split(' ')[0];
  //     params.set('type', type);
  //     if (filter.gstin.trim()) params.set('gstin', filter.gstin.trim());
  //     if (filter.returnPeriod) params.set('from', filter.returnPeriod);
  //     const res = await fetch(`/api/reports/gst?${params.toString()}`);
  //     if (!res.ok) throw new Error(`Error ${res.status}`);
  //     setRows(await res.json());
  //     setFetched(true);
  //   } catch (e) {
  //     setError(e.message || 'Failed to generate GST report.');
  //     setRows([]);
  //   } finally { setLoading(false); }
  // };

  const handleGenerate = async () => {
  if (!filter.reportType || !filter.returnPeriod) {
    setError("Please select Report Type and Return Period.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const reportType = filter.reportType.split(" ")[0];

    const response = await getGstReport({
      type: reportType,
      gstin: filter.gstin.trim(),
      from: filter.returnPeriod,
      to: filter.returnPeriod,
    });

    setRows(Array.isArray(response) ? response : []);
    setFetched(true);
  } catch (error) {
    console.error("Error generating GST report:", error);

    if (error.response?.data?.message) {
      setError(error.response.data.message);
    } else {
      setError("Failed to generate GST report.");
    }

    setRows([]);
    setFetched(false);
  } finally {
    setLoading(false);
  }
};

  /* Build data rows: use API rows if available, else show default skeleton */
  const displayRows = fetched && rows.length > 0
    ? rows
    : DEFAULT_TYPES.map(t => ({
        invoiceType: t,
        invoiceCount: null,
        taxableValue: null,
        cgst: null,
        sgst: null,
        igst: null,
        totalTax: null,
      }));

  /* Filter by invoiceType if not 'All' */
  const filteredRows = filter.invoiceType === 'All'
    ? displayRows
    : displayRows.filter(r => (r.invoiceType || '').includes(filter.invoiceType));

  /* Totals */
  const totalInvoices  = filteredRows.reduce((s, r) => s + (Number(r.invoiceCount) || 0), 0);
  const totalTaxable   = filteredRows.reduce((s, r) => s + (r.taxableValue || 0), 0);
  const totalCgst      = filteredRows.reduce((s, r) => s + (r.cgst || 0), 0);
  const totalSgst      = filteredRows.reduce((s, r) => s + (r.sgst || 0), 0);
  const totalIgst      = filteredRows.reduce((s, r) => s + (r.igst || 0), 0);
  const totalTax       = filteredRows.reduce((s, r) => s + (r.totalTax || 0), 0);

  const getExportRowsAndHeaders = () => {
    const headers = [
      'Invoice Type',
      'Invoice Count',
      'Taxable Value (₹)',
      'CGST (₹)',
      'SGST (₹)',
      'IGST (₹)',
      'Total Tax (₹)'
    ];

    const exportRows = filteredRows.map(r => ({
      cols: [
        r.invoiceType,
        r.invoiceCount != null ? fmtCount(r.invoiceCount) : '—',
        fmt(r.taxableValue),
        fmt(r.cgst),
        fmt(r.sgst),
        fmt(r.igst),
        fmt(r.totalTax)
      ]
    }));

    exportRows.push({
      cols: [
        'Total',
        totalInvoices ? fmtCount(totalInvoices) : '—',
        fmt(totalTaxable),
        fmt(totalCgst),
        fmt(totalSgst),
        fmt(totalIgst),
        fmt(totalTax)
      ],
      bold: true
    });

    return { headers, exportRows };
  };

  const getExportMeta = () => [
    `Report Type: ${filter.reportType}`,
    `GSTIN: ${filter.gstin || 'All'}`,
    `Return Period: ${filter.returnPeriod || 'All'} | Financial Year: ${filter.financialYear}`,
    `Invoice Type: ${filter.invoiceType} | State of Supply: ${filter.stateOfSupply}`,
  ];

  const handleExportPdf = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToPdf(`gst_report_${dateStr}`, {
      title: 'GST Report',
      meta: getExportMeta(),
      headers,
      rows: exportRows,
      colWidths: [3, 2, 2.5, 2, 2, 2, 2.5]
    });
  };

  const handleExportExcel = () => {
    const { headers, exportRows } = getExportRowsAndHeaders();
    const dateStr = new Date().toISOString().split('T')[0];
    exportReportToCsv(`gst_report_${dateStr}`, {
      title: 'GST Report',
      meta: getExportMeta(),
      headers,
      rows: exportRows
    });
  };

  const handleDownloadJson = () => {
    const data = {
      reportType: filter.reportType,
      gstin: filter.gstin,
      returnPeriod: filter.returnPeriod,
      financialYear: filter.financialYear,
      invoiceType: filter.invoiceType,
      generatedAt: new Date().toISOString(),
      rows: filteredRows,
      totals: {
        totalInvoices,
        totalTaxable,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gst_report_${filter.returnPeriod || 'portal'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <div className="p-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
        <button onClick={() => navigate('/dashboard/accounts/reports')} className="hover:underline">Reports</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">GST Reports</span>
      </div>

      <div className="flex items-center gap-3 mb-3">
  <button
    onClick={() => navigate(-1)}
    className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm">
    <ArrowLeft size={15} />
  </button>
  <h2 className="text-lg font-bold text-gray-200">GST Report</h2>
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
            <label className="block text-xs font-semibold text-gray-300 mb-1">Report Type *</label>
            <select value={filter.reportType} onChange={e => sf('reportType', e.target.value)} className={sel}>
              {REPORT_TYPES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">GSTIN *</label>
            <input
              type="text"
              placeholder="Your GSTIN"
              value={filter.gstin}
              onChange={e => sf('gstin', e.target.value)}
              className={inp + ' font-mono'}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Return Period *</label>
            <input
              type="month"
              value={filter.returnPeriod}
              onChange={e => sf('returnPeriod', e.target.value)}
              className={inp}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Financial Year</label>
            <select value={filter.financialYear} onChange={e => sf('financialYear', e.target.value)} className={sel}>
              {FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Invoice Type</label>
            <select value={filter.invoiceType} onChange={e => sf('invoiceType', e.target.value)} className={sel}>
              {INVOICE_TYPE_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Tax Rate</label>
            <select value={filter.taxRate} onChange={e => sf('taxRate', e.target.value)} className={sel}>
              {TAX_RATE_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Filing Status</label>
            <select value={filter.filingStatus} onChange={e => sf('filingStatus', e.target.value)} className={sel}>
              {FILING_STATUS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">State of Supply</label>
            <select value={filter.stateOfSupply} onChange={e => sf('stateOfSupply', e.target.value)} className={sel}>
              {STATES_OF_SUPPLY.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerate} disabled={loading}
            className="px-5 py-2 rounded text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: '#3b5bdb' }}>
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
          <button onClick={handleDownloadJson} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Download JSON (GST Portal)</button>
          <button onClick={handleExportExcel} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Download Excel</button>
          <button onClick={handleExportPdf} className="px-4 py-2 rounded border border-white/10 text-sm text-gray-300 hover:bg-white/10">Export PDF</button>
        </div>
      </div>

      {/* ── GST Summary Table ── */}
      <div className="bg-[#140f2d]/80 border border-white/10 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm font-bold text-gray-300">GST Summary</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#2d3a5e' }} className="text-white">
              <th className="px-4 py-3 text-left font-semibold">Invoice Type</th>
              <th className="px-4 py-3 text-center font-semibold">No. of Invoices</th>
              <th className="px-4 py-3 text-center font-semibold">Taxable Value (₹)</th>
              <th className="px-4 py-3 text-center font-semibold">CGST (₹)</th>
              <th className="px-4 py-3 text-center font-semibold">SGST (₹)</th>
              <th className="px-4 py-3 text-center font-semibold">IGST (₹)</th>
              <th className="px-4 py-3 text-center font-semibold">Total Tax (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, idx) => (
              <tr key={idx} className="border-b border-white/10 hover:bg-white/10">
                <td className="px-4 py-2.5 text-sm text-gray-300">{r.invoiceType || '—'}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">
                  {r.invoiceCount != null ? fmtCount(r.invoiceCount) : '—'}
                </td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.taxableValue)}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.cgst)}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.sgst)}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.igst)}</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-300">{fmt(r.totalTax)}</td>
              </tr>
            ))}
          </tbody>
          {/* Total row */}
          <tfoot>
            <tr className="border-t-2 border-white/10 bg-white/5">
              <td className="px-4 py-3 font-bold text-sm text-gray-200">Total</td>
              <td className="px-4 py-3 text-center font-bold text-sm text-gray-200">
                {fetched && totalInvoices > 0 ? fmtCount(totalInvoices) : '—'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-sm text-gray-200">
                {fetched && totalTaxable > 0 ? fmt(totalTaxable) : '—'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-sm text-gray-200">
                {fetched && totalCgst > 0 ? fmt(totalCgst) : '—'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-sm text-gray-200">
                {fetched && totalSgst > 0 ? fmt(totalSgst) : '—'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-sm text-gray-200">
                {fetched && totalIgst > 0 ? fmt(totalIgst) : '—'}
              </td>
              <td className="px-4 py-3 text-center font-bold text-sm text-gray-200">
                {fetched && totalTax > 0 ? fmt(totalTax) : '—'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}