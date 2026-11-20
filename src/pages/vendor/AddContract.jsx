import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Users, DollarSign, Calendar,
  ArrowLeft, Save, X, CheckCircle, ChevronDown, Tag,
  AlignLeft, Phone, User, Banknote, Clock, ScrollText, Upload
} from 'lucide-react';

import { createContract } from "../../services/vendor/contract.services";
import { getAllVendors } from "../../services/vendor/vendor.services";

const InputField = ({ label, placeholder, value, onChange, type = 'text', icon: Icon }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={15} />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full rounded-xl border border-white/10 bg-[#140f2d]/80
          ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-3
          text-sm text-gray-300 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
          transition-all duration-200
        `}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options, icon: Icon }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon size={15} />
        </span>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full rounded-xl border border-white/10 bg-[#140f2d]/80 appearance-none
          ${Icon ? 'pl-9' : 'pl-4'} pr-9 py-3
          text-sm text-gray-300
          focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
          transition-all duration-200
        `}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const TextAreaField = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
        {label}
      </label>
    )}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 px-4 py-3
        text-sm text-gray-300 placeholder-gray-400 resize-none
        focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500
        transition-all duration-200"
    />
  </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
        <Icon size={16} className="text-purple-300" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// Values match backend ContractType enum exactly
const CONTRACT_TYPES = [
  { value: '', label: 'Select Type' },
  { value: 'service',     label: 'Service Agreement' },
  { value: 'supply',      label: 'Supply Agreement' },
  { value: 'nda',         label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'mou',         label: 'Memorandum of Understanding (MOU)' },
  { value: 'lease',       label: 'Lease Agreement' },
  { value: 'purchase',    label: 'Purchase Agreement' },
  { value: 'maintenance', label: 'Maintenance Contract' },
  { value: 'consulting',  label: 'Consulting Agreement' },
  { value: 'other',       label: 'Other' },
];

// Values match backend Currency enum exactly
const CURRENCIES = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
];

// Values match backend PaymentTerms enum exactly
const PAYMENT_TERMS_OPTIONS = [
  { value: 'onetime',    label: 'One-Time' },
  { value: 'weekly',     label: 'Weekly' },
  { value: 'monthly',    label: 'Monthly' },
  { value: 'quarterly',  label: 'Quarterly' },
  { value: 'halfyearly', label: 'Half-Yearly' },
  { value: 'annually',   label: 'Annually' },
  { value: 'milestone',  label: 'Milestone-Based' },
];

