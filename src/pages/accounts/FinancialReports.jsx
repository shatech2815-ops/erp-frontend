import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BarChart2, Search, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';

// const BASE_URL = '/api/accounting';
import { getFinancialReport } from "../../services/account/financialReport.services";
const REPORT_TYPES = ['Profit & Loss Statement','Balance Sheet','Cash Flow Statement','GST Report'];
const FINANCIAL_YEARS = ['2025-26','2024-25','2023-24','2022-23'];
const ACCOUNTING_BASIS = ['Accrual','Cash'];
const COMPARE_WITH_OPTIONS = ['None','Previous Month','Previous Quarter','Previous Year'];
const CURRENCIES = ['INR','USD','EUR','GBP'];
const SHOW_PCT_OPTIONS = ['No','Yes'];
const COST_CENTERS = ['All','Head Office','Branch 1','Branch 2'];
const INCLUDE_CLOSING = ['Yes','No'];
const DECIMAL_PLACES_OPTIONS = ['0','1','2','3'];
const fmt = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const SummaryCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}><Icon size={20} style={{ color }} /></div>
    <div><p className="text-xs text-gray-400">{label}</p><p className="text-lg font-bold text-white">₹{fmt(value)}</p></div>
  </div>
);

export default function FinancialReports() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    reportType: 'Profit & Loss Statement', financialYear: '2025-26',
    periodFrom: '', periodTo: '', accountingBasis: 'Accrual', compareWith: 'None',
    currency: 'INR', showPctColumn: 'No', costCenter: 'All',
    includeClosingEntries: 'Yes', decimalPlaces: '2',
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');

  const setF = (k, v) => setFilter(p => ({ ...p, [k]: v }));

  // const handleGenerate = async () => {
  //   setLoading(true); setError('');
  //   try {
  //     let url = `${BASE_URL}/financial-report?reportType=${encodeURIComponent(filter.reportType)}&financialYear=${filter.financialYear}`;
  //     if (filter.periodFrom) url += `&start=${filter.periodFrom}`;
  //     if (filter.periodTo)   url += `&end=${filter.periodTo}`;
  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error(`Error ${res.status}`);
  //     const data = await res.json();
  //     setReport(data); setFetched(true);
  //   } catch (err) { setError(err.message || 'Failed to generate report.'); setReport(null); }
  //   finally { setLoading(false); }
  // };

  const handleGenerate = async () => {
  if (!filter.periodFrom || !filter.periodTo) {
    setError("Please select both From Date and To Date.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const data = await getFinancialReport({
      reportType: filter.reportType,
      from: filter.periodFrom,
      to: filter.periodTo,
    });

    console.log("Financial Report Response:", data);

    const arr = Array.isArray(data) ? data : [];

const reportData = {
  totalIncome:
    arr.find((x) => x.name === "Total Income")?.amount || 0,

  totalExpense:
    arr.find((x) => x.name === "Total Expense")?.amount || 0,

  grossProfit:
    arr.find((x) => x.name === "Gross Profit")?.amount || 0,

  taxAmount:
    arr.find((x) => x.name === "Tax Amount")?.amount || 0,

  finalProfit:
    arr.find((x) => x.name === "Final Profit")?.amount || 0,

  netProfit:
    arr.find((x) => x.name === "Net Profit")?.amount || 0,

  totalAssets:
    arr.find((x) => x.name === "Total Assets")?.amount || 0,

  totalLiabilities:
    arr.find((x) => x.name === "Total Liabilities")?.amount || 0,

  totalEquity:
    arr.find((x) => x.name === "Total Equity")?.amount || 0,

  cashInflow:
    arr.find((x) => x.name === "Cash Inflow")?.amount || 0,

  cashOutflow:
    arr.find((x) => x.name === "Cash Outflow")?.amount || 0,

  netCashFlow:
    arr.find((x) => x.name === "Net Cash Flow")?.amount || 0,
};

setReport(reportData);
    setFetched(true);
  } catch (err) {
    console.error("Financial report fetch error:", err);

    setError(
      err?.response?.data?.message ||
        err.message ||
        "Failed to generate report."
    );

    setReport(null);
  } finally {
    setLoading(false);
  }
};
  const getRowsForReport = (rep) => {
    if (!rep) return [];
    if (filter.reportType === "Profit & Loss Statement") {
      return [
        { label: "Total Income", value: rep.totalIncome },
        { label: "Total Expense", value: rep.totalExpense },
        { label: "Gross Profit", value: rep.grossProfit },
        { label: "Tax Amount", value: rep.taxAmount },
        { label: "Final Profit", value: rep.finalProfit },
        { label: "Net Profit", value: rep.netProfit },
      ];
    } else if (filter.reportType === "Balance Sheet") {
      return [
        { label: "Total Assets", value: rep.totalAssets },
        { label: "Total Liabilities", value: rep.totalLiabilities },
        { label: "Total Equity", value: rep.totalEquity },
      ];
    } else if (filter.reportType === "Cash Flow Statement") {
      return [
        { label: "Cash Inflow", value: rep.cashInflow },
        { label: "Cash Outflow", value: rep.cashOutflow },
        { label: "Net Cash Flow", value: rep.netCashFlow },
      ];
    } else {
      return [
        { label: "Total Income (Sales)", value: rep.totalIncome },
        { label: "Total Expense (Purchases)", value: rep.totalExpense },
        { label: "Tax Amount", value: rep.taxAmount },
      ];
    }
  };

  const getExportData = async () => {
    let currentReport = report;
    if (!currentReport) {
      if (!filter.periodFrom || !filter.periodTo) {
        setError("Please select both From Date and To Date, then click Generate Report or Export.");
        return null;
      }
      try {
        setLoading(true);
        const data = await getFinancialReport({
          reportType: filter.reportType,
          from: filter.periodFrom,
          to: filter.periodTo,
        });
        const arr = Array.isArray(data) ? data : [];
        currentReport = {
          totalIncome: arr.find((x) => x.name === "Total Income")?.amount || 0,
          totalExpense: arr.find((x) => x.name === "Total Expense")?.amount || 0,
          grossProfit: arr.find((x) => x.name === "Gross Profit")?.amount || 0,
          taxAmount: arr.find((x) => x.name === "Tax Amount")?.amount || 0,
          finalProfit: arr.find((x) => x.name === "Final Profit")?.amount || 0,
          netProfit: arr.find((x) => x.name === "Net Profit")?.amount || 0,
          totalAssets: arr.find((x) => x.name === "Total Assets")?.amount || 0,
          totalLiabilities: arr.find((x) => x.name === "Total Liabilities")?.amount || 0,
          totalEquity: arr.find((x) => x.name === "Total Equity")?.amount || 0,
          cashInflow: arr.find((x) => x.name === "Cash Inflow")?.amount || 0,
          cashOutflow: arr.find((x) => x.name === "Cash Outflow")?.amount || 0,
          netCashFlow: arr.find((x) => x.name === "Net Cash Flow")?.amount || 0,
        };
        setReport(currentReport);
        setFetched(true);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to fetch report data for export.");
        return null;
      } finally {
        setLoading(false);
      }
    }
    return currentReport;
  };

  const escapePdf = (str) => {
    return String(str || '').replace(/[()\\\\]/g, '\\$&');
  };

  const handleExportPDF = async () => {
    const rep = await getExportData();
    if (!rep) return;

    const rows = getRowsForReport(rep);
    const title = `Financial Report: ${filter.reportType}`;
    const meta = [
      `Financial Year: ${filter.financialYear}`,
      `Period: ${filter.periodFrom || 'All'} to ${filter.periodTo || 'All'}`,
      `Accounting Basis: ${filter.accountingBasis} | Currency: ${filter.currency}`,
      `Generated On: ${new Date().toLocaleString()}`,
    ];

    const content = [];
    content.push(`BT /F1 16 Tf 50 740 Td (${escapePdf(title)}) Tj ET`);

    let metaY = 715;
    for (const m of meta) {
      content.push(`BT /F2 9 Tf 50 ${metaY} Td (${escapePdf(m)}) Tj ET`);
      metaY -= 14;
    }

    content.push('0.5 w');
    content.push(`50 ${metaY - 5} m 560 ${metaY - 5} l S`);

    const tableTop = metaY - 24;
    content.push(`BT /F1 11 Tf 60 ${tableTop} Td (Particulars) Tj ET`);
    content.push(`BT /F1 11 Tf 400 ${tableTop} Td (Amount (${filter.currency})) Tj ET`);
    content.push(`50 ${tableTop - 8} m 560 ${tableTop - 8} l S`);

    let rowY = tableTop - 24;
    for (const r of rows) {
      content.push(`BT /F2 10 Tf 60 ${rowY} Td (${escapePdf(r.label)}) Tj ET`);
      const valStr = `${filter.currency === 'INR' ? 'Rs. ' : ''}${fmt(r.value)}`;
      content.push(`BT /F1 10 Tf 400 ${rowY} Td (${escapePdf(valStr)}) Tj ET`);
      content.push('0.2 w');
      content.push(`50 ${rowY - 6} m 560 ${rowY - 6} l S`);
      rowY -= 22;
    }

    content.push('BT /F2 8 Tf 50 40 Td (Generated by ERP Financial System - Confidential) Tj ET');

    const stream = content.join('\n');
    const streamLen = new Blob([stream]).size;

    let out = '%PDF-1.4\n';
    const offsets = [];

    const addObj = (str) => {
      offsets.push(new Blob([out]).size);
      out += str + '\n';
    };

    addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
    addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
    addObj('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj');
    addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
    addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
    addObj(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj`);

    const startXref = new Blob([out]).size;
    out += 'xref\n0 7\n0000000000 65535 f \n';
    for (let i = 0; i < 6; i++) {
      out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    out += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    const blob = new Blob([out], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedType = filter.reportType.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    link.setAttribute('download', `financial_report_${sanitizedType}_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const rep = await getExportData();
    if (!rep) return;

    const rows = getRowsForReport(rep);
    const sanitizedType = filter.reportType.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    const csvContent = [
      `"Financial Report: ${filter.reportType}"`,
      `"Financial Year: ${filter.financialYear}"`,
      `"Period: ${filter.periodFrom || 'N/A'} to ${filter.periodTo || 'N/A'}"`,
      `"Accounting Basis: ${filter.accountingBasis}"`,
      `"Currency: ${filter.currency}"`,
      `"Generated On: ${new Date().toLocaleString()}"`,
      "",
      '"Particulars","Amount"',
      ...rows.map(r => `"${r.label}","${Number(r.value || 0).toFixed(2)}"`)
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financial_report_${sanitizedType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportRows = report ?
    filter.reportType === "Profit & Loss Statement"
      ? [
          { label: "Total Income", value: report.totalIncome, color: "text-emerald-400" },
          { label: "Total Expense", value: report.totalExpense, color: "text-red-400" },
          { label: "Gross Profit", value: report.grossProfit, color: "text-blue-400" },
          { label: "Tax Amount", value: report.taxAmount, color: "text-amber-400" },
          { label: "Final Profit", value: report.finalProfit, color: report.finalProfit >= 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Net Profit", value: report.netProfit, color: report.netProfit >= 0 ? "text-emerald-400" : "text-red-400", bold: true },
        ]
      : filter.reportType === "Balance Sheet"
      ? [
          { label: "Total Assets", value: report.totalAssets, color: "text-emerald-400" },
          { label: "Total Liabilities", value: report.totalLiabilities, color: "text-red-400" },
          { label: "Total Equity", value: report.totalEquity, color: "text-gray-200", bold: true },
        ]
      : filter.reportType === "Cash Flow Statement"
      ? [
          { label: "Cash Inflow", value: report.cashInflow, color: "text-emerald-400" },
          { label: "Cash Outflow", value: report.cashOutflow, color: "text-red-400" },
          { label: "Net Cash Flow", value: report.netCashFlow, color: report.netCashFlow >= 0 ? "text-emerald-400" : "text-red-400", bold: true },
        ]
      : [
          { label: "Total Income (Sales)", value: report.totalIncome, color: "text-emerald-400" },
          { label: "Total Expense (Purchases)", value: report.totalExpense, color: "text-red-400" },
          { label: "Tax Amount", value: report.taxAmount, color: "text-amber-400", bold: true },
        ]
    : [];

  const inp = "w-full px-3 py-2 rounded-lg border border-white/10 text-sm focus:outline-none bg-[#140f2d]/80";

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Financials</button>
        <ChevronRight size={12} />
        <span className="text-gray-300 font-semibold">Financial Reports</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 shadow-sm"><ArrowLeft size={15} /></button>
        <h2 className="text-xl font-bold text-gray-200">Financial Reports</h2>
      </div>
      <hr className="border-white/10 mb-5" />

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {/* Report Settings */}
      <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Report Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Report Type *</label>
            <select value={filter.reportType} onChange={e => setF('reportType', e.target.value)} className={inp}>{REPORT_TYPES.map(r => <option key={r}>{r}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Financial Year *</label>
            <select value={filter.financialYear} onChange={e => setF('financialYear', e.target.value)} className={inp}>{FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Period From *</label>
            <input type="date" value={filter.periodFrom} onChange={e => setF('periodFrom', e.target.value)} className={inp} /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Period To *</label>
            <input type="date" value={filter.periodTo} onChange={e => setF('periodTo', e.target.value)} className={inp} /></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Accounting Basis</label>
            <select value={filter.accountingBasis} onChange={e => setF('accountingBasis', e.target.value)} className={inp}>{ACCOUNTING_BASIS.map(b => <option key={b}>{b}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Compare With</label>
            <select value={filter.compareWith} onChange={e => setF('compareWith', e.target.value)} className={inp}>{COMPARE_WITH_OPTIONS.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Currency</label>
            <select value={filter.currency} onChange={e => setF('currency', e.target.value)} className={inp}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Show % Column</label>
            <select value={filter.showPctColumn} onChange={e => setF('showPctColumn', e.target.value)} className={inp}>{SHOW_PCT_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Cost Center / Branch</label>
            <select value={filter.costCenter} onChange={e => setF('costCenter', e.target.value)} className={inp}>{COST_CENTERS.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Include Closing Entries</label>
            <select value={filter.includeClosingEntries} onChange={e => setF('includeClosingEntries', e.target.value)} className={inp}>{INCLUDE_CLOSING.map(o => <option key={o}>{o}</option>)}</select></div>
          <div><label className="block text-xs font-semibold text-gray-300 mb-1">Decimal Places</label>
            <select value={filter.decimalPlaces} onChange={e => setF('decimalPlaces', e.target.value)} className={inp}>{DECIMAL_PLACES_OPTIONS.map(d => <option key={d}>{d}</option>)}</select></div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGenerate} className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90" style={{ background: '#4C6BF5' }}><Search size={14} /> Generate Report</button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10"><Download size={14} /> Export PDF</button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10"><Download size={14} /> Export Excel</button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10">Print</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <SummaryCard label="Total Income"  value={report.totalIncome}  icon={TrendingUp}   color="#059669" bg="rgba(16,185,129,0.15)" />
            <SummaryCard label="Total Expense" value={report.totalExpense} icon={TrendingDown} color="#dc2626" bg="rgba(239,68,68,0.15)" />
            <SummaryCard label="Net Profit"    value={report.netProfit}    icon={DollarSign}   color="#d97706" bg="rgba(245,158,11,0.15)" />
          </div>
          <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10"><h3 className="text-sm font-bold text-gray-300">{filter.reportType}</h3></div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {reportRows.map(({ label, value, color, bold }) => (
                  <tr key={label} className={bold ? 'bg-white/5' : ''}>
                    <td className={`px-6 py-4 text-sm ${bold ? 'font-bold text-gray-200' : 'text-gray-300'}`}>{label}</td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${color}`}>₹{fmt(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-white/10 flex justify-between text-xs text-gray-400">
              {report.currency && <span>Currency: <strong>{report.currency}</strong></span>}
              {report.generatedBy && <span>Generated by: <strong>{report.generatedBy}</strong></span>}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#140f2d]/80 rounded-lg border border-white/10 p-12 text-center text-gray-400 shadow-sm">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">{fetched ? 'No data for selected filters.' : 'Configure settings and click Generate Report'}</p>
        </div>
      )}
    </div>
  );
}
