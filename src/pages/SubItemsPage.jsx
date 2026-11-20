
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft,
  ShoppingCart, Users, Package, ClipboardList, BarChart2, Settings,
  Tag, FileText, CreditCard, Activity, Building2, Warehouse,
  Wrench, Briefcase, Zap, DollarSign, TrendingUp, ChevronRight,
  Truck, Scale,
} from 'lucide-react';

// ── Section icons ─────────────────────────────────────────────────────────────
const SECTION_ICONS = {
  'purchase-orders': ShoppingCart,
  vendors:           Users,
  inventory:         Package,
  requisitions:      ClipboardList,
  rfqs:              FileText,
  quotations:        Scale,
  grn:               Truck,
  reports:           BarChart2,
  settings:          Settings,
  contracts:         FileText,
  invoices:          CreditCard,
  performance:       Activity,
  clients:           Building2,
  leads:             TrendingUp,
  opportunities:     Briefcase,
  orders:            ShoppingCart,
  service:           Wrench,
  financials:        DollarSign,
  payments:          CreditCard,
  expenses:          Tag,
  stock:             Warehouse,
  items:             Package,
  warehouse:         Warehouse,
  production:        Zap,
  'cost-centers':    Building2,
  budgets:           TrendingUp,
  'fixed-assets':    Briefcase,
  'employee-advances': Users,
};

// ── Per-module colour palettes ────────────────────────────────────────────────
const MODULE_META = {
  purchase:      { gradient: 'from-violet-500 to-purple-600',  light: 'rgba(139,92,246,0.12)', accent: '#7c3aed', text: '#5b21b6' },
  vendor:        { gradient: 'from-purple-500 to-purple-400',    light: 'rgba(139,92,246,0.12)', accent: '#8b5cf6', text: '#ffffff' },
  client:        { gradient: 'from-emerald-500 to-teal-500',   light: 'rgba(16,185,129,0.15)', accent: '#059669', text: '#6ee7b7' },
  accounts:      { gradient: 'from-amber-400 to-orange-500',   light: 'rgba(245,158,11,0.15)', accent: '#d97706', text: '#92400e' },
  stock:         { gradient: 'from-red-500 to-rose-600',       light: 'rgba(239,68,68,0.15)', accent: '#dc2626', text: '#991b1b' },
  inventorymgmt: { gradient: 'from-pink-500 to-fuchsia-600',   light: '#fce7f3', accent: '#db2777', text: '#9d174d' },
};

// ── Section colour palettes (cycling) ─────────────────────────────────────────
const CARD_PALETTES = [
  { bg: 'rgba(139,92,246,0.12)', icon: '#8b5cf6', border: '#4F46E520' },
  { bg: 'rgba(16,185,129,0.15)', icon: '#059669', border: '#05966920' },
  { bg: 'rgba(245,158,11,0.15)', icon: '#d97706', border: '#d9770620' },
  { bg: 'rgba(139,92,246,0.12)', icon: '#7c3aed', border: '#7c3aed20' },
  { bg: 'rgba(239,68,68,0.15)', icon: '#dc2626', border: '#dc262620' },
  { bg: '#fce7f3', icon: '#db2777', border: '#db277720' },
];

// ── CROSS-MODULE ROUTE OVERRIDES ──────────────────────────────────────────────
// When a sub-item in one module should navigate to another module's page,
// define the override here. Key = item label (exact match).
const ROUTE_OVERRIDES = {
};

