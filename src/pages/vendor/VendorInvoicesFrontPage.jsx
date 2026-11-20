import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, List, Zap, Clock, Truck, ClipboardList, TrendingDown, TrendingUp } from 'lucide-react';

const SECTIONS = [
  {
    label: 'Invoice List',
    desc: 'View all vendor billing and invoice records',
    icon: List,
    route: '/dashboard/vendor/invoices/list',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
  {
    label: 'Generate Invoice',
    desc: 'Create a new invoice, challan, quotation or note',
    icon: Zap,
    route: '/dashboard/vendor/invoices/generate',
    color: '#059669',
    bg: 'rgba(16,185,129,0.15)',
  },
  {
    label: 'Payment History',
    desc: 'Track past payments made to vendors',
    icon: Clock,
    route: '/dashboard/vendor/invoices/payments',
    color: '#d97706',
    bg: 'rgba(245,158,11,0.15)',
  },
];

const DOC_SECTIONS = [
  {
    label: 'Delivery Challan List',
    desc: 'View all delivery challans issued to recipients',
    icon: Truck,
    route: '/dashboard/vendor/invoices/challans',
    color: '#1a6b3a',
    bg: 'rgba(34,197,94,0.15)',
  },
  {
    label: 'Quotation List',
    desc: 'View all quotations sent to customers',
    icon: ClipboardList,
    route: '/dashboard/vendor/invoices/quotations',
    color: '#b45309',
    bg: '#fef9c3',
  },
  {
    label: 'Credit Note List',
    desc: 'View all credit notes issued to buyers',
    icon: TrendingDown,
    route: '/dashboard/vendor/invoices/credit-notes',
    color: '#6ee7b7',
    bg: 'rgba(16,185,129,0.15)',
  },
  {
    label: 'Debit Note List',
    desc: 'View all debit notes issued to buyers',
    icon: TrendingUp,
    route: '/dashboard/vendor/invoices/debit-notes',
    color: '#fb7185',
    bg: '#ffe4e6',
  },
];

export default function VendorInvoicesFrontPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d97706] to-[#fbbf24] flex items-center justify-center">
            <CreditCard size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Invoices</h1>
            <p className="text-xs text-gray-400 mt-0.5">Billing, payments and history</p>
          </div>
        </div>
      </div>

      {/* Primary sections */}
      <div className="flex flex-col gap-4 mb-6">
        {SECTIONS.map((sec, idx) => {
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

      {/* Document lists section */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Document Lists</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOC_SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(sec.route)}
              className="relative flex items-center gap-4 bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group text-left overflow-hidden"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                style={{ background: sec.bg }}
              >
                <Icon size={20} style={{ color: sec.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">{sec.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{sec.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}