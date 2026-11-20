import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileText, Plus, Trash2, Search, Link2, CheckCircle2, AlertCircle } from 'lucide-react';

import {
  createVendorInvoice,
  getAllVendorInvoices,
  matchVendorInvoice
} from "../../services/account/vendorInvoice.services";

import { getAllVendors } from "../../services/vendor/vendor.services";
import { getAllOrders } from "../../services/purchase/purchaseOrder.services";
import { getAllGRNs } from "../../services/purchase/grn.services";
import { getAllExpenseCategories } from "../../services/account/expense.services";
import api from "../../interceptors/interceptors";

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry'
];
const PURCHASE_TYPES = ['Regular','Reverse Charge','Import','Exempt'];
const VENDOR_INV_STATUSES = ['Pending','Received','Partially Paid','Paid','Disputed','Cancelled'];
const ITC_OPTIONS = ['Yes','No','Partial'];
const UNITS = ['Nos','Kgs','Ltrs','Mtrs','Sqft','Hours','Days','Box','Pcs','PACK'];
const GST_RATES = [0, 5, 12, 18, 28];

const emptyItem = () => ({ itemName: '', hsnSac: '', qty: 1, unit: 'Nos', rate: 0, gstPercent: 18, amount: 0 });

export default function VendorInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [matchingId, setMatchingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Filter States
  const [searchBill, setSearchBill] = useState('');
  const [filterBillStatus, setFilterBillStatus] = useState('ALL');
  const [filterBillDate, setFilterBillDate] = useState('');

  // Dropdown Master Data
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [grns, setGrns] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  // Form State
  const [form, setForm] = useState({
    billNo: '',
    vendorInvoiceNo: '',
    vendor: '',
    poNumber: '',
    grnNumber: '',
    matchStatus: 'PENDING_MATCH',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    placeOfSupply: 'Tamil Nadu',
    purchaseType: 'Regular',
    status: 'Pending',
    expenseCategory: '',
    itcEligible: 'Yes',
    attachBill: null,
    notes: '',
    tdsDeduction: '0',
  });

  const [items, setItems] = useState([emptyItem()]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetchInvoices();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    // 1. Expense Categories
    getAllExpenseCategories()
      .then(res => setExpenseCategories(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setExpenseCategories([]));

    // 2. Registered Vendors
    getAllVendors()
      .then(res => setVendors(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setVendors([]));

    // 3. Purchase Orders
    getAllOrders()
      .then(res => setPurchaseOrders(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setPurchaseOrders([]));

    // 4. GRNs
    getAllGRNs()
      .then(res => setGrns(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => setGrns([]));

    // 5. Catalog Items
    api.get('/items')
      .then(res => setCatalogItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCatalogItems([]));
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await getAllVendorInvoices();
      const invoiceList = Array.isArray(response) ? response : (response?.data || []);
      setInvoices(invoiceList);
    } catch (error) {
      console.error("Error fetching vendor invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewBill = () => {
    const nextBillNum = `BILL-${String(1001 + invoices.length)}`;
    setForm({
      billNo: nextBillNum,
      vendorInvoiceNo: '',
      vendor: '',
      poNumber: '',
      grnNumber: '',
      matchStatus: 'PENDING_MATCH',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      placeOfSupply: 'Tamil Nadu',
      purchaseType: 'Regular',
      status: 'Pending',
      expenseCategory: '',
      itcEligible: 'Yes',
      attachBill: null,
      notes: '',
      tdsDeduction: '0',
    });
    setItems([emptyItem()]);
    setShowForm(true);
  };

  // PO Selection Handler: Auto fill Vendor and Items from PO
  const handlePOSelect = (poNum) => {
    setField('poNumber', poNum);
    const po = purchaseOrders.find(p => p.orderNumber === poNum || String(p.id) === poNum);
    if (po) {
      const vendorName = po.supplierName || po.supplier || '';
      setField('vendor', vendorName);

      // Auto load items from PO
      if (po.items && Array.isArray(po.items) && po.items.length > 0) {
        setItems(po.items.map(it => {
          const qty = Number(it.quantity) || 1;
          const rate = Number(it.unitPrice || it.rate || 0);
          const gst = Number(it.gstPercent || 18);
          const base = qty * rate;
          const amt = base + (base * (gst / 100));
          return {
            itemName: it.itemName || it.name || '',
            hsnSac: it.hsnSac || '',
            qty: qty,
            unit: it.unit || 'Nos',
            rate: rate,
            gstPercent: gst,
            amount: amt
          };
        }));
      }

      // If GRN matches this PO, preselect it if available
      const matchingGRN = grns.find(g => g.poNumber === po.orderNumber);
      if (matchingGRN && !form.grnNumber) {
        setField('grnNumber', matchingGRN.grnNumber);
      }
    }
  };

  // GRN Selection Handler: Auto fill PO, Vendor, and items
  const handleGRNSelect = (grnNum) => {
    setField('grnNumber', grnNum);
    const grn = grns.find(g => g.grnNumber === grnNum || String(g.id) === grnNum);
    if (grn) {
      if (grn.vendor) setField('vendor', grn.vendor);
      if (grn.poNumber) {
        setField('poNumber', grn.poNumber);
        // Find PO to pull prices if available
        const po = purchaseOrders.find(p => p.orderNumber === grn.poNumber);
        if (po && po.items && po.items.length > 0) {
          handlePOSelect(po.orderNumber);
          return;
        }
      }

      // If no PO items found, map from GRN items
      if (grn.items && Array.isArray(grn.items) && grn.items.length > 0) {
        setItems(grn.items.map(it => {
          const qty = Number(it.acceptedQuantity || it.receivedQuantity || 1);
          return {
            itemName: it.itemName || '',
            hsnSac: '',
            qty: qty,
            unit: 'Nos',
            rate: 0,
            gstPercent: 18,
            amount: 0
          };
        }));
      }
    }
  };

  const handleItemCatalogSelect = (idx, selectedItemName) => {
    const catalogItem = catalogItems.find(c => c.name === selectedItemName);
    if (catalogItem) {
      const rate = Number(catalogItem.costPrice || catalogItem.price || 0);
      const unit = catalogItem.unit || 'Nos';
      const hsn = catalogItem.hsnSac || '';
      updateItem(idx, 'itemName', catalogItem.name);
      updateItem(idx, 'rate', rate);
      updateItem(idx, 'unit', unit);
      if (hsn) updateItem(idx, 'hsnSac', hsn);
    } else {
      updateItem(idx, 'itemName', selectedItemName);
    }
  };

  const updateItem = (idx, k, v) => {
    setItems(prev => {
      const copy = [...prev];
      const item = { ...copy[idx], [k]: v };
      const base = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
      const gst = base * ((parseFloat(item.gstPercent) || 0) / 100);
      item.amount = base + gst;
      copy[idx] = item;
      return copy;
    });
  };

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0);
  const totalGst = items.reduce((s, i) => {
    const b = (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0);
    return s + b * ((parseFloat(i.gstPercent) || 0) / 100);
  }, 0);
  const isIGST = form.placeOfSupply !== 'Tamil Nadu';
  const cgst = isIGST ? 0 : totalGst / 2;
  const sgst = isIGST ? 0 : totalGst / 2;
  const igst = isIGST ? totalGst : 0;
  const tds = parseFloat(form.tdsDeduction) || 0;
  const netPayable = subtotal + totalGst - tds;

  const handlePerform3WayMatch = async (id) => {
    try {
      setMatchingId(id);
      setMsg('');
      const res = await matchVendorInvoice(id);
      setMsg('3-Way Match Verified! Invoice amounts match Purchase Order and GRN. General Ledger entry posted.');
      fetchInvoices();
    } catch (e) {
      setMsg('Match Failed: ' + (e?.response?.data?.message || e.message || 'Discrepancy detected between PO, GRN and Invoice'));
    } finally {
      setMatchingId(null);
    }
  };

  const handleSave = async () => {
    if (!form.billNo?.trim() || !form.vendor?.trim()) {
      setMsg('Please fill in Bill No and Vendor.');
      return;
    }
    if (!form.billDate) {
      setMsg('Please fill in Bill Date.');
      return;
    }

    setSaving(true);
    setMsg('');

    try {
      const payload = {
        ...form,
        tdsDeduction: tds,
        poNumber: form.poNumber || null,
        grnNumber: form.grnNumber || null,
        matchStatus: 'PENDING_MATCH',
        subtotal,
        cgst,
        sgst,
        igst,
        netPayable,
        billDate: form.billDate || null,
        dueDate: form.dueDate || null,
        items: items.map((i) => ({
          itemName: i.itemName,
          hsnSac: i.hsnSac,
          qty: parseInt(i.qty) || 1,
          unit: i.unit,
          rate: parseFloat(i.rate) || 0,
          gstPercent: parseFloat(i.gstPercent) || 0,
          amount: i.amount,
        })),
      };

      await createVendorInvoice(payload);
      setMsg('Vendor invoice created successfully!');
      setShowForm(false);
      fetchInvoices();
    } catch (error) {
      console.error("Error saving vendor invoice:", error);
      setMsg('Failed to save vendor invoice: ' + (error?.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchQ = !searchBill || 
      (inv.billNo || '').toLowerCase().includes(searchBill.toLowerCase()) || 
      (inv.vendor || '').toLowerCase().includes(searchBill.toLowerCase()) || 
      (inv.vendorInvoiceNo || '').toLowerCase().includes(searchBill.toLowerCase()) ||
      (inv.poNumber || '').toLowerCase().includes(searchBill.toLowerCase());
    const matchS = filterBillStatus === 'ALL' || inv.status === filterBillStatus;
    const matchD = !filterBillDate || (inv.billDate || '').startsWith(filterBillDate);
    return matchQ && matchS && matchD;
  });

  const lbl = "block text-xs font-semibold text-purple-300 mb-1";
  const inp = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[#1b1638] text-white";

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Vendor Invoices</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <FileText size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Vendor Invoices</h2>
          <p className="text-sm text-gray-400">Manage purchase bills from vendors & 3-way matching</p>
        </div>
        <button 
          onClick={handleOpenNewBill} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-all" 
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
        >
          <Plus size={14} /> New Bill
        </button>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
          msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please fill')
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('please fill') ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {msg}
        </div>
      )}

      {/* New Bill Form */}
      {showForm && (
        <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-6">
          <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
            <span>Bill Details</span>
            <span className="text-xs font-normal text-gray-400">Auto-fills vendor & items when PO or GRN is selected</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Bill No */}
            <div>
              <label className={lbl}>Bill No <span className="text-red-400">*</span></label>
              <input value={form.billNo} onChange={e => setField('billNo', e.target.value)} className={inp} placeholder="BILL-0001 (auto)" />
            </div>

            {/* Vendor Invoice No */}
            <div>
              <label className={lbl}>Vendor Invoice No</label>
              <input value={form.vendorInvoiceNo} onChange={e => setField('vendorInvoiceNo', e.target.value)} className={inp} placeholder="Vendor's own invoice number" />
            </div>

            {/* PO Number Dropdown */}
            <div>
              <label className={lbl}>Purchase Order (PO)</label>
              <select value={form.poNumber} onChange={e => handlePOSelect(e.target.value)} className={inp}>
                <option value="">-- Link Purchase Order --</option>
                {purchaseOrders.map(po => (
                  <option key={po.id} value={po.orderNumber} className="bg-[#140f2d] text-white">
                    {po.orderNumber} - {po.supplierName || po.supplier || 'Vendor'}
                  </option>
                ))}
              </select>
            </div>

            {/* GRN Number Dropdown */}
            <div>
              <label className={lbl}>Goods Receipt Note (GRN)</label>
              <select value={form.grnNumber} onChange={e => handleGRNSelect(e.target.value)} className={inp}>
                <option value="">-- Link GRN --</option>
                {grns.map(g => (
                  <option key={g.id} value={g.grnNumber} className="bg-[#140f2d] text-white">
                    {g.grnNumber} - {g.vendor || 'Vendor'} (PO: {g.poNumber || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Dropdown */}
            <div>
              <label className={lbl}>Vendor <span className="text-red-400">*</span></label>
              {vendors.length > 0 ? (
                <div className="relative">
                  <select 
                    value={form.vendor} 
                    onChange={e => setField('vendor', e.target.value)} 
                    className={inp}
                  >
                    <option value="">Select Vendor...</option>
                    {form.vendor && !vendors.some(v => (v.companyName || v.legalName || v.name) === form.vendor) && (
                      <option value={form.vendor} className="bg-[#140f2d] text-white">{form.vendor}</option>
                    )}
                    {vendors.map(v => {
                      const vName = v.companyName || v.legalName || v.name;
                      return (
                        <option key={v.id} value={vName} className="bg-[#140f2d] text-white">
                          {vName} {v.city ? `(${v.city})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <input value={form.vendor} onChange={e => setField('vendor', e.target.value)} className={inp} placeholder="Vendor name" />
              )}
            </div>

            {/* Bill Date */}
            <div>
              <label className={lbl}>Bill Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.billDate} onChange={e => setField('billDate', e.target.value)} className={inp} />
            </div>

            {/* Due Date */}
            <div>
              <label className={lbl}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} className={inp} />
            </div>

            {/* Place of Supply */}
            <div>
              <label className={lbl}>Place of Supply</label>
              <select value={form.placeOfSupply} onChange={e => setField('placeOfSupply', e.target.value)} className={inp}>
                {STATES.map(s => <option key={s} className="bg-[#140f2d] text-white">{s}</option>)}
              </select>
            </div>

            {/* Purchase Type */}
            <div>
              <label className={lbl}>Purchase Type</label>
              <select value={form.purchaseType} onChange={e => setField('purchaseType', e.target.value)} className={inp}>
                {PURCHASE_TYPES.map(t => <option key={t} className="bg-[#140f2d] text-white">{t}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)} className={inp}>
                {VENDOR_INV_STATUSES.map(s => <option key={s} className="bg-[#140f2d] text-white">{s}</option>)}
              </select>
            </div>

            {/* Expense Category */}
            <div>
              <label className={lbl}>Expense Category</label>
              <select value={form.expenseCategory} onChange={e => setField('expenseCategory', e.target.value)} className={inp}>
                <option value="" className="bg-[#140f2d] text-gray-400">Select Category</option>
                {expenseCategories.map(c => (
                  <option key={c.id || c.categoryName} value={c.categoryName} className="bg-[#140f2d] text-white">
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* ITC Eligible */}
            <div>
              <label className={lbl}>ITC Eligible</label>
              <select value={form.itcEligible} onChange={e => setField('itcEligible', e.target.value)} className={inp}>
                {ITC_OPTIONS.map(o => <option key={o} className="bg-[#140f2d] text-white">{o}</option>)}
              </select>
            </div>

            {/* TDS Deduction */}
            <div>
              <label className={lbl}>TDS Deduction (₹)</label>
              <input type="number" min="0" step="0.01" value={form.tdsDeduction} onChange={e => setField('tdsDeduction', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Line Items */}
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase">Line Items</h4>
            {catalogItems.length > 0 && (
              <span className="text-xs text-gray-400">Catalog items available for auto-fill</span>
            )}
          </div>

          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[40px]" />
                <col className="w-[24%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[40px]" />
              </colgroup>
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['#','Item Name','HSN/SAC','Qty','Unit','Rate (₹)','GST %','Amount (₹)',''].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-bold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 text-xs text-gray-400 font-medium">{idx + 1}</td>
                    
                    {/* Item Name with Datalist catalog lookup */}
                    <td className="px-2 py-2">
                      <input 
                        list={`catalog-list-${idx}`}
                        value={item.itemName} 
                        onChange={e => handleItemCatalogSelect(idx, e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1b1638] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" 
                        placeholder="Item name / search catalog" 
                      />
                      <datalist id={`catalog-list-${idx}`}>
                        {catalogItems.map(c => (
                          <option key={c.id} value={c.name}>{c.name} - ₹{c.price || c.costPrice}</option>
                        ))}
                      </datalist>
                    </td>

                    <td className="px-2 py-2">
                      <input 
                        value={item.hsnSac} 
                        onChange={e => updateItem(idx, 'hsnSac', e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1b1638] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30" 
                        placeholder="HSN/SAC" 
                      />
                    </td>
                    
                    <td className="px-2 py-2">
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.qty} 
                        onChange={e => updateItem(idx, 'qty', e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1b1638] text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30" 
                        placeholder="1" 
                      />
                    </td>

                    <td className="px-2 py-2">
                      <select 
                        value={item.unit} 
                        onChange={e => updateItem(idx, 'unit', e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1b1638] text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      >
                        {UNITS.map(u => <option key={u} className="bg-[#140f2d] text-white">{u}</option>)}
                      </select>
                    </td>

                    <td className="px-2 py-2">
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.rate} 
                        onChange={e => updateItem(idx, 'rate', e.target.value)} 
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1b1638] text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30" 
                        placeholder="0.00" 
                      />
                    </td>

                    <td className="px-2 py-2">
                      <select 
                        value={item.gstPercent} 
                        onChange={e => updateItem(idx, 'gstPercent', parseFloat(e.target.value))} 
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#1b1638] text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      >
                        {GST_RATES.map(g => <option key={g} value={g} className="bg-[#140f2d] text-white">{g}%</option>)}
                      </select>
                    </td>

                    <td className="px-3 py-2.5 text-sm font-semibold text-white">
                      ₹{Number(item.amount || 0).toFixed(2)}
                    </td>

                    <td className="px-2 py-2.5 text-center">
                      {items.length > 1 && (
                        <button onClick={() => setItems(p => p.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            type="button"
            onClick={() => setItems(p => [...p, emptyItem()])} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#d97706] text-amber-300 text-sm font-semibold hover:bg-amber-500/10 mb-4 transition-colors"
          >
            <Plus size={14} /> Add Line Item
          </button>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-full max-w-xs space-y-1.5 text-sm bg-white/5 p-4 rounded-xl border border-white/10">
              {[
                ['Subtotal', subtotal],
                ...(isIGST ? [['IGST', igst]] : [['CGST', cgst], ['SGST', sgst]]),
                ['TDS Deduction', -tds],
                ['Net Payable', netPayable]
              ].map(([label, val]) => (
                <div key={label} className={`flex justify-between ${label === 'Net Payable' ? 'font-bold text-amber-400 text-base border-t border-white/10 pt-2' : 'text-gray-300'}`}>
                  <span>{label}</span>
                  <span>₹{Number(Math.abs(val) || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={lbl}>Notes</label>
              <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={2} className={inp + ' resize-none'} placeholder="Additional notes, payment terms..." />
            </div>
            <div>
              <label className={lbl}>Attach Bill (PDF / Scan)</label>
              <input type="file" accept=".pdf,.jpg,.png" onChange={e => setField('attachBill', e.target.files[0])}
                className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-[#1b1638] text-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold" />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-all" 
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} 
              Save Bill
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bills List Table */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-purple-300 mb-3">All Vendor Bills</h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchBill} onChange={e => setSearchBill(e.target.value)} placeholder="Search bill no / vendor / PO..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[#1b1638] text-white" />
            </div>
            <select value={filterBillStatus} onChange={e => setFilterBillStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none bg-[#1b1638] text-white">
              <option value="ALL">All Statuses</option>
              {['Pending','Paid','Overdue','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="month" value={filterBillDate} onChange={e => setFilterBillDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/10 text-xs focus:outline-none bg-[#1b1638] text-white" />
            {(searchBill || filterBillStatus !== 'ALL' || filterBillDate) && (
              <button onClick={() => { setSearchBill(''); setFilterBillStatus('ALL'); setFilterBillDate(''); }}
                className="px-3 py-2 rounded-xl border border-white/10 text-xs text-red-400 hover:bg-red-500/10">
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Bill No','Vendor Inv No','Vendor','PO No / GRN','Bill Date','Due Date','Subtotal','GST','Net Payable','Match Status','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan={12} className="text-center py-12 text-gray-400">No vendor invoices found.</td></tr>
                ) : (
                  filteredInvoices.map((inv, i) => (
                    <tr key={inv.id || i} className="hover:bg-[rgba(255,253,245,0.05)] transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-white">{inv.billNo}</td>
                      <td className="px-4 py-3 text-xs text-gray-300">{inv.vendorInvoiceNo || '-'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-white">{inv.vendor}</td>
                      <td className="px-4 py-3 text-xs text-purple-300">
                        {inv.poNumber ? <div className="font-mono text-[11px]">{inv.poNumber}</div> : null}
                        {inv.grnNumber ? <div className="font-mono text-[10px] text-gray-400">{inv.grnNumber}</div> : null}
                        {!inv.poNumber && !inv.grnNumber ? '-' : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{inv.billDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{inv.dueDate}</td>
                      <td className="px-4 py-3 text-xs">₹{Number(inv.subtotal || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs">₹{Number((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0)).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs font-bold text-amber-300">₹{Number(inv.netPayable || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          inv.matchStatus === 'MATCHED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : inv.matchStatus === 'MISMATCHED' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}>
                          {inv.matchStatus || 'PENDING_MATCH'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex gap-2 items-center">
                          <button onClick={() => setSelectedInvoice(inv)} className="text-amber-300 hover:underline font-medium">
                            View
                          </button>
                          {inv.poNumber && inv.grnNumber && inv.matchStatus !== 'MATCHED' && (
                            <button 
                              onClick={() => handlePerform3WayMatch(inv.id)} 
                              disabled={matchingId === inv.id}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 border border-purple-500/30 text-[11px] font-semibold transition-all flex items-center gap-1"
                            >
                              {matchingId === inv.id ? (
                                <div className="w-3 h-3 border border-purple-300 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Link2 size={12} />
                              )}
                              3-Way Match
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1636] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#140f2d]/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-amber-400" />
                Invoice Details
              </h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Bill No</p>
                  <p className="text-sm text-white font-medium">{selectedInvoice.billNo}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Vendor Invoice No</p>
                  <p className="text-sm text-gray-300">{selectedInvoice.vendorInvoiceNo || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Vendor</p>
                  <p className="text-sm text-gray-300">{selectedInvoice.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Linked PO / GRN</p>
                  <p className="text-xs text-gray-300 font-mono">
                    {selectedInvoice.poNumber || '-'} / {selectedInvoice.grnNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Bill Date</p>
                  <p className="text-sm text-gray-300">{selectedInvoice.billDate}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Due Date</p>
                  <p className="text-sm text-gray-300">{selectedInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">Net Payable</p>
                  <p className="text-lg font-bold text-amber-400">₹{Number(selectedInvoice.netPayable || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300 font-semibold mb-1">3-Way Match Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedInvoice.matchStatus === 'MATCHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedInvoice.matchStatus || 'PENDING_MATCH'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-white/10 bg-[#140f2d]/50 flex justify-end">
              <button onClick={() => setSelectedInvoice(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}