const allModules = {
  purchase: {
    label: 'Purchase Management',
    subtitle: 'Manage purchase orders, vendors & inventory',
    sections: [
      { id: 'purchase-orders', label: 'Purchase Orders', desc: 'Create and track purchase orders',        items: [{ label: 'PO List', route: '/dashboard/purchase/purchase-orders/po-list' },{ label: 'Create PO', route: '/dashboard/purchase/purchase-orders/create-po' },{ label: 'PO Status Tracker', route: '/dashboard/purchase/purchase-orders/po-status-tracker' },{ label: 'Create Supplier PO', route: '/dashboard/purchase/purchase-orders/create-supplier-po' },{ label: 'Supplier PO List', route: '/dashboard/purchase/purchase-orders/supplier-po-list' }] },
      { id: 'vendors',         label: 'Vendors',         desc: 'Manage supplier relationships',           items: [{ label: 'Vendor List', route: '/dashboard/purchase/vendors/list' },{ label: 'Vendor Performance', route: '/dashboard/vendor/performance' },{ label: 'Add New Vendor', route: '/dashboard/purchase/vendors/add' }] },
      {
        id: 'inventory', label: 'Inventory', desc: 'Track stock levels and items',
        items: [
          { label: 'Item Catalog',   route: '/dashboard/purchase/inventory/item-catalog' },
          { label: 'Stock Levels',   route: '/dashboard/purchase/inventory/stock-levels' }, 
          { label: 'Item Requests',  route: '/dashboard/purchase/inventory/item-requests' },
        ],
      },
      { id: 'requisitions',    label: 'Requisitions',    desc: 'Requisition approvals and workflows',     items: [{ label: 'Requisition List', route: '/dashboard/purchase/requisitions/req-list' },{ label: 'New Requisition', route: '/dashboard/purchase/requisitions/new-requisition' },{ label: 'Approval Workflow', route: '/dashboard/purchase/requisitions/approval-workflow' }] },
      { id: 'rfqs',            label: 'RFQs & Quotes',   desc: 'Request for Quotations and Vendor Bids',  items: [{ label: 'RFQ List', route: '/dashboard/purchase/rfqs/rfq-list' },{ label: 'Create RFQ', route: '/dashboard/purchase/create-rfq' }] },
      { id: 'quotations',      label: 'Quotations',      desc: 'Vendor Quotations and Comparison',        items: [{ label: 'Quotation Comparison', route: '/dashboard/purchase/quotations/comparison' }] },
      { id: 'grn',             label: 'Goods Receipt',   desc: 'GRN and Quality Inspection',              items: [{ label: 'GRN List', route: '/dashboard/purchase/grn-list' },{ label: 'Create GRN', route: '/dashboard/purchase/create-grn' }] },
      { id: 'reports',         label: 'Reports',         desc: 'Analytics and performance reports',       route: '/dashboard/purchase/reports', items: [{ label: 'PO Reports', route: '/dashboard/purchase/reports/po-reports' },{ label: 'Vendor Performance Report', route: '/dashboard/purchase/reports/vendor-performance' },{ label: 'Inventory Report', route: '/dashboard/purchase/reports/inventory-report' }] },
      { id: 'settings',        label: 'Settings',        desc: 'Configure purchase preferences',          items: [{ label: 'Approval Matrix', route: '/dashboard/purchase/settings/approval-matrix' },{ label: 'PO Templates', route: '/dashboard/purchase/settings/po-templates' },{ label: 'Vendor Categories', route: '/dashboard/purchase/settings/vendor-categories' }] },
    ],
  },
  vendor: {
    label: 'Vendor Management',
    subtitle: 'Contracts, invoices and vendor performance',
    sections: [
      { id: 'vendors',    label: 'Vendors',    desc: 'All registered vendor profiles',       items: [{ label: 'Vendor List', route: '/dashboard/vendor/vendors/list' },{ label: 'Add New Vendor', route: '/dashboard/vendor/vendors/add' },{ label: 'Vendor Categories', route: '/dashboard/vendor/vendors/categories' }, { label: 'Account Vendor List', route: '/dashboard/accounts/vendors/list' },{ label: 'Account Vendor Invoice List', route: '/dashboard/accounts/vendors/invoices' }] },
      { id: 'contracts',  label: 'Contracts',  desc: 'Contracts, templates and renewals',    items: [{ label: 'Contract List', route: '/dashboard/vendor/contracts/list' },{ label: 'Add New Contract', route: '/dashboard/vendor/contracts/add' },{ label: 'Contract Templates', route: '/dashboard/vendor/contracts/templates' }] },
      { id: 'invoices',   label: 'Invoices',   desc: 'Billing, payments and history',        items: [{ label: 'Invoice List', route: '/dashboard/vendor/invoices/list' },{ label: 'Generate Invoice', route: '/dashboard/vendor/invoices/generate' },{ label: 'Payment History', route: '/dashboard/vendor/invoices/payments' }] },
      { id: 'performance',label: 'Performance',desc: 'Scorecards, SLAs and analytics',       route: '/dashboard/vendor/performance', items: [{ label: 'Vendor Scorecard', route: '/dashboard/vendor/performance/vendor-scorecard' },{ label: 'Performance Reports', route: '/dashboard/vendor/performance/performance-reports' },{ label: 'SLA Tracking', route: '/dashboard/vendor/performance/sla-tracking' }] },
      { id: 'reports',    label: 'Reports',    desc: 'Vendor and contract analytics',        route: '/dashboard/vendor/reports',     items: [{ label: 'Vendor Performance Report', route: '/dashboard/vendor/reports/vendor-performance' },{ label: 'Contract Expiry Report', route: '/dashboard/vendor/reports/contract-expiry' },{ label: 'Invoice Payment Report', route: '/dashboard/vendor/reports/invoice-payment' }] },
      { id: 'settings',   label: 'Settings',   desc: 'Vendor types, terms and preferences',  route: '/dashboard/vendor/settings',    items: [{ label: 'Vendor Types', route: '/dashboard/vendor/settings/vendor-types' },{ label: 'Contract Terms', route: '/dashboard/vendor/settings/contract-terms' },{ label: 'Payment Terms', route: '/dashboard/vendor/settings/payment-terms' }] },
    ],
  },
  client: {
    label: 'Client Management',
    subtitle: 'Leads, orders, service and client relations',
    sections: [
      { id: 'clients',      label: 'Clients',       desc: 'Client profiles and categories',        items: [{ label: 'Client List', route: '/dashboard/client/clients/list' },{ label: 'Add New Client', route: '/dashboard/client/clients/add' },{ label: 'Client Categories', route: '/dashboard/client/clients/categories' },{ label: 'Client Contacts', route: '/dashboard/client/clients/contacts' }] },
      { id: 'leads',        label: 'Leads',         desc: 'Track and convert incoming leads',      items: [{ label: 'Lead List',  route: '/dashboard/client/leads/list' },{ label: 'Add New Lead',  route: '/dashboard/client/leads/add' },{ label: 'Lead Sources',route: '/dashboard/client/leads/lead-sources' },{ label: 'Lead Conversion',    route: '/dashboard/client/leads/conversion' }] },
      { id: 'opportunities',label: 'Opportunities', desc: 'Sales pipeline and quotations',         items: [{ label: 'Opportunity List', route:'/dashboard/client/opportunities/list' },{ label: 'Add New Opportunity' , route:'/dashboard/client/opportunities/add'},{ label: 'Sales Pipeline', route:'/dashboard/client/opportunities/pipeline' },{ label: 'Quotation Management' ,route:'/dashboard/client/opportunities/quotations'}] },
      { id: 'orders',       label: 'Orders',        desc: 'Order status and delivery tracking',    items: [{ label: 'Order List', route:'/dashboard/client/orders/list' },{ label: 'Create Order' , route:'/dashboard/client/orders/add'},{ label: 'Order Status', route:'/dashboard/client/orders/status' },{ label: 'Delivery Schedule' ,route:'/dashboard/client/orders/delivery-schedule'}] },
      { id: 'service',      label: 'Service',       desc: 'Requests, complaints and warranty',     items: [{ label: 'Service Requests' , route:'/dashboard/client/service/add'},{ label: 'Service History', route:'/dashboard/client/service/history' },{ label: 'Warranty Management', route:'/dashboard/client/service/warranty' },{ label: 'Complaints',route:'/dashboard/client/service/complaints' }] },
      { id: 'reports',      label: 'Reports',       desc: 'Sales, client and order analytics',     items: [{ label: 'Client Report', route:'/dashboard/client/reports/client-report' },{ label: 'Sales Report', route:'/dashboard/client/reports/sales-report' },{ label: 'Order Report', route:'/dashboard/client/reports/order-report' },{ label: 'Client Feedback Report' }] },
    ],
  },
  accounts: {
    label: 'Accounts Management',
    subtitle: 'Financials, invoices, payments and GST',
    sections: [
      { id: 'financials',label: 'Financials', desc: 'Ledger, trial balance and reports',     items: [{ label: 'Dashboard', route: '/dashboard/accounts/financials/dashboard' },{ label: 'General Ledger', route: '/dashboard/accounts/financials/ledger' },{ label: 'Trial Balance', route: '/dashboard/accounts/financials/trial-balance' },{ label: 'Financial Reports', route: '/dashboard/accounts/financials/reports' },{ label: 'Manual Journal Entry', route: '/dashboard/accounts/journal-entries' }] },
      { id: 'invoices',  label: 'Invoices',   desc: 'Create, track and manage invoices',     items: [{ label: 'Invoice List', route: '/dashboard/accounts/invoices/list' },{ label: 'Create Invoice', route: '/dashboard/accounts/invoices/create' },{ label: 'Invoice Tracking', route: '/dashboard/accounts/invoices/tracking' },{ label: 'Payment Receipts', route: '/dashboard/accounts/invoices/receipts' }] },
      { id: 'payments',  label: 'Payments',   desc: 'Payments, modes and reconciliation',    items: [{ label: 'Payment List', route: '/dashboard/accounts/payments/list' },{ label: 'Make Payment', route: '/dashboard/accounts/payments/make' },{ label: 'Payment Modes', route: '/dashboard/accounts/payments/modes' },{ label: 'Bank Reconciliation', route: '/dashboard/accounts/payments/reconciliation' }] },
      { id: 'expenses',  label: 'Expenses',   desc: 'Expense tracking and categories',       items: [{ label: 'Expense List', route: '/dashboard/accounts/expenses/list' },{ label: 'Add Expense', route: '/dashboard/accounts/expenses/add' },{ label: 'Expense Categories', route: '/dashboard/accounts/expenses/categories' },{ label: 'Expense Reports', route: '/dashboard/accounts/expenses/reports' }] },
      { id: 'vendors',   label: 'Vendors',    desc: 'Vendor payments and invoices',          items: [{ label: 'Vendor List', route: '/dashboard/accounts/vendors/list' },{ label: 'Vendor Payments', route: '/dashboard/accounts/vendors/payments' },{ label: 'Vendor Invoices', route: '/dashboard/accounts/vendors/invoices' }] },
      { id: 'cost-centers', label: 'Cost Centers', desc: 'Manage organizational cost centers', items: [{ label: 'Cost Centers', route: '/dashboard/accounts/cost-centers' }] },
      { id: 'budgets',      label: 'Budgets',      desc: 'Set budgets and track variance',     items: [{ label: 'Budgets', route: '/dashboard/accounts/budgets' }] },
      { id: 'fixed-assets', label: 'Fixed Assets', desc: 'Asset registry and depreciation',    items: [{ label: 'Asset Register', route: '/dashboard/accounts/fixed-assets' }] },
      { id: 'employee-advances', label: 'Advances', desc: 'Employee salary advances',          items: [{ label: 'Employee Advances', route: '/dashboard/accounts/employee-advances' }] },
      { id: 'reports',   label: 'Reports',    desc: 'P&L, balance sheet and GST reports',    route: '/dashboard/accounts/reports', items: [{ label: 'Profit & Loss Report', route: '/dashboard/accounts/reports/profit-loss' },{ label: 'Balance Sheet', route: '/dashboard/accounts/reports/balance-sheet' },{ label: 'Cash Flow Report', route: '/dashboard/accounts/reports/cash-flow' },{ label: 'GST Reports', route: '/dashboard/accounts/reports/gst' }] },
    ],
  },
  stock: {
    label: 'Stock Management',
    subtitle: 'Inventory, warehouse and production control',
    sections: [
      { id: 'inventory', label: 'Inventory', desc: 'Stock levels, adjustments and transfers', route: '/dashboard/stock/inventory', items: [{ label: 'Stock Levels', route: '/dashboard/stock/inventory/stock-levels' }, { label: '🔥 HOW TO TEST FLOW', route: '/dashboard/stock/inventory/testing-flow' }, { label: 'Physical Stock Balances', route: '/dashboard/stock/inventory/balances' },{ label: 'Low Stock Alerts', route: '/dashboard/stock/inventory/low-alerts' },{ label: 'Stock Movement Ledger', route: '/dashboard/stock/inventory/movements' },{ label: 'Stock Receipt (IN)', route: '/dashboard/stock/inventory/receipt' },{ label: 'Quality Inspection', route: '/dashboard/stock/inventory/quality' },{ label: 'Sales Pick List', route: '/dashboard/stock/inventory/picklist' },{ label: 'Stock Issue (OUT)', route: '/dashboard/stock/inventory/issue' },{ label: 'Stock Transfer', route: '/dashboard/stock/inventory/transfer' },{ label: 'Stock Returns', route: '/dashboard/stock/inventory/returns' },{ label: 'Physical Stock Count', route: '/dashboard/stock/inventory/count' },{ label: 'Item Catalog', route: '/dashboard/stock/inventory/item-catalog' }] },
      { id: 'items',     label: 'Items',     desc: 'Item catalog and bill of materials',      items: [{ label: 'Item List', route: '/dashboard/stock/items/item-list' },{ label: 'Add New Item', route: '/dashboard/stock/items/add-new-item' },{ label: 'Item Categories', route: '/dashboard/stock/items/item-categories' },{ label: 'Bill of Materials (BOM)', route: '/dashboard/stock/items/bill-of-materials' }] },
      { id: 'warehouse', label: 'Warehouse', desc: 'Warehouse locations and mapping',         items: [{ label: 'Warehouse List', route: '/dashboard/stock/warehouse/warehouse-list' },{ label: 'Add New Warehouse', route: '/dashboard/stock/warehouse/add-warehouse' },{ label: 'Location Mapping', route: '/dashboard/stock/warehouse/location-mapping' }] },
      { id: 'production',label: 'Production',desc: 'Work orders and production scheduling',   items: [{ label: 'Bill of Materials (BOM)', route: '/dashboard/stock/items/bill-of-materials' },{ label: 'Production Planning', route: '/dashboard/stock/production/production-planning' },{ label: 'Work Orders', route: '/dashboard/stock/production/work-orders' },{ label: 'Production Scheduling', route: '/dashboard/stock/production/production-scheduling' }] },
      { id: 'reports',   label: 'Reports',   desc: 'Stock and inventory analytics',   route: '/dashboard/stock/reports',    items: [{ label: 'Stock Report', route: '/dashboard/stock/reports/stock-report' },{ label: 'Inventory Report', route: '/dashboard/stock/reports/inventory-report' },{ label: 'Stock Movement Report', route: '/dashboard/stock/reports/stock-movement-report' },{ label: 'Production Report', route: '/dashboard/stock/reports/production-report' }] },
      { id: 'settings',  label: 'Settings',  desc: 'UOM, barcodes and inventory config',  route: '/dashboard/stock/settings',   items: [{ label: 'UOM Management', route: '/dashboard/stock/settings/uom' },{ label: 'Inventory Settings', route: '/dashboard/stock/settings/inventory-settings' },{ label: 'Barcode Settings' }] },
    ],
  },
  inventorymgmt: {
    label: 'Inventory Management',
    subtitle: 'Advanced inventory, MRP and warehouse ops',
    sections: [
      { id: 'items',     label: 'Items',     desc: 'Item list, categories and BOM',       items: [{ label: 'Item List', route: '/dashboard/inventorymgmt/items/item-list' },{ label: 'Add New Item', route: '/dashboard/inventorymgmt/items/add-new-item' },{ label: 'Item Categories', route: '/dashboard/inventorymgmt/items/item-categories' },{ label: 'Bill of Materials (BOM)', route: '/dashboard/inventorymgmt/items/bill-of-materials' }] },
      { id: 'stock',     label: 'Stock',     desc: 'Stock levels, adjustments and alerts', items: [{ label: 'Stock Levels', route: '/dashboard/stock/inventory/stock-levels' },{ label: 'Stock Adjustment', route: '/dashboard/inventorymgmt/inventory/stock-adjustment' },{ label: 'Stock Transfer', route: '/dashboard/inventorymgmt/inventory/stock-transfer' },{ label: 'Stock Alerts', route: '/dashboard/inventorymgmt/inventory/stock-alerts' }] },
      { id: 'warehouse', label: 'Warehouse', desc: 'Warehouses, mapping and counts',       items: [{ label: 'Warehouse List', route: '/dashboard/inventorymgmt/warehouse/warehouse-list' },{ label: 'Add New Warehouse', route: '/dashboard/inventorymgmt/warehouse/add-warehouse' },{ label: 'Location Mapping', route: '/dashboard/inventorymgmt/warehouse/location-mapping' },{ label: 'Inventory Counts', route: '/dashboard/inventorymgmt/warehouse/inventory-counts' }] },
      { id: 'production',label: 'Production',desc: 'MRP, work orders and scheduling',      items: [{ label: 'Production Planning', route: '/dashboard/inventorymgmt/production/production-planning' },{ label: 'Work Orders', route: '/dashboard/inventorymgmt/production/work-orders' },{ label: 'Production Scheduling', route: '/dashboard/inventorymgmt/production/production-scheduling' },{ label: 'Material Requirements Planning (MRP)', route: '/dashboard/inventorymgmt/production/mrp' }] },
      { id: 'reports',   label: 'Reports',   desc: 'Valuation, accuracy and movement',     items: [{ label: 'Inventory Valuation Report', route: '/dashboard/inventorymgmt/reports/inventory-valuation' },{ label: 'Stock Movement Report', route: '/dashboard/inventorymgmt/reports/stock-movement-report' },{ label: 'Inventory Accuracy Report', route: '/dashboard/inventorymgmt/reports/inventory-accuracy' },{ label: 'Slow-Moving Items Report', route: '/dashboard/inventorymgmt/reports/slow-moving' }] },
    ],
  },
};

