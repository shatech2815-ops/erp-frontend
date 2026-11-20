import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, BarChart2, ArrowLeftRight, Sliders } from 'lucide-react';

const INVENTORY_SECTIONS = [
  {
    label: '🔥 HOW TO TEST FLOW',
    desc: 'Step by step testing guide for the entire Inventory module',
    icon: BarChart2,
    route: '/dashboard/stock/inventory/testing-flow',
    color: '#ffb703',
    bg: 'rgba(255,183,3,0.15)',
  },
  {
    label: 'Stock Levels',
    desc: 'View and manage current stock quantities per warehouse',
    icon: BarChart2,
    route: '/dashboard/stock/inventory/stock-levels',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
  {
    label: 'Item Catalog',
    desc: 'Manage items, categories, units and pricing',
    icon: Package,
    route: '/dashboard/stock/inventory/item-catalog',
    color: '#059669',
    bg: 'rgba(16,185,129,0.15)',
  },
  {
    label: 'Stock Adjustment',
    desc: 'Record stock-in, stock-out and adjustments',
    icon: Sliders,
    route: '/dashboard/stock/inventory/stock-adjustment',
    color: '#d97706',
    bg: 'rgba(245,158,11,0.15)',
  },
  {
    label: 'Stock Movement Ledger',
    desc: 'Audit trail of every stock change',
    icon: BarChart2,
    route: '/dashboard/stock/inventory/movements',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
  },
  {
    label: 'Stock Receipt (IN)',
    desc: 'Process incoming stock from vendors',
    icon: ArrowLeftRight,
    route: '/dashboard/stock/inventory/receipt',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.15)',
  },
  {
    label: 'Quality Inspection',
    desc: 'Perform QC checks on goods received',
    icon: Sliders,
    route: '/dashboard/stock/inventory/quality',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
  },
  {
    label: 'Sales Pick List',
    desc: 'Reserve and pack stock for sales orders',
    icon: Package,
    route: '/dashboard/stock/inventory/picklist',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
  },
  {
    label: 'Stock Issue (OUT)',
    desc: 'Consume stock from warehouse',
    icon: ArrowLeftRight,
    route: '/dashboard/stock/inventory/issue',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
  },
  {
    label: 'Stock Transfer',
    desc: 'Transfer stock between warehouses',
    icon: ArrowLeftRight,
    route: '/dashboard/stock/inventory/transfer',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.15)',
  },
  {
    label: 'Stock Returns',
    desc: 'Process Customer or Vendor Returns',
    icon: ArrowLeftRight,
    route: '/dashboard/stock/inventory/returns',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.15)',
  },
  {
    label: 'Physical Stock Count',
    desc: 'Record physical inventory count and post variances',
    icon: BarChart2,
    route: '/dashboard/stock/inventory/count',
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.15)',
  },
  {
    label: 'Low Stock Alerts',
    desc: 'View items below reorder level',
    icon: BarChart2,
    route: '/dashboard/stock/inventory/low-alerts',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.15)',
  },
];

export default function Inventory() {
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
            <Package size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Inventory</h1>
            <p className="text-xs text-gray-400 mt-0.5">Stock levels, adjustments and transfers</p>
          </div>
        </div>
      </div>

      {/* ✅ Changed: grid replaced with flex-col for list layout */}
      <div className="flex flex-col gap-4">
        {INVENTORY_SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(sec.route)}
              className="relative flex items-center gap-4 bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group text-left overflow-hidden"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                style={{ background: sec.bg }}
              >
                <Icon size={24} style={{ color: sec.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">{sec.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{sec.desc}</p>
              </div>
              <span className="text-2xl font-black opacity-10 absolute right-4 top-1/2 -translate-y-1/2" style={{ color: sec.color }}>
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}