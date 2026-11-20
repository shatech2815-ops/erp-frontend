import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, Plus, Search, Filter, Eye, Trash2,
  ChevronRight, FileText, TrendingUp,
  CheckCircle, Clock, XCircle, AlertCircle, Truck
} from 'lucide-react';


import {
  getAllOrders,
  deleteOrder
} from "../../services/purchase/purchaseOrder.services";

const STATUS_CONFIG = {
  CREATED:   { label: 'Created',   color: '#6366f1', bg: 'rgba(139,92,246,0.12)',  icon: FileText },
  APPROVED:  { label: 'Approved',  color: '#059669', bg: 'rgba(16,185,129,0.15)',  icon: CheckCircle },
  SHIPPED:   { label: 'Shipped',   color: '#2563eb', bg: 'rgba(59,130,246,0.15)',  icon: ShoppingCart },
  DELIVERED: { label: 'Delivered', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: 'rgba(239,68,68,0.15)',  icon: XCircle },
};

// const DEMO_POS = [
//   { id: 'PO-2025-001', orderDate: '2025-01-10', deliveryDate: '2025-01-25', supplier: 'Ravi Traders',     contact: '9876543210', email: 'ravi@traders.com',    total: 85000, tax: 7650, discount: 2000, net: 90650, paymentStatus: 'Paid',    paymentMethod: 'Bank Transfer', status: 'COMPLETED', remarks: 'Urgent requirement' },
//   { id: 'PO-2025-002', orderDate: '2025-02-05', deliveryDate: '2025-02-20', supplier: 'Sri Ganesh Stores', contact: '9876500001', email: 'ganesh@stores.com',   total: 45000, tax: 4050, discount: 500,  net: 48550, paymentStatus: 'Pending', paymentMethod: 'Cheque',        status: 'APPROVED',  remarks: '' },
//   { id: 'PO-2025-003', orderDate: '2025-02-18', deliveryDate: '2025-03-05', supplier: 'Murugan Supplies',  contact: '9876511122', email: 'murugan@supply.com',  total: 12000, tax: 1080, discount: 0,    net: 13080, paymentStatus: 'Unpaid',  paymentMethod: 'Cash',          status: 'PENDING',   remarks: 'Awaiting approval' },
//   { id: 'PO-2025-004', orderDate: '2025-03-01', deliveryDate: '2025-03-15', supplier: 'Chennai Hardware',  contact: '9876522233', email: 'chennai@hw.com',      total: 67000, tax: 6030, discount: 1000, net: 72030, paymentStatus: 'Paid',    paymentMethod: 'UPI',           status: 'COMPLETED', remarks: 'Bulk order' },
//   { id: 'PO-2025-005', orderDate: '2025-03-10', deliveryDate: '2025-03-22', supplier: 'Vijay Enterprises', contact: '9876533344', email: 'vijay@ent.com',       total: 23000, tax: 2070, discount: 200,  net: 24870, paymentStatus: 'Pending', paymentMethod: 'Bank Transfer', status: 'CREATED',   remarks: 'New supplier' },
//   { id: 'PO-2025-006', orderDate: '2025-03-15', deliveryDate: '2025-03-28', supplier: 'Kumar & Sons',      contact: '9876544455', email: 'kumar@sons.com',      total: 34000, tax: 3060, discount: 500,  net: 36560, paymentStatus: 'Unpaid',  paymentMethod: 'Cheque',        status: 'REJECTED',  remarks: 'Price not matching' },
// ];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const POList = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewPO, setViewPO] = useState(null);

  // useEffect(() => {
  //   const stored = localStorage.getItem('srivaari_pos');
  //   const list = stored ? JSON.parse(stored) : DEMO_POS;
  //   setPos(list);
  // }, []);

   useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  try {
    const response = await getAllOrders();

    const formattedOrders = response.map((po) => ({
      id: po.id,
      orderNumber: po.orderNumber,
      orderDate: po.orderDate,
      deliveryDate: po.expectedDeliveryDate,
      supplier: po.supplierName,
      contact: po.supplierContact,
      email: po.supplierEmail,
      total: Number(po.totalAmount) || 0,
      tax: Number(po.taxAmount) || 0,
      discount: Number(po.discount) || 0,
      net: Number(po.netAmount) || 0,
      paymentStatus: po.paymentStatus || "Unpaid",
      paymentMethod: po.paymentMethod || "Cash",
      status: po.status || "CREATED",
      remarks: po.remarks || "",
      supplierName: po.supplierName,
      items: po.items || [],
      warehouse: po.warehouse || "",
    }));

    setPos(formattedOrders);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
  }
};
  // const filtered = pos.filter(po => {
  //   const matchSearch = po.id.toLowerCase().includes(search.toLowerCase()) ||
  //     po.supplier.toLowerCase().includes(search.toLowerCase());
  //   const matchStatus = filterStatus === 'ALL' || po.status === filterStatus;
  //   return matchSearch && matchStatus;
  // });

    const filtered = pos.filter((po) => {
  const matchSearch =
    String(po.id || "").toLowerCase().includes(search.toLowerCase()) ||
    String(po.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
    String(po.supplier || "").toLowerCase().includes(search.toLowerCase());

  const matchStatus =
    filterStatus === "ALL" || po.status === filterStatus;

  return matchSearch && matchStatus;
});

  // const deletePO = (id) => {
  //   const updated = pos.filter(p => p.id !== id);
  //   setPos(updated);
  //   localStorage.setItem('srivaari_pos', JSON.stringify(updated));
  // };

    const handleDeletePO = async (id) => {
  try {
    await deleteOrder(id);
    setPos((prev) => prev.filter((p) => p.id !== id));
  } catch (error) {
    console.error("Error deleting PO:", error);
    alert("Failed to delete purchase order");
  }
};

  // const stats = {
  //   total: pos.length,
  //   completed: pos.filter(p => p.status === 'COMPLETED').length,
  //   pending: pos.filter(p => p.status === 'PENDING' || p.status === 'CREATED').length,
  //   totalValue: pos.reduce((a, p) => a + p.net, 0),
  // };
    const stats = {
  total: pos.length,
  delivered: pos.filter((p) => p.status === "DELIVERED").length,
  pending: pos.filter((p) =>
    p.status === "CREATED" ||
    p.status === "APPROVED" ||
    p.status === "SHIPPED"
  ).length,
  totalValue: pos.reduce((a, p) => a + p.net, 0),
}

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')} className="hover:text-purple-300 transition-colors">Purchase Orders</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">PO List</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <ShoppingCart size={22} style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Purchase Order List</h2>
          <p className="text-sm text-gray-400">All purchase orders at a glance</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/purchase/purchase-orders/create-po')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Plus size={16} /> New PO
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total POs', value: stats.total,     icon: FileText,    color: '#6366f1', bg: 'rgba(139,92,246,0.12)' },
          // { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#059669', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: '#059669', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Pending',   value: stats.pending,   icon: Clock,       color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Total Value',value: `₹${(stats.totalValue/1000).toFixed(0)}K`, icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
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

      {/* Filters */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search by PO number or supplier..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white/5"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400 flex-shrink-0" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white/5 text-white">
              <option value="ALL">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))' }}>
                {['PO Number','Order Date','Delivery Date','Supplier','Net Amount','Payment','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No purchase orders found</td></tr>
              ) : filtered.map(po => (
                <tr key={po.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-bold text-[#6366f1]">{po.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{po.orderDate}</td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{po.deliveryDate}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{po.supplier}</p>
                      <p className="text-xs text-gray-400">{po.contact}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-white">₹{po.net.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      po.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      po.paymentStatus === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>{po.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => navigate('/dashboard/purchase/create-grn', { state: { po } })}
                        title="Create GRN (Receive Goods)"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors whitespace-nowrap"
                      >
                        <Truck size={12} />
                        Create GRN
                      </button>
                      <button onClick={() => setViewPO(po)}
                        title="View Details"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDeletePO(po.id)}
                        title="Delete PO"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {pos.length} orders</p>
        </div>
      </div>

      {/* View Modal */}
      {viewPO && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewPO(null)}>
          <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">{viewPO.orderNumber}</h3>
                <StatusBadge status={viewPO.status} />
              </div>
              <button onClick={() => setViewPO(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Supplier', viewPO.supplier], ['Contact', viewPO.contact],
                ['Email', viewPO.email], ['Order Date', viewPO.orderDate],
                ['Delivery Date', viewPO.deliveryDate], ['Payment Method', viewPO.paymentMethod],
                ['Total', `₹${viewPO.total.toLocaleString()}`], ['Tax', `₹${viewPO.tax.toLocaleString()}`],
                ['Discount', `₹${viewPO.discount.toLocaleString()}`], ['Net Amount', `₹${viewPO.net.toLocaleString()}`],
                ['Payment Status', viewPO.paymentStatus],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-white text-xs">{v}</p>
                </div>
              ))}
            </div>
            {viewPO.remarks && (
              <div className="mt-3 bg-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Remarks</p>
                <p className="text-sm text-white">{viewPO.remarks}</p>
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button 
                onClick={() => setViewPO(null)} 
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-white/5 border border-white/10"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const targetPO = viewPO;
                  setViewPO(null);
                  navigate('/dashboard/purchase/create-grn', { state: { po: targetPO } });
                }} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md"
              >
                <Truck size={14} />
                Receive Goods (Create GRN)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POList;
