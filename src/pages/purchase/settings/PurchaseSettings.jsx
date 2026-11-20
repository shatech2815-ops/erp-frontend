// PurchaseSettings.jsx — Purchase Management > Settings (index)
// Matches the exact SectionItems list-row pattern used in Purchase Orders, Vendors, etc.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Shield, FileText, Tag } from 'lucide-react';

const ITEMS = [
  { label: 'Approval Matrix',    icon: Shield,   color: '#7c3aed', bg: 'rgba(139,92,246,0.12)', route: '/dashboard/purchase/settings/approval-matrix' },
  { label: 'PO Templates',       icon: FileText,  color: '#6366f1', bg: 'rgba(139,92,246,0.12)', route: '/dashboard/purchase/settings/po-templates' },
  { label: 'Vendor Categories',  icon: Tag,       color: '#10b981', bg: 'rgba(16,185,129,0.15)', route: '/dashboard/purchase/settings/vendor-categories' },
];

const PurchaseSettings = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Breadcrumb — same as SectionItems */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Settings</span>
      </div>

      {/* Header — exact same as SectionItems */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <Shield size={22} style={{ color: '#8b5cf6' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <p className="text-sm text-gray-400">Configure purchase preferences</p>
        </div>
      </div>

      {/* Items list — exact same as SectionItems list rows */}
      <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)] bg-[#140f2d]/80">
        {ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button key={idx} onClick={() => navigate(item.route)}
              className="flex items-center gap-4 w-full text-left px-5 py-4 hover:bg-white/10 transition-all duration-150 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.12)' }}>
                <span className="text-xs font-bold text-purple-300">{idx + 1}</span>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                <Icon size={18} style={{ color: item.color }} />
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

export default PurchaseSettings;