// ── Module Overview Cards ─────────────────────────────────────────────────────
const ModuleOverview = ({ mod, basePath, moduleKey }) => {
  const navigate = useNavigate();
  const meta = MODULE_META[moduleKey] || MODULE_META.vendor;

  return (
    <div>
      {/* Hero header */}
      <div className={`relative rounded-3xl bg-gradient-to-r ${meta.gradient} p-6 mb-6 overflow-hidden shadow-lg`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#140f2d]/80" />
          <div className="absolute -bottom-12 -left-6 w-56 h-56 rounded-full bg-[#140f2d]/80" />
        </div>
        <div className="relative">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Module</p>
          <h2 className="text-2xl font-extrabold text-white mb-1">{mod.label}</h2>
          <p className="text-white/75 text-sm">{mod.subtitle}</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              {mod.sections.length} sections
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              {mod.sections.reduce((a, s) => a + s.items.length, 0)} features
            </span>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mod.sections.map((sec, idx) => {
          const Icon = SECTION_ICONS[sec.id] || Package;
          const pal = CARD_PALETTES[idx % CARD_PALETTES.length];
          return (
            <button
              key={sec.id}
              onClick={() => navigate(sec.route || `${basePath}/${sec.id}`)}
              className="relative flex flex-col bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-250 group text-left overflow-hidden"
            >
              {/* Top gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, ${pal.icon}, ${pal.icon}88)` }} />

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-110"
                  style={{ background: pal.bg }}>
                  <Icon size={22} style={{ color: pal.icon }} />
                </div>
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <ArrowRight size={13} className="text-gray-400 group-hover:text-gray-200 transition-colors" />
                </div>
              </div>

              <h3 className="font-bold text-white text-base mb-1 group-hover:text-purple-300 transition-colors">{sec.label}</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">{sec.desc}</p>

              <div className="mt-auto flex items-center gap-1.5">
                {sec.items.slice(0, 3).map((item, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: pal.bg, color: pal.icon }}>
                    {item.label.split(' ')[0]}
                  </span>
                ))}
                {sec.items.length > 3 && (
                  <span className="text-xs text-gray-400">+{sec.items.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Sub-item list view ────────────────────────────────────────────────────────
const SectionItems = ({ section, mod, basePath, moduleKey }) => {
  const navigate = useNavigate();
  const meta = MODULE_META[moduleKey] || MODULE_META.vendor;
  const Icon = SECTION_ICONS[section.id] || Package;

  // Resolve the final route for an item — checks ROUTE_OVERRIDES first, then item.route
  const resolveRoute = (item) => {
    if (ROUTE_OVERRIDES[item.label]) return ROUTE_OVERRIDES[item.label];
    return item.route || null;
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate(basePath, { replace: true })} className="hover:text-purple-300 transition-colors">{mod.label}</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">{section.label}</span>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(basePath, { replace: true })}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: meta.light }}>
          <Icon size={22} style={{ color: meta.accent }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{section.label}</h2>
          <p className="text-sm text-gray-400">{section.desc}</p>
        </div>
      </div>

      {/* Items as list */}
      <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)] bg-[#140f2d]/80">
        {section.items.map((item, idx) => {
          const route = resolveRoute(item);
          return (
            <button
              key={idx}
              onClick={() => route && navigate(route)}
              className={`flex items-center gap-4 w-full text-left px-5 py-4 hover:bg-white/10 transition-all duration-150 group ${!route ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: meta.light }}>
                <span className="text-xs font-bold transition-colors" style={{ color: meta.accent }}>{idx + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">{item.label}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 group-hover:text-purple-300 flex-shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const SubItemsPage = ({ moduleKey }) => {
  const { sectionId: paramSectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const mod = allModules[moduleKey];
  if (!mod) return <div className="p-6 text-red-400">Module not found</div>;

  const basePath = `/dashboard/${moduleKey}`;

  const lastSegment = location.pathname.replace(basePath, '').replace(/^\//, '').split('/')[0];
  const sectionId = paramSectionId || (lastSegment && lastSegment !== moduleKey ? lastSegment : undefined);
  const section = mod.sections.find((s) => 
    s.id === sectionId || 
    (sectionId === 'goods-receipt' && s.id === 'grn') ||
    (sectionId === 'rfqs-quotes' && s.id === 'rfqs') ||
    (sectionId && s.id.replace(/-/g, '') === sectionId.replace(/-/g, ''))
  );

  if (!section) {
    return <ModuleOverview mod={mod} basePath={basePath} moduleKey={moduleKey} />;
  }

  return <SectionItems section={section} mod={mod} basePath={basePath} moduleKey={moduleKey} />;
};

export default SubItemsPage;