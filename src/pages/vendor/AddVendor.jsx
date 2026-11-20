import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Globe2,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

import { createVendor } from '../../services/account/accountVendor.services';
import { getAllVendorCategories } from '../../services/vendor/vendorCategories.services';

const VENDOR_TYPES = ['Supplier', 'Service Provider', 'Contractor', 'Consultant', 'Other'];
const VENDOR_STATUSES = ['Active', 'Inactive', 'Blacklisted'];
const PAYMENT_TERMS_LIST = ['Immediate', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90'];
const TDS_CATEGORIES = [
  '194A - Interest',
  '194C - Contractor',
  '194D - Insurance',
  '194H - Commission',
  '194I - Rent',
  '194J - Professional',
  '194Q - Purchase of Goods',
  'Not Applicable',
];

const STEPS = [
  { id: 'identity', label: 'Identity', caption: 'Vendor profile', icon: Building2 },
  { id: 'finance', label: 'Finance', caption: 'Tax & payment', icon: CircleDollarSign },
  { id: 'banking', label: 'Banking', caption: 'Settlement details', icon: Landmark },
  { id: 'documents', label: 'Documents', caption: 'Proof & notes', icon: FileCheck2 },
];

const initialForm = {
  vendorName: '',
  vendorCode: '',
  vendorType: 'Supplier',
  status: 'Active',
  category: '',
  companyName: '',
  contactPerson: '',
  phone: '',
  alternatePhone: '',
  email: '',
  gstin: '',
  pan: '',
  creditLimit: '',
  paymentTerms: 'Net 30',
  billingAddress: '',
  tdsCategory: 'Not Applicable',
  website: '',
  bankAccountNo: '',
  bankName: '',
  ifscCode: '',
  accountHolderName: '',
  notes: '',
  gstCertificate: null,
  panCard: null,
  addressProof: null,
  agreementDoc: null,
};

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 placeholder:text-gray-500 outline-none transition-all focus:border-violet-400 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/10';

const labelClass = 'mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400';

const Field = ({ label, required, icon: Icon, children, hint }) => (
  <label className="block">
    <span className={labelClass}>
      {Icon && <Icon size={13} className="text-violet-500" />}
      {label}
      {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1.5 block text-[11px] text-gray-400">{hint}</span>}
  </label>
);

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} className={inputClass}>
    {children}
  </select>
);

const FileUploadField = ({ label, file, onUpload, onRemove, description }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-slate-50/60 p-4 transition-all hover:border-violet-400 hover:bg-violet-50/40">
      <label className="flex cursor-pointer items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#140f2d]/80 text-violet-600 shadow-sm ring-1 ring-slate-200">
          {file ? <Check size={18} /> : <Upload size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-300">{file ? file.name : label}</p>
          <p className="mt-0.5 truncate text-[11px] text-gray-400">
            {file ? 'File selected' : description}
          </p>
        </div>
        {file && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-rose-500"
          >
            <X size={15} />
          </button>
        )}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={onUpload}
        />
      </label>
    </div>
  );
};

