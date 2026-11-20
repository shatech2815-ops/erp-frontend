
// ─────────────────────────────────────────────────────────────────────────────
// ContractList.jsx — Connected to backend API
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, ArrowLeft, FileText, Users, Calendar,
  DollarSign, Edit2, Save, X, CheckCircle, ChevronRight,
  AlertCircle, Clock, Tag, Banknote, User, Phone,
  ScrollText, Shield, ChevronDown
} from 'lucide-react';

// const BASE_URL = '/api';
import {
  getAllContracts,
  updateContract,
} from "../../services/vendor/contract.services";

// ─── helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:    { label: 'Active',           bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  draft:     { label: 'Draft',            bg: 'bg-amber-500/10',   text: 'text-amber-400',  dot: 'bg-amber-400' },
  pending:   { label: 'Pending Approval', bg: 'bg-blue-500/10',    text: 'text-blue-400',   dot: 'bg-blue-400' },
  expired:   { label: 'Expired',          bg: 'bg-red-500/10',     text: 'text-red-400',    dot: 'bg-red-400' },
  terminated:{ label: 'Terminated',       bg: 'bg-white/5',   text: 'text-gray-400',   dot: 'bg-gray-400' },
};

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

const CURRENCIES = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
];

// ─── Values match backend PaymentTerms enum: onetime, weekly, monthly,
//     quarterly, halfyearly, annually, milestone ─────────────────────────────
const PAYMENT_TERMS_OPTIONS = [
  { value: 'onetime',    label: 'One-Time' },
  { value: 'weekly',     label: 'Weekly' },
  { value: 'monthly',    label: 'Monthly' },
  { value: 'quarterly',  label: 'Quarterly' },
  { value: 'halfyearly', label: 'Half-Yearly' },
  { value: 'annually',   label: 'Annually' },
  { value: 'milestone',  label: 'Milestone-Based' },
];

const CONTRACT_STATUS_OPTS = [
  { value: 'draft',      label: 'Draft' },
  { value: 'active',     label: 'Active' },
  { value: 'pending',    label: 'Pending Approval' },
  { value: 'expired',    label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
];

const formatDate = (val) => {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return val; }
};

