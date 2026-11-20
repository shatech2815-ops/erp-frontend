
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, UserPlus, Upload } from 'lucide-react';

import { createVendor } from "../../services/account/accountVendor.services";


import {getAllVendorCategories} from "../../services/vendor/vendorCategories.services";

// const BASE_URL = '/api/accounting';
const VENDOR_TYPES = ['Supplier','Service Provider','Contractor','Consultant','Other'];
const VENDOR_STATUSES = ['Active','Inactive','Blacklisted'];
const PAYMENT_TERMS_LIST = ['Immediate','Net 7','Net 15','Net 30','Net 45','Net 60','Net 90'];
const TDS_CATEGORIES = ['194A - Interest','194C - Contractor','194D - Insurance','194H - Commission','194I - Rent','194J - Professional','194Q - Purchase of Goods','Not Applicable'];

export default function AddAccountVendor() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [vendorCategories, setVendorCategories] = useState([]);
  const [form, setForm] = useState({
    vendorName: '', vendorCode: '', vendorType: 'Supplier', status: 'Active',
    category: '', companyName: '',
    contactPerson: '', phone: '', alternatePhone: '', email: '',
    gstin: '', pan: '', creditLimit: '', paymentTerms: 'Net 30',
    billingAddress: '', tdsCategory: 'Not Applicable', website: '',
    bankAccountNo: '', bankName: '', ifscCode: '', accountHolderName: '',
    notes: '',
    gstCertificate: null, panCard: null, addressProof: null, agreementDoc: null,
  });


  useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {
  try {
    const response = await getAllVendorCategories();

    const categories = Array.isArray(response)
      ? response
      : response?.data || [];

    setVendorCategories(categories);
  } catch (error) {
    console.error("Error fetching vendor categories:", error);
    setVendorCategories([]);
  }
};
  // useEffect(() => {
  //   fetch('/api/vendors/categories')
  //     .then(r => r.json())
  //     .then(data => setVendorCategories(Array.isArray(data) ? data : data.categories || []))
  //     .catch(() => setVendorCategories([]));
  // }, []);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // const handleSave = async () => {
  //   setSaving(true); setMsg('');
  //   try {
  //     const payload = { ...form, creditLimit: parseFloat(form.creditLimit) || null };
  //     const res = await fetch(`${BASE_URL}/vendors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  //     if (res.ok) { setMsg('Vendor saved!'); navigate('/dashboard/accounts/vendors/list'); }
  //     else { setMsg('Error saving vendor.'); }
  //   } catch { setMsg('Failed.'); } finally { setSaving(false); }
  // };

  const handleSave = async () => {
  setSaving(true);
  setMsg('');

  try {
   const payload = {
  vendorName: form.vendorName,
  vendorCode: form.vendorCode, // ✅ IMPORTANT
  vendorType: form.vendorType,
  status: form.status,

  contactPerson: form.contactPerson,
  phone: form.phone,
  alternatePhone: form.alternatePhone,
  email: form.email,

  gstin: form.gstin,
  pan: form.pan,
  creditLimit: parseFloat(form.creditLimit) || null,
  paymentTerms: form.paymentTerms,

  billingAddress: form.billingAddress,
  tdsCategory: form.tdsCategory,
  website: form.website,

  bankAccountNo: form.bankAccountNo,
  bankName: form.bankName,
  ifscCode: form.ifscCode,
  accountHolderName: form.accountHolderName,

  notes: form.notes,
  category: form.category, // (string → you map to entity later)

  // files (match DTO names)
  gstDocument: form.gstCertificate,
  panDocument: form.panCard,
  addressProof: form.addressProof,
  agreementDocument: form.agreementDoc,
};

    await createVendor(payload);   // ✅ backend integration

    setMsg('Vendor saved!');
    navigate('/dashboard/accounts/vendors/list');

  } catch (error) {
    setMsg('Error saving vendor.');
  } finally {
    setSaving(false);
  }
};

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5";

  const FileUploadField = ({ label, fieldKey, accept = ".pdf,.jpg,.png" }) => (
    <div>
      <label className={lbl}>{label}</label>
      <label className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-white/10 text-sm bg-white/5 cursor-pointer hover:border-[#d97706] hover:bg-[rgba(254,249,240,0.12)] transition-colors group">
        <Upload size={14} className="text-gray-400 group-hover:text-[#d97706] flex-shrink-0" />
        <span className="truncate text-gray-400 group-hover:text-[#d97706] text-xs">
          {form[fieldKey] ? form[fieldKey].name : `Upload ${label}`}
        </span>
        <input type="file" accept={accept} className="hidden"
          onChange={e => setField(fieldKey, e.target.files[0] || null)} />
      </label>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/accounts/vendors/list')} className="hover:text-amber-300">Vendor List</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Add Vendor</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}><UserPlus size={22} style={{ color: '#d97706' }} /></div>
        <div className="flex-1"><h2 className="text-xl font-bold text-white">Add Vendor</h2><p className="text-sm text-gray-400">Register a new vendor for accounts payable</p></div>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Error')||msg.includes('Failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      {/* Basic Info */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Vendor Name *</label><input value={form.vendorName} onChange={e => setField('vendorName', e.target.value)} className={inp} placeholder="Vendor / Company name" /></div>
          <div><label className={lbl}>Company Name</label><input value={form.companyName} onChange={e => setField('companyName', e.target.value)} className={inp} placeholder="Registered company name" /></div>
          <div><label className={lbl}>Vendor Code</label><input value={form.vendorCode} onChange={e => setField('vendorCode', e.target.value)} className={inp} placeholder="VEN-001 (auto)" /></div>
          <div>
            <label className={lbl}>Category</label>
            <select value={form.category} onChange={e => setField('category', e.target.value)} className={inp}>
              <option value="">Select Category</option>
              {vendorCategories.map((cat, i) => (
              <option key={cat.id || i} value={cat.name || cat.categoryName || cat.category}>
                {cat.name || cat.categoryName || cat.category}
              </option>
              ))}
            </select>
          </div>
          <div><label className={lbl}>Vendor Type *</label><select value={form.vendorType} onChange={e => setField('vendorType', e.target.value)} className={inp}>{VENDOR_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className={lbl}>Status</label><select value={form.status} onChange={e => setField('status', e.target.value)} className={inp}>{VENDOR_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label className={lbl}>Contact Person</label><input value={form.contactPerson} onChange={e => setField('contactPerson', e.target.value)} className={inp} placeholder="Primary contact name" /></div>
          <div><label className={lbl}>Phone *</label><input value={form.phone} onChange={e => setField('phone', e.target.value)} className={inp} placeholder="+91 XXXXX XXXXX" /></div>
          <div><label className={lbl}>Alternate Phone</label><input value={form.alternatePhone} onChange={e => setField('alternatePhone', e.target.value)} className={inp} placeholder="Alternate number" /></div>
          <div><label className={lbl}>Email</label><input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inp} placeholder="vendor@email.com" /></div>
          <div><label className={lbl}>Website</label><input value={form.website} onChange={e => setField('website', e.target.value)} className={inp} placeholder="www.vendor.com" /></div>
        </div>
      </div>

      {/* Tax & Financial */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Tax &amp; Financial Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>GSTIN</label><input value={form.gstin} onChange={e => setField('gstin', e.target.value)} className={inp} placeholder="22AAAAA0000A1Z5" /></div>
          <div><label className={lbl}>PAN</label><input value={form.pan} onChange={e => setField('pan', e.target.value)} className={inp} placeholder="AAAAA0000A" /></div>
          <div><label className={lbl}>Credit Limit (₹)</label><input type="number" value={form.creditLimit} onChange={e => setField('creditLimit', e.target.value)} className={inp} placeholder="0.00" /></div>
          <div><label className={lbl}>Payment Terms</label><select value={form.paymentTerms} onChange={e => setField('paymentTerms', e.target.value)} className={inp}>{PAYMENT_TERMS_LIST.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label className={lbl}>TDS Category</label><select value={form.tdsCategory} onChange={e => setField('tdsCategory', e.target.value)} className={inp}>{TDS_CATEGORIES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div className="sm:col-span-3"><label className={lbl}>Billing Address</label><textarea value={form.billingAddress} onChange={e => setField('billingAddress', e.target.value)} rows={2} className={inp + ' resize-none'} placeholder="Street, City, State, PIN" /></div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Bank Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className={lbl}>Bank Name</label><input value={form.bankName} onChange={e => setField('bankName', e.target.value)} className={inp} placeholder="HDFC Bank" /></div>
          <div><label className={lbl}>Account Holder Name</label><input value={form.accountHolderName} onChange={e => setField('accountHolderName', e.target.value)} className={inp} placeholder="Account holder name" /></div>
          <div><label className={lbl}>Bank Account No</label><input value={form.bankAccountNo} onChange={e => setField('bankAccountNo', e.target.value)} className={inp} placeholder="Account number" /></div>
          <div><label className={lbl}>IFSC Code</label><input value={form.ifscCode} onChange={e => setField('ifscCode', e.target.value)} className={inp} placeholder="HDFC0001234" /></div>
        </div>
      </div>

      {/* Notes & Documents */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Additional Info</h3>
        <div className="mb-4">
          <label className={lbl}>Notes</label>
          <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={3} className={inp + ' resize-none'} placeholder="Internal notes about this vendor" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-300 mb-3">Documents</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FileUploadField label="GST Certificate" fieldKey="gstCertificate" />
            <FileUploadField label="PAN Card" fieldKey="panCard" />
            <FileUploadField label="Address Proof" fieldKey="addressProof" />
            <FileUploadField label="Agreement Document" fieldKey="agreementDoc" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} Save Vendor
        </button>
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/10">Cancel</button>
      </div>
    </div>
  );
}