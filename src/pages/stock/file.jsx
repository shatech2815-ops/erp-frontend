
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Plus, Search, Filter,
  Eye, Trash2, ChevronRight, TrendingUp, CheckCircle, Clock, Paperclip, X,
} from 'lucide-react';

import {
  getAllSupplierPOs,
  deleteSupplierPO
} from "../../services/purchase/supplierPO.services";

const SupplierPOList = () => {
  const navigate = useNavigate();
  const [list, setList]       = useState([]);
  const [search, setSearch]         = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [viewEntry, setViewEntry]   = useState(null);
  const [viewDoc, setViewDoc]     = useState(null); // { src, name }

  // useEffect(() => {
  //   const stored = localStorage.getItem('mveng_supplier_pos');
  //   setList(stored ? JSON.parse(stored) : []);
  // }, []);

  useEffect(() => {
  fetchSupplierPOs();
}, []);

const fetchSupplierPOs = async () => {
  try {
    const response = await getAllSupplierPOs();

    const supplierPOs = Array.isArray(response)
      ? response
      : response?.data || [];

    setList(supplierPOs);
  } catch (error) {
    console.error("Error fetching supplier POs:", error);
    setList([]);
  }
};

  const filtered = list.filter(po => {
  const matchSearch =
     po.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
    po.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
    po.buyerName?.toLowerCase().includes(search.toLowerCase());
  const invDate = po.invoiceDate || '';
  const matchFrom = !filterDateFrom || invDate >= filterDateFrom;
  const matchTo   = !filterDateTo   || invDate <= filterDateTo;
  return matchSearch && matchFrom && matchTo;
});

  // const deleteEntry = (id) => {
  //   const updated = list.filter(p => p.id !== id);
  //   setList(updated);
  //   localStorage.setItem('mveng_supplier_pos', JSON.stringify(updated));
  //   if (viewEntry?.id === id) setViewEntry(null);
  // };

  const deleteEntry = async (id) => {
  try {
    await deleteSupplierPO(id);

    const updated = list.filter((p) => p.id !== id);
    setList(updated);

    if (viewEntry?.id === id) {
      setViewEntry(null);
    }
  } catch (error) {
    console.error("Error deleting supplier PO:", error);
  }
};

  const stats = {
    total: list.length,
    totalValue: list.reduce((s, p) => s + (parseFloat(p.grandTotal) || 0), 0),
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium flex-wrap">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')} className="hover:text-purple-300 transition-colors">Purchase Orders</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Supplier PO List</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <FileText size={22} style={{ color: '#6366f1' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Supplier PO List</h2>
          <p className="text-sm text-gray-400">All supplier tax invoices / purchase orders</p>
        </div>
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders/create-supplier-po')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Plus size={16} /> New Supplier PO
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Records',  value: stats.total,                                        icon: FileText,    color: '#6366f1', bg: 'rgba(139,92,246,0.12)' },
          { label: 'Total Value',    value: `₹${(stats.totalValue / 1000).toFixed(1)}K`,         icon: TrendingUp,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
          { label: 'With Document',  value: list.filter(p => p.attachmentDocument).length,             icon: Paperclip,   color: '#059669', bg: 'rgba(16,185,129,0.15)' },
          { label: 'No Document',    value: list.filter(p => !p.attachmentDocument).length,            icon: Clock,       color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
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

      {/* Search */}
     {/* Search + Filters */}
    <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by invoice no / supplier / buyer…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white/5" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
            className="pl-3 pr-2 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white/5 text-white" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
            className="pl-3 pr-2 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white/5 text-white" />
        </div>
      </div>
    </div>

      {/* Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#8b5cf6' }}>
                {['Invoice No','Invoice Date','Supplier','Buyer GSTIN','Destination','Grand Total (₹)','Document','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400">
                    <FileText size={36} className="mx-auto mb-2 opacity-30" />
                    <p>No supplier POs found.</p>
                    <button onClick={() => navigate('/dashboard/purchase/purchase-orders/create-supplier-po')}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <Plus size={13} /> Create First Supplier PO
                    </button>
                  </td>
                </tr>
              ) : filtered.map((po, i) => (
                <tr key={i} className="hover:bg-[rgba(139,92,246,0.08)] transition-colors">
                  <td className="px-4 py-3 font-bold text-[#6366f1]">{po.invoiceNo}</td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{po.invoiceDate}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{po.supplier?.name || '—'}</p>
                    <p className="text-xs text-gray-400">  {po.supplier?.gstin || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{po.buyerGstin || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{po.destination || '—'}</td>
                  <td className="px-4 py-3 font-bold text-white">₹{Number(po.grandTotal || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {po.attachmentDocument ? (
                      <button
                      onClick={() =>
                      setViewDoc({
                      src: po.attachmentDocument,
                      name: "Document"
                      })
                     }
                    className="flex items-center gap-1.5 text-xs text-[#6366f1] font-semibold hover:underline">
                    <Paperclip size={12} /> View
                    </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewEntry(po)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => deleteEntry(po.id)}
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
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {list.length} records</p>
        </div>
      </div>

      {/* ── View Detail Modal ── */}
      {viewEntry && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewEntry(null)}>
          <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Invoice #{viewEntry.invoiceNo}</h3>
                <p className="text-sm text-gray-400">{viewEntry.invoiceDate}</p>
              </div>
              <button onClick={() => setViewEntry(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10">
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[
                ['Supplier', viewEntry.supplier?.name],
                ['Supplier GSTIN', viewEntry.supplier?.gstin],
                ['Buyer', viewEntry.buyerName],
                ['Buyer GSTIN', viewEntry.buyerGstin],
                ['Invoice Date', viewEntry.invoiceDate],
                ['Delivery Note No', viewEntry.deliveryNoteNo],
                ['Mode of Payment', viewEntry.modeTermsOfPayment],
                ['Reference No', viewEntry.referenceNo],
                ['Buyer Order No', viewEntry.buyersOrderNo],
                ['Dispatched Through', viewEntry.dispatchedThrough],
                ['Destination', viewEntry.destination],
                ['Mode of Despatch', viewEntry.modeOfDespatch],
                ['Colour Coated', viewEntry.colourCoated],
                ['Grand Total', `₹${Number(viewEntry.grandTotal || 0).toLocaleString('en-IN')}`],
                ['CGST Total', `₹${Number(viewEntry.cgstTotal || 0).toLocaleString('en-IN')}`],
                ['SGST Total', `₹${Number(viewEntry.sgstTotal || 0).toLocaleString('en-IN')}`],
                ['IGST Total', `₹${Number(viewEntry.igstTotal || 0).toLocaleString('en-IN')}`],
                ['Taxable Value', `₹${Number(viewEntry.taxableTotal || 0).toLocaleString('en-IN')}`],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-white text-xs">{v}</p>
                </div>
              ))}
            </div>

            {/* Line Items */}
            {viewEntry.items?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">Line Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#8b5cf6' }}>
                        {['#','Description','HSN','Qty','UoM','Rate','Taxable','CGST','SGST','IGST','Amount'].map(h => (
                          <th key={h} className="px-2 py-2 text-left text-white font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {viewEntry.items.map((item, i) => (
                        <tr key={i} className="hover:bg-white/10">
                          <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                          <td className="px-2 py-1.5 font-medium text-white">{item.description || '—'}</td>
                          <td className="px-2 py-1.5 text-gray-400">{item.hsnSac || '—'}</td>
                          <td className="px-2 py-1.5">{item.quantity}</td>
                          <td className="px-2 py-1.5 text-gray-400">{item.uom}</td>
                          <td className="px-2 py-1.5">₹{item.rate}</td>
                          <td className="px-2 py-1.5">₹{item.taxableValue}</td>
                          <td className="px-2 py-1.5">₹{item.cgstAmt} ({item.cgstRate}%)</td>
                          <td className="px-2 py-1.5">₹{item.sgstAmt} ({item.sgstRate}%)</td>
                          <td className="px-2 py-1.5">₹{item.igstAmt} ({item.igstRate}%)</td>
                          <td className="px-2 py-1.5 font-bold text-white">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewEntry.remarks && (
              <div className="bg-white/5 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-0.5">Remarks</p>
                <p className="text-sm text-white">{viewEntry.remarks}</p>
              </div>
            )}

            {viewEntry.attachmentDocument && (
              <div className="mt-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2">
                  Attached Document
                </h4>
                <button
                  onClick={() =>
                    setViewDoc({
                      src: viewEntry.attachmentDocument,
                      name: "Document"
                    })
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#6366f1] text-[#6366f1]"
                >
                  <Paperclip size={14} /> View Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Document Viewer Modal ── */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setViewDoc(null)}>
          <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Paperclip size={15} className="text-[#6366f1]" /> {viewDoc.name}
              </div>
              <button onClick={() => setViewDoc(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-white/5">
              {viewDoc.src?.startsWith('data:image') ? (
                <img src={viewDoc.src} alt={viewDoc.name} className="max-w-full max-h-[70vh] rounded-xl shadow object-contain" />
              ) : viewDoc.src?.startsWith('data:application/pdf') ? (
                <iframe src={viewDoc.src} title={viewDoc.name} className="w-full h-[70vh] rounded-xl border-0" />
              ) : (
                <p className="text-gray-400 text-sm">Cannot preview this file type.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierPOList;