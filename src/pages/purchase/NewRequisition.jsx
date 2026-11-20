import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ClipboardList, ChevronRight, Package, User, Building2, AlertCircle, CheckCircle, FileText } from 'lucide-react';

import { createRequisition } from "../../services/purchase/requisition.services";
import { getItems } from "../../services/purchase/inventory.services";
import { getAllBudgets } from "../../services/account/budget.services";
import { getAllCostCenters } from "../../services/account/costCenter.services";

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

const INITIAL_FORM = {
  requestDate: '',
  requestedBy: '',
  department: '',
  costCenter: '',
  itemName: '',
  itemCode: '',
  description: '',
  quantity: '',
  uom: '',
  requiredDate: '',
  priority: '',
  estimatedUnitPrice: '',
  preferredVendor: '',
  businessJustification: '',
  remarks: '',
};

const NewRequisition = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [costCenters, setCostCenters] = useState([]);

  useEffect(() => {
    loadItems();
    loadBudgetsAndCostCenters();
  }, []);

  const loadBudgetsAndCostCenters = async () => {
    try {
      const [bRes, ccRes] = await Promise.all([
        getAllBudgets().catch(() => []),
        getAllCostCenters().catch(() => [])
      ]);
      setBudgets(Array.isArray(bRes) ? bRes : []);
      setCostCenters(Array.isArray(ccRes) ? ccRes : []);
    } catch (error) {
      console.error("Error loading budgets or cost centers:", error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await getItems();
      setItems(response || []);
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const handleItemSelect = (e) => {
    const selectedId = e.target.value;
    const item = items.find((i) => String(i.id) === String(selectedId));

    setForm((prev) => ({
      ...prev,
      itemCode: selectedId,
      itemName: item?.itemName || item?.name || "",
      description: item?.description || "",
      uom: item?.uom || "",
    }));

    if (errors.itemCode) setErrors((prev) => ({ ...prev, itemCode: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCostCenterChange = (e) => {
    const val = e.target.value;
    const selectedCC = costCenters.find(c => c.code === val || c.name === val || String(c.id) === val);
    setForm(prev => ({
      ...prev,
      costCenter: val,
      department: selectedCC?.department ? selectedCC.department : prev.department
    }));
    if (errors.costCenter) setErrors(prev => ({ ...prev, costCenter: '' }));
    if (errors.department && selectedCC?.department) setErrors(prev => ({ ...prev, department: '' }));
  };

  const activeBudget = useMemo(() => {
    if (!budgets.length) return null;

    // 1. Try finding by matching Cost Center
    if (form.costCenter) {
      const selectedCC = costCenters.find(
        c => c.code?.toLowerCase() === form.costCenter.toLowerCase() ||
             c.name?.toLowerCase() === form.costCenter.toLowerCase() ||
             String(c.id) === String(form.costCenter)
      );
      if (selectedCC) {
        const match = budgets.find(b => Number(b.costCenterId) === Number(selectedCC.id));
        if (match) return match;
      }
    }

    // 2. Try finding by matching Department
    if (form.department) {
      const match = budgets.find(
        b => b.department && b.department.toLowerCase().trim() === form.department.toLowerCase().trim()
      );
      if (match) return match;
    }

    // 3. Fallback: single company-wide budget
    if (budgets.length === 1 && !form.costCenter && !form.department) {
      return budgets[0];
    }

    return null;
  }, [budgets, costCenters, form.costCenter, form.department]);

  const requestedAmount = useMemo(() => {
    return (Number(form.quantity || 0) * Number(form.estimatedUnitPrice || 0)) || 0;
  }, [form.quantity, form.estimatedUnitPrice]);

  const availableBudget = useMemo(() => {
    if (activeBudget) {
      const allocated = Number(activeBudget.totalBudget || 0);
      const actual = Number(activeBudget.totalActual || 0);
      return Math.max(0, allocated - actual);
    }
    return 0;
  }, [activeBudget]);

  const remainingBudget = availableBudget - requestedAmount;

  const validate = () => {
    const e = {};
    if (!form.requestDate) e.requestDate = 'Request date is required';
    if (!form.requestedBy.trim()) e.requestedBy = 'Requester name is required';
    if (!form.department.trim()) e.department = 'Department is required';
    if (!form.itemName.trim()) e.itemName = 'Item name is required';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Valid quantity is required';
    if (!form.uom.trim()) e.uom = 'UOM is required';
    if (!form.requiredDate) e.requiredDate = 'Required date is required';
    if (!form.priority) e.priority = 'Priority is required';
    if (!form.businessJustification.trim()) e.businessJustification = 'Business justification is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const estimatedTotal = Number(form.quantity) * Number(form.estimatedUnitPrice || 0);

    const requisitionData = {
      ...form,
      quantity: Number(form.quantity),
      estimatedUnitPrice: Number(form.estimatedUnitPrice || 0),
      estimatedTotal: estimatedTotal,
      status: "SUBMITTED",
    };

    try {
      await createRequisition(requisitionData);
      setSuccess(true);
      setForm(INITIAL_FORM);
      setTimeout(() => {
        setSuccess(false);
        navigate("/dashboard/purchase/requisitions/req-list");
      }, 1500);
    } catch (error) {
      console.error("Error creating requisition:", error);
      alert(error?.response?.data?.message || "Failed to create requisition.");
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white/5 transition-colors ${errors[field] ? 'border-red-300 focus:ring-red-200' : 'border-white/10 focus:ring-[#7c3aed]/30'}`;

  const selectCls = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white/5 transition-colors appearance-none ${errors[field] ? 'border-red-300 focus:ring-red-200' : 'border-white/10 focus:ring-[#7c3aed]/30'}`;

  const FieldError = ({ field }) => errors[field] ? (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1"><AlertCircle size={11} /> {errors[field]}</p>
  ) : null;

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/requisitions')} className="hover:text-purple-300 transition-colors">Requisitions</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">New Requisition</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/requisitions')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <Plus size={22} style={{ color: '#7c3aed' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">New Requisition</h2>
          <p className="text-sm text-gray-400">Create a new purchase requisition request</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl mb-5 text-sm font-medium">
          <CheckCircle size={16} /> Requisition created successfully! Req No assigned automatically.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left - Item Details */}
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center"><Package size={14} style={{ color: '#7c3aed' }} /></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Item / Service Details</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Item Code (Catalog)</label>
                <select name="itemCode" value={form.itemCode} onChange={handleItemSelect} className={selectCls('itemCode')}>
                  <option value="">Select Item...</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.itemCode || i.id} — {i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Item Name / Service <span className="text-red-400">*</span></label>
                <input name="itemName" value={form.itemName} onChange={handleChange} placeholder="Item Name" className={inputCls('itemName')} />
                <FieldError field="itemName" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Item description" className={inputCls('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Quantity <span className="text-red-400">*</span></label>
                <input name="quantity" value={form.quantity} onChange={handleChange} type="number" min="1" placeholder="Quantity" className={inputCls('quantity')} />
                <FieldError field="quantity" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">UOM <span className="text-red-400">*</span></label>
                <input name="uom" value={form.uom} onChange={handleChange} placeholder="e.g. Nos, Kg" className={inputCls('uom')} />
                <FieldError field="uom" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Estimated Unit Price</label>
                <input name="estimatedUnitPrice" value={form.estimatedUnitPrice} onChange={handleChange} type="number" placeholder="Price per unit" className={inputCls('estimatedUnitPrice')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Estimated Total</label>
                <input readOnly value={(Number(form.quantity || 0) * Number(form.estimatedUnitPrice || 0)).toFixed(2)} className={inputCls('estimatedTotal') + ' bg-gray-50 cursor-not-allowed'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Preferred Vendor (Optional)</label>
              <input name="preferredVendor" value={form.preferredVendor} onChange={handleChange} placeholder="e.g. ABC Supplies" className={inputCls('preferredVendor')} />
            </div>
            
            {/* Section 3: Dynamic Budget Check UI */}
            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase">
                  Budget Status ({activeBudget ? `${activeBudget.department ? activeBudget.department + ' Dept' : (form.costCenter || 'Cost Center')} - FY ${activeBudget.financialYear || ''}` : `Cost Center: ${form.costCenter || 'Default'}`})
                </h4>
                {activeBudget ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    Live Budget Synced
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/30">
                    No Budget Configured
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-gray-300">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Available</span>
                  <span className="font-semibold text-white">₹{availableBudget.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Requested</span>
                  <span className="font-semibold text-white">₹{requestedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-2">
                  <span className="text-xs text-gray-500">Remaining</span>
                  {activeBudget ? (
                    remainingBudget >= 0 ? (
                      <span className="font-semibold text-emerald-400">₹{remainingBudget.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="font-semibold text-red-400">Exceeded by ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}</span>
                    )
                  ) : (
                    <span className="font-semibold text-amber-300 text-xs">Unallocated</span>
                  )}
                </div>
              </div>
              {activeBudget && remainingBudget < 0 && (
                <p className="mt-3 text-xs text-red-400 flex items-center gap-1 bg-red-400/10 p-2 rounded-lg">
                  <AlertCircle size={12}/> Budget exceeded! Will be routed to higher approval level.
                </p>
              )}
              {!activeBudget && (
                <p className="mt-2 text-xs text-gray-400">
                  Tip: Configure a budget in <span className="text-purple-300 font-medium">Accounts &gt; Budgets</span> for this Cost Center or Department to activate live controls.
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Right - Request Details */}
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center"><User size={14} style={{ color: '#d97706' }} /></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Request Details</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Request Date <span className="text-red-400">*</span></label>
                <input name="requestDate" value={form.requestDate} onChange={handleChange} type="date" className={inputCls('requestDate')} />
                <FieldError field="requestDate" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Required Date <span className="text-red-400">*</span></label>
                <input name="requiredDate" value={form.requiredDate} onChange={handleChange} type="date" className={inputCls('requiredDate')} />
                <FieldError field="requiredDate" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Requested By <span className="text-red-400">*</span></label>
                <input name="requestedBy" value={form.requestedBy} onChange={handleChange} placeholder="Your name" className={inputCls('requestedBy')} />
                <FieldError field="requestedBy" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Priority <span className="text-red-400">*</span></label>
                <select name="priority" value={form.priority} onChange={handleChange} className={selectCls('priority')}>
                  <option value="">Select priority…</option>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <FieldError field="priority" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Department <span className="text-red-400">*</span></label>
                <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Production" className={inputCls('department')} />
                <FieldError field="department" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Cost Center</label>
                {costCenters.length > 0 ? (
                  <select
                    name="costCenter"
                    value={form.costCenter}
                    onChange={handleCostCenterChange}
                    className={selectCls('costCenter')}
                  >
                    <option value="">Select Cost Center...</option>
                    {costCenters.map(cc => (
                      <option key={cc.id} value={cc.code || cc.name}>
                        {cc.code} - {cc.name} {cc.department ? `(${cc.department})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="costCenter"
                    value={form.costCenter}
                    onChange={handleChange}
                    placeholder="e.g. CC-101"
                    className={inputCls('costCenter')}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Business Justification <span className="text-red-400">*</span></label>
              <textarea name="businessJustification" value={form.businessJustification} onChange={handleChange} rows={2} placeholder="Reason for request"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 resize-none text-white" />
              <FieldError field="businessJustification" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Remarks</label>
              <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={1} placeholder="Optional notes"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 bg-white/5 resize-none text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5">Attachment</label>
              <input type="file" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-300 hover:file:bg-purple-500/20 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-5">
        <button onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
          <ClipboardList size={16} /> Submit Requisition
        </button>
      </div>
    </div>
  );
};

export default NewRequisition;
