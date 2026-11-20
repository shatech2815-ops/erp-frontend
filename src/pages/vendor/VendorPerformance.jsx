// ─────────────────────────────────────────────────────────────────────────────
// VendorPerformance.jsx
// Backend endpoints (PerformanceController /api/performance):
//   GET /vendor/{vendorId}   → VendorPerformanceResponseDto
//   GET /scorecard/{vendorId}→ VendorScorecardDto
//   GET /sla/{vendorId}      → List<SlaTrackingDto>
// SlaStatus enum: ON_TIME, DELAYED, IN_PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Activity, Star, TrendingUp, Clock,
  CheckCircle, AlertCircle, FileText, DollarSign,
  Users, BarChart2, Search,
} from 'lucide-react';

// const BASE_URL = '/api';
import { getAllVendors } from "../../services/vendor/vendor.services";

import {
  getVendorPerformance,
  getVendorScorecard,
  getSlaTracking,
} from "../../services/vendor/performance.services";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const scoreColor = (score) => {
  if (score >= 80) return { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', dot: '#10b981', label: 'Good' };
  if (score >= 50) return { bg: 'rgba(245,158,11,0.15)', text: '#92400e', dot: '#f59e0b', label: 'Average' };
  return { bg: 'rgba(239,68,68,0.15)', text: '#991b1b', dot: '#ef4444', label: 'Poor' };
};

const slaColor = (status) => {
  if (!status) return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
  const s = status.toUpperCase();
  if (s === 'ON_TIME')     return { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', dot: '#10b981' };
  if (s === 'DELAYED')     return { bg: 'rgba(239,68,68,0.15)', text: '#991b1b', dot: '#ef4444' };
  if (s === 'IN_PROGRESS') return { bg: 'rgba(59,130,246,0.15)', text: '#1e40af', dot: '#3b82f6' };
  return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;
const fmtScore = (n) => Number(n || 0).toFixed(2);

const formatDate = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(val); }
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
    {sub && <p className="text-xs text-purple-300 mt-0.5">{sub}</p>}
  </div>
);

// ─── SectionCard ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
        <Icon size={16} className="text-purple-300" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── ScoreBadge ───────────────────────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  const c = scoreColor(score);
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: c.bg, color: c.text }}>
      <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
      {fmtScore(score)} — {c.label}
    </span>
  );
};

// ─── SlaBadge ─────────────────────────────────────────────────────────────────
const SlaBadge = ({ status }) => {
  const c = slaColor(status);
  const label = status?.replace(/_/g, ' ') || '—';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {label}
    </span>
  );
};