export default function AddVendor() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [vendorCategories, setVendorCategories] = useState([]);
  const [activeStep, setActiveStep] = useState('identity');
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllVendorCategories();
      const categories = Array.isArray(response) ? response : response?.data || [];
      setVendorCategories(categories);
    } catch (error) {
      console.error('Error fetching vendor categories:', error);
      setVendorCategories([]);
    }
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const completion = useMemo(() => {
    const fields = [
      form.vendorName,
      form.companyName,
      form.category,
      form.contactPerson,
      form.phone,
      form.email,
      form.gstin,
      form.pan,
      form.billingAddress,
      form.bankName,
      form.accountHolderName,
      form.bankAccountNo,
      form.ifscCode,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [form]);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');

    try {
      const parsedCreditLimit = parseFloat(form.creditLimit);
      const payload = {
        vendorName: form.vendorName,
        vendorCode: form.vendorCode,
        vendorType: form.vendorType,
        status: form.status,
        companyName: form.companyName,
        contactPerson: form.contactPerson,
        phone: form.phone,
        alternatePhone: form.alternatePhone,
        email: form.email,
        gstin: form.gstin,
        pan: form.pan,
        creditLimit: isNaN(parsedCreditLimit) ? '' : String(parsedCreditLimit),
        paymentTerms: form.paymentTerms,
        billingAddress: form.billingAddress,
        tdsCategory: form.tdsCategory,
        website: form.website,
        bankAccountNo: form.bankAccountNo,
        bankName: form.bankName,
        ifscCode: form.ifscCode,
        accountHolderName: form.accountHolderName,
        notes: form.notes,
        category: form.category,
      };

      // Add file fields separately — only if a file was actually selected
      if (form.gstCertificate) payload.gstFile = form.gstCertificate;
      if (form.panCard) payload.panFile = form.panCard;
      if (form.addressProof) payload.addressProofFile = form.addressProof;
      if (form.agreementDoc) payload.agreementFile = form.agreementDoc;

      await createVendor(payload);
      setMsg('Vendor saved successfully.');
      navigate('/dashboard/accounts/vendors/list');
    } catch (error) {
      console.error(error);
      setMsg('Unable to save vendor. Please check the details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const goToStep = (id) => {
    setActiveStep(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };



  return (
    <div className="min-h-full pb-28">
      {/* Page intro */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-gray-400">
            <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-violet-600">
              Accounts
            </button>
            <ChevronRight size={12} />
            <button onClick={() => navigate('/dashboard/accounts/vendors/list')} className="hover:text-violet-600">
              Vendors
            </button>
            <ChevronRight size={12} />
            <span className="text-gray-300">New vendor</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#140f2d]/80 text-gray-300 shadow-sm hover:border-violet-300 hover:text-violet-600"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Create vendor</h1>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-600">
                  AP Setup
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Build a complete vendor profile before the first purchase or payment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#140f2d]/80 px-4 py-3 shadow-sm">
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#eef2ff" strokeWidth="4" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${completion} 100`}
                pathLength="100"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-gray-300">
              {completion}%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Profile strength</p>
            <p className="text-sm font-bold text-gray-200">Ready to review</p>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            msg.includes('Unable')
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          <ShieldCheck size={18} />
          {msg}
        </div>
      )}

      {/* New visual step rail */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-[#140f2d]/80 p-2 shadow-sm lg:grid-cols-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const active = activeStep === step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(step.id)}
              className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                active
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                  : 'text-gray-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active ? 'bg-white/10 text-violet-300' : 'bg-violet-50 text-violet-600'
                }`}
              >
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black">{String(index + 1).padStart(2, '0')} / {step.label}</p>
                <p className={`mt-0.5 text-[10px] ${active ? 'text-white/50' : 'text-gray-400'}`}>
                  {step.caption}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="space-y-5">
          {/* Identity */}
          <section id="identity" className="scroll-mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[#140f2d]/80 shadow-sm">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-6 text-white">
              <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" />
              <div className="absolute bottom-0 left-1/2 h-24 w-56 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <Building2 size={22} className="text-violet-300" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">01 / Identity</p>
                  <h2 className="mt-1 text-lg font-black">Who is this vendor?</h2>
                  <p className="mt-1 text-xs text-white/50">Start with the information your team will see most often.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Vendor name" required icon={Building2}>
                <input className={inputClass} value={form.vendorName} onChange={(e) => setField('vendorName', e.target.value)} placeholder="e.g. Acme Industrial Supplies" />
              </Field>

              <Field label="Company name" icon={Building2}>
                <input className={inputClass} value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} placeholder="Registered company name" />
              </Field>

              <Field label="Vendor code" hint="Leave empty if your backend generates it.">
                <input className={inputClass} value={form.vendorCode} onChange={(e) => setField('vendorCode', e.target.value)} placeholder="VEN-001" />
              </Field>

              <Field label="Category">
                <Select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                  <option value="">Select category</option>
                  {vendorCategories.map((cat, index) => (
                    <option key={cat.id || index} value={cat.name || cat.categoryName || cat.category}>
                      {cat.name || cat.categoryName || cat.category}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Vendor type" required>
                <Select value={form.vendorType} onChange={(e) => setField('vendorType', e.target.value)}>
                  {VENDOR_TYPES.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>

              <Field label="Status">
                <Select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                  {VENDOR_STATUSES.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>

              <Field label="Contact person" icon={Users}>
                <input className={inputClass} value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} placeholder="Primary contact name" />
              </Field>

              <Field label="Phone" required icon={Phone}>
                <input className={inputClass} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </Field>

              <Field label="Alternate phone" icon={Phone}>
                <input className={inputClass} value={form.alternatePhone} onChange={(e) => setField('alternatePhone', e.target.value)} placeholder="Optional number" />
              </Field>

              <Field label="Email" icon={Mail}>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="vendor@company.com" />
              </Field>

              <Field label="Website" icon={Globe2}>
                <input className={inputClass} value={form.website} onChange={(e) => setField('website', e.target.value)} placeholder="https://vendor.com" />
              </Field>
            </div>
          </section>

          {/* Finance */}
          <section id="finance" className="scroll-mt-5 rounded-[28px] border border-white/10 bg-[#140f2d]/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CircleDollarSign size={21} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">02 / Finance</p>
                  <h2 className="mt-1 text-lg font-black text-white">Tax & payment profile</h2>
                </div>
              </div>
              <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-400 sm:block">India compliance</span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Field label="GSTIN">
                <input className={inputClass} value={form.gstin} onChange={(e) => setField('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" />
              </Field>

              <Field label="PAN">
                <input className={inputClass} value={form.pan} onChange={(e) => setField('pan', e.target.value)} placeholder="AAAAA0000A" />
              </Field>

              <Field label="Credit limit">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                  <input type="number" className={`${inputClass} pl-8`} value={form.creditLimit} onChange={(e) => setField('creditLimit', e.target.value)} placeholder="0.00" />
                </div>
              </Field>

              <Field label="Payment terms">
                <Select value={form.paymentTerms} onChange={(e) => setField('paymentTerms', e.target.value)}>
                  {PAYMENT_TERMS_LIST.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>

              <Field label="TDS category" >
                <Select value={form.tdsCategory} onChange={(e) => setField('tdsCategory', e.target.value)}>
                  {TDS_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>

              <div className="md:col-span-2 lg:col-span-3">
                <Field label="Billing address" icon={MapPin}>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-none`}
                    value={form.billingAddress}
                    onChange={(e) => setField('billingAddress', e.target.value)}
                    placeholder="Street, City, State, PIN"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Banking */}
          <section id="banking" className="scroll-mt-5 rounded-[28px] border border-white/10 bg-[#140f2d]/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Landmark size={21} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">03 / Banking</p>
                <h2 className="mt-1 text-lg font-black text-white">Settlement details</h2>
              </div>
            </div>

            <div className="mb-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Vendor settlement account</p>
                  <p className="mt-5 text-xl font-black tracking-wide">{form.bankName || 'Bank name'}</p>
                  <p className="mt-1 text-xs text-white/45">{form.accountHolderName || 'Account holder name'}</p>
                </div>
                <WalletCards size={25} className="text-violet-300" />
              </div>
              <div className="mt-7 flex flex-wrap gap-8">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35">Account</p>
                  <p className="mt-1 text-sm font-bold tracking-wider">{form.bankAccountNo || '•••• •••• ••••'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/35">IFSC</p>
                  <p className="mt-1 text-sm font-bold">{form.ifscCode || 'HDFC0001234'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank name">
                <input className={inputClass} value={form.bankName} onChange={(e) => setField('bankName', e.target.value)} placeholder="HDFC Bank" />
              </Field>
              <Field label="Account holder">
                <input className={inputClass} value={form.accountHolderName} onChange={(e) => setField('accountHolderName', e.target.value)} placeholder="Account holder name" />
              </Field>
              <Field label="Bank account number">
                <input className={inputClass} value={form.bankAccountNo} onChange={(e) => setField('bankAccountNo', e.target.value)} placeholder="Account number" />
              </Field>
              <Field label="IFSC code">
                <input className={inputClass} value={form.ifscCode} onChange={(e) => setField('ifscCode', e.target.value)} placeholder="HDFC0001234" />
              </Field>
            </div>
          </section>

          {/* Documents */}
          <section id="documents" className="scroll-mt-5 rounded-[28px] border border-white/10 bg-[#140f2d]/80 p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <FileText size={21} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">04 / Documents</p>
                <h2 className="mt-1 text-lg font-black text-white">Proof & internal notes</h2>
              </div>
            </div>

            <Field label="Internal notes">
              <textarea
                rows={4}
                className={`${inputClass} resize-none`}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Add anything your accounts, purchase or finance team should know..."
              />
            </Field>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black text-gray-200">Supporting documents</p>
                <span className="text-[10px] font-medium text-gray-400">PDF, JPG or PNG</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <FileUploadField label="GST Certificate" file={form.gstCertificate} onRemove={() => setField('gstCertificate', null)} onUpload={(e) => setField('gstCertificate', e.target.files?.[0] || null)} description="Upload GST registration proof" />
                <FileUploadField label="PAN Card" file={form.panCard} onRemove={() => setField('panCard', null)} onUpload={(e) => setField('panCard', e.target.files?.[0] || null)} description="Upload PAN document" />
                <FileUploadField label="Address Proof" file={form.addressProof} onRemove={() => setField('addressProof', null)} onUpload={(e) => setField('addressProof', e.target.files?.[0] || null)} description="Upload business address proof" />
                <FileUploadField label="Agreement Document" file={form.agreementDoc} onRemove={() => setField('agreementDoc', null)} onUpload={(e) => setField('agreementDoc', e.target.files?.[0] || null)} description="Upload signed agreement" />
              </div>
            </div>
          </section>
        </main>

        {/* Context rail */}
        <aside className="hidden xl:block">
          <div className="sticky top-5 space-y-4">
            <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-indigo-600 to-slate-950 p-5 text-white shadow-xl shadow-violet-900/15">
              <div className="mb-10 flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-100">New record</span>
                <Sparkles size={17} className="text-violet-200" />
              </div>
              <p className="text-xs text-white/50">Vendor workspace</p>
              <h3 className="mt-2 text-2xl font-black leading-tight">
                {form.vendorName || 'Your next vendor'}
              </h3>
              <p className="mt-2 text-xs leading-5 text-white/50">
                Complete the profile once and keep purchasing, accounting and compliance aligned.
              </p>

              <div className="mt-6 rounded-2xl bg-white/10 p-3">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-white/50">Profile completion</span>
                  <span>{completion}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-violet-300 transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#140f2d]/80 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Quick navigation</p>
              <div className="mt-4 space-y-1">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left ${
                        activeStep === step.id ? 'bg-violet-50 text-violet-700' : 'text-gray-400 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-xs font-bold">{step.label}</span>
                      <ArrowRight size={13} className="ml-auto opacity-40" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#140f2d]/80 text-emerald-600 shadow-sm">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-200">Before you save</p>
                  <p className="mt-1 text-[11px] leading-5 text-gray-400">
                    Verify GSTIN, PAN, bank account number and IFSC against the vendor documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-30 mt-8 rounded-2xl border border-white/10 bg-[#140f2d]/95 px-6 py-4 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden items-center gap-2 text-xs font-medium text-gray-400 sm:flex">
            <ShieldCheck size={16} className="text-emerald-500" />
            Your vendor data is ready for review.
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus size={15} />
              )}
              {saving ? 'Creating vendor...' : 'Create vendor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
