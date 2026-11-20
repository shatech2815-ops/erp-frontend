import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Save,
  Building,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getAllVendorCategories } from '../../services/vendor/vendorCategories.services';

const INITIAL = {
  legalName: '', tradeName: '', vendorType: '', vendorCategory: '', businessType: '', industry: '', website: '', contactPerson: '', email: '', phone: '', alternatePhone: '',
  registeredAddress: '', billingAddress: '', shippingAddress: '', city: '', state: '', country: '', postalCode: '',
  gstNumber: '', pan: '', taxRegistrationNumber: '', taxType: '', taxClassification: '',
  bankName: '', accountNumber: '', ifsc: '', branch: '', accountHolderName: '', paymentMethod: 'Bank Transfer',
  paymentTerms: '', creditTerms: '', currency: 'INR', deliveryTerms: '', leadTime: '', minimumOrderQuantity: ''
};

const VENDOR_TYPES = ["Manufacturer", "Distributor", "Wholesaler", "Service Provider", "Contractor", "Consultant", "Logistics Provider", "Technology Vendor", "Raw Material Supplier"];
const BUSINESS_TYPES = ["Private Limited", "Public Limited", "Partnership", "Proprietorship", "LLP", "NGO"];

const TAB_FIELDS = {
  basic: ['legalName', 'contactPerson', 'email', 'phone'],
  address: ['registeredAddress', 'city', 'state', 'country', 'postalCode'],
  tax: ['gstNumber', 'pan'],
  bank: ['bankName', 'accountNumber', 'ifsc', 'accountHolderName'],
  commercial: [],
  documents: []
};

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, error }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || label}
      className={`h-11 px-4 rounded-xl border ${
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30 ring-1 ring-red-500/20'
          : 'border-white/10 focus:ring-purple-500/30 focus:border-purple-500/50'
      } bg-[#140f2d]/80 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all`}
    />
    {error && (
      <span className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
        <AlertCircle size={12} className="shrink-0" />
        {error}
      </span>
    )}
  </div>
);

