import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, ClipboardList, Package, CheckCircle, Clock, XCircle, AlertCircle, Save, X, Edit2, User, Warehouse } from 'lucide-react';

import {
  getItems,
  getRequests,
  createRequest,
  updateRequestStatus,
} from "../../services/purchase/inventory.services";

// const LS_REQUESTS = 'srivaari_item_requests';
// const LS_ITEMS    = 'srivaari_items';

const WAREHOUSES = ['Main Warehouse', 'Secondary Warehouse', 'Cold Storage', 'Distribution Center'];
const STORES     = ['Store A', 'Store B', 'Store C', 'Store D'];
// const STATUSES   = ['Pending', 'Approved', 'Rejected', 'Fulfilled'];
const STATUSES = ["PENDING", "APPROVED", "REJECTED", "FULFILLED"];

// const STATUS_META = {
//   Pending:  { bg: 'rgba(245,158,11,0.15)', text: '#92400e', icon: Clock },
//   Approved: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', icon: CheckCircle },
//   Rejected: { bg: 'rgba(239,68,68,0.15)', text: '#991b1b', icon: XCircle },
//   Fulfilled:{ bg: 'rgba(139,92,246,0.12)', text: '#ffffff', icon: Package },
// };

const STATUS_META = {
  PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#92400e', icon: Clock },
  APPROVED: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', icon: CheckCircle },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#991b1b', icon: XCircle },
  FULFILLED: { bg: 'rgba(139,92,246,0.12)', text: '#ffffff', icon: Package },
};

