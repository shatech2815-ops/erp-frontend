import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, AlertTriangle, ShieldCheck, CheckCircle, FileText, Activity, Phone, MapPin, Building, CreditCard, ShoppingCart, DollarSign, BookOpen, Clock, Settings, FileSignature, FileArchive } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'company', label: 'Company Details', icon: Building },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'banking', label: 'Banking', icon: CreditCard },
  { id: 'contracts', label: 'Contracts', icon: FileSignature },
  { id: 'pos', label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'invoices', label: 'Invoices', icon: FileArchive },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: BookOpen },
  { id: 'risk', label: 'Risk', icon: AlertTriangle },
  { id: 'history', label: 'Audit History', icon: Clock }
];

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await fetch(`/api/vendors/get-vendor/${id}`);
        if (res.ok) {
          const data = await res.json();
          setVendor(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  if (loading) return <div className="text-white p-6">Loading vendor profile...</div>;
  if (!vendor) return <div className="text-red-400 p-6">Vendor not found.</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'APPROVED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'PENDING APPROVAL': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'SUSPENDED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'BLACKLISTED': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'LOW': return 'text-emerald-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-2 pb-10 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-all shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{vendor.legalName || vendor.vendorName}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm font-medium">
              <span className="text-gray-400">ID: {vendor.vendorId || vendor.id}</span>
              <span className="text-gray-600">•</span>
              <span className="text-purple-300">{vendor.vendorCategory || 'Uncategorized'}</span>
              <span className="text-gray-600">•</span>
              <span className={`px-2.5 py-0.5 rounded-md border text-xs font-bold ${getStatusColor(vendor.status)}`}>
                {vendor.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#140f2d]/80 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Risk Level</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${getRiskColor(vendor.riskLevel)}`}>
                <AlertTriangle size={14} /> {vendor.riskLevel || 'UNKNOWN'}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Score</span>
              <span className="text-sm font-bold text-white flex items-center gap-1">
                {vendor.overallScore || 0}% 
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all border border-white/5">
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#140f2d]/80 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/20 p-4 border-b md:border-b-0 md:border-r border-white/10 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-purple-600/90 text-white shadow-md border border-purple-500/50' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
                <Icon size={16} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn space-y-6">
              <h3 className="text-lg font-bold text-white mb-4">Vendor Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Total Spend</p>
                  <p className="text-2xl font-bold text-white">₹0.00</p>
                  <p className="text-xs text-emerald-400 mt-2">+0% this year</p>
                </div>
                <div className="bg-black/20 border border-white/5 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Active POs</p>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-gray-500 mt-2">0 pending delivery</p>
                </div>
                <div className="bg-black/20 border border-white/5 p-5 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Outstanding Payable</p>
                  <p className="text-2xl font-bold text-white">₹0.00</p>
                  <p className="text-xs text-red-400 mt-2">₹0.00 overdue</p>
                </div>
              </div>

              <div className="mt-8 bg-black/20 border border-white/5 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Onboarding Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-300 font-medium">Company Information</span>
                    {vendor.isCompanyVerified ? <CheckCircle size={18} className="text-emerald-400" /> : <div className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">PENDING</div>}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-300 font-medium">Tax Verification</span>
                    {vendor.isTaxVerified ? <CheckCircle size={18} className="text-emerald-400" /> : <div className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">PENDING</div>}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-300 font-medium">Bank Verification</span>
                    {vendor.isBankVerified ? <CheckCircle size={18} className="text-emerald-400" /> : <div className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">PENDING</div>}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-300 font-medium">Document Verification</span>
                    {vendor.isDocumentsVerified ? <CheckCircle size={18} className="text-emerald-400" /> : <div className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">PENDING</div>}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-300 font-medium">Compliance Verification</span>
                    {vendor.isComplianceVerified ? <CheckCircle size={18} className="text-emerald-400" /> : <div className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-1 rounded">PENDING</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Vendor Documents</h3>
                <button className="text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/20">
                  + Upload Document
                </button>
              </div>
              <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs text-purple-300 uppercase font-bold border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Document Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {vendor.documents && vendor.documents.length > 0 ? (
                      vendor.documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-2"><FileText size={16} className="text-purple-400"/> {doc.documentType}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${doc.verificationStatus === 'Verified' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                              {doc.verificationStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">{doc.issueDate || '-'}</td>
                          <td className="px-6 py-4">{doc.expiryDate || '-'}</td>
                          <td className="px-6 py-4 text-right">
                             <a href={`/api/vendors/documents/${doc.fileUrl}`} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 font-medium">View</a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                          No documents uploaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FALLBACK FOR OTHER TABS */}
          {['company', 'contacts', 'addresses', 'compliance', 'banking', 'contracts', 'pos', 'invoices', 'payments', 'performance', 'risk', 'history'].includes(activeTab) && (
            <div className="animate-fadeIn h-full flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                 {(() => {
                    const Icon = TABS.find(t => t.id === activeTab)?.icon || Settings;
                    return <Icon size={32} className="text-gray-500" />;
                 })()}
               </div>
               <h3 className="text-xl font-bold text-white mb-2">{TABS.find(t => t.id === activeTab)?.label}</h3>
               <p className="text-gray-400 max-w-md text-sm">
                 Detailed data for {TABS.find(t => t.id === activeTab)?.label} is aggregated from related modules. 
                 This section will populate automatically as transactions occur.
               </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default VendorProfile;
