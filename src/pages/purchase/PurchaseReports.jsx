
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart2, TrendingUp, TrendingDown,
  ShoppingCart, Users, Package, DollarSign,
  CheckCircle, Clock, XCircle, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import { getPurchaseReports } from "../../services/purchase/poReport.services";

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = ['#8b5cf6','#10b981','#f59e0b','#ef4444','#7c3aed','#14b8a6','#f43f5e','#6366f1'];

// ─── Data ─────────────────────────────────────────────────────────────────────

// 1. LINE CHART — Monthly PO spend trend
// const LINE_DATA = [
//   { month: 'Oct', poValue: 120000, vendorPay: 95000, returns: 8000  },
//   { month: 'Nov', poValue: 145000, vendorPay: 110000,returns: 5000  },
//   { month: 'Dec', poValue: 98000,  vendorPay: 80000, returns: 12000 },
//   { month: 'Jan', poValue: 175000, vendorPay: 140000,returns: 3000  },
//   { month: 'Feb', poValue: 160000, vendorPay: 125000,returns: 7000  },
//   { month: 'Mar', poValue: 261480, vendorPay: 162680,returns: 4000  },
// ];

// 2. BAR CHART — Vendor-wise PO count & spend
// const BAR_DATA = [
//   { vendor: 'Ravi',    orders: 3, spend: 90650  },
//   { vendor: 'Ganesh',  orders: 2, spend: 48550  },
//   { vendor: 'Murugan', orders: 4, spend: 13080  },
//   { vendor: 'Chennai', orders: 2, spend: 72030  },
//   { vendor: 'Vijay',   orders: 1, spend: 24870  },
//   { vendor: 'Kumar',   orders: 2, spend: 36560  },
// ];

// // 3. PIE CHART — PO Status breakdown
// const PIE_STATUS = [
//   { name: 'Completed', value: 2, color: '#10b981' },
//   { name: 'Approved',  value: 1, color: '#8b5cf6' },
//   { name: 'Pending',   value: 1, color: '#f59e0b' },
//   { name: 'Created',   value: 1, color: '#6366f1' },
//   { name: 'Rejected',  value: 1, color: '#ef4444' },
// ];

// // 4. DONUT CHART — Payment method distribution
// const DONUT_PAY = [
//   { name: 'Bank Transfer', value: 2, color: '#8b5cf6' },
//   { name: 'Cheque',        value: 2, color: '#7c3aed' },
//   { name: 'UPI',           value: 1, color: '#14b8a6' },
//   { name: 'Cash',          value: 1, color: '#f59e0b' },
// ];

// 5. RADAR CHART — Vendor performance scores
// const RADAR_DATA = [
//   { metric: 'On-Time',   Ravi: 90, Ganesh: 72, Murugan: 95 },
//   { metric: 'Quality',   Ravi: 85, Ganesh: 78, Murugan: 88 },
//   { metric: 'Pricing',   Ravi: 80, Ganesh: 85, Murugan: 75 },
//   { metric: 'Response',  Ravi: 88, Ganesh: 70, Murugan: 92 },
//   { metric: 'Accuracy',  Ravi: 92, Ganesh: 75, Murugan: 90 },
// ];




