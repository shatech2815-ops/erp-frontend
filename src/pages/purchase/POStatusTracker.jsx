import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, ChevronRight, Search,
  CheckCircle, Clock, XCircle, FileText, TrendingUp,
  Calendar, User, MessageSquare, ChevronDown, ChevronUp, Filter
} from 'lucide-react';

import {
  getAllOrders,
  updateOrderStatus,
} from "../../services/purchase/purchaseOrder.services";

const STATUS_FLOW = ['CREATED', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG = {
  CREATED:   { label: 'Created',   color: '#6366f1', bg: 'rgba(139,92,246,0.12)',  icon: FileText,    step: 0 },
  APPROVED:  { label: 'Approved',  color: '#059669', bg: 'rgba(16,185,129,0.15)',  icon: CheckCircle, step: 1 },
  SHIPPED:   { label: 'Shipped',   color: '#2563eb', bg: 'rgba(59,130,246,0.15)',  icon: FileText,    step: 2 },
  DELIVERED: { label: 'Delivered', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: CheckCircle, step: 3 },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(239,68,68,0.15)',  icon: XCircle,     step: 4 },
};

// const DEMO_POS = [
//   { id: 'PO-2025-001', supplier: 'Ravi Traders',     status: 'DELIVERED', net: 90650,  orderDate: '2025-01-10' },
//   { id: 'PO-2025-002', supplier: 'Sri Ganesh Stores', status: 'APPROVED',  net: 48550,  orderDate: '2025-02-05' },
//   { id: 'PO-2025-003', supplier: 'Murugan Supplies',  status: 'SHIPPED',   net: 13080,  orderDate: '2025-02-18' },
//   { id: 'PO-2025-004', supplier: 'Chennai Hardware',  status: 'DELIVERED', net: 72030,  orderDate: '2025-03-01' },
//   { id: 'PO-2025-005', supplier: 'Vijay Enterprises', status: 'CREATED',   net: 24870,  orderDate: '2025-03-10' },
//   { id: 'PO-2025-006', supplier: 'Kumar & Sons',      status: 'REJECTED',  net: 36560,  orderDate: '2025-03-15' },
// ];

// Generate timeline events from status
const getTimeline = (po) => {
  const cfg = STATUS_CONFIG[po.status];
  const step = cfg?.step ?? 0;
  const events = [];
  const date = new Date(po.orderDate);

  events.push({ status: 'CREATED', label: 'Order Created', date: po.orderDate, by: 'System', note: `PO ${po.id} raised for ${po.supplier}` });

  if (po.status === 'REJECTED') {
    const d2 = new Date(date); d2.setDate(d2.getDate() + 2);
    events.push({ status: 'REJECTED', label: 'Order Rejected', date: d2.toISOString().split('T')[0], by: 'Manager', note: 'Does not meet approval criteria' });
    return events;
  }
  if (step >= 1) {
    const d2 = new Date(date); d2.setDate(d2.getDate() + 1);
    events.push({ status: 'SHIPPED', label: 'Sent for Approval', date: d2.toISOString().split('T')[0], by: 'Purchase Dept', note: 'Submitted to approval queue' });
  }
  if (step >= 2) {
    const d3 = new Date(date); d3.setDate(d3.getDate() + 3);
    events.push({ status: 'APPROVED', label: 'Order Approved', date: d3.toISOString().split('T')[0], by: 'Manager', note: 'Approved and dispatched to supplier' });
  }
  if (step >= 3) {
    const d4 = new Date(date); d4.setDate(d4.getDate() + 10);
    events.push({ status: 'DELIVERED', label: 'Order Completed', date: d4.toISOString().split('T')[0], by: 'Warehouse', note: 'Goods received and verified' });
  }
  return events;
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />{cfg.label}
    </span>
  );
};