// ─── VendorPerformance ────────────────────────────────────────────────────────
const VendorPerformance = ({ context }) => {
  const navigate = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');

  const [perf, setPerf]       = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [slaList, setSlaList] = useState([]);

  const [loadingVendors, setLoadingVendors]   = useState(true);
  const [loadingPerf, setLoadingPerf]         = useState(false);
  const [error, setError]                     = useState('');

  // Load vendor list for dropdown
  // useEffect(() => {
  //   fetch(`${BASE_URL}/vendors/get-all-vendors`)
  //     .then((r) => r.json())
  //     .then((data) => {
  //       // Backend returns raw Vendor entity list — field is vendorName (not name)
  //       const list = Array.isArray(data) ? data : [];
  //       setVendors(list);
  //       if (list.length > 0) setVendorId(String(list[0].id));
  //     })
  //     .catch(() => setVendors([]))
  //     .finally(() => setLoadingVendors(false));
  // }, []);

  useEffect(() => {
  getAllVendors()
    .then((data) => {
      const list = Array.isArray(data) ? data : [];
      setVendors(list);

      if (list.length > 0) {
        setVendorId(String(list[0].id));
      }
    })
    .catch((error) => {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    })
    .finally(() => setLoadingVendors(false));
}, []);

  // Load performance data whenever vendorId changes
  // useEffect(() => {
  //   if (!vendorId) return;
  //   setLoadingPerf(true);
  //   setError('');

  //   Promise.all([
  //     fetch(`${BASE_URL}/performance/vendor/${vendorId}`).then((r) => r.json()),
  //     fetch(`${BASE_URL}/performance/scorecard/${vendorId}`).then((r) => r.json()),
  //     fetch(`${BASE_URL}/performance/sla/${vendorId}`).then((r) => r.json()),
  //   ])
  //     .then(([perfData, scorecardData, slaData]) => {
  //       setPerf(perfData);
  //       setScorecard(scorecardData);
  //       setSlaList(Array.isArray(slaData) ? slaData : []);
  //     })
  //     .catch(() => setError('Failed to load performance data. Please try again.'))
  //     .finally(() => setLoadingPerf(false));
  // }, [vendorId]);

  useEffect(() => {
  if (!vendorId) return;

  setLoadingPerf(true);
  setError("");

  Promise.all([
    getVendorPerformance(vendorId),
    getVendorScorecard(vendorId),
    getSlaTracking(vendorId),
  ])
    .then(([perfData, scorecardData, slaData]) => {
      setPerf(perfData);
      setScorecard(scorecardData);
      setSlaList(Array.isArray(slaData) ? slaData : []);
    })
    .catch((error) => {
      console.error("Error loading performance data:", error);
      setError("Failed to load performance data. Please try again.");
    })
    .finally(() => setLoadingPerf(false));
}, [vendorId]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300">{moduleLabel}</button>
        <span>/</span>
        <span className="text-white font-semibold">Vendor Performance</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Vendor Performance</h1>
            <p className="text-sm text-purple-300 mt-0.5">Scorecards, SLAs and analytics</p>
          </div>
        </div>
      </div>

      {/* Vendor Selector */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-6">
        <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-2">Select Vendor</label>
        <div className="flex gap-3 items-center">
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            disabled={loadingVendors}
            className="flex-1 max-w-sm rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none"
          >
            {loadingVendors
              ? <option>Loading vendors...</option>
              : vendors.length === 0
                ? <option value="">No vendors found</option>
                : vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.companyName || v.vendorName}
                    </option>
                  ))
            }
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">{error}</div>
      )}

      {loadingPerf ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : perf ? (
        <div className="flex flex-col gap-5">

          {/* Stat Cards — from VendorPerformanceResponseDto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Contracts"    value={perf.totalContracts}    color="#8b5cf6" icon={FileText} />
            <StatCard label="Completed"          value={perf.completedContracts} color="#10b981" icon={CheckCircle} />
            <StatCard label="Delayed"            value={perf.delayedContracts}  color="#ef4444" icon={AlertCircle} />
            <StatCard label="Performance Score"  value={fmtScore(perf.performanceScore)} color="#f59e0b" icon={Star} sub={scoreColor(perf.performanceScore).label} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Invoices"   value={perf.totalInvoices}   color="#6366f1" icon={DollarSign} />
            <StatCard label="Paid Invoices"    value={perf.paidInvoices}    color="#10b981" icon={CheckCircle} />
            <StatCard label="Pending Invoices" value={perf.pendingInvoices} color="#f59e0b" icon={Clock} />
          </div>

          {/* Financial Summary */}
          <SectionCard title="Financial Summary" icon={DollarSign}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total Amount</p>
                <p className="text-2xl font-extrabold text-white">₹{fmt(perf.totalAmount)}</p>
              </div>
              <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Paid Amount</p>
                <p className="text-2xl font-extrabold text-emerald-400">₹{fmt(perf.paidAmount)}</p>
              </div>
              <div className="text-center p-4 bg-amber-500/10 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-400 font-medium uppercase tracking-wide mb-1">Pending Amount</p>
                <p className="text-2xl font-extrabold text-amber-400">₹{fmt(perf.pendingAmount)}</p>
              </div>
            </div>
          </SectionCard>

          {/* Scorecard — from VendorScorecardDto */}
          {scorecard && (
            <SectionCard title="Scorecard" icon={Star}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Overall Score</p>
                  <ScoreBadge score={scorecard.score} />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Rating</span>
                      <span className="font-bold text-white">{scorecard.rating || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Status</span>
                      <span className="font-bold text-white">{scorecard.status || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">On-Time %</span>
                      <span className="font-bold text-white">{fmtPct(scorecard.onTimePercentage)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Payment Efficiency</span>
                      <span className="font-bold text-white">{fmtPct(scorecard.paymentEfficiency)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {/* Score bar */}
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Score Breakdown</p>
                  <div className="space-y-3">
                    {[
                      { label: 'On-Time Delivery', value: scorecard.onTimePercentage },
                      { label: 'Payment Efficiency', value: scorecard.paymentEfficiency },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-purple-300 mb-1">
                          <span>{label}</span>
                          <span className="font-semibold">{fmtPct(value)}</span>
                        </div>
                        <div className="w-full bg-purple-500/10 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, value)}%`, background: value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* SLA Tracking — from List<SlaTrackingDto> */}
          <SectionCard title="SLA Tracking" icon={Clock}>
            {slaList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No SLA data available for this vendor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-white/10">
                      <th className="pb-3 text-left">Contract</th>
                      <th className="pb-3 text-left">Start Date</th>
                      <th className="pb-3 text-left">End Date</th>
                      <th className="pb-3 text-left">Actual End</th>
                      <th className="pb-3 text-left">SLA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {slaList.map((s) => (
                      <tr key={s.contractId} className="hover:bg-white/10 transition-colors">
                        <td className="py-3 font-semibold text-white">{s.contractName}</td>
                        <td className="py-3 text-purple-300">{formatDate(s.startDate)}</td>
                        <td className="py-3 text-purple-300">{formatDate(s.endDate)}</td>
                        <td className="py-3 text-purple-300">{s.actualEndDate ? formatDate(s.actualEndDate) : '—'}</td>
                        <td className="py-3"><SlaBadge status={s.slaStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

        </div>
      ) : !loadingPerf && vendorId ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
            <Activity size={28} className="text-purple-300" />
          </div>
          <p className="text-sm text-purple-300">No performance data found for this vendor.</p>
        </div>
      ) : null}
    </div>
  );
};

export default VendorPerformance;
