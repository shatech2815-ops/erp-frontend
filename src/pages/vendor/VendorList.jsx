
// ─────────────────────────────────────────────────────────────────────────────
// VendorList.jsx — Vendor list with document viewer, dummy data fallback
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Phone, Mail, MapPin, ArrowLeft,
  Users, CheckCircle, X, Edit2, Save, Building2,
  Globe, Landmark, CreditCard, FileText, User,
  ChevronRight, Filter, Tag, Eye, ZoomIn, ZoomOut,
  Printer, Download, HardDrive, FolderOpen,
} from 'lucide-react';

import { getAllVendors, updateVendor } from "../../services/vendor/vendor.services";

// const BASE_URL = '/api';

// // ─── Dummy data (shown until backend is connected) ────────────────────────────
// const DUMMY_VENDORS = [
//   {
//     id: 1, vendorCode: 'VND-001', vendorName: 'Rajan Kumar', companyName: 'Rajan Traders Pvt. Ltd.',
//     categoryName: 'Supplier', mobileNumber: '+91 98765 43210', alternatePhone: '+91 91234 56789',
//     email: 'rajan@rajantraders.com', website: 'www.rajantraders.com',
//     addressLine1: '12, Gandhi Nagar', addressLine2: 'Anna Salai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600002',
//     bankName: 'State Bank of India', accountHolderName: 'Rajan Kumar', accountNumber: '1234567890', ifscCode: 'SBIN0001234',
//     status: 'ACTIVE', createdAt: '2024-01-15T10:00:00Z',
//     gstDocument: 'gst_rajan.pdf', gstDocumentName: 'gst_rajan.pdf',
//     panDocument: 'pan_rajan.pdf', panDocumentName: 'pan_rajan.pdf',
//     addressProof: null, agreementDocument: 'agreement_rajan.pdf', agreementDocumentName: 'agreement_rajan.pdf',
//   },
//   {
//     id: 2, vendorCode: 'VND-002', vendorName: 'Priya Sharma', companyName: 'Sharma Constructions',
//     categoryName: 'Contractor', mobileNumber: '+91 87654 32109', alternatePhone: '',
//     email: 'priya@sharmaconstruct.in', website: '',
//     addressLine1: '45, MG Road', addressLine2: '', city: 'Bangalore', state: 'Karnataka', country: 'India', pincode: '560001',
//     bankName: 'HDFC Bank', accountHolderName: 'Priya Sharma', accountNumber: '9876543210', ifscCode: 'HDFC0002345',
//     status: 'ACTIVE', createdAt: '2024-02-20T09:30:00Z',
//     gstDocument: 'gst_sharma.pdf', gstDocumentName: 'gst_sharma.pdf',
//     panDocument: null, addressProof: 'address_sharma.pdf', addressProofName: 'address_sharma.pdf',
//     agreementDocument: null,
//   },
//   {
//     id: 3, vendorCode: 'VND-003', vendorName: 'Arvind Mehta', companyName: 'Mehta Engineering Works',
//     categoryName: 'Service Provider', mobileNumber: '+91 76543 21098', alternatePhone: '+91 98001 23456',
//     email: 'arvind@mehtaengg.com', website: 'www.mehtaengg.com',
//     addressLine1: '8, Industrial Estate', addressLine2: 'Phase II', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001',
//     bankName: 'ICICI Bank', accountHolderName: 'Arvind Mehta', accountNumber: '1122334455', ifscCode: 'ICIC0003456',
//     status: 'INACTIVE', createdAt: '2023-11-05T14:00:00Z',
//     gstDocument: null,
//     panDocument: 'pan_mehta.pdf', panDocumentName: 'pan_mehta.pdf',
//     addressProof: 'address_mehta.pdf', addressProofName: 'address_mehta.pdf',
//     agreementDocument: 'agreement_mehta.pdf', agreementDocumentName: 'agreement_mehta.pdf',
//   },
//   {
//     id: 4, vendorCode: 'VND-004', vendorName: 'Sunita Nair', companyName: 'Nair Office Supplies',
//     categoryName: 'Supplier', mobileNumber: '+91 65432 10987', alternatePhone: '',
//     email: 'sunita@nairsupplies.com', website: 'www.nairsupplies.com',
//     addressLine1: '3/A, Commercial Street', addressLine2: '', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500001',
//     bankName: 'Axis Bank', accountHolderName: 'Sunita Nair', accountNumber: '6677889900', ifscCode: 'UTIB0004567',
//     status: 'ACTIVE', createdAt: '2024-03-10T11:00:00Z',
//     gstDocument: 'gst_nair.pdf', gstDocumentName: 'gst_nair.pdf',
//     panDocument: 'pan_nair.pdf', panDocumentName: 'pan_nair.pdf',
//     addressProof: 'address_nair.pdf', addressProofName: 'address_nair.pdf',
//     agreementDocument: 'agreement_nair.pdf', agreementDocumentName: 'agreement_nair.pdf',
//   },
//   {
//     id: 5, vendorCode: 'VND-005', vendorName: 'Deepak Iyer', companyName: 'Iyer Consulting Services',
//     categoryName: 'Consultant', mobileNumber: '+91 54321 09876', alternatePhone: '+91 77001 55432',
//     email: 'deepak@iyerconsulting.in', website: '',
//     addressLine1: '22, Ring Road', addressLine2: 'Near Central Mall', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001',
//     bankName: 'Kotak Mahindra Bank', accountHolderName: 'Deepak Iyer', accountNumber: '3344556677', ifscCode: 'KKBK0005678',
//     status: 'ACTIVE', createdAt: '2024-04-01T08:00:00Z',
//     gstDocument: null, panDocument: 'pan_iyer.pdf', panDocumentName: 'pan_iyer.pdf',
//     addressProof: null, agreementDocument: null,
//   },
// ];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// const getDocUrl = (val) => {
//   if (!val) return null;
//   if (val.startsWith('data:')) return val;
//   return `/vendors/documents/${val}`;
// };

