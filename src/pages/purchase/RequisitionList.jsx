import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Eye, ClipboardList,
  ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle,
  TrendingUp, Package, Calendar, FileText
} from 'lucide-react';
import { getAllRequisitions } from "../../services/purchase/requisition.services";

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6', icon: FileText },
  SUBMITTED: { label: 'Submitted', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: Clock },
  PENDING_APPROVAL: { label: 'Pending Approval', color: '#d97706', bg: 'rgba(245,158,11,0.15)', icon: Clock },
  APPROVED: { label: 'Approved', color: '#059669', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(239,68,68,0.15)', icon: XCircle },
  RETURNED_FOR_REVISION: { label: 'Returned', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', icon: AlertTriangle },
  CONVERTED_TO_PO: { label: 'Converted to PO', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: XCircle },
  CLOSED: { label: 'Closed', color: '#4b5563', bg: '#e5e7eb', icon: CheckCircle },
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: '#6b7280', bg: '#f3f4f6' },
  MEDIUM: { label: 'Medium', color: '#2563eb', bg: 'rgba(59,130,246,0.15)' },
  HIGH: { label: 'High', color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
};

const StatusBadge = ({ status }) => {
  // Normalize string for safety, defaults to Pending Approval
  const key = (status || '').toUpperCase().replace(/ /g, '_');
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.PENDING_APPROVAL;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

const RequisitionList = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const data = await getAllRequisitions();
      setRequisitions(data || []);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
    }
  };

  const filtered = requisitions.filter((r) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      !search ||
      r.itemName?.toLowerCase().includes(searchText) ||
      r.requestedBy?.toLowerCase().includes(searchText) ||
      r.requisitionNumber?.toLowerCase().includes(searchText) ||
      r.department?.toLowerCase().includes(searchText);

    const matchStatus = !statusFilter || (r.status || 'PENDING').toUpperCase() === statusFilter;
    const matchPriority = !priorityFilter || r.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: requisitions.length,
    pending: requisitions.filter(r => (r.status || 'PENDING').includes('PENDING')).length,
    approved: requisitions.filter(r => r.status === 'APPROVED').length,
    high: requisitions.filter(r => r.priority === 'HIGH').length,
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/requisitions')} className="hover:text-purple-300 transition-colors">Requisitions</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Requisition List</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/requisitions')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <ClipboardList size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Requisition List</h2>
          <p className="text-sm text-gray-400">Track and manage purchase requisitions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: ClipboardList, color: '#7c3aed', bg: 'rgba(139,92,246,0.12)' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#059669', bg: 'rgba(16,185,129,0.15)' },
          { label: 'High Priority', value: stats.high, icon: AlertTriangle, color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search item, requester, req no..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400 flex-shrink-0" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 text-white">
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(k => <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 text-white">
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))' }}>
                {['Req No', 'Item', 'Qty', 'Requested By', 'Department', 'Req Date', 'Status', 'Priority', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ClipboardList size={36} className="opacity-30" />
                      <p className="font-medium">No requisitions found</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors group text-white">
                  <td className="px-4 py-3">
                    <span className="font-bold text-[#7c3aed] text-xs">{r.requisitionNumber || '-'}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{r.itemName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-bold">
                      <Package size={12} className="text-gray-400" /> {r.quantity} {r.uom}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.requestedBy}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{r.department}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {r.requestDate}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => navigate('/dashboard/purchase/create-rfq', { state: { requisition: r } })}
                        title="Create RFQ from this Requisition"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors whitespace-nowrap"
                      >
                        <FileText size={12} />
                        Create RFQ
                      </button>
                      <button onClick={() => setViewItem(r)}
                        title="View Details"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {requisitions.length} requisitions</p>
        </div>
      </div>

      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
          <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">{viewItem.itemName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{viewItem.requisitionNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={viewItem.status} />
                <button onClick={() => setViewItem(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10">✕</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Item Code', viewItem.itemCode || '-'],
                ['UOM', viewItem.uom],
                ['Quantity', viewItem.quantity],
                ['Requested By', viewItem.requestedBy],
                ['Department', viewItem.department],
                ['Cost Center', viewItem.costCenter || '-'],
                ['Priority', viewItem.priority],
                ['Request Date', viewItem.requestDate],
                ['Required Date', viewItem.requiredDate],
                ['Estimated Unit Price', viewItem.estimatedUnitPrice],
                ['Estimated Total', viewItem.estimatedTotal],
                ['Preferred Vendor', viewItem.preferredVendor || '-'],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-white text-xs">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-gray-400 mb-0.5">Business Justification</p>
              <p className="text-sm text-white">{viewItem.businessJustification || '-'}</p>
            </div>
            {viewItem.remarks && (
              <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-xs text-gray-400 mb-0.5">Remarks</p>
                <p className="text-sm text-white">{viewItem.remarks}</p>
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button 
                onClick={() => setViewItem(null)} 
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/5 border border-white/10"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const targetReq = viewItem;
                  setViewItem(null);
                  navigate('/dashboard/purchase/create-rfq', { state: { requisition: targetReq } });
                }} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-md"
              >
                <FileText size={14} />
                Proceed to Create RFQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionList;