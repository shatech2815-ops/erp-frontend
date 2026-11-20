

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart2, FileText, DollarSign,
  Users, AlertCircle, Clock, RefreshCw,
  TrendingUp, TrendingDown, ShieldCheck, CalendarClock,
  CircleDollarSign, BadgeCheck, Hourglass, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';

// const BASE_URL = '/api/performance';
import {
  getVendorPerformanceReport,
  getContractExpiryReport,
  getInvoicePaymentReport,
} from "../../services/vendor/performance.services";

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtINR   = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtScore = (n) => Number(n || 0).toFixed(1);
const fmtPct   = (n) => `${Number(n || 0).toFixed(1)}%`;
const fmtDate  = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(val); }
};

// ─── Status styles ────────────────────────────────────────────────────────────
const scoreStyle = (score) => {
  if (score >= 80) return { bg: 'rgba(34,197,94,0.15)', text: '#15803d', border: '#86efac', dot: '#16a34a', label: 'Good' };
  if (score >= 50) return { bg: '#fef9c3', text: '#a16207', border: '#fde047', dot: '#ca8a04', label: 'Average' };
  return              { bg: 'rgba(239,68,68,0.15)', text: '#b91c1c', border: '#fca5a5', dot: '#dc2626', label: 'Poor' };
};

const contractStyle = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'EXPIRED')       return { bg: 'rgba(239,68,68,0.15)', text: '#b91c1c', border: '#fca5a5', dot: '#dc2626', Icon: XCircle };
  if (s === 'EXPIRING_SOON') return { bg: '#fef9c3', text: '#a16207', border: '#fde047', dot: '#ca8a04', Icon: AlertTriangle };
  return                     { bg: 'rgba(34,197,94,0.15)', text: '#15803d', border: '#86efac', dot: '#16a34a', Icon: CheckCircle2 };
};

const paymentStyle = (status) => {
  const s = (status || '').toUpperCase();
  if (s === 'PAID')    return { bg: 'rgba(34,197,94,0.15)', text: '#15803d', border: '#86efac', dot: '#16a34a', label: 'Paid' };
  if (s === 'PARTIAL') return { bg: '#fef9c3', text: '#a16207', border: '#fde047', dot: '#ca8a04', label: 'Partial' };
  return                     { bg: 'rgba(239,68,68,0.15)', text: '#b91c1c', border: '#fca5a5', dot: '#dc2626', label: 'Unpaid' };
};

const dueStyle = (status) => {
  if ((status || '').toUpperCase() === 'OVERDUE')
    return { bg: 'rgba(239,68,68,0.15)', text: '#b91c1c', border: '#fca5a5', dot: '#dc2626', label: 'Overdue' };
  return { bg: 'rgba(34,197,94,0.15)', text: '#15803d', border: '#86efac', dot: '#16a34a', label: 'On Time' };
};

// ─── Shared components ────────────────────────────────────────────────────────
const Badge = ({ label, style }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
    style={{ background: style.bg, color: style.text, borderColor: style.border }}
  >
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
    {label}
  </span>
);