const formatCurrency = (val, currency = 'INR') => {
  if (!val) return '—';
  return `${currency} ${Number(val).toLocaleString('en-IN')}`;
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── EditField / EditSelect ───────────────────────────────────────────────────
const EditField = ({ label, field, icon: Icon, type = 'text', editForm, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon size={13} /></span>}
      <input
        type={type}
        value={editForm[field] || ''}
        onChange={(e) => onChange(field, e.target.value)}
        className={`w-full rounded-xl border border-white/10 bg-[#140f2d]/80 ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all`}
      />
    </div>
  </div>
);

const EditSelect = ({ label, field, options, editForm, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <select
      value={editForm[field] || ''}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#140f2d]/80 pl-3 pr-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── ContractDetailModal ──────────────────────────────────────────────────────
const ContractDetailModal = ({ contract, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    contractName: contract.contractName || '',
    contractType: contract.contractType || '',
    status: contract.status || 'draft',
    description: contract.description || '',
    partyOneName: contract.partyOneName || '',
    partyTwoName: contract.partyTwoName || '',
    contractValue: contract.contractValue || '',
    currency: contract.currency || 'INR',
    paymentTerms: contract.paymentTerms || 'monthly',
    startDate: contract.startDate || '',
    endDate: contract.endDate || '',
  });
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (field, value) =>
    setEditForm((prev) => ({ ...prev, [field]: value }));

  // const handleSave = async () => {
  //   setSaving(true);
  //   try {
  //     const payload = {
  //       ...editForm,
  //       vendorId: contract.vendorId || null,
  //       contractValue: editForm.contractValue ? Number(editForm.contractValue) : null,
  //     };
  //     const res = await fetch(`${BASE_URL}/contracts/update-contract/${contract.id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });
  //     if (!res.ok) throw new Error('Update failed');
  //     const updated = await res.json();
  //     onUpdate(updated);
  //     setIsEditing(false);
  //   } catch (err) {
  //     alert('Failed to update: ' + err.message);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {

  setSaving(true);

  try {

    const payload = {
      ...editForm,
      vendorId: contract.vendorId || null,
      contractValue: editForm.contractValue
        ? Number(editForm.contractValue)
        : null,
    };

    const updated = await updateContract(
      contract.id,
      payload
    );

    onUpdate(updated);

    setIsEditing(false);

  } catch (err) {

    console.error(
      "Failed to update contract:",
      err
    );

    alert("Failed to update contract");

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

  const SH = ({ title }) => (
    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest mt-5 mb-3 pb-1 border-b border-white/10">{title}</h4>
  );

  const paymentLabel = PAYMENT_TERMS_OPTIONS.find(f => f.value === contract.paymentTerms)?.label || contract.paymentTerms;
  const typeLabel = CONTRACT_TYPES.find(t => t.value === contract.contractType)?.label || contract.contractType;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-transparent"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#140f2d] border-l border-white/10 shadow-[-12px_0_40px_rgba(0,0,0,0.6)] w-full max-w-xl md:max-w-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-7 py-5 bg-gradient-to-r from-purple-500/10 to-white/5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={18} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{contract.contractName}</h2>
              <p className="text-xs text-purple-300 capitalize">{typeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                <Edit2 size={14} /> Edit
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl border border-white/10 text-purple-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-60">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors"><X size={16} /></button>
          </div>
        </div>

        <div className="overflow-y-auto px-7 py-5 flex-1">
          <StatusBadge status={contract.status} />

          {!isEditing && (
            <>
              <SH title="Contract Details" />
              <DetailRow icon={Tag} label="Contract Name" value={contract.contractName} />
              <DetailRow icon={FileText} label="Type" value={typeLabel} />
              <DetailRow icon={ScrollText} label="Description" value={contract.description} />
              <SH title="Parties" />
              <DetailRow icon={User} label="Party 1" value={contract.partyOneName} />
              <DetailRow icon={User} label="Party 2" value={contract.partyTwoName} />
              <SH title="Financial" />
              <DetailRow icon={DollarSign} label="Contract Value" value={formatCurrency(contract.contractValue, contract.currency)} />
              <DetailRow icon={Clock} label="Payment Terms" value={paymentLabel} />
              <SH title="Dates" />
              <DetailRow icon={Calendar} label="Start Date" value={formatDate(contract.startDate)} />
              <DetailRow icon={Calendar} label="End Date" value={formatDate(contract.endDate)} />
              {/* Documents */}
{contract.contractDocuments?.length > 0 && (
  <>
    <SH title="Documents" />
    <div className="flex flex-col gap-2">
      {contract.contractDocuments.map((doc, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 border border-white/10">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-purple-300" />
            <span className="text-xs font-semibold text-purple-300">{doc.originalName || doc.fileName || `Document ${i+1}`}</span>
          </div>
          <a href={`/api/contracts/documents/${doc.fileName || doc}`} target="_blank" rel="noopener noreferrer"
            className="text-xs font-semibold text-purple-300 hover:underline">View</a>
        </div>
      ))}
    </div>
  </>
)}
            </>
          )}

          {isEditing && (
            <>
              <SH title="Contract Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <EditField label="Contract Name" field="contractName" icon={Tag} editForm={editForm} onChange={handleFieldChange} />
                <EditSelect label="Contract Type" field="contractType" options={CONTRACT_TYPES.filter(o => o.value)} editForm={editForm} onChange={handleFieldChange} />
                <EditSelect label="Status" field="status" options={CONTRACT_STATUS_OPTS} editForm={editForm} onChange={handleFieldChange} />
              </div>
              <div className="mb-2">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={2}
                  className="w-full mt-1 rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2.5 text-sm text-gray-300 focus:outline-none resize-none"
                />
              </div>
              <SH title="Parties" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <EditField label="Party 1 Name" field="partyOneName" icon={User} editForm={editForm} onChange={handleFieldChange} />
                <EditField label="Party 2 Name" field="partyTwoName" icon={User} editForm={editForm} onChange={handleFieldChange} />
              </div>
              <SH title="Financial" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                <EditField label="Contract Value" field="contractValue" icon={DollarSign} type="number" editForm={editForm} onChange={handleFieldChange} />
                <EditSelect label="Currency" field="currency" options={CURRENCIES} editForm={editForm} onChange={handleFieldChange} />
                <EditSelect label="Payment Terms" field="paymentTerms" options={PAYMENT_TERMS_OPTIONS} editForm={editForm} onChange={handleFieldChange} />
              </div>
              <SH title="Dates" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EditField label="Start Date" field="startDate" icon={Calendar} type="date" editForm={editForm} onChange={handleFieldChange} />
                <EditField label="End Date" field="endDate" icon={Calendar} type="date" editForm={editForm} onChange={handleFieldChange} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── ContractRow ──────────────────────────────────────────────────────────────
const ContractRow = ({ contract, isSelected, onClick }) => {
  const typeLabel = CONTRACT_TYPES.find(t => t.value === contract.contractType)?.label || contract.contractType;
  return (
    <div
      onClick={onClick}
      className={`border-b border-white/10 hover:bg-white/10 hover:shadow-sm transition-all duration-150 cursor-pointer group flex items-center gap-4 px-5 py-4 ${
        isSelected ? 'bg-purple-500/15 border-l-4 border-l-purple-500' : 'bg-[#140f2d]/80'
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-purple-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors truncate">{contract.contractName}</p>
        <p className="text-xs text-gray-400 truncate capitalize">{typeLabel}</p>
      </div>
      <div className="hidden md:block text-xs text-purple-300 w-32 flex-shrink-0">
        {[contract.partyOneName, contract.partyTwoName].filter(Boolean).join(' ↔ ') || '—'}
      </div>
      <div className="hidden sm:block text-xs text-purple-300 w-24 flex-shrink-0">
        {formatCurrency(contract.contractValue, contract.currency)}
      </div>
      <div className="hidden lg:block text-xs text-purple-300 w-24 flex-shrink-0">
        {formatDate(contract.endDate)}
      </div>
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <StatusBadge status={contract.status} />
        <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-300 transition-colors" />
      </div>
    </div>
  );
};

// ─── ContractList ─────────────────────────────────────────────────────────────
const ContractList = ({ context }) => {
  const navigate = useNavigate();
  const moduleBase  = context?.moduleBase  || '/dashboard/vendor';
  const addPath     = context?.addPath     || '/dashboard/vendor/contracts/add';
  const moduleLabel = context?.moduleLabel || 'Vendor Management';

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
const [filterStatus, setFilterStatus] = useState('');
const [filterType, setFilterType] = useState('');
const [filterDateFrom, setFilterDateFrom] = useState('');
const [filterDateTo, setFilterDateTo]     = useState('');
  const [selectedContract, setSelectedContract] = useState(null);

  // const loadContracts = () => {
  //   setLoading(true);
  //   fetch(`${BASE_URL}/contracts/get-all-contracts`)
  //     .then((r) => r.json())
  //     .then((data) => setContracts(Array.isArray(data) ? data : []))
  //     .catch(() => setContracts([]))
  //     .finally(() => setLoading(false));
  // };

  const loadContracts = async () => {

  try {

    setLoading(true);

    const data = await getAllContracts();

    console.log("Contracts:", data);

    setContracts(
      Array.isArray(data)
        ? data
        : []
    );

  } catch (error) {

    console.error(
      "Failed to load contracts:",
      error
    );

    setContracts([]);

  } finally {

    setLoading(false);
  }
};

  useEffect(() => { loadContracts(); }, []);

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.contractName?.toLowerCase().includes(q) ||
      c.partyOneName?.toLowerCase().includes(q) ||
      c.partyTwoName?.toLowerCase().includes(q);
    const matchStatus   = !filterStatus || c.status === filterStatus;
  const matchType     = !filterType   || c.contractType === filterType;
  const startDate = c.startDate || '';
  const matchFrom = !filterDateFrom || startDate >= filterDateFrom;
  const matchTo   = !filterDateTo   || startDate <= filterDateTo;
  return matchSearch && matchStatus && matchType && matchFrom && matchTo;
  });

  const handleUpdate = (updatedContract) => {
    setContracts((prev) => prev.map((c) => c.id === updatedContract.id ? updatedContract : c));
    setSelectedContract(updatedContract);
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-3 font-medium">
        <button onClick={() => navigate(moduleBase)} className="hover:text-purple-300">{moduleLabel}</button>
        <span>/</span>
        <button onClick={() => navigate(`${moduleBase}/contracts`)} className="hover:text-purple-300">Contracts</button>
        <span>/</span>
        <span className="text-white font-semibold">Contract List</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Contract List</h1>
            <p className="text-sm text-purple-300 mt-0.5">{contracts.length} contract{contracts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => navigate(addPath)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md">
          <Plus size={15} /> Add Contract
        </button>
      </div>

      {contracts.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or party…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-4 pr-8 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none"
          >
            <option value="">All Statuses</option>
            {CONTRACT_STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
  className="pl-3 pr-8 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 bg-white/5 text-white">
  <option value="">All Types</option>
  {CONTRACT_TYPES.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
</select>
<input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
  className="pl-3 pr-2 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none bg-white/5" />
<span className="text-xs text-gray-400">to</span>
<input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
  className="pl-3 pr-2 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none bg-white/5" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
            <FileText size={36} className="text-purple-300" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Contracts Yet</h3>
          <p className="text-sm text-purple-300 mb-6 max-w-xs">Create your first vendor contract to get started.</p>
          <button onClick={() => navigate(addPath)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-white/10 transition-colors shadow-md">
            <Plus size={16} /> Add Contract
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">No contracts match your search.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-sm divide-y divide-[rgba(139,92,246,0.12)]">
          {filtered.map((c) => (
            <ContractRow
              key={c.id}
              contract={c}
              isSelected={selectedContract?.id === c.id}
              onClick={() => setSelectedContract(c)}
            />
          ))}
        </div>
      )}

      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ContractList;