const SelectField = ({ label, name, value, onChange, options = [], placeholder, loading = false, error }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`h-11 px-4 rounded-xl border ${
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30 ring-1 ring-red-500/20'
          : 'border-white/10 focus:ring-purple-500/30 focus:border-purple-500/50'
      } bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 transition-all appearance-none`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center'
      }}
    >
      <option value="" className="bg-[#140f2d] text-gray-400">
        {loading ? `Loading ${label}...` : (placeholder || `Select ${label}`)}
      </option>
      {options.map(o => <option key={o} value={o} className="bg-[#140f2d]">{o}</option>)}
    </select>
    {error && (
      <span className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
        <AlertCircle size={12} className="shrink-0" />
        {error}
      </span>
    )}
  </div>
);

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Building },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'tax', label: 'Tax & Compliance', icon: ShieldCheck },
  { id: 'bank', label: 'Banking', icon: CreditCard },
  { id: 'commercial', label: 'Commercial', icon: Settings },
  { id: 'documents', label: 'Documents', icon: FileText }
];

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const [sectionAlert, setSectionAlert] = useState(null);
  const [files, setFiles] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorCategories, setVendorCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getAllVendorCategories();
        if (Array.isArray(data)) {
          const names = data
            .filter(item => {
              if (item.status !== undefined) return item.status === 'ACTIVE' || item.status === true;
              if (item.isActive !== undefined) return item.isActive;
              return true;
            })
            .map(item => (typeof item === 'string' ? item : item.name))
            .filter(Boolean);
          setVendorCategories(names);
        }
      } catch (err) {
        console.error("Failed to load vendor categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const categoryOptions = useMemo(() => {
    if (form.vendorCategory && !vendorCategories.includes(form.vendorCategory)) {
      return [form.vendorCategory, ...vendorCategories];
    }
    return vendorCategories;
  }, [vendorCategories, form.vendorCategory]);

  const validateSection = (sectionId, formData = form) => {
    const sectionErrors = {};

    if (sectionId === 'basic') {
      if (!formData.legalName?.trim()) {
        sectionErrors.legalName = 'Legal Name is required';
      }
      if (!formData.contactPerson?.trim()) {
        sectionErrors.contactPerson = 'Contact Person is required';
      }
      if (!formData.email?.trim()) {
        sectionErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        sectionErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone?.trim()) {
        sectionErrors.phone = 'Phone number is required';
      }
    } else if (sectionId === 'address') {
      if (!formData.registeredAddress?.trim()) {
        sectionErrors.registeredAddress = 'Registered Address is required';
      }
      if (!formData.city?.trim()) {
        sectionErrors.city = 'City is required';
      }
      if (!formData.state?.trim()) {
        sectionErrors.state = 'State is required';
      }
      if (!formData.country?.trim()) {
        sectionErrors.country = 'Country is required';
      }
      if (!formData.postalCode?.trim()) {
        sectionErrors.postalCode = 'Postal Code is required';
      }
    } else if (sectionId === 'tax') {
      if (!formData.gstNumber?.trim()) {
        sectionErrors.gstNumber = 'GST Number is required';
      }
      if (!formData.pan?.trim()) {
        sectionErrors.pan = 'PAN is required';
      }
    } else if (sectionId === 'bank') {
      if (!formData.bankName?.trim()) {
        sectionErrors.bankName = 'Bank Name is required';
      }
      if (!formData.accountNumber?.trim()) {
        sectionErrors.accountNumber = 'Account Number is required';
      }
      if (!formData.ifsc?.trim()) {
        sectionErrors.ifsc = 'IFSC Code is required';
      }
      if (!formData.accountHolderName?.trim()) {
        sectionErrors.accountHolderName = 'Account Holder Name is required';
      }
    }

    return sectionErrors;
  };

  const validateAll = () => {
    let allErrors = {};
    let firstInvalidTab = null;

    for (const tab of TABS) {
      const tabErrors = validateSection(tab.id);
      if (Object.keys(tabErrors).length > 0) {
        allErrors = { ...allErrors, ...tabErrors };
        if (!firstInvalidTab) {
          firstInvalidTab = tab.id;
        }
      }
    }

    return { allErrors, firstInvalidTab };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleNext = () => {
    const currentErrors = validateSection(activeTab);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...currentErrors }));
      setSectionAlert('Please complete all mandatory fields in this section before proceeding.');
      return;
    }

    setSectionAlert(null);
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (idx < TABS.length - 1) {
      setActiveTab(TABS[idx + 1].id);
    }
  };

  const handlePrev = () => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (idx > 0) {
      setActiveTab(TABS[idx - 1].id);
      setSectionAlert(null);
    }
  };

  const handleTabClick = (targetTabId) => {
    const currentIdx = TABS.findIndex(t => t.id === activeTab);
    const targetIdx = TABS.findIndex(t => t.id === targetTabId);

    if (targetIdx === currentIdx) return;

    // Backward navigation is always allowed
    if (targetIdx < currentIdx) {
      setActiveTab(targetTabId);
      setSectionAlert(null);
      return;
    }

    // Forward navigation: validate current section first
    const currentErrors = validateSection(activeTab);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...currentErrors }));
      setSectionAlert('Please complete all mandatory fields in this section before proceeding.');
      return;
    }

    // Check intermediate sections up to the target section
    for (let i = 0; i < targetIdx; i++) {
      const intermediateErrors = validateSection(TABS[i].id);
      if (Object.keys(intermediateErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...intermediateErrors }));
        setActiveTab(TABS[i].id);
        setSectionAlert(`Please complete required fields in ${TABS[i].label} before proceeding.`);
        return;
      }
    }

    setSectionAlert(null);
    setActiveTab(targetTabId);
  };

  const handleSubmit = async () => {
    const { allErrors, firstInvalidTab } = validateAll();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (firstInvalidTab) {
        setActiveTab(firstInvalidTab);
        const tabName = TABS.find(t => t.id === firstInvalidTab)?.label || 'previous section';
        setSectionAlert(`Please fill in all mandatory fields in ${tabName} before submitting.`);
      }
      return;
    }

    setSectionAlert(null);
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => formData.append(k, form[k]));
      // Map files to the backend fields expected by create-vendor
      if (files.gst) formData.append('gstFile', files.gst);
      if (files.pan) formData.append('panFile', files.pan);
      if (files.address) formData.append('addressProofFile', files.address);
      if (files.agreement) formData.append('agreementFile', files.agreement);

      formData.append('status', 'SUBMITTED');
      
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendors/create-vendor', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => navigate('/dashboard/vendor/vendors/list'), 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to register vendor");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting vendor registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 shadow-sm transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Vendor Registration & Onboarding</h2>
          <p className="text-sm text-gray-400">Complete the vendor profile for approval and activation</p>
        </div>
      </div>

      {isSaved && (
        <div className="flex items-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-4 rounded-2xl mb-6">
          <CheckCircle size={20} className="mr-3" /> Vendor Registered successfully! Moving to Under Review...
        </div>
      )}

      <div className="bg-[#140f2d]/80 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-black/20 p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col gap-2">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            const tabHasError = TAB_FIELDS[t.id]?.some(field => Boolean(errors[field]));
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabClick(t.id)} 
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} /> {t.label}
                </div>
                {tabHasError && (
                  <span className="w-2 h-2 rounded-full bg-red-400 ring-2 ring-red-400/20" title="Contains missing required fields" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {sectionAlert && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm animate-fadeIn">
              <AlertCircle size={18} className="shrink-0" />
              <span>{sectionAlert}</span>
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <InputField label="Legal Name *" name="legalName" value={form.legalName} onChange={handleChange} error={errors.legalName} />
              <InputField label="Trade Name" name="tradeName" value={form.tradeName} onChange={handleChange} error={errors.tradeName} />
              <SelectField label="Vendor Type" name="vendorType" value={form.vendorType} onChange={handleChange} options={VENDOR_TYPES} error={errors.vendorType} />
              <SelectField label="Vendor Category" name="vendorCategory" value={form.vendorCategory} onChange={handleChange} options={categoryOptions} loading={loadingCategories} placeholder={vendorCategories.length === 0 && !loadingCategories ? "No categories created yet" : undefined} error={errors.vendorCategory} />
              <SelectField label="Business Type" name="businessType" value={form.businessType} onChange={handleChange} options={BUSINESS_TYPES} error={errors.businessType} />
              <InputField label="Industry" name="industry" value={form.industry} onChange={handleChange} error={errors.industry} />
              <InputField label="Contact Person *" name="contactPerson" value={form.contactPerson} onChange={handleChange} error={errors.contactPerson} />
              <InputField label="Email *" name="email" value={form.email} onChange={handleChange} type="email" error={errors.email} />
              <InputField label="Phone *" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />
              <InputField label="Alternate Phone" name="alternatePhone" value={form.alternatePhone} onChange={handleChange} error={errors.alternatePhone} />
              <InputField label="Website" name="website" value={form.website} onChange={handleChange} error={errors.website} />
            </div>
          )}

          {activeTab === 'address' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <div className="col-span-1 md:col-span-2">
                <InputField label="Registered Address *" name="registeredAddress" value={form.registeredAddress} onChange={handleChange} error={errors.registeredAddress} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <InputField label="Billing Address" name="billingAddress" value={form.billingAddress} onChange={handleChange} error={errors.billingAddress} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <InputField label="Shipping Address" name="shippingAddress" value={form.shippingAddress} onChange={handleChange} error={errors.shippingAddress} />
              </div>
              <InputField label="City *" name="city" value={form.city} onChange={handleChange} error={errors.city} />
              <InputField label="State *" name="state" value={form.state} onChange={handleChange} error={errors.state} />
              <InputField label="Country *" name="country" value={form.country} onChange={handleChange} error={errors.country} />
              <InputField label="Postal Code *" name="postalCode" value={form.postalCode} onChange={handleChange} error={errors.postalCode} />
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <InputField label="GST Number *" name="gstNumber" value={form.gstNumber} onChange={handleChange} error={errors.gstNumber} />
              <InputField label="PAN *" name="pan" value={form.pan} onChange={handleChange} error={errors.pan} />
              <InputField label="Tax Registration Number" name="taxRegistrationNumber" value={form.taxRegistrationNumber} onChange={handleChange} error={errors.taxRegistrationNumber} />
              <SelectField label="Tax Type" name="taxType" value={form.taxType} onChange={handleChange} options={['GST', 'VAT', 'Sales Tax', 'Service Tax']} error={errors.taxType} />
              <InputField label="Tax Classification" name="taxClassification" value={form.taxClassification} onChange={handleChange} error={errors.taxClassification} />
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <div className="col-span-1 md:col-span-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-xs flex items-start gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <p>Sensitive banking information is protected using strict access controls and encrypted in audit logs.</p>
              </div>
              <InputField label="Bank Name *" name="bankName" value={form.bankName} onChange={handleChange} error={errors.bankName} />
              <InputField label="Account Number *" name="accountNumber" value={form.accountNumber} onChange={handleChange} error={errors.accountNumber} />
              <InputField label="IFSC Code *" name="ifsc" value={form.ifsc} onChange={handleChange} error={errors.ifsc} />
              <InputField label="Branch" name="branch" value={form.branch} onChange={handleChange} error={errors.branch} />
              <InputField label="Account Holder Name *" name="accountHolderName" value={form.accountHolderName} onChange={handleChange} error={errors.accountHolderName} />
              <SelectField label="Payment Method" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} options={['Bank Transfer', 'Cheque', 'UPI', 'Cash', 'Credit Card']} error={errors.paymentMethod} />
            </div>
          )}

          {activeTab === 'commercial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <InputField label="Payment Terms" name="paymentTerms" value={form.paymentTerms} onChange={handleChange} placeholder="e.g. Net 30, Net 45" error={errors.paymentTerms} />
              <InputField label="Credit Terms" name="creditTerms" value={form.creditTerms} onChange={handleChange} error={errors.creditTerms} />
              <SelectField label="Currency" name="currency" value={form.currency} onChange={handleChange} options={['INR', 'USD', 'EUR', 'GBP']} error={errors.currency} />
              <InputField label="Delivery Terms" name="deliveryTerms" value={form.deliveryTerms} onChange={handleChange} placeholder="e.g. FOB, CIF, EXW" error={errors.deliveryTerms} />
              <InputField label="Lead Time (Days)" name="leadTime" value={form.leadTime} onChange={handleChange} type="number" error={errors.leadTime} />
              <InputField label="Minimum Order Quantity (MOQ)" name="minimumOrderQuantity" value={form.minimumOrderQuantity} onChange={handleChange} type="number" error={errors.minimumOrderQuantity} />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
               <div className="col-span-1 md:col-span-2 flex items-center justify-between">
                 <h3 className="text-white font-bold text-lg">Onboarding Documents</h3>
                 <p className="text-xs text-purple-300">Supported formats: PDF, JPG, PNG</p>
               </div>
               
               {['gst', 'pan', 'address', 'agreement'].map((doc) => (
                 <div key={doc} className="bg-black/20 border border-white/5 p-5 rounded-2xl flex flex-col gap-3 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white uppercase">{doc} Certificate</p>
                        <p className="text-xs text-gray-400">Upload official document</p>
                      </div>
                    </div>
                    <input type="file" name={doc} onChange={handleFileChange} className="text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                 </div>
               ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handlePrev} 
              disabled={activeTab === 'basic'}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/10 disabled:opacity-50 transition-colors">
              Previous
            </button>
            
            {activeTab !== 'documents' ? (
              <button
                type="button"
                onClick={handleNext} 
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors shadow-sm">
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {loading ? 'Submitting...' : <><Save size={16} /> Submit Vendor For Approval</>}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