const Spinner = () => (
  <div className="flex justify-center py-20">
    <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Empty = ({ msg }) => (
  <div className="flex flex-col items-center py-20 text-center gap-3">
    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
      <BarChart2 size={26} className="text-gray-400" />
    </div>
    <p className="text-sm text-gray-400 font-medium">{msg}</p>
  </div>
);

// Mini progress bar
const ProgressBar = ({ value, max = 100, color }) => (
  <div className="w-full bg-purple-500/10 rounded-full h-1.5 overflow-hidden">
    <div
      className="h-1.5 rounded-full transition-all duration-700"
      style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
    />
  </div>
);

// ─── VENDOR PERFORMANCE TAB ───────────────────────────────────────────────────
const VendorPerfTab = ({ data, loading }) => {
  if (loading) return <Spinner />;
  if (!data.length) return <Empty msg="No vendor performance data available." />;

  return (
    <div className="flex flex-col gap-4">
      {data.map((v) => {
        const sc = scoreStyle(v.performanceScore);
        const paymentPct = v.paymentRate || 0;
        return (
          <div
            key={v.vendorId}
            className="bg-[#140f2d]/80 rounded-2xl border border-white/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-white/5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-purple-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{v.vendorName}</p>
                  {v.companyName && <p className="text-xs text-gray-400">{v.companyName}</p>}
                </div>
              </div>
              {/* Score badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold"
                style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
              >
                <span className="text-lg">
                  {v.performanceScore >= 80 ? '🏆' : v.performanceScore >= 50 ? '📊' : '⚠️'}
                </span>
                <span>{fmtScore(v.performanceScore)}</span>
                <span className="text-xs font-medium opacity-70">/ 100</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10">
              {[
                { label: 'Total Contracts', value: v.totalContracts, icon: FileText, color: '#8b5cf6' },
                { label: 'Active',          value: v.activeContracts, icon: CheckCircle2, color: '#16a34a' },
                { label: 'Expired',         value: v.expiredContracts, icon: XCircle, color: '#dc2626' },
                { label: 'Payment Rate',    value: fmtPct(v.paymentRate), icon: TrendingUp, color: '#f59e0b' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-4 text-center">
                  <div className="w-7 h-7 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <p className="text-lg font-extrabold text-white">{value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Financials + progress */}
            <div className="px-5 py-4 bg-white/5 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 mb-3">
                {[
                  { label: 'Invoice Total',  value: fmtINR(v.totalInvoiceAmount), color: '#8b5cf6' },
                  { label: 'Paid',           value: fmtINR(v.totalPaidAmount),    color: '#16a34a' },
                  { label: 'Pending',        value: fmtINR(v.pendingAmount),      color: '#dc2626' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                    <p className="text-sm font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Payment progress</span>
                  <span className="font-semibold text-purple-300">{fmtPct(paymentPct)}</span>
                </div>
                <ProgressBar
                  value={paymentPct}
                  color={paymentPct >= 80 ? '#16a34a' : paymentPct >= 50 ? '#f59e0b' : '#dc2626'}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── CONTRACT EXPIRY TAB ──────────────────────────────────────────────────────
const ContractExpiryTab = ({ data, loading }) => {
  if (loading) return <Spinner />;
  if (!data.length) return <Empty msg="No contract expiry data available." />;

  // Sort: expired first, then expiring soon, then active
  const sorted = [...data].sort((a, b) => {
    const order = { EXPIRED: 0, EXPIRING_SOON: 1, ACTIVE: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((c) => {
        const st = contractStyle(c.status);
        const isExpired = c.status?.toUpperCase() === 'EXPIRED';
        const isExpiring = c.status?.toUpperCase() === 'EXPIRING_SOON';
        const daysText = isExpired
          ? `Expired ${Math.abs(c.daysRemaining)} days ago`
          : isExpiring
          ? `Expires in ${c.daysRemaining} days`
          : `${c.daysRemaining} days remaining`;

        return (
          <div
            key={c.contractId}
            className="bg-[#140f2d]/80 rounded-xl border shadow-sm flex items-center gap-4 px-5 py-4 hover:shadow-md transition-shadow"
            style={{ borderColor: st.border, borderLeftWidth: 4, borderLeftColor: st.dot }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: st.bg }}
            >
              <st.Icon size={18} style={{ color: st.dot }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{c.contractName}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {c.vendorName} · {fmtDate(c.startDate)} → {fmtDate(c.endDate)}
              </p>
            </div>

            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
              <Badge label={c.status?.replace(/_/g, ' ')} style={st} />
              <p
                className="text-xs font-semibold"
                style={{ color: st.text }}
              >
                {daysText}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── INVOICE PAYMENT TAB ──────────────────────────────────────────────────────
const InvoicePaymentTab = ({ data, loading }) => {
  if (loading) return <Spinner />;
  if (!data.length) return <Empty msg="No invoice payment data available." />;

  const sorted = [...data].sort((a, b) => {
    // Overdue + unpaid first
    const aScore = (a.dueStatus === 'OVERDUE' ? 2 : 0) + (a.paymentStatus === 'UNPAID' ? 1 : 0);
    const bScore = (b.dueStatus === 'OVERDUE' ? 2 : 0) + (b.paymentStatus === 'UNPAID' ? 1 : 0);
    return bScore - aScore;
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((inv) => {
        const ps = paymentStyle(inv.paymentStatus);
        const ds = dueStyle(inv.dueStatus);
        const paidPct = inv.totalAmount > 0 ? (inv.paidAmount / inv.totalAmount) * 100 : 0;

        return (
          <div
            key={inv.invoiceId}
            className="bg-[#140f2d]/80 rounded-xl border border-white/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            style={{ borderLeftWidth: 4, borderLeftColor: ps.dot }}
          >
            <div className="flex items-start gap-4 px-5 py-4">
              {/* Invoice icon */}
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={17} className="text-purple-300" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-white text-sm font-mono">{inv.invoiceNumber}</span>
                  <Badge label={ps.label} style={ps} />
                  <Badge label={ds.label} style={ds} />
                </div>
                <p className="text-xs text-gray-400">
                  {inv.customerName} · Invoice: {fmtDate(inv.invoiceDate)} · Due: {fmtDate(inv.dueDate)}
                  {inv.daysOverdue > 0 && (
                    <span className="ml-1 text-red-400 font-semibold">({inv.daysOverdue}d overdue)</span>
                  )}
                </p>

                {/* Payment progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Paid {fmtINR(inv.paidAmount)} of {fmtINR(inv.totalAmount)}</span>
                    <span className="font-semibold text-purple-300">{fmtPct(paidPct)}</span>
                  </div>
                  <ProgressBar
                    value={paidPct}
                    color={paidPct >= 100 ? '#16a34a' : paidPct > 0 ? '#f59e0b' : '#dc2626'}
                  />
                </div>
              </div>

              {/* Pending amount */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400 mb-0.5">Pending</p>
                <p className="text-base font-extrabold text-red-400">{fmtINR(inv.pendingAmount)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── MAIN VendorReports ───────────────────────────────────────────────────────
const VendorReports = ({ context }) => {
  const navigate    = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [activeTab, setActiveTab] = useState('vendor');
  const [vendorData,   setVendorData]   = useState([]);
  const [contractData, setContractData] = useState([]);
  const [invoiceData,  setInvoiceData]  = useState([]);
  const [loadingV, setLoadingV] = useState(true);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingI, setLoadingI] = useState(true);

  // const loadAll = () => {
  //   setLoadingV(true); setLoadingC(true); setLoadingI(true);

  //   fetch(`${BASE_URL}/vendor-performance`)
  //     .then(r => r.json()).then(d => setVendorData(Array.isArray(d) ? d : []))
  //     .catch(() => setVendorData([]))
  //     .finally(() => setLoadingV(false));

  //   fetch(`${BASE_URL}/contract-expiry`)
  //     .then(r => r.json()).then(d => setContractData(Array.isArray(d) ? d : []))
  //     .catch(() => setContractData([]))
  //     .finally(() => setLoadingC(false));

  //   fetch(`${BASE_URL}/invoice-payment`)
  //     .then(r => r.json()).then(d => setInvoiceData(Array.isArray(d) ? d : []))
  //     .catch(() => setInvoiceData([]))
  //     .finally(() => setLoadingI(false));
  // };

  const loadAll = async () => {
  setLoadingV(true);
  setLoadingC(true);
  setLoadingI(true);

  try {
    const [
      vendorPerformanceRes,
      contractExpiryRes,
      invoicePaymentRes,
    ] = await Promise.all([
      getVendorPerformanceReport(),
      getContractExpiryReport(),
      getInvoicePaymentReport(),
    ]);

    setVendorData(
      Array.isArray(vendorPerformanceRes) ? vendorPerformanceRes : []
    );

    setContractData(
      Array.isArray(contractExpiryRes) ? contractExpiryRes : []
    );

    setInvoiceData(
      Array.isArray(invoicePaymentRes) ? invoicePaymentRes : []
    );
  } catch (error) {
    console.error("Error loading vendor reports:", error);

    setVendorData([]);
    setContractData([]);
    setInvoiceData([]);
  } finally {
    setLoadingV(false);
    setLoadingC(false);
    setLoadingI(false);
  }
};

  useEffect(() => { loadAll(); }, []);

  // Summary stats
  const totalVendors    = vendorData.length;
  const expiringSoon    = contractData.filter(c => c.status === 'EXPIRING_SOON').length;
  const overdueInvoices = invoiceData.filter(i => i.dueStatus === 'OVERDUE').length;
  const unpaidInvoices  = invoiceData.filter(i => i.paymentStatus === 'UNPAID').length;

  const totalPending    = invoiceData.reduce((s, i) => s + (i.pendingAmount || 0), 0);

  const tabs = [
    { key: 'vendor',   label: 'Vendor Performance', icon: TrendingUp,   count: totalVendors,    countColor: '#8b5cf6' },
    { key: 'contract', label: 'Contract Expiry',    icon: CalendarClock, count: contractData.length, countColor: expiringSoon > 0 ? '#ca8a04' : '#16a34a' },
    { key: 'invoice',  label: 'Invoice Payments',   icon: CircleDollarSign, count: invoiceData.length,  countColor: overdueInvoices > 0 ? '#dc2626' : '#16a34a' },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300 transition-colors">
          {moduleLabel}
        </button>
        <ChevronRight size={12} />
        <span className="text-white font-semibold">Reports</span>
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-sm text-purple-300 mt-0.5">Vendor and contract analytics</p>
          </div>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors shadow-sm"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: Users,
            value: totalVendors,
            label: 'Vendors Tracked',
            accent: '#8b5cf6',
            bg: 'rgba(139,92,246,0.12)',
            sub: 'Total active vendors',
          },
          {
            icon: AlertCircle,
            value: expiringSoon,
            label: 'Expiring Soon',
            accent: '#ca8a04',
            bg: '#fef9c3',
            sub: 'Contracts near expiry',
          },
          {
            icon: Clock,
            value: overdueInvoices,
            label: 'Overdue Invoices',
            accent: '#dc2626',
            bg: 'rgba(239,68,68,0.15)',
            sub: 'Require immediate action',
          },
          {
            icon: CircleDollarSign,
            value: unpaidInvoices,
            label: 'Unpaid Invoices',
            accent: '#6366f1',
            bg: 'rgba(139,92,246,0.12)',
            sub: totalPending > 0 ? fmtINR(totalPending) + ' pending' : 'All clear',
          },
        ].map(({ icon: Icon, value, label, accent, bg, sub }) => (
          <div
            key={label}
            className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-md transition-shadow"
            style={{ borderTopWidth: 3, borderTopColor: accent }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={17} style={{ color: accent }} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white leading-none mb-1">{value}</p>
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tab card */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-white/10 overflow-x-auto bg-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2.5 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-purple-500/40 text-purple-300 bg-[#140f2d]/80'
                  : 'border-transparent text-gray-400 hover:text-purple-300 hover:bg-[rgba(240,247,251,0.12)]'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              <span
                className="ml-0.5 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: activeTab === t.key ? 'rgba(139,92,246,0.12)' : '#F1F5F9',
                  color: activeTab === t.key ? t.countColor : '#94a3b8',
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'vendor'   && <VendorPerfTab     data={vendorData}   loading={loadingV} />}
          {activeTab === 'contract' && <ContractExpiryTab data={contractData} loading={loadingC} />}
          {activeTab === 'invoice'  && <InvoicePaymentTab data={invoiceData}  loading={loadingI} />}
        </div>
      </div>
    </div>
  );
};

export default VendorReports;