// Values match backend ContractStatus enum exactly
const CONTRACT_STATUS = [
  { value: 'draft',      label: 'Draft' },
  { value: 'active',     label: 'Active' },
  { value: 'pending',    label: 'Pending Approval' },
  { value: 'expired',    label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
];

const AddContract = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill || {};

  // Load vendors from backend API
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    getAllVendors()
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]));
  }, []);

  // Multiple document upload
  const [documents, setDocuments] = useState([]);
  const handleDocumentAdd = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prev => [...prev, ...files]);
    e.target.value = '';
  };
  const handleDocumentRemove = (idx) => setDocuments(prev => prev.filter((_, i) => i !== idx));

  const [form, setForm] = useState({
    contractName: '',
    vendorId: '',
    contractType: '',
    status: 'draft',
    description: '',
    partyOneName: '',
    partyTwoName: '',
    contractValue: '',
    currency: 'INR',
    paymentTerms: 'monthly',
    startDate: '',
    endDate: '',
    contractDocument: '',
  });

  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      setForm((prev) => ({ ...prev, ...prefill }));
    }
  }, []); // eslint-disable-line

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // const handleSave = () => {
  //   if (!form.contractName.trim()) {
  //     setError('Contract Name is required.');
  //     return;
  //   }
  //   if (!form.contractType) {
  //     setError('Please select a Contract Type.');
  //     return;
  //   }
  //   if (!form.vendorId) {
  //     setError('Please select a Vendor.');
  //     return;
  //   }
  //   setError('');
  //   setSaving(true);

  //   try {
  //     const existing = JSON.parse(localStorage.getItem('srivaari_contracts') || '[]');
  //     const selectedVendor = vendors.find((v) => String(v.id) === String(form.vendorId));
  //     const newContract = {
  //       id: Date.now(),
  //       contractId: Date.now(),
  //       ...form,
  //       vendorId: Number(form.vendorId),
  //       contractValue: form.contractValue ? Number(form.contractValue) : null,
  //       vendorName: selectedVendor ? selectedVendor.vendorName : '',
  //       createdAt: new Date().toISOString(),
  //     };
  //     existing.push(newContract);
  //     localStorage.setItem('srivaari_contracts', JSON.stringify(existing));
  //     navigate('/dashboard/vendor/contracts/list');
  //   } catch {
  //     setError('Failed to save contract. Please try again.');
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
  if (!form.contractName.trim()) {
    setError("Contract Name is required.");
    return;
  }

  if (!form.contractType) {
    setError("Please select a Contract Type.");
    return;
  }

  if (!form.vendorId) {
    setError("Please select a Vendor.");
    return;
  }

  setError("");
  setSaving(true);

  try {
    const payload = {
      contractName: form.contractName,
      vendorId: Number(form.vendorId),
      contractType: form.contractType,
      status: form.status,
      description: form.description,
      partyOneName: form.partyOneName,
      partyTwoName: form.partyTwoName,
      contractValue: form.contractValue
        ? Number(form.contractValue)
        : null,
      currency: form.currency,
      paymentTerms: form.paymentTerms,
      startDate: form.startDate,
      endDate: form.endDate,
      contractDocument: documents.length > 0
        ? documents.map((file) => file.name).join(", ")
        : "",
    };

    await createContract(payload);

    navigate("/dashboard/vendor/contracts/list");
  } catch (error) {
    console.error("Save Contract Error:", error);

    setError(
      error?.response?.data?.message ||
      "Failed to save contract. Please try again."
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate('/dashboard/vendor')} className="hover:text-purple-300">
          Vendor Management
        </button>
        <span>/</span>
        <button onClick={() => navigate('/dashboard/vendor/contracts')} className="hover:text-purple-300">
          Contracts
        </button>
        <span>/</span>
        <span className="text-white font-semibold">Add New Contract</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Contract</h1>
            <p className="text-sm text-purple-300 mt-0.5">Fill in the details to create a new vendor contract</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={15} />
            }
            {saving ? 'Saving...' : 'Save Contract'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">

        <SectionCard title="Contract Details" icon={FileText}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Contract Name"
                placeholder="e.g. Annual Supply Agreement 2025"
                value={form.contractName}
                onChange={handleChange('contractName')}
                icon={Tag}
              />
              <SelectField
                label="Contract Type"
                value={form.contractType}
                onChange={handleChange('contractType')}
                options={CONTRACT_TYPES}
                icon={FileText}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vendor selector — shows vendorCode — vendorName format */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Vendor</label>
                <select
                  value={form.vendorId}
                  onChange={handleChange('vendorId')}
                  className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 pl-4 pr-9 py-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none"
                >
                  <option value="">-- Select Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendorCode} — {v.vendorName}
                    </option>
                  ))}
                </select>
              </div>
              <SelectField
                label="Contract Status"
                value={form.status}
                onChange={handleChange('status')}
                options={CONTRACT_STATUS}
                icon={CheckCircle}
              />
            </div>
            <TextAreaField
              label="Description"
              placeholder="Brief description of this contract..."
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
            />
          </div>
        </SectionCard>

        <SectionCard title="Parties Information" icon={Users}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Party 1 Name"
              placeholder="e.g. Sri Vaari Enterprises"
              value={form.partyOneName}
              onChange={handleChange('partyOneName')}
              icon={User}
            />
            <InputField
              label="Party 2 Name"
              placeholder="e.g. Rajan Traders Pvt. Ltd."
              value={form.partyTwoName}
              onChange={handleChange('partyTwoName')}
              icon={User}
            />
          </div>
        </SectionCard>

        <SectionCard title="Financial Details" icon={Banknote}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="Contract Value"
              placeholder="e.g. 500000"
              value={form.contractValue}
              onChange={handleChange('contractValue')}
              icon={DollarSign}
              type="number"
            />
            <SelectField
              label="Currency"
              value={form.currency}
              onChange={handleChange('currency')}
              options={CURRENCIES}
              icon={Banknote}
            />
            <SelectField
              label="Payment Terms"
              value={form.paymentTerms}
              onChange={handleChange('paymentTerms')}
              options={PAYMENT_TERMS_OPTIONS}
              icon={Clock}
            />
          </div>
        </SectionCard>

        <SectionCard title="Dates" icon={Calendar}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Start Date"
              value={form.startDate}
              onChange={handleChange('startDate')}
              icon={Calendar}
              type="date"
            />
            <InputField
              label="End Date"
              value={form.endDate}
              onChange={handleChange('endDate')}
              icon={Calendar}
              type="date"
            />
          </div>
        </SectionCard>

        {/* Documents Upload Section */}
        <SectionCard title="Documents" icon={FileText}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-2">
                Upload Documents (Multiple Allowed)
              </label>
              <label className="flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-dashed border-white/10 bg-white/5 cursor-pointer hover:border-[#8b5cf6] hover:bg-white/10 transition-all w-fit">
                <Upload size={16} className="text-purple-300" />
                <span className="text-sm text-purple-300 font-medium">Click to add documents</span>
                <input type="file" multiple onChange={handleDocumentAdd} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
              </label>
              <p className="text-xs text-gray-400 mt-1">Supported: PDF, DOC, DOCX, PNG, JPG</p>
            </div>

            {documents.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Added Documents ({documents.length})</p>
                {documents.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-500/10 border border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-purple-300 flex-shrink-0" />
                      <span className="text-sm text-white font-medium truncate">{file.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => handleDocumentRemove(idx)}
                      className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors flex-shrink-0 ml-2">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

      </div>

      <div className="mt-8 flex justify-end gap-3 pb-4">
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md disabled:opacity-60"
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Save size={15} />
          }
          {saving ? 'Saving...' : 'Save Contract'}
        </button>
      </div>
    </div>
  );
};

export default AddContract;