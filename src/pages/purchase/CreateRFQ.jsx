import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, FileText, ChevronRight, AlertCircle, Plus, Trash2, CheckCircle, Upload, Building2, Link as LinkIcon } from 'lucide-react';
import { createRFQ } from "../../services/purchase/rfq.services";
import { getAllVendors } from "../../services/vendor/vendor.services";

const INITIAL_FORM = {
  rfqNumber: '',
  requisitionNumber: '',
  requiredDeliveryDate: '',
  responseDeadline: '',
  termsAndConditions: '',
  specifications: '',
  attachments: '',
  vendors: []
};

const INITIAL_ITEM = {
  itemName: '',
  quantity: '',
  uom: '',
  specifications: ''
};

const CreateRFQ = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [items, setItems] = useState([INITIAL_ITEM]);
  const [vendorInput, setVendorInput] = useState('');
  const [registeredVendors, setRegisteredVendors] = useState([]);
  const [selectedRegisteredVendor, setSelectedRegisteredVendor] = useState('');
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getAllVendors()
      .then(data => setRegisteredVendors(Array.isArray(data) ? data : []))
      .catch(() => setRegisteredVendors([]));

    if (location.state?.requisition) {
      const req = location.state.requisition;
      // Default response deadline 7 days from now
      const defaultDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setForm(prev => ({
        ...prev,
        requisitionNumber: req.requisitionNumber || prev.requisitionNumber,
        requiredDeliveryDate: req.requiredDate || prev.requiredDeliveryDate,
        responseDeadline: prev.responseDeadline || defaultDeadline,
        specifications: req.businessJustification || req.remarks || prev.specifications,
        vendors: req.preferredVendor && !prev.vendors.includes(req.preferredVendor) 
          ? [...prev.vendors, req.preferredVendor] 
          : prev.vendors,
      }));

      setItems([{
        itemName: req.itemName || '',
        quantity: req.quantity || 1,
        uom: req.uom || 'Nos',
        specifications: req.businessJustification || req.remarks || ''
      }]);
    }
  }, [location.state]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, INITIAL_ITEM]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const addVendor = () => {
    if (vendorInput.trim() && !form.vendors.includes(vendorInput.trim())) {
      setForm({ ...form, vendors: [...form.vendors, vendorInput.trim()] });
      setVendorInput('');
    }
  };

  const addSelectedRegisteredVendor = () => {
    if (selectedRegisteredVendor && !form.vendors.includes(selectedRegisteredVendor)) {
      setForm({ ...form, vendors: [...form.vendors, selectedRegisteredVendor] });
      setSelectedRegisteredVendor('');
    }
  };

  const removeVendor = (vendor) => {
    setForm({ ...form, vendors: form.vendors.filter(v => v !== vendor) });
  };

  const validate = () => {
    const e = {};
    if (!form.responseDeadline) e.responseDeadline = 'Deadline is required';
    if (!form.requiredDeliveryDate) e.requiredDeliveryDate = 'Delivery date is required';
    if (items.some(i => !i.itemName || !i.quantity)) e.items = 'All items must have a name and quantity';
    if (form.vendors.length === 0) e.vendors = 'Add at least one vendor';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    try {
      const payload = {
        ...form,
        items: items.map(i => ({ 
          itemId: Number(i.itemId) || 0,
          itemName: i.itemName,
          quantity: Number(i.quantity) || 1,
          uom: i.uom || 'Nos',
          specifications: i.specifications || ''
        })),
        status: 'SENT'
      };
      await createRFQ(payload);
      setSaved(true);
      setTimeout(() => navigate('/dashboard/purchase/rfqs/rfq-list'), 1500);
    } catch (error) {
      console.error(error);
      alert('Failed to create RFQ');
    }
  };

  const inputCls = (field) => `w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 bg-[#140f2d]/80 text-white ${errors[field] ? 'border-red-400 focus:ring-red-400/30' : 'focus:ring-purple-500/30'}`;

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300">Purchase</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/rfqs/rfq-list')} className="hover:text-purple-300">RFQs</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Create RFQ</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <FileText size={22} style={{ color: '#7c3aed' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create RFQ</h2>
          <p className="text-sm text-gray-400">Request for Quotation from multiple vendors</p>
        </div>
      </div>

      {location.state?.requisition && (
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <LinkIcon size={16} />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-semibold uppercase tracking-wide">Auto-filled from Requisition</p>
              <p className="text-sm font-bold text-white">
                {location.state.requisition.requisitionNumber} • {location.state.requisition.itemName} ({location.state.requisition.quantity} {location.state.requisition.uom})
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 font-medium">
            Internal Indent Linked
          </span>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl mb-5 text-sm font-medium">
          <CheckCircle size={16} /> RFQ Created and Sent to Vendors!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Details */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">RFQ Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Linked Requisition No</label>
                <input name="requisitionNumber" value={form.requisitionNumber} onChange={handleChange} placeholder="Optional" className={inputCls()} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Required Delivery Date <span className="text-red-400">*</span></label>
                <input type="date" name="requiredDeliveryDate" value={form.requiredDeliveryDate} onChange={handleChange} className={inputCls('requiredDeliveryDate')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Response Deadline <span className="text-red-400">*</span></label>
                <input type="date" name="responseDeadline" value={form.responseDeadline} onChange={handleChange} className={inputCls('responseDeadline')} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">General Specifications</label>
              <textarea name="specifications" value={form.specifications} onChange={handleChange} rows="2" className={inputCls()} placeholder="Technical or quality requirements"></textarea>
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Items</h3>
              <button onClick={addItem} className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300"><Plus size={14}/> Add Item</button>
            </div>
            {errors.items && <p className="text-xs text-red-400 mb-2">{errors.items}</p>}
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl relative group">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                  )}
                  <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-6">
                      <label className="block text-xs text-gray-400 mb-1">Item Name</label>
                      <input value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)} className="w-full bg-[#140f2d] border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500" />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-400 mb-1">Quantity</label>
                      <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-full bg-[#140f2d] border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500" />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-400 mb-1">UOM</label>
                      <input value={item.uom} onChange={e => handleItemChange(idx, 'uom', e.target.value)} placeholder="Nos/Kg" className="w-full bg-[#140f2d] border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Item Specific Specifications</label>
                    <input value={item.specifications} onChange={e => handleItemChange(idx, 'specifications', e.target.value)} className="w-full bg-[#140f2d] border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vendors */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Vendors <span className="text-red-400">*</span></h3>
            <p className="text-xs text-gray-400 mb-3">Select registered vendors or add email/name to send this RFQ.</p>
            {errors.vendors && <p className="text-xs text-red-400 mb-2">{errors.vendors}</p>}
            
            {registeredVendors.length > 0 && (
              <div className="flex gap-2 mb-3">
                <select
                  value={selectedRegisteredVendor}
                  onChange={e => setSelectedRegisteredVendor(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-purple-500 appearance-none"
                >
                  <option value="" className="bg-[#140f2d] text-gray-300">Choose registered vendor...</option>
                  {registeredVendors.map(v => (
                    <option key={v.id} value={v.companyName || v.legalName || v.name} className="bg-[#140f2d] text-white">
                      {v.companyName || v.legalName || v.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addSelectedRegisteredVendor}
                  disabled={!selectedRegisteredVendor}
                  className="bg-purple-600/30 hover:bg-purple-600/50 disabled:opacity-40 border border-purple-500/30 text-purple-200 px-3 py-2 rounded-lg text-xs font-semibold"
                >
                  + Add
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input value={vendorInput} onChange={e => setVendorInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addVendor()} placeholder="Or type vendor email or name" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-purple-500" />
              <button onClick={addVendor} className="bg-white/10 hover:bg-white/20 px-3 rounded-lg text-white"><Plus size={16}/></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.vendors.map(v => (
                <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/20">
                  <Building2 size={11} /> {v} <button onClick={() => removeVendor(v)} className="hover:text-red-400"><Trash2 size={12}/></button>
                </span>
              ))}
              {form.vendors.length === 0 && <p className="text-xs text-gray-500">No vendors added yet. RFQ must be sent to vendors.</p>}
            </div>
          </div>

          {/* Terms & Attachments */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Terms & Docs</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Terms & Conditions</label>
              <textarea name="termsAndConditions" value={form.termsAndConditions} onChange={handleChange} rows="4" className={inputCls()} placeholder="Standard terms..."></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Attachments</label>
              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 cursor-pointer transition-colors text-sm">
                <Upload size={16} /> Upload Document
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
          <Save size={16} /> Send RFQ to Vendors
        </button>
      </div>
    </div>
  );
};
export default CreateRFQ;