// Progress stepper for non-rejected
const StatusStepper = ({ status }) => {
  if (status === 'REJECTED') return null;
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  return (
    <div className="flex items-center gap-0 mt-4 mb-2">
      {STATUS_FLOW.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const Icon = cfg.icon;
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'border-transparent' : 'border-white/10 bg-white/5'
              }`} style={done ? { background: cfg.bg, borderColor: cfg.color + '40' } : {}}>
                <Icon size={14} style={{ color: done ? cfg.color : '#d1d5db' }} />
              </div>
              <p className={`text-[9px] mt-1 font-semibold ${active ? 'text-white' : done ? 'text-purple-300' : 'text-gray-300'}`}>
                {cfg.label}
              </p>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className="flex-1 h-0.5 mt-[-12px] mx-1" style={{ background: i < currentStep ? '#8b5cf6' : '#e5e7eb' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const POStatusTracker = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expanded, setExpanded] = useState(null);
  const [updateForm, setUpdateForm] = useState({ id: '', status: '', paymentStatus: '', updatedBy: '', remarks: '' });
  const [updateMsg, setUpdateMsg] = useState('');

  // useEffect(() => {
  //   const stored = localStorage.getItem('mveng_pos');
  //   setPos(stored ? JSON.parse(stored) : DEMO_POS);
  // }, []);

  useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  try {
    const response = await getAllOrders();

    const orders = Array.isArray(response)
      ? response
      : response?.data || [];

    const formatted = orders.map((order) => ({
      id: order.orderNumber || order.id,
      supplier:
        order.supplier?.name ||
        order.supplierName ||
        order.vendorName ||
        "—",
      status: order.status || "CREATED",
      net: Number(order.totalAmount || order.grandTotal || 0),
      orderDate: order.orderDate || order.createdAt?.split("T")[0],
      rawId: order.id,
      paymentStatus: order.paymentStatus || "Pending",
    }));

    setPos(formatted);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    setPos([]);
  }
};

  const filtered = pos.filter(po => {
  // const matchSearch = po.id.toLowerCase().includes(search.toLowerCase()) ||
  //   po.supplier.toLowerCase().includes(search.toLowerCase());

  const matchSearch =
  po.id?.toString().toLowerCase().includes(search.toLowerCase()) ||
  po.supplier?.toLowerCase().includes(search.toLowerCase());
  const matchStatus = filterStatus === 'ALL' || po.status === filterStatus;
  return matchSearch && matchStatus;
});

  // const handleUpdate = () => {
  //   if (!updateForm.id || !updateForm.status || !updateForm.updatedBy) {
  //     setUpdateMsg('Please fill PO ID, Status and Updated By.');
  //     return;
  //   }
  //   const updated = pos.map(p => p.id === updateForm.id ? { ...p, status: updateForm.status, paymentStatus: updateForm.paymentStatus || p.paymentStatus } : p);
  //   setPos(updated);
  //   localStorage.setItem('mveng_pos', JSON.stringify(updated));
  //   setUpdateMsg(`✓ Status of ${updateForm.id} updated to ${STATUS_CONFIG[updateForm.status]?.label}`);
  //   setUpdateForm({ id: '', status: '', paymentStatus: '', updatedBy: '', remarks: '' });
  //   setTimeout(() => setUpdateMsg(''), 3000);
  // };

  const handleUpdate = async () => {
  if (!updateForm.id || !updateForm.status || !updateForm.updatedBy) {
    setUpdateMsg("Please fill PO ID, Status and Updated By.");
    return;
  }

  try {
    const selectedPO = pos.find((p) => p.id === updateForm.id);

    if (!selectedPO) {
      setUpdateMsg("Purchase order not found.");
      return;
    }

    await updateOrderStatus(selectedPO.rawId, updateForm.status);

    setPos((prev) =>
      prev.map((p) =>
        p.id === updateForm.id
          ? {
              ...p,
              status: updateForm.status,
              paymentStatus:
                updateForm.paymentStatus || p.paymentStatus,
            }
          : p
      )
    );

    setUpdateMsg(
      `✓ Status of ${updateForm.id} updated to ${
        STATUS_CONFIG[updateForm.status]?.label
      }`
    );

    setUpdateForm({
      id: "",
      status: "",
      paymentStatus: "",
      updatedBy: "",
      remarks: "",
    });

    setTimeout(() => setUpdateMsg(""), 3000);
  } catch (error) {
    console.error("Error updating order status:", error);
    setUpdateMsg("Failed to update purchase order status.");
  }
};

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')} className="hover:text-purple-300 transition-colors">Purchase Orders</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">PO Status Tracker</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <ShoppingCart size={22} style={{ color: '#6366f1' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">PO Status Tracker</h2>
          <p className="text-sm text-gray-400">Track and update purchase order statuses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Update Status Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 overflow-hidden sticky top-5">
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
            <div className="p-5">
              <h3 className="font-bold text-white text-base mb-4">Update Status</h3>
              <div className="space-y-3">
                {/* PO ID dropdown */}
                <div>
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1 block">Purchase Order ID</label>
                  <select value={updateForm.id} onChange={e => setUpdateForm(p => ({ ...p, id: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', appearance: 'none' }}>
                    <option value="">Select PO ID</option>
                    {pos.map(p => <option key={p.id} value={p.id}>{p.id} — {p.supplier}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1 block">New Status</label>
                  <select value={updateForm.status} onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', appearance: 'none' }}>
                    <option value="">Select Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1 block">Payment Status</label>
                  <select value={updateForm.paymentStatus} onChange={e => setUpdateForm(p => ({ ...p, paymentStatus: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', appearance: 'none' }}>
                    <option value="">Select Payment Status</option>
                    {['Paid', 'Unpaid', 'Pending', 'Partial'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1 block">Updated By</label>
                  <input value={updateForm.updatedBy} onChange={e => setUpdateForm(p => ({ ...p, updatedBy: e.target.value }))}
                    placeholder="Your name"
                    className="w-full h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide mb-1 block">Remarks</label>
                  <textarea value={updateForm.remarks} onChange={e => setUpdateForm(p => ({ ...p, remarks: e.target.value }))}
                    rows={3} placeholder="Reason for update..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
                </div>

                {updateMsg && (
                  <div className={`text-xs p-3 rounded-xl font-medium ${updateMsg.startsWith('✓') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {updateMsg}
                  </div>
                )}

                <button onClick={handleUpdate}
                  className="w-full h-11 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status Timeline List */}
        <div className="lg:col-span-2">
          {/* Search */}
          {/* Search + Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by PO ID or supplier..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400 flex-shrink-0" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-[#140f2d]/80 text-white">
                <option value="ALL">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map(po => {
              const isOpen = expanded === po.id;
              const timeline = getTimeline(po);
              const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.CREATED;
              return (
                <div key={po.id} className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                  {/* PO Row Header */}
                  <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors text-left"
                    onClick={() => setExpanded(isOpen ? null : po.id)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                      <ShoppingCart size={16} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm">{po.id}</p>
                        <StatusBadge status={po.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{po.supplier} · ₹{po.net?.toLocaleString()}</p>
                    </div>
                    <div className="text-gray-300 flex-shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Expanded: stepper + timeline */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-50">
                      {/* Progress stepper */}
                      <StatusStepper status={po.status} />
                      {po.status === 'REJECTED' && (
                        <div className="flex items-center gap-2 mt-3 mb-3 px-3 py-2 bg-red-500/10 rounded-xl text-xs text-red-400 font-medium">
                          <XCircle size={13} /> This PO was rejected.
                        </div>
                      )}

                      {/* Timeline events */}
                      <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mt-5 mb-3">Status Timeline</p>
                      <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#6366f1] via-[#8b5cf6] to-gray-200 rounded-full" />
                        <div className="space-y-4">
                          {timeline.map((evt, i) => {
                            const eCfg = STATUS_CONFIG[evt.status] || STATUS_CONFIG.CREATED;
                            const EIcon = eCfg.icon;
                            return (
                              <div key={i} className="relative flex gap-3">
                                {/* Dot */}
                                <div className="absolute -left-6 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm flex-shrink-0"
                                  style={{ background: eCfg.bg, borderColor: eCfg.color + '50', top: '2px' }}>
                                  <EIcon size={10} style={{ color: eCfg.color }} />
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-white text-xs">{evt.label}</p>
                                    <StatusBadge status={evt.status} />
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={10} />{evt.date}</span>
                                    <span className="flex items-center gap-1"><User size={10} />{evt.by}</span>
                                  </div>
                                  {evt.note && (
                                    <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1">
                                      <MessageSquare size={10} className="mt-0.5 flex-shrink-0" />{evt.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POStatusTracker;