// ─── Small helpers ────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const Tip = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#140f2d]/80 border border-white/10 rounded-xl shadow-lg px-4 py-3 text-xs min-w-[130px]">
      {label && <p className="font-bold text-white mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold leading-5">
          {p.name}: {money ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const KPI = ({ label, value, sub, color, icon: Icon, trend }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10 flex flex-col gap-1" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={15} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
    {sub && <p className="text-xs text-purple-300 font-medium">{sub}</p>}
  </div>
);

 

const Card = ({ title, badge, children, className = '' }) => (
  <div className={`bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
      <p className="text-sm font-bold text-white">{title}</p>
      {badge && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 uppercase tracking-wide">{badge}</span>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const PieLegend = ({ data }) => (
  <div className="flex flex-col gap-2">
    {data.map(d => (
      <div key={d.name} className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
        <span className="text-xs text-purple-300 font-medium flex-1">{d.name}</span>
        <span className="text-xs font-bold text-white">{d.value}</span>
      </div>
    ))}
  </div>
);

// ─── Report links (the 3 sub-reports below) ───────────────────────────────────
const REPORT_LINKS = [
  { num: 1, label: 'PO Reports',                desc: 'Detailed purchase order analysis & history',    route: '/dashboard/purchase/reports/po-reports' },
  { num: 2, label: 'Vendor Performance Report', desc: 'Scorecard, SLAs & delivery metrics',            route: '/dashboard/purchase/reports/vendor-performance' },
  { num: 3, label: 'Inventory Report',          desc: 'Stock levels, item movement & requests',        route: '/dashboard/purchase/reports/inventory-report' },
];



// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PurchaseReports() {
  const navigate = useNavigate();

    const [kpi, setKpi] = useState({
  totalValue: 0,
  completed: 0,
  pending: 0,
  rejected: 0,
});

   const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieStatus, setPieStatus] = useState([]);
  const [donutPay, setDonutPay] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getPurchaseReports(
        "2025-10-01",
        "2026-03-31",
        "",
        ""
      );

      console.log("API DATA:", data);

      // Helper to add colors to chart data
      const addColors = (arr = []) =>
        arr.map((item, idx) => ({
          ...item,
          color: P[idx % P.length],
        }));

      // Helper to generate full month range and fill missing months with zeros
      const fillMissingMonths = (trend = [], start, end) => {
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const startDate = new Date(start);
        const endDate = new Date(end);
        const result = [];
        const map = {};
        trend.forEach(item => {
          map[item.month] = item;
        });
        let cur = new Date(startDate);
        while (cur <= endDate) {
          const monthKey = monthNames[cur.getMonth()];
          if (map[monthKey]) {
            result.push(map[monthKey]);
          } else {
            result.push({ month: monthKey, poValue: 0, vendorPay: 0, returns: 0 });
          }
          cur.setMonth(cur.getMonth() + 1);
        }
        return result;
      };

      // Set KPI & chart data
      setKpi({
        totalValue: data.totalPoValue || 0,
        completed: data.completedCount || 0,
        pending: data.pendingCount || 0,
        rejected: data.rejectedCount || 0,
      });
      setPieStatus(addColors(data.statusBreakdown || []));
      setDonutPay(addColors(data.paymentMethods || []));
      // Ensure line chart shows all months in the interval
      setLineData(fillMissingMonths(data.monthlyTrend || [], "2025-10-01", "2026-03-31"));
      setBarData(data.vendorStats || []);
      setRadarData(data.vendorPerformance || []);

    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

    const topMethod = (donutPay || []).length
  ? donutPay.reduce((max, item) =>
      item.value > (max?.value || 0) ? item : max
    )
  : null;
  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>

      

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
            <BarChart2 size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Reports</h1>
            <p className="text-xs text-gray-400">Analytics and performance reports</p>
          </div>
        </div>
      </div>

      

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* <KPI label="Total PO Value"   value={fmt(261480)} color="#8b5cf6" icon={DollarSign}   trend={12} />
        <KPI label="Completed POs"    value="2"           color="#10b981" icon={CheckCircle}  sub="₹1,62,680 settled" />
        <KPI label="Pending / Active" value="3"           color="#f59e0b" icon={Clock}        sub="₹98,800 outstanding" />
        <KPI label="Rejected POs"     value="1"           color="#ef4444" icon={XCircle}      sub="₹36,560 cancelled" /> */}

          <KPI label="Total PO Value" value={fmt(kpi.totalValue)} icon={DollarSign} color="#8b5cf6" />
          <KPI label="Completed POs" value={kpi.completed} icon={CheckCircle} color="#10b981" />
          <KPI label="Pending / Active" value={kpi.pending} icon={Clock} color="#f59e0b" />
          <KPI label="Rejected POs" value={kpi.rejected} icon={XCircle} color="#ef4444" />
      </div>

      {/* ══ CHART 1 — LINE CHART (full width) ══ */}
      <Card title="📈  Monthly Purchase Trend — PO Value vs Vendor Payments vs Returns  (₹)" badge="Line Chart" className="mb-5">
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={lineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.12)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip money />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="poValue"   name="PO Value"       stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="vendorPay" name="Vendor Payments" stroke="#10b981" strokeWidth={2}   dot={{ r: 3, fill: '#10b981' }} />
            <Line type="monotone" dataKey="returns"   name="Returns"         stroke="#f43f5e" strokeWidth={2}   strokeDasharray="5 3" dot={{ r: 3, fill: '#f43f5e' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ══ CHART 2 — BAR CHART (full width) ══ */}
      <Card title="📊  Vendor-wise Order Count vs Total Spend  (₹)" badge="Bar Chart" className="mb-5">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.12)" />
            <XAxis dataKey="vendor" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left"  tickFormatter={v => `${v}`}               tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} />
            <Legend iconType="rect" wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left"  dataKey="orders" name="No. of Orders" fill="#8b5cf6" radius={[6,6,0,0]} maxBarSize={36} />
            <Bar yAxisId="right" dataKey="spend"  name="Total Spend (₹)" fill="#9ca3af" radius={[6,6,0,0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ══ CHART 3 + 4 — PIE & DONUT side by side ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

        {/* PIE — PO Status */}
        <Card title="🥧  PO Status Distribution" badge="Pie Chart">
          <div className="flex items-center gap-5">
            <ResponsiveContainer width="55%" height={210}>
              <PieChart>
                <Pie data={pieStatus} cx="50%" cy="50%" outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <PieLegend data={pieStatus} />
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Total POs</p>
                {/* <p className="text-3xl font-extrabold text-white">6</p> */}
                <p>{(pieStatus || []).reduce((sum, item) => sum + (item.value || 0), 0)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* DONUT — Payment Methods */}
        <Card title="🍩  Payment Method Split" badge="Donut Chart">
          <div className="flex items-center gap-5">
            <ResponsiveContainer width="55%" height={210}>
              <PieChart>
                <Pie data={donutPay} cx="50%" cy="50%" innerRadius={52} outerRadius={85} dataKey="value" paddingAngle={4}>
                  {donutPay.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <PieLegend data={donutPay} />
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Top Method</p>
                {/* <p className="text-sm font-extrabold text-purple-300">Bank Transfer & Cheque</p> */}
                  <p>{topMethod?.name || "-"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ══ CHART 5 — RADAR CHART (full width) ══ */}
      <Card title="🕸️  Vendor Performance Radar — On-Time, Quality, Pricing, Response, Accuracy" badge="Radar Chart" className="mb-7">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <PolarGrid stroke="rgba(139,92,246,0.12)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#8b5cf6', fontWeight: 600 }} />
            <PolarRadiusAxis angle={90} domain={[60, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Radar name="Ravi Traders"     dataKey="Ravi"    stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.18} strokeWidth={2} />
            <Radar name="Sri Ganesh Stores" dataKey="Ganesh" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} strokeWidth={2} />
            <Radar name="Murugan Supplies" dataKey="Murugan" stroke="#10b981" fill="#10b981" fillOpacity={0.18} strokeWidth={2} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Tooltip content={<Tip />} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* ══ Report Links (the original 3 items, now below the charts) ══ */}
      <div className="mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Detailed Reports</p>
        <div className="bg-[#140f2d]/80 rounded-2xl border border-white/10 shadow-sm overflow-hidden divide-y divide-white/10">
          {REPORT_LINKS.map(r => (
            <div key={r.num}
              onClick={() => navigate(r.route)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-extrabold text-purple-300">{r.num}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{r.label}</p>
                <p className="text-xs text-gray-400">{r.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-300 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