const getDocUrl = (val) => {

  if (!val) return null;

  // base64 support
  if (
    typeof val === "string" &&
    val.startsWith("data:")
  ) {
    return val;
  }

  return `${import.meta.env.VITE_API_URL}/vendors/documents/${val}`;
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_META = {
  ACTIVE:   { label: 'ACTIVE',   bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', dot: '#10b981' },
  INACTIVE: { label: 'INACTIVE', bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' },
};
const StatusBadge = ({ status = 'ACTIVE' }) => {
  const m = STATUS_META[status?.toUpperCase()] || STATUS_META.ACTIVE;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
};

const Avatar = ({ name = '' }) => (
  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center flex-shrink-0">
    <span className="text-white font-bold text-sm">{name?.[0]?.toUpperCase() || 'V'}</span>
  </div>
);

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl p-5 shadow-sm border border-white/10" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

// ─── Document Viewer Dialog ───────────────────────────────────────────────────
const DocumentViewerDialog = ({ vendor, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const containerRef = useRef(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const printRef = useRef();


  const getDocName = (doc) => {
    if (!doc) return '';
    const nameKey = doc.key + 'Name'; // e.g. gstDocumentName
    return vendor[nameKey] || vendor[doc.key] || doc.label;
  };

  const docs = [
    { label: 'GST Certificate',    key: 'gstDocument',       icon: FileText },
    { label: 'PAN Card',           key: 'panDocument',        icon: CreditCard },
    { label: 'Address Proof',      key: 'addressProof',       icon: MapPin },
    { label: 'Agreement Document', key: 'agreementDocument',  icon: FileText },
  ].filter(d => vendor[d.key]);

  useEffect(() => {
    if (docs.length > 0 && !activeDoc) setActiveDoc(docs[0]);
  }, []);

  useEffect(() => { setZoom(1); setOffset({ x: 0, y: 0 }); }, [activeDoc]);

  const handleZoomIn  = () => setZoom(z => Math.min(z + 0.25, 5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
  const handleReset   = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  const onMouseDown = (e) => { setDragging(true); dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }; };
  const onMouseMove = (e) => { if (!dragging || !dragStart.current) return; setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }); };
  const onMouseUp   = () => { setDragging(false); dragStart.current = null; };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); setZoom(z => Math.min(Math.max(z - e.deltaY * 0.001, 0.25), 5)); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeDoc]);

  const docUrl  = activeDoc ? getDocUrl(vendor[activeDoc.key]) : null;
  const docName = activeDoc ? getDocName(activeDoc) : '';
  const rawVal  = activeDoc ? (vendor[activeDoc.key] || '') : '';
  const isImage = docUrl && (docUrl.startsWith('data:image') || /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(rawVal));
  const isPdf   = docUrl && (docUrl.startsWith('data:application/pdf') || /\.pdf$/i.test(rawVal));
  const isOffice = /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(rawVal);
  const isText   = /\.(txt|csv|json|xml)$/i.test(rawVal);

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    if (isImage) {
      w.document.write(`<html><body style="margin:0;display:flex;justify-content:center;"><img src="${docUrl}" style="max-width:100%;" onload="window.print();window.close();" /></body></html>`);
    } else {
      w.document.write(`<html><body style="margin:0;"><embed src="${docUrl}" width="100%" height="100%" type="application/pdf" /></body></html>`);
      w.setTimeout(() => { w.print(); }, 1500);
    }
    w.document.close();
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = docUrl;
    a.download = docName;
    a.target = '_blank';
    a.click();
  };

  const handleSaveToComputer = () => {
    const a = document.createElement('a');
    a.href = docUrl;
    a.download = `${vendor.companyName}_${activeDoc.label}_${docName}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FolderOpen size={18} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Documents — {vendor.companyName}</h2>
              <p className="text-xs text-gray-400">{docs.length} document{docs.length !== 1 ? 's' : ''} uploaded</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — doc list */}
          <div className="w-52 flex-shrink-0 border-r border-white/10 bg-white/5 overflow-y-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">Files</p>
            {docs.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400">No documents uploaded.</p>
            ) : (
              docs.map(doc => {
                const DocIcon = doc.icon;
                const isActive = activeDoc?.key === doc.key;
                return (
                  <button key={doc.key} onClick={() => { setActiveDoc(doc); setZoom(1); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-purple-500 text-white' : 'text-purple-300 hover:bg-white/10'}`}>
                    <DocIcon size={14} className="flex-shrink-0" />
                    <span className="text-xs font-semibold leading-tight">{doc.label}</span>
                  </button>
                );
              })
            )}
            {/* Not uploaded docs */}
            {[
              { label: 'GST Certificate', key: 'gstDocument' },
              { label: 'PAN Card', key: 'panDocument' },
              { label: 'Address Proof', key: 'addressProof' },
              { label: 'Agreement Document', key: 'agreementDocument' },
            ].filter(d => !vendor[d.key]).map(doc => (
              <div key={doc.key} className="flex items-center gap-3 px-4 py-3 opacity-40">
                <FileText size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 leading-tight">{doc.label}<br /><em className="text-[10px]">Not uploaded</em></span>
              </div>
            ))}
          </div>

          {/* Main viewer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#140f2d]/80 flex-shrink-0 flex-wrap">
              <button onClick={handleZoomOut} disabled={zoom <= 0.25}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 disabled:opacity-30" title="Zoom Out">
                <ZoomOut size={15} />
              </button>
              <span className="text-xs font-bold text-purple-300 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} disabled={zoom >= 5}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 disabled:opacity-30" title="Zoom In">
                <ZoomIn size={15} />
              </button>
              <button onClick={handleReset}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10" title="Reset">
                ↺
              </button>
              <div className="w-px h-6 bg-purple-500/10 mx-1" />
              <button onClick={handlePrint} disabled={!activeDoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-purple-300 hover:bg-white/10 disabled:opacity-30" title="Print">
                <Printer size={13} /> Print
              </button>
              <button onClick={handleDownload} disabled={!activeDoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-purple-300 hover:bg-white/10 disabled:opacity-30" title="Download">
                <Download size={13} /> Download
              </button>
              <button onClick={handleSaveToComputer} disabled={!activeDoc}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-purple-300 hover:bg-white/10 disabled:opacity-30" title="Save to Computer">
                <HardDrive size={13} /> Save
              </button>
              {activeDoc && (
                <span className="ml-auto text-xs text-gray-400 font-medium truncate max-w-[160px]">{docName}</span>
              )}
            </div>

            {/* Document display — zoom + pan for all types */}
            <div
              ref={containerRef}
              className="flex-1 overflow-hidden bg-white/5 flex items-start justify-center p-4"
              style={{ cursor: dragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default') }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            >
              {!activeDoc ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FolderOpen size={48} className="text-blue-200 mb-3" />
                  <p className="text-gray-400 text-sm font-medium">No documents available</p>
                </div>
              ) : isImage ? (
                <img
                  src={docUrl} alt={activeDoc.label} draggable={false}
                  style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: 'top center', transition: dragging ? 'none' : 'transform 0.15s ease', userSelect: 'none' }}
                  className="max-w-full rounded-xl shadow-lg"
                />
              ) : isPdf ? (
                <div style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: 'top center', transition: dragging ? 'none' : 'transform 0.15s ease', width: '100%', userSelect: 'none' }}>
                  <iframe
                    src={`${docUrl}#toolbar=0`}
                    className="w-full rounded-xl shadow-lg bg-[#140f2d]/80"
                    style={{ height: '70vh', border: 'none', pointerEvents: dragging ? 'none' : 'auto' }}
                    title={activeDoc.label}
                  />
                  <div className="mt-3 flex justify-center">
                    <a href={docUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-white/10">
                      <Eye size={13} /> Open in new tab
                    </a>
                  </div>
                </div>
              ) : (isOffice || !isPdf) ? (
                <div style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: 'top center', transition: dragging ? 'none' : 'transform 0.15s ease', userSelect: 'none' }}
                  className="flex flex-col items-center justify-center bg-[#140f2d]/80 rounded-2xl p-10 shadow-lg">
                  <FileText size={48} className="text-purple-300 opacity-40 mb-3" />
                  <p className="text-white font-bold text-sm mb-1">{docName}</p>
                  <p className="text-gray-400 text-xs mb-5">This file type cannot be previewed in the browser.</p>
                  <a href={docUrl} download={docName}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#ffffff)' }}>
                    <Download size={14} /> Download to View
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── EditField ────────────────────────────────────────────────────────────────
const EditField = ({ label, field, icon: Icon, type = 'text', editForm, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input
        type={type} value={editForm[field] || ''}
        onChange={(e) => onChange(field, e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all`}
      />
    </div>
  </div>
);

// ─── VendorDetailModal ────────────────────────────────────────────────────────
const VendorDetailModal = ({ vendor, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [editForm, setEditForm] = useState({
    vendorName: vendor.vendorName || '', companyName: vendor.companyName || '',
    mobileNumber: vendor.mobileNumber || '', alternatePhone: vendor.alternatePhone || '',
    email: vendor.email || '', website: vendor.website || '',
    addressLine1: vendor.addressLine1 || '', addressLine2: vendor.addressLine2 || '',
    city: vendor.city || '', state: vendor.state || '', country: vendor.country || '', pincode: vendor.pincode || '',
    bankName: vendor.bankName || '', accountHolderName: vendor.accountHolderName || '',
    accountNumber: vendor.accountNumber || '', ifscCode: vendor.ifscCode || '',
    status: vendor.status || 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (field, value) => setEditForm(prev => ({ ...prev, [field]: value }));

  // const handleSave = async () => {
  //   setSaving(true);
  //   try {
  //     const formData = new FormData();
  //     Object.entries(editForm).forEach(([key, val]) => {
  //       if (val !== '' && val !== null && val !== undefined) formData.append(key, val);
  //     });
  //     const res = await fetch(`${BASE_URL}/vendors/update-vendor/${vendor.id}`, { method: 'PUT', body: formData });
  //     if (!res.ok) throw new Error('Update failed');
  //     const updated = await res.json();
  //     onUpdate(updated);
  //     setIsEditing(false);
  //   } catch (err) {
  //     alert('Failed to update vendor: ' + err.message);
  //   } finally { setSaving(false); }
  // };

  const [files, setFiles] = useState({
  gst: null,
  pan: null,
  addressProof: null,
  agreement: null
});

const handleSave = async () => {
  setSaving(true);
  try {
    const updated = await updateVendor(
      vendor.id,
      editForm,
      files
    );

    onUpdate(updated);
    setIsEditing(false);

  } catch (err) {
    alert(err?.response?.data?.message || "Update failed");
  } finally {
    setSaving(false);
  }
};

  const DetailRow = ({ icon: Icon, label, value }) =>
    value ? (
      <div className="flex items-start gap-3 py-2.5 border-b border-white/10 last:border-0">
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={13} className="text-purple-300" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">{label}</p>
          <p className="text-sm text-white font-semibold mt-0.5">{value}</p>
        </div>
      </div>
    ) : null;

  const SectionHeading = ({ title }) => (
    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mt-5 mb-3 pb-1 border-b border-white/10">{title}</h4>
  );

  const uploadedDocCount = ['gstDocument', 'panDocument', 'addressProof', 'agreementDocument'].filter(k => vendor[k]).length;

  if (showDocViewer) return <DocumentViewerDialog vendor={vendor} onClose={() => setShowDocViewer(false)} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#140f2d]/80 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-7 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-gray-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{vendor.companyName?.[0]?.toUpperCase() || 'V'}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{vendor.companyName}</h2>
              <p className="text-sm text-purple-300">{vendor.vendorName}</p>
              {vendor.vendorCode && <p className="text-xs text-gray-400 font-mono mt-0.5">{vendor.vendorCode}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 disabled:opacity-60">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10"><X size={16} /></button>
          </div>
        </div>

        <div className="overflow-y-auto px-7 py-5 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge status={vendor.status || 'ACTIVE'} />
            {vendor.createdAt && (
              <span className="text-xs text-gray-400">Registered {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            )}
          </div>

          {!isEditing && (
            <>
              <SectionHeading title="Basic Information" />
              <DetailRow icon={User} label="Vendor Name" value={vendor.vendorName} />
              <DetailRow icon={Building2} label="Company Name" value={vendor.companyName} />
              <DetailRow icon={Tag} label="Category" value={vendor.categoryName} />
              <SectionHeading title="Contact Details" />
              <DetailRow icon={Phone} label="Mobile" value={vendor.mobileNumber} />
              <DetailRow icon={Phone} label="Alternate Phone" value={vendor.alternatePhone} />
              <DetailRow icon={Mail} label="Email" value={vendor.email} />
              <DetailRow icon={Globe} label="Website" value={vendor.website} />
              <SectionHeading title="Address" />
              <DetailRow icon={MapPin} label="Address Line 1" value={vendor.addressLine1} />
              <DetailRow icon={MapPin} label="Address Line 2" value={vendor.addressLine2} />
              <DetailRow icon={MapPin} label="City" value={vendor.city} />
              <DetailRow icon={MapPin} label="State" value={vendor.state} />
              <DetailRow icon={MapPin} label="Country" value={vendor.country} />
              <DetailRow icon={MapPin} label="Pincode" value={vendor.pincode} />
              <SectionHeading title="Financial Details" />
              <DetailRow icon={Landmark} label="Bank Name" value={vendor.bankName} />
              <DetailRow icon={User} label="Account Holder" value={vendor.accountHolderName} />
              <DetailRow icon={CreditCard} label="Account Number" value={vendor.accountNumber} />
              <DetailRow icon={FileText} label="IFSC Code" value={vendor.ifscCode} />
              <SectionHeading title="Documents" />
              <div className="flex flex-col gap-2 mb-4">
                {[
                  { label: 'GST Certificate',    key: 'gstDocument' },
                  { label: 'PAN Card',            key: 'panDocument' },
                  { label: 'Address Proof',       key: 'addressProof' },
                  { label: 'Agreement Document',  key: 'agreementDocument' },
                ].map(({ label, key }) =>
                  vendor[key] ? (
                    <div key={key} className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 border border-white/10">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-purple-300" />
                        <span className="text-xs font-semibold text-purple-300">{label}</span>
                      </div>
                      <a href={getDocUrl(vendor[key])} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-purple-300 hover:text-[#ffffff] underline underline-offset-2">View</a>
                    </div>
                  ) : (
                    <div key={key} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-gray-300" />
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                      <span className="text-xs text-gray-300">Not uploaded</span>
                    </div>
                  )
                )}
              </div>
              {uploadedDocCount > 0 && (
                <button onClick={() => setShowDocViewer(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(255,255,255,0.10)] transition-colors border border-white/10">
                  <Eye size={15} /> View All Documents ({uploadedDocCount})
                </button>
              )}
            </>
          )}

          {isEditing && (
            <>
              <SectionHeading title="Basic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <EditField label="Vendor Name" field="vendorName" icon={User} editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Company Name" field="companyName" icon={Building2} editForm={editForm} onChange={handleFieldChange} />
              </div>
              <SectionHeading title="Contact Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <EditField label="Mobile" field="mobileNumber" icon={Phone} type="tel" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Alternate Phone" field="alternatePhone" icon={Phone} type="tel" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Email" field="email" icon={Mail} type="email" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Website" field="website" icon={Globe} type="url" editForm={editForm} onChange={handleFieldChange} />
              </div>
              <SectionHeading title="Address" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <EditField label="Address Line 1" field="addressLine1" icon={MapPin} editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Address Line 2" field="addressLine2" icon={MapPin} editForm={editForm} onChange={handleFieldChange} />
                <EditField label="City" field="city" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="State" field="state" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Country" field="country" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Pincode" field="pincode" editForm={editForm} onChange={handleFieldChange} />
              </div>
              <SectionHeading title="Financial Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EditField label="Bank Name" field="bankName" icon={Landmark} editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Account Holder Name" field="accountHolderName" icon={User} editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Account Number" field="accountNumber" icon={CreditCard} type="number" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="IFSC Code" field="ifscCode" icon={FileText} editForm={editForm} onChange={handleFieldChange} />
              </div>
              <SectionHeading title="Upload Documents" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <input type="file" onChange={(e) => setFiles(p => ({ ...p, gst: e.target.files[0] }))} />
                  <input type="file" onChange={(e) => setFiles(p => ({ ...p, pan: e.target.files[0] }))} />
                  <input type="file" onChange={(e) => setFiles(p => ({ ...p, addressProof: e.target.files[0] }))} />
                  <input type="file" onChange={(e) => setFiles(p => ({ ...p, agreement: e.target.files[0] }))} />
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── VendorRow ────────────────────────────────────────────────────────────────
const VendorRow = ({ vendor, onView, onDocsView }) => (
  <div className="bg-[#140f2d]/80 border-b border-white/10 hover:bg-white/10 transition-all duration-150 group flex items-center gap-3 px-5 py-4">
    <Avatar name={vendor.companyName || vendor.vendorName} />

    {/* Company + vendor name */}
    <div className="w-44 flex-shrink-0">
      <p className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors leading-tight truncate">{vendor.companyName}</p>
      <p className="text-xs text-gray-400 truncate">{vendor.vendorName}</p>
    </div>

    {/* Category */}
    <div className="hidden sm:block w-28 flex-shrink-0">
      {vendor.categoryName
        ? <span className="text-xs bg-purple-500/10 text-purple-300 px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap">{vendor.categoryName || '—'}</span>
        : <span className="text-xs text-gray-300">—</span>}
    </div>

    {/* Phone */}
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-purple-300 w-36 flex-shrink-0">
      <Phone size={11} className="text-gray-400 flex-shrink-0" />
      <span className="truncate">{vendor.mobileNumber || '—'}</span>
    </div>

    {/* Email */}
    <div className="hidden md:flex items-center gap-1.5 text-xs text-purple-300 w-48 overflow-hidden">
      <Mail size={11} className="text-gray-400 flex-shrink-0" />
      <span className="truncate">{vendor.email || '—'}</span>
    </div>

    {/* City/State */}
    <div className="hidden lg:flex items-center gap-1.5 text-xs text-purple-300 w-48 overflow-hidden">
      <MapPin size={11} className="text-gray-400 flex-shrink-0" />
      <span className="truncate">{[vendor.city, vendor.state].filter(Boolean).join(', ') || '—'}</span>
    </div>

    {/* Vendor Code */}
    <div className="hidden xl:block text-xs text-gray-400 font-mono flex-shrink-0 w-24 truncate">
      {vendor.vendorCode || '—'}
    </div>

    {/* Status */}
    <div className="flex-shrink-0">
      <StatusBadge status={vendor.status || 'ACTIVE'} />
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
      {/* Eye — open doc viewer */}
      <button
        onClick={e => { e.stopPropagation(); onDocsView(vendor); }}
        className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors"
        title="View Documents"
      >
        <Eye size={14} />
      </button>
      {/* Details */}
      <button
        onClick={e => { e.stopPropagation(); onView(vendor); }}
        className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors"
        title="View Details"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
      <Users size={36} className="text-purple-300" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No Vendors Yet</h3>
    <p className="text-sm text-purple-300 mb-6 max-w-xs">Start by adding your first vendor. All registered vendors will appear here.</p>
    <button onClick={onAdd} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md">
      <Plus size={16} /> Add New Vendor
    </button>
  </div>
);

// ─── VendorList ───────────────────────────────────────────────────────────────
const VendorList = ({ context }) => {
  const navigate = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const sectionBase = context?.sectionBase || '/dashboard/vendor/vendors';
  const addPath     = context?.addPath     || '/dashboard/vendor/vendors/add';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [docViewVendor, setDocViewVendor] = useState(null);

 const normalizeVendor = (v) => ({
  ...v,

  // ✅ category
  categoryName:
    v.category?.name ||
    v.categoryName ||
    v.category ||
    "",

  // ✅ phone mapping
  mobileNumber: v.phone || "",

  // ✅ location mapping
  city: v.billingAddress || "",

  // optional split if needed later
  state: "",

  status: v.status || "ACTIVE",
});

  // const loadVendors = () => {
  //   setLoading(true);
  //   fetch(`${BASE_URL}/vendors/get-all-vendors`)
  //     .then(r => r.json())
  //     .then(data => {
  //       const list = Array.isArray(data) ? data.map(normalizeVendor) : [];
  //       // If backend returns empty, use dummy data
  //       setVendors(list.length > 0 ? list : DUMMY_VENDORS);
  //     })
  //     .catch(() => setVendors(DUMMY_VENDORS))
  //     .finally(() => setLoading(false));
  // };

  const loadVendors = async () => {
  setLoading(true);
  try {
    const data = await getAllVendors();

    const list = Array.isArray(data)
      ? data.map(normalizeVendor)
      : [];

    setVendors(list); // ❌ no dummy fallback
  } catch (error) {
    console.error("Error fetching vendors:", error);
    setVendors([]); // backend only
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { loadVendors(); }, []);

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchSearch =
      v.vendorName?.toLowerCase().includes(q) ||
      v.companyName?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.mobileNumber?.includes(q);
    const matchStatus = filterStatus === 'ALL' || (v.status || 'ACTIVE').toUpperCase() === filterStatus.toUpperCase();
    const matchCategory = filterCategory === 'ALL' || (v.categoryName || '').toLowerCase() === filterCategory.toLowerCase();
    return matchSearch && matchStatus && matchCategory;
  });

  const handleUpdate = (updatedVendor) => {
    const normalized = normalizeVendor(updatedVendor);
    setVendors(prev => prev.map(v => v.id === normalized.id ? normalized : v));
    setSelectedVendor(normalized);
  };

  const stats = [
    { label: 'Total Vendors', value: vendors.length,                                                   color: '#8b5cf6', icon: Users       },
    { label: 'Active',        value: vendors.filter(v => (v.status?.toUpperCase()) === 'ACTIVE').length,  color: '#10b981', icon: CheckCircle },
    { label: 'Inactive',      value: vendors.filter(v => v.status === 'INACTIVE').length,              color: '#94a3b8', icon: X           },
  ];

  const allCategories = [...new Set(vendors.map(v => v.categoryName).filter(Boolean))];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300">{moduleLabel}</button>
        <span>/</span>
        <button onClick={() => navigate(sectionBase)} className="hover:text-purple-300">Vendors</button>
        <span>/</span>
        <span className="text-white font-semibold">Vendor List</span>
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Vendor List</h1>
            <p className="text-sm text-purple-300 mt-0.5">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
        <button onClick={() => navigate(addPath)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md">
          <Plus size={15} /> Add Vendor
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500" />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="pl-8 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none cursor-pointer">
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div className="relative">
          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="pl-8 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none cursor-pointer">
            <option value="ALL">All Categories</option>
            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <EmptyState onAdd={() => navigate(addPath)} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">No vendors match your search.</p>
      ) : (
        <>
          {/* Column headers */}
          <div className="flex items-center gap-3 px-5 py-2.5 mb-1 bg-purple-500/10 rounded-xl border border-white/10">
            <div className="w-9 flex-shrink-0" />
            <div className="w-44 flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Vendor</div>
            <div className="hidden sm:block w-28 flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Category</div>
            <div className="hidden sm:block w-36 flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Phone</div>
            <div className="hidden md:block flex-1 min-w-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Email</div>
            <div className="hidden lg:block w-36 flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Location</div>
            <div className="hidden xl:block w-24 flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Code</div>
            <div className="flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Status</div>
            <div className="ml-2 flex-shrink-0 text-xs font-bold text-purple-300 uppercase tracking-wide">Actions</div>
          </div>
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)]">
            {filtered.map(vendor => (
              <VendorRow
                key={vendor.id}
                vendor={vendor}
                onView={v => navigate(`${sectionBase}/${v.id}`)}
                onDocsView={v => setDocViewVendor(v)}
              />
            ))}
          </div>
        </>
      )}

      {selectedVendor && (
        <VendorDetailModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onUpdate={handleUpdate} />
      )}
      {docViewVendor && (
        <DocumentViewerDialog vendor={docViewVendor} onClose={() => setDocViewVendor(null)} />
      )}
    </div>
  );
};

export default VendorList;