const emptyForm = {
  itemId: '', warehouseName: '', storeName: '', quantity: '',
  requestedBy: '', approvedBy: '', status: 'Pending', requestDate: '', remarks: '',
};

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all`} />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.Pending;
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.text }}>
      <Icon size={11} />{status}
    </span>
  );
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}><Icon size={18} style={{ color }} /></div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

export default function ItemRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [items, setItems]       = useState([]);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // useEffect(() => {
  //   try { const r = localStorage.getItem(LS_REQUESTS); if (r) setRequests(JSON.parse(r)); } catch {}
  //   try { const i = localStorage.getItem(LS_ITEMS); if (i) setItems(JSON.parse(i)); } catch {}
  // }, []);

  useEffect(() => {
  loadItems();
  loadRequests();
}, []);

const loadItems = async () => {
  try {
    const data = await getItems();
    setItems(data || []);
  } catch (error) {
    console.error("Error loading items:", error);
    showToast("Failed to load items", "error");
  }
};

// const loadRequests = async () => {
//   try {
//     const data = await getRequests();
//     setRequests(data || []);
//   } catch (error) {
//     console.error("Error loading requests:", error);
//     showToast("Failed to load requests", "error");
//   }
// };

const loadRequests = async () => {
  try {
    const response = await getRequests();

    const data = Array.isArray(response)
      ? response
      : response?.data || [];

    setRequests(data);
  } catch (error) {
    console.error("Error loading requests:", error);
    showToast("Failed to load requests", "error");
  }
};

  // const persist = (data) => { try { localStorage.setItem(LS_REQUESTS, JSON.stringify(data)); } catch {} };

  const getName = (itemId) => {
    const item = items.find(i => i.id === parseInt(itemId));
    return item ? item.name : `Item #${itemId}`;
  };

  const handleStatusUpdate = async (id, status) => {
  try {
    await updateRequestStatus(id, status);

    showToast("Status updated successfully");

    await loadRequests();
  } catch (error) {
    console.error("Error updating status:", error);
    showToast("Failed to update status", "error");
  }
};

  // const handleSave = () => {
  //   if (!form.itemId || !form.warehouseName || !form.quantity) { showToast('Item ID, Warehouse and Quantity are required.', 'error'); return; }
  //   setSaving(true);
  //   const entry = {
  //     itemId: parseInt(form.itemId), warehouseName: form.warehouseName, storeName: form.storeName,
  //     quantity: parseInt(form.quantity), requestedBy: form.requestedBy || null, approvedBy: form.approvedBy || null,
  //     status: form.status, requestDate: form.requestDate || null, remarks: form.remarks || null,
  //   };
  //   let updated;
  //   if (editId) {
  //     updated = requests.map(r => r.id === editId ? { ...r, ...entry } : r);
  //     showToast('Request updated.');
  //     setEditId(null);
  //   } else {
  //     updated = [...requests, { ...entry, id: Date.now() }];
  //     showToast('Request created.');
  //   }
  //   setRequests(updated);
  //   persist(updated);
  //   setForm(emptyForm);
  //   setSaving(false);
  // };

  const handleSave = async () => {
  if (!form.itemId || !form.warehouseName || !form.quantity) {
    showToast('Item ID, Warehouse and Quantity are required.', 'error');
    return;
  }

  setSaving(true);

  const payload = {
    itemId: parseInt(form.itemId),
    warehouseName: form.warehouseName,
    storeName: form.storeName,
    quantity: parseInt(form.quantity),
    requestedBy: form.requestedBy || null,
    approvedBy: form.approvedBy || null,
    status: form.status,
    requestDate: form.requestDate || null,
    remarks: form.remarks || null,
  };

  try {
  if (editId) {
  await updateRequestStatus(editId, form.status);

  setRequests((prev) =>
    prev.map((req) =>
      req.id === editId
        ? {
            ...req,
            ...payload,
            status: form.status,
          }
        : req
    )
  );

  showToast("Request updated successfully");
} else {
  await createRequest(payload);
  showToast("Request created successfully");
}

  setForm(emptyForm);
  setEditId(null);

  await loadRequests();
} catch (error) {
  console.error("Error saving request:", error);
  showToast("Failed to save request", "error");
}finally {
    setSaving(false);
  }
};



  // const handleEdit = (req) => {
  //   setForm({ itemId: req.itemId ?? '', warehouseName: req.warehouseName ?? '', storeName: req.storeName ?? '', quantity: req.quantity ?? '', requestedBy: req.requestedBy ?? '', approvedBy: req.approvedBy ?? '', status: req.status ?? 'Pending', requestDate: req.requestDate ?? '', remarks: req.remarks ?? '' });
  //   setEditId(req.id);
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // };

  const handleEdit = (req) => {
  setForm({
    id: req.id,
    itemId: req.itemId ?? '',
    warehouseName: req.warehouseName ?? '',
    storeName: req.storeName ?? '',
    quantity: req.quantity ?? '',
    requestedBy: req.requestedBy ?? '',
    approvedBy: req.approvedBy ?? '',
    status: req.status ?? 'Pending',
    requestDate: req.requestDate ?? '',
    remarks: req.remarks ?? '',
  });

  setEditId(req.id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const filtered = requests.filter(r => {
    const matchQ = !search || getName(r.itemId).toLowerCase().includes(search.toLowerCase()) || (r.requestedBy || '').toLowerCase().includes(search.toLowerCase());
    const matchS = filterStatus === 'ALL' || r.status === filterStatus;
    return matchQ && matchS;
  });

  const stats = [
    { label: 'Total',    value: requests.length, color: '#8b5cf6', icon: ClipboardList },
    { label: 'Pending',  value: requests.filter(r => r.status === 'Pending').length,  color: '#f59e0b', icon: Clock },
    { label: 'Approved', value: requests.filter(r => r.status === 'Approved').length, color: '#059669', icon: CheckCircle },
    { label: 'Rejected', value: requests.filter(r => r.status === 'Rejected').length, color: '#dc2626', icon: XCircle },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ background: 'rgba(139,92,246,0.10)' }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
          {toast.type === 'error' ? <XCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-white/10 bg-[#140f2d]/80 flex items-center justify-center hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} className="text-purple-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center">
            <ClipboardList size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Item Requests</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage stock item requests and approvals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Form */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 mb-6 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <Plus size={15} className="text-purple-300" />
          <h2 className="text-sm font-bold text-white">{editId ? 'Update Request' : 'New Item Request'}</h2>
          {editId && <button onClick={() => { setForm(emptyForm); setEditId(null); }} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-400"><X size={13} /> Cancel</button>}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Item ID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Package size={13} /></span>
                <select value={form.itemId} onChange={e => ff('itemId', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 pl-8 pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all appearance-none">
                  <option value="">Select Item...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.id} — {i.name}</option>)}
                </select>
              </div>
            </div>
            <SelectField label="Warehouse" value={form.warehouseName} onChange={v => ff('warehouseName', v)} options={WAREHOUSES} />
            <SelectField label="Store" value={form.storeName} onChange={v => ff('storeName', v)} options={STORES} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <InputField label="Quantity" placeholder="Qty" value={form.quantity} onChange={v => ff('quantity', v)} type="number" />
            <InputField label="Requested By" placeholder="Name" value={form.requestedBy} onChange={v => ff('requestedBy', v)} icon={User} />
            <InputField label="Approved By" placeholder="Name (optional)" value={form.approvedBy} onChange={v => ff('approvedBy', v)} icon={User} />
            <SelectField label="Status" value={form.status} onChange={v => ff('status', v)} options={STATUSES} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Request Date</label>
              <input type="date" value={form.requestDate} onChange={e => ff('requestDate', e.target.value)}
                className="rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Remarks</label>
              <input type="text" placeholder="Optional remarks" value={form.remarks} onChange={e => ff('remarks', e.target.value)}
                className="rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {editId ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search by item or requester…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-purple-300 focus:outline-none">
            <option value="ALL">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-purple-400 text-white text-xs uppercase tracking-wide">
                {['Item', 'Warehouse', 'Store', 'Qty', 'Requested By', 'Approved By', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-14 text-gray-400 text-sm">No requests found.</td></tr>
              ) : filtered.map((req, idx) => (
                <tr key={req.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/5'}`}>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{getName(req.itemId)}<br/><span className="text-[10px] text-gray-400">ID: {req.itemId}</span></td>
                  <td className="px-4 py-3 text-xs text-purple-300">{req.warehouseName}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{req.storeName}</td>
                  <td className="px-4 py-3 text-xs font-bold text-white">{req.quantity}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{req.requestedBy || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{req.approvedBy || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{req.requestDate || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={req.status || 'Pending'} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(req)} className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-[#8b5cf6] hover:text-white text-purple-300 flex items-center justify-center transition-colors"><Edit2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
