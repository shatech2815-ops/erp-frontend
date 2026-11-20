
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, List, PlusCircle, Tag, BookOpen, FileText } from 'lucide-react';

const SECTIONS = [
  { label: 'Vendor List',              desc: 'View all registered vendor profiles',          icon: List,       route: '/dashboard/vendor/vendors/list',                color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { label: 'Add New Vendor',           desc: 'Register a new vendor in the system',          icon: PlusCircle, route: '/dashboard/vendor/vendors/add',                color: '#059669', bg: 'rgba(16,185,129,0.15)' },
  { label: 'Vendor Categories',        desc: 'Organise vendors into groups and categories',  icon: Tag,        route: '/dashboard/vendor/vendors/categories',         color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
  // { label: 'Account Vendor List',      desc: 'View vendors linked to accounts payable',      icon: BookOpen,   route: '/dashboard/accounts/vendors/list',             color: '#7c3aed', bg: 'rgba(139,92,246,0.12)' },
  { label: 'Account Vendor Invoice List', desc: 'View and reconcile invoices from account vendors', icon: FileText, route: '/dashboard/accounts/vendors/invoices',  color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
];

export default function VendorsFrontPage() {
  const navigate = useNavigate();
  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center">
            <Users size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Vendors</h1>
            <p className="text-xs text-gray-400 mt-0.5">All registered vendor profiles</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <button key={idx} onClick={() => navigate(sec.route)}
              className="relative flex items-center gap-4 bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group text-left overflow-hidden">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110" style={{ background: sec.bg }}>
                <Icon size={24} style={{ color: sec.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">{sec.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{sec.desc}</p>
              </div>
              <span className="text-2xl font-black opacity-10 absolute right-4 top-1/2 -translate-y-1/2" style={{ color: sec.color }}>{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}