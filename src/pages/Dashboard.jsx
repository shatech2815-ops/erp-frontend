
  import React, { useState, useEffect, useRef } from 'react';
  import { useNavigate } from 'react-router-dom';

  const dashboardStyles = `
    .dashboard-animated-card {
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(10px);
      border-radius: 16px !important;
      padding: 20px !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    .dashboard-animated-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%);
      z-index: -1;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .dashboard-animated-card:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15) !important;
      border-color: rgba(139, 92, 246, 0.4) !important;
    }
    .dashboard-animated-card:hover::before {
      opacity: 1;
    }
    .dashboard-animated-card:hover .stat-icon-wrapper {
      transform: rotate(8deg) scale(1.15);
    }
    .stat-icon-wrapper {
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
  `;
  import {
    Package, ShoppingCart, DollarSign, TrendingUp,
    ClipboardList, CheckCircle, AlertCircle, Clock, AlertTriangle,
    BarChart2, Activity, ChevronRight, ArrowUpRight, ArrowDownRight,
    Bell, CreditCard, Boxes, Users, FileText, Rocket
  } from 'lucide-react';

  import { getAllOrders } from "../services/purchase/purchaseOrder.services";
  import { getAllSupplierPOs } from "../services/purchase/supplierPO.services";
  import { getAllVendorInvoices } from "../services/vendor/vendorInvoice.services";
  import { getAllVendors } from "../services/vendor/vendor.services";
  import { getDashboardData } from "../services/account/dashboard.services";
  import { getAllItems } from "../services/stock/item.services";
  import {getInvoicePaymentReport} from "../services/vendor/performance.services";

  // ── Animated counter ──────────────────────────────────────────────────────────
  function CountUp({ target, prefix = '', suffix = '', duration = 1800 }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);
    useEffect(() => {
      started.current = false;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(ease * target));
            if (p < 1) requestAnimationFrame(tick);
            else setVal(target);
          };
          requestAnimationFrame(tick);
        }
      }, { threshold: 0.3 });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, [target, duration]);
    return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
  }

  // ── SVG Line Chart ─────────────────────────────────────────────────────────────
  function LineChart({ data, color = '#4F46E5', height = 90 }) {
    const W = 300, H = height;
    const vals = data.map(d => d.value);
    const max = Math.max(...vals); const min = Math.min(...vals);
    const rng = max - min || 1;
    const pts = vals.map((v, i) => ({
      x: (i / (vals.length - 1)) * W,
      y: H - 10 - ((v - min) / rng) * (H - 20),
    }));
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const fillD = `${pathD} L${pts[pts.length-1].x},${H} L0,${H} Z`;
    const gid = `g${color.replace(/[^a-z0-9]/gi,'')}`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height, display:'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#${gid})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.8" />)}
      </svg>
    );
  }

  // ── SVG Bar Chart ──────────────────────────────────────────────────────────────
  function BarChart({ data, barColors }) {
    const max = Math.max(...data.map(d => d.value));
    return (
      <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'110px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', height:'100%', justifyContent:'flex-end' }}>
            <span style={{ fontSize:'9px', color:'#64748b', fontWeight:700 }}>{d.value}</span>
            <div style={{
              width:'100%', borderRadius:'5px 5px 0 0', minHeight:'4px',
              background: barColors ? barColors[i % barColors.length] : '#4F46E5',
              height:`${(d.value / max) * 80}%`,
              transition:'height 1.2s cubic-bezier(.16,1,.3,1)',
            }} />
            <span style={{ fontSize:'9px', color:'#94a3b8' }}>{d.label}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── KPI Stat Card ──────────────────────────────────────────────────────────────
  function StatCard({ icon: Icon, title, value, change, sub, color, prefix='', suffix='' }) {
    const pos = change >= 0;
    return (
      <div className="dashboard-animated-card" style={{ padding:'18px 20px' }}>
        <div style={{ position:'absolute', top:0, right:0, width:'72px', height:'72px',
          background:`${color}0e`, borderRadius:'0 16px 0 72px' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
          <div className="stat-icon-wrapper" style={{ width:'38px', height:'38px', borderRadius:'11px', background:`${color}16`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={17} color={color} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'3px', padding:'3px 8px', borderRadius:'20px',
            background: pos ? '#dcfce7' : '#fee2e2' }}>
            {pos ? <ArrowUpRight size={11} color="#16a34a" /> : <ArrowDownRight size={11} color="#dc2626" />}
            <span style={{ fontSize:'10px', fontWeight:700, color: pos ? '#16a34a' : '#dc2626' }}>
              {pos?'+':''}{change}%
            </span>
          </div>
        </div>
        <div style={{ fontSize:'28px', fontWeight:800, color:'#0f172a', letterSpacing:'-0.5px', lineHeight:1, marginBottom:'4px' }}>
          <CountUp target={typeof value === 'number' ? value : 0} prefix={prefix} suffix={suffix} />
        </div>
        <div style={{ fontSize:'12px', color:'#64748b', fontWeight:600 }}>{title}</div>
        {sub && <div style={{ fontSize:'10px', color:'#94a3b8', marginTop:'2px' }}>{sub}</div>}
      </div>
    );
  }

  // ── Alert severity config ─────────────────────────────────────────────────────
  const ALERT_STYLES = {
    overdue:  { bg:'#fff1f2', border:'#fecdd3', icon: AlertCircle,   iconColor:'#e11d48', badge:'#fecdd3', badgeText:'#9f1239', label:'Overdue'  },
    due_today:{ bg:'#fff7ed', border:'#fed7aa', icon: Clock,         iconColor:'#f97316', badge:'#fed7aa', badgeText:'#9a3412', label:'Due Today' },
    stock:    { bg:'#fefce8', border:'#fef08a', icon: AlertTriangle,  iconColor:'#ca8a04', badge:'#fef08a', badgeText:'#854d0e', label:'Low Stock' },
    info:     { bg:'#f0fdf4', border:'#bbf7d0', icon: CheckCircle,   iconColor:'#16a34a', badge:'#bbf7d0', badgeText:'#166534', label:'Info'     },
  };

  // ── Dashboard ──────────────────────────────────────────────────────────────────
  export default function Dashboard() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [alertFilter, setAlertFilter] = useState('ALL');
    
    useEffect(() => { 
      try {
        const userObj = JSON.parse(localStorage.getItem('user'));
        const role = userObj?.user?.role || userObj?.role || 'admin';
        if (role !== 'admin') {
           navigate(`/dashboard/${role}`);
        }
      } catch(e) {}
      
      const t = setTimeout(() => setLoaded(true), 80); 
      return () => clearTimeout(t); 
    }, [navigate]);

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [supplierPOs, setSupplierPOs] = useState([]);
    const [loadingSupplierPOs, setLoadingSupplierPOs] = useState(true);
    const [vendorInvoices, setVendorInvoices] = useState([]);
    const [loadingVendorInvoices, setLoadingVendorInvoices] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [invoicePaymentReport, setInvoicePaymentReport] = useState([]);

    // ── DUMMY DATA — replace with backend API calls ────────────────────────────
    // TODO: fetch from /api/alerts or equivalent endpoint
    // const alerts = [
    //   {
    //     id: 1,
    //     type: 'overdue',
    //     title: 'Invoice INV-20260401-1812 overdue',
    //     desc: 'Ashok Leyland — ₹4,20,000 was due on 01-Apr-2026 (19 days ago)',
    //     time: '19d overdue',
    //   },
    //   {
    //     id: 2,
    //     type: 'overdue',
    //     title: 'Invoice INV-20260410-2244 overdue',
    //     desc: 'Rane Holdings — ₹95,000 was due on 10-Apr-2026 (10 days ago)',
    //     time: '10d overdue',
    //   },
    //   {
    //     id: 3,
    //     type: 'due_today',
    //     title: 'Payment due today — TVS Motors',
    //     desc: 'Invoice INV-20260420-3301 · ₹1,85,000 · Due: 20-Apr-2026',
    //     time: 'Today',
    //   },
    //   {
    //     id: 4,
    //     type: 'due_today',
    //     title: 'Payment due today — Lucas TVS',
    //     desc: 'Invoice INV-20260420-3415 · ₹3,10,000 · Due: 20-Apr-2026',
    //     time: 'Today',
    //   },
    //   {
    //     id: 5,
    //     type: 'stock',
    //     title: 'HSS End Mill Ø12 below minimum level',
    //     desc: 'Current stock: 3 pcs · Minimum order level: 10 pcs · Reorder now',
    //     time: 'Stock alert',
    //   },
    //   {
    //     id: 6,
    //     type: 'stock',
    //     title: 'Carbide Insert TCMT 110208 critically low',
    //     desc: 'Current stock: 6 pcs · Minimum order level: 25 pcs · Reorder now',
    //     time: 'Stock alert',
    //   },
    //   {
    //     id: 7,
    //     type: 'stock',
    //     title: 'M10 Hex Bolts (Grade 8.8) running low',
    //     desc: 'Current stock: 42 pcs · Minimum order level: 100 pcs · Reorder now',
    //     time: 'Stock alert',
    //   },
    //   {
    //     id: 8,
    //     type: 'info',
    //     title: 'PO MV-1041 successfully delivered',
    //     desc: 'TVS Motors — Jigs & Fixtures · Closed on 20-Apr-2026',
    //     time: 'Today',
    //   },
    // ];

    // TODO: fetch from /api/purchase-orders
    // const purchaseOrders = [
    //   { id:'PO-2026-0042', vendor:'Bharat Tools Pvt Ltd',   item:'HSS End Mill Ø12 × 20 pcs',           value:'₹28,000',  status:'Pending Approval', date:'18-Apr-2026', due:'25-Apr-2026' },
    //   { id:'PO-2026-0041', vendor:'Sri Murugan Fasteners',  item:'M10 Hex Bolts Grade 8.8 × 200 pcs',   value:'₹6,400',   status:'Approved',         date:'16-Apr-2026', due:'22-Apr-2026' },
    //   { id:'PO-2026-0040', vendor:'Coromant India',         item:'Carbide Insert TCMT 110208 × 50 pcs',  value:'₹42,500',  status:'In Transit',       date:'14-Apr-2026', due:'20-Apr-2026' },
    //   { id:'PO-2026-0039', vendor:'Lakshmi Machine Works',  item:'CNC Spindle Bearing Set × 2 nos',      value:'₹18,200',  status:'Received',         date:'10-Apr-2026', due:'17-Apr-2026' },
    //   { id:'PO-2026-0038', vendor:'Ambika Steel Traders',   item:'MS Flat Bar 50×10 × 100 kg',           value:'₹9,500',   status:'Received',         date:'08-Apr-2026', due:'15-Apr-2026' },
    //   { id:'PO-2026-0037', vendor:'Sakthi Cutting Tools',   item:'Drill Bit Set HSS × 5 sets',           value:'₹12,750',  status:'Cancelled',        date:'05-Apr-2026', due:'12-Apr-2026' },
    // ];

    const revData = (() => {
      if (!purchaseOrders || purchaseOrders.length === 0) return Array(10).fill({ value: 10 });
      const sorted = [...purchaseOrders].filter(p => p.orderDate).sort((a,b) => new Date(a.orderDate) - new Date(b.orderDate));
      if (!sorted.length) return Array(10).fill({ value: 10 });
      const minDate = new Date(sorted[0].orderDate).getTime();
      const maxDate = new Date(sorted[sorted.length-1].orderDate).getTime();
      const range = maxDate - minDate || 1;
      const res = Array(10).fill(0);
      sorted.forEach(po => {
        const d = new Date(po.orderDate).getTime();
        let idx = Math.floor(((d - minDate) / range) * 9);
        res[idx] += Number(po.totalAmount) || 0;
      });
      // Normalize values slightly to fit the chart nicely
      const maxRes = Math.max(...res, 1);
      return res.map(v => ({ value: (v / maxRes) * 100 || 10 }));
    })();

    const spendCategories = (() => {
      const cats = {};
      purchaseOrders.forEach(po => {
        const cat = po.category || "General";
        cats[cat] = (cats[cat] || 0) + (Number(po.totalAmount) || 0);
      });
      const total = Object.values(cats).reduce((a,b) => a+b, 0) || 1;
      const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#f97316', '#ec4899'];
      return Object.entries(cats).slice(0, 5).map(([label, val], i) => ({
        label,
        val: '₹' + (val / 100000).toFixed(1) + 'L',
        pct: Math.round((val / total) * 100) + '%',
        color: colors[i % colors.length]
      }));
    })();
    
    // Fallback if no categories
    const specSegments = spendCategories.length > 0 ? spendCategories : [
      { label:'General', pct:'100%', color:'#8b5cf6', val:'₹0L' }
    ];

    // Alert counts for summary badges
   
    // const stockCount    = alerts.filter(a => a.type === 'stock').length;

    const anim = (delay) => ({
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.55s ease ${delay}s, transform 0.55s cubic-bezier(.16,1,.3,1) ${delay}s`,
    });

    const PO_STATUS_STYLE = {
  CREATED: {
    bg: "#fef9c3",
    color: "#a16207",
  },

  APPROVED: {
    bg: "#dbeafe",
    color: "#1d4ed8",
  },

  SHIPPED: {
    bg: "#ede9fe",
    color: "#6d28d9",
  },

  DELIVERED: {
    bg: "#dcfce7",
    color: "#15803d",
  },

  CANCELLED: {
    bg: "#fee2e2",
    color: "#b91c1c",
  },
};

    useEffect(() => {
    fetchPurchaseOrders();
    fetchSupplierPOs();
    fetchVendorInvoices();
    fetchVendors();
    fetchDashboardData();
    fetchItems();
    fetchInvoicePaymentReport();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoadingOrders(true);

      const data = await getAllOrders();

      console.log("Purchase Orders:", data);

      setPurchaseOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch purchase orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

    const totalOrders = purchaseOrders.length;
    const totalSupplierPOs = supplierPOs.length;
    const totalVendorInvoices = vendorInvoices.length;
    const totalVendors = vendors.length;
    const totalRevenue =
    dashboardData?.totalRevenue ||
    dashboardData?.revenue ||
    0;
    const formattedRevenue =
  Number(totalRevenue / 10000000).toFixed(1);
  const lowStockItems = items.filter(
  (item) =>
    (item.currentStock || item.stock || 0) <=
    (item.minimumStock || item.reorderLevel || 0)
);

  const stockCount = lowStockItems.length;

  const stockAlerts = lowStockItems.map((item, index) => ({
  id: `stock-${index}`,

  type: "stock",

  title: `${
    item.itemName ||
    item.name ||
    "Inventory Item"
  } below minimum stock`,

  desc: `Current stock: ${
    item.currentStock || item.stock || 0
  } · Minimum level: ${
    item.minimumStock ||
    item.reorderLevel ||
    0
  }`,

  time: "Low Stock",
}));

  const overdueInvoiceAlerts = vendorInvoices
  .filter(
    (inv) =>
      inv.status === "OVERDUE"
  )
  .map((inv, index) => ({
    id: `overdue-${index}`,

    type: "overdue",

    title: `Invoice ${
      inv.billNo ||
      inv.invoiceNumber ||
      inv.id
    } overdue`,

    desc: `${
      inv.vendorName ||
      inv.vendor?.name ||
      "-"
    } — ₹${
      inv.netPayable ||
      inv.total ||
      inv.amount ||
      0
    } pending payment`,

    time: "Overdue",
  }));

  const dueTodayAlerts = vendorInvoices
  .filter(
    (inv) =>
      inv.status === "PENDING"
  )
  .map((inv, index) => ({
    id: `pending-${index}`,

    type: "due_today",

    title: `Payment pending for ${
      inv.vendorName ||
      inv.vendor?.name ||
      "-"
    }`,

    desc: `Invoice ${
      inv.billNo ||
      inv.invoiceNumber
    } · ₹${
      inv.netPayable ||
      inv.total ||
      inv.amount ||
      0
    }`,

    time: "Pending",
  }));

  const infoAlerts = purchaseOrders
  .filter(
    (o) =>
      o.status === "DELIVERED"
  )
  .slice(0, 5)
  .map((o, index) => ({
    id: `info-${index}`,

    type: "info",

    title: `PO ${
      o.orderNumber
    } delivered successfully`,

    desc: `${
      o.vendor?.name ||
      o.supplierName ||
      "-"
    } · ₹${
      o.totalAmount || 0
    }`,

    time: "Delivered",
  }));

  const alerts = [
  ...overdueInvoiceAlerts,
  ...dueTodayAlerts,
  ...stockAlerts,
  ...infoAlerts,
];

 const overdueCount  = alerts.filter(a => a.type === 'overdue').length;
    const dueTodayCount = alerts.filter(a => a.type === 'due_today').length;

  const approvedOrders = purchaseOrders.filter(
    (o) => o.status === "APPROVED"
  ).length;

  const pendingOrders = purchaseOrders.filter(
    (o) => o.status === "PENDING"
  ).length;

  const cancelledOrders = purchaseOrders.filter(
    (o) => o.status === "CANCELLED"
  ).length;

  const pendingPayments =
  invoicePaymentReport.filter(
    (item) =>
      item.paymentStatus === "PENDING" ||
      item.status === "PENDING" ||
      item.invoiceStatus === "PENDING"
  );

const pendingPaymentCount =
  pendingPayments.length;

const pendingPaymentAmount =
  pendingPayments.reduce(
    (sum, item) =>
      sum +
      (
        item.pendingAmount ||
        item.amount ||
        item.totalAmount ||
        item.netPayable ||
        0
      ),
    0
  );

  const totalPurchaseValue = purchaseOrders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0
  );

    const fetchSupplierPOs = async () => {
    try {
      setLoadingSupplierPOs(true);

      const data = await getAllSupplierPOs();

      console.log("Supplier POs:", data);

      setSupplierPOs(data || []);
    } catch (error) {
      console.error("Failed to fetch supplier POs:", error);
    } finally {
      setLoadingSupplierPOs(false);
    }
  };

    const fetchVendorInvoices = async () => {
    try {
      setLoadingVendorInvoices(true);

      const data = await getAllVendorInvoices();

      console.log("Vendor Invoices:", data);

      setVendorInvoices(data || []);
    } catch (error) {
      console.error("Failed to fetch vendor invoices:", error);
    } finally {
      setLoadingVendorInvoices(false);
    }
  };

    const fetchVendors = async () => {
    try {
      setLoadingVendors(true);

      const data = await getAllVendors();

      console.log("Vendors:", data);

      setVendors(data || []);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

    const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const data = await getDashboardData();

      console.log("Dashboard Data:", data);

      setDashboardData(data || {});
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoadingDashboard(false);
    }
  };

    const fetchItems = async () => {
  try {
    setLoadingItems(true);

    const data = await getAllItems();

    console.log("Inventory Items:", data);

    setItems(data || []);
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
  } finally {
    setLoadingItems(false);
  }
};

  const fetchInvoicePaymentReport =
  async () => {

    try {

      const data =
        await getInvoicePaymentReport();

      console.log(
        "Invoice Payment Report:",
        data
      );

      setInvoicePaymentReport(
        data || []
      );

    } catch (error) {

      console.error(
        "Failed to fetch invoice payment report:",
        error
      );
    }
  };

    return (
      <div className="dashboard-bg min-h-screen text-white p-6 pb-24 font-[Poppins]">
        {/* Header / Welcome Section */}
        <div className="mb-8">
          <div className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mb-1">Enterprise Business Hub</div>
          <div className="text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome Back, <span className="text-[#0ea5e9]">Admin!</span>
          </div>
          <div className="text-sm text-gray-400">Powering your procurement & vendor ecosystem</div>
        </div>

        {/* Top KPIs - 5 Circles */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* Card 1: Total Vendors */}
          <div className="relative flex flex-col items-center justify-center p-6 dashboard-glass-panel neon-border-purple rounded-full aspect-square text-center">
            <Users size={24} className="text-purple-400 mb-2" />
            <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Total Vendors</div>
            <div className="text-3xl font-bold text-white mb-1"><CountUp target={totalVendors} /></div>
            <div className="text-xs text-green-400 font-semibold">+12.5%</div>
            <div className="text-[9px] text-gray-500">from last month</div>
          </div>
          {/* Card 2: Purchase Orders */}
          <div className="relative flex flex-col items-center justify-center p-6 dashboard-glass-panel neon-border-blue rounded-full aspect-square text-center">
            <ShoppingCart size={24} className="text-blue-400 mb-2" />
            <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Purchase Orders</div>
            <div className="text-3xl font-bold text-white mb-1"><CountUp target={totalOrders} /></div>
            <div className="text-xs text-green-400 font-semibold">+18.2%</div>
            <div className="text-[9px] text-gray-500">from last month</div>
          </div>
          {/* Card 3: Total Spend */}
          <div className="relative flex flex-col items-center justify-center p-6 dashboard-glass-panel neon-border-cyan rounded-full aspect-square text-center">
            <DollarSign size={24} className="text-cyan-400 mb-2" />
            <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Total Spend</div>
            <div className="text-3xl font-bold text-white mb-1">₹ <CountUp target={Number(formattedRevenue)} suffix="L" /></div>
            <div className="text-xs text-green-400 font-semibold">+22.4%</div>
            <div className="text-[9px] text-gray-500">from last month</div>
          </div>
          {/* Card 4: Pending Invoices */}
          <div className="relative flex flex-col items-center justify-center p-6 dashboard-glass-panel neon-border-orange rounded-full aspect-square text-center">
            <FileText size={24} className="text-orange-400 mb-2" />
            <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Pending Invoices</div>
            <div className="text-3xl font-bold text-white mb-1"><CountUp target={pendingPaymentCount} /></div>
            <div className="text-xs text-red-400 font-semibold">-8.4%</div>
            <div className="text-[9px] text-gray-500">from last month</div>
          </div>
          {/* Card 5: Active Contracts */}
          <div className="relative flex flex-col items-center justify-center p-6 dashboard-glass-panel neon-border-pink rounded-full aspect-square text-center">
            <FileText size={24} className="text-pink-400 mb-2" />
            <div className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Active Contracts</div>
            <div className="text-3xl font-bold text-white mb-1"><CountUp target={totalVendors} /></div>
            <div className="text-xs text-green-400 font-semibold">+16.7%</div>
            <div className="text-[9px] text-gray-500">from last month</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Middle Section (3D Graphic + Charts) */}
          <div className="col-span-9 flex flex-col gap-6">
            
            {/* Live Data Tables Area */}
            <div className="grid grid-cols-2 gap-6 h-[400px]">
              {/* Recent Purchase Orders */}
              <div className="dashboard-glass-panel p-5 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShoppingCart size={16} className="text-blue-400"/> Recent Purchase Orders</h3>
                  <button type="button" onClick={() => navigate('/dashboard/purchase/purchase-orders/po-list')} className="text-[10px] text-blue-400 hover:text-blue-300">View All →</button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-gray-400 sticky top-0 bg-[#0f0a1c] z-10">
                      <tr>
                        <th className="py-2 px-3 font-semibold">PO Number</th>
                        <th className="py-2 px-3 font-semibold">Vendor</th>
                        <th className="py-2 px-3 font-semibold">Amount</th>
                        <th className="py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {purchaseOrders.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4 text-gray-500">No recent orders</td></tr>
                      ) : purchaseOrders.slice(0, 6).map(po => (
                        <tr key={po.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 px-3 font-medium text-gray-200">{po.orderNumber}</td>
                          <td className="py-2 px-3 text-gray-400 truncate max-w-[100px]">{po.vendor?.name || po.supplierName || '-'}</td>
                          <td className="py-2 px-3 text-white font-semibold">₹{(po.totalAmount || 0).toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: PO_STATUS_STYLE[po.status]?.bg || '#374151', color: PO_STATUS_STYLE[po.status]?.color || '#f3f4f6' }}>
                              {po.status || 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Invoices */}
              <div className="dashboard-glass-panel p-5 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileText size={16} className="text-orange-400"/> Pending Invoices</h3>
                  <button type="button" onClick={() => navigate('/dashboard/vendor/invoices/list')} className="text-[10px] text-orange-400 hover:text-orange-300">View All →</button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-gray-400 sticky top-0 bg-[#0f0a1c] z-10">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Invoice No</th>
                        <th className="py-2 px-3 font-semibold">Vendor</th>
                        <th className="py-2 px-3 font-semibold">Due Date</th>
                        <th className="py-2 px-3 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {vendorInvoices.filter(i => i.status !== 'PAID').length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4 text-gray-500">No pending invoices</td></tr>
                      ) : vendorInvoices.filter(i => i.status !== 'PAID').slice(0, 6).map(inv => (
                        <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 px-3 font-medium text-gray-200">{inv.billNo || inv.invoiceNumber || inv.id}</td>
                          <td className="py-2 px-3 text-gray-400 truncate max-w-[100px]">{inv.customerName || inv.vendor?.name || inv.vendorName || '-'}</td>
                          <td className="py-2 px-3 text-gray-300">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td>
                          <td className="py-2 px-3 text-white font-semibold flex items-center gap-2">
                             ₹{(inv.items?.reduce((s, it) => s + (it.quantity * (it.price ?? it.unitPrice ?? 0)), 0) || inv.netPayable || inv.total || inv.amount || inv.totalAmount || 0).toLocaleString()}
                             {inv.status === 'OVERDUE' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="dashboard-glass-panel p-5">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-white">Purchase Overview</h3>
                   <div className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded">This Month v</div>
                 </div>
                 <div className="h-[140px] w-full pt-4">
                    <LineChart data={revData} color="#c084fc" height={100} />
                 </div>
                 <div className="flex justify-between text-[9px] text-gray-500 mt-2 px-2">
                   <span>01 May</span><span>06 May</span><span>11 May</span><span>16 May</span><span>21 May</span><span>25 May</span><span>31 May</span>
                 </div>
              </div>

               {/* Doughnut Chart */}
              <div className="dashboard-glass-panel p-5">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-white">Spend by Category</h3>
                   <button type="button" onClick={() => navigate('/dashboard/purchase/reports/po-reports')} className="text-[10px] text-purple-400 hover:text-purple-300">View Report →</button>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="relative w-[120px] h-[120px] rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#8b5cf6 0% 45%, #3b82f6 45% 70%, #06b6d4 70% 85%, #f97316 85% 95%, #ec4899 95% 100%)' }}>
                      <div className="absolute inset-[15px] bg-[#0b0716] rounded-full flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white leading-none mb-1">₹ {(totalPurchaseValue / 100000).toFixed(1)}L</span>
                        <span className="text-[9px] text-gray-400 leading-none">Total Spend</span>
                      </div>
                   </div>
                   <div className="flex-1 flex flex-col gap-2">
                      {specSegments.map((seg, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: seg.color }}></span>
                            {seg.label}
                          </span>
                          <span className="text-white font-bold">{seg.pct}</span>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className="dashboard-glass-panel p-5 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30">
               <h3 className="text-xl font-serif italic text-blue-200 mb-1 leading-tight">"Better Vendors.<br/>Stronger Supply Chain."</h3>
            </div>

            <div className="dashboard-glass-panel p-5 flex-1 overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                 <button type="button" onClick={() => navigate('/dashboard/notifications')} className="text-[10px] text-purple-400 hover:text-purple-300">View All →</button>
               </div>
               
               <div className="flex flex-col gap-5 overflow-y-auto max-h-[300px] custom-scrollbar">
                 {alerts.slice(0,5).map((a, i) => (
                   <div key={i} className="flex gap-3 items-start">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-${a.type === 'info' ? 'green' : a.type==='overdue' ? 'red' : 'blue'}-500/20`}>
                        {a.type === 'info' ? <CheckCircle size={14} className="text-green-400"/> : a.type==='overdue' ? <AlertCircle size={14} className="text-red-400"/> : <Bell size={14} className="text-blue-400"/>}
                     </div>
                     <div className="flex-1">
                       <p className="text-[11px] text-gray-200 leading-snug">{a.title}</p>
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-[9px] text-gray-500">by Admin</span>
                         <span className="text-[9px] text-gray-500">{a.time}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="dashboard-glass-panel p-5 flex-1 flex flex-col overflow-hidden max-h-[350px]">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-400"/> Low Stock Alerts
                 </h3>
                 <button type="button" onClick={() => navigate('/dashboard/stock/inventory/low-alerts')} className="text-[10px] text-yellow-400 hover:text-yellow-300">Restock →</button>
               </div>
               
               <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
                 {lowStockItems.length === 0 ? (
                   <div className="text-center py-6 text-gray-500 text-xs">Stock levels are healthy</div>
                 ) : lowStockItems.map((item, i) => (
                   <div key={i} className="flex flex-col gap-1 pb-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors p-2 rounded-lg">
                     <div className="flex justify-between">
                       <span className="text-[11px] font-semibold text-gray-200">{item.itemName || item.name}</span>
                       <span className="text-[11px] font-bold text-red-400">{item.currentStock || item.stock || 0} left</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-[9px] text-gray-500">Min level: {item.minimumStock || item.reorderLevel || 0}</span>
                       <span className="text-[9px] text-yellow-500/80 uppercase tracking-wider font-bold">Action Req</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Quick Actions Bar */}
        <div className="mt-8 mx-auto w-full max-w-[95%] dashboard-glass-panel px-4 py-3 flex items-center justify-between gap-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <div className="text-sm font-bold text-white px-4">Quick Actions</div>
          
          <div className="flex items-center gap-2 border-l border-white/10 pl-6">
             <button onClick={() => navigate('/dashboard/vendor/vendors/add')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-gray-300">
               <Users size={14} className="text-cyan-400" /> Add Vendor
             </button>
             <button onClick={() => navigate('/dashboard/purchase/purchase-orders/create-po')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-gray-300">
               <ShoppingCart size={14} className="text-purple-400" /> New Purchase Order
             </button>
             <button onClick={() => navigate('/dashboard/purchase/requisitions/new-requisition')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-gray-300">
               <FileText size={14} className="text-blue-400" /> Add Requisition
             </button>
             <button onClick={() => navigate('/dashboard/vendor/invoices/generate')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-gray-300">
               <DollarSign size={14} className="text-orange-400" /> Create Invoice
             </button>
             <button onClick={() => navigate('/dashboard/vendor/reports')} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-semibold text-gray-300">
               <BarChart2 size={14} className="text-pink-400" /> View Reports
             </button>
          </div>

          <button onClick={() => navigate('/dashboard/purchase/purchase-orders')} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-all">
            <Rocket size={14} /> Grow Your Business →
          </button>
        </div>

      </div>
    );
}
