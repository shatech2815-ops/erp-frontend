import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Ruler, SlidersHorizontal, QrCode } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    label: 'UOM Management',
    desc:  'Create and manage Units of Measurement (Kg, Liter, Piece…)',
    icon:  Ruler,
    route: '/dashboard/stock/settings/uom',
    color: '#8b5cf6',
    bg:    'rgba(139,92,246,0.12)',
  },
  {
    label: 'Inventory Settings',
    desc:  'Batch tracking, expiry, valuation method and reorder rules',
    icon:  SlidersHorizontal,
    route: '/dashboard/stock/settings/inventory-settings',
    color: '#059669',
    bg:    'rgba(16,185,129,0.15)',
  },
  {
    label: 'Barcode Settings',
    desc:  'Barcode format, prefix and print configuration (coming soon)',
    icon:  QrCode,
    route: null,
    color: '#d97706',
    bg:    'rgba(245,158,11,0.15)',
    disabled: true,
  },
];

export default function StockSettingsPage() {
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
            <Settings size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Settings</h1>
            <p className="text-xs text-gray-400 mt-0.5">UOM, barcodes and inventory configuration</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {SETTINGS_SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <button
              key={idx}
              onClick={() => !sec.disabled && sec.route && navigate(sec.route)}
              disabled={sec.disabled}
              className={`relative flex items-center gap-4 bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 text-left overflow-hidden transition-all duration-200
                ${sec.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1 group cursor-pointer'}`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${!sec.disabled ? 'group-hover:scale-110' : ''}`}
                style={{ background: sec.bg }}
              >
                <Icon size={24} style={{ color: sec.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-white text-base transition-colors ${!sec.disabled ? 'group-hover:text-purple-300' : ''}`}>{sec.label}</p>
                  {sec.disabled && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-gray-400">Coming Soon</span>
                  )}
                </div>
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
