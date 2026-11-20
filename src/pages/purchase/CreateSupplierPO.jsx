// CreateSupplierPO.jsx — Purchase Management > Purchase Orders > Create Supplier PO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, FileText, Save, RotateCcw, Plus, Trash2, Paperclip,
} from 'lucide-react';

import { createSupplierPO } from "../../services/purchase/supplierPO.services";

const PAYMENT_TERMS = ['Immediate', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90'];
const UNITS = ['Nos', 'Kgs', 'Ltrs', 'Mtrs', 'Sqft', 'Hours', 'Days', 'Box', 'Pcs', 'Set', 'Pair', 'NOS'];
const GST_RATES = [0, 5, 12, 18, 28];
const TRANSPORT_MODES = ['VAN', 'Lorry', 'Courier', 'Hand Delivery', 'Rail', 'Air', 'Other'];

const emptyItem = () => ({
  slNo: '',
  description: '',
  hsnSac: '',
  quantity: '',
  uom: 'Nos',
  rate: '',
  amount: '',
  cgstRate: 9,
  sgstRate: 9,
  igstRate: 0,
  cgstAmt: 0,
  sgstAmt: 0,
  igstAmt: 0,
  taxableValue: '',
});

const calcItem = (item) => {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const taxable = qty * rate;
  const cgstAmt = taxable * ((parseFloat(item.cgstRate) || 0) / 100);
  const sgstAmt = taxable * ((parseFloat(item.sgstRate) || 0) / 100);
  const igstAmt = taxable * ((parseFloat(item.igstRate) || 0) / 100);
  const amount = taxable + cgstAmt + sgstAmt + igstAmt;
  return { ...item, taxableValue: taxable.toFixed(2), cgstAmt: cgstAmt.toFixed(2), sgstAmt: sgstAmt.toFixed(2), igstAmt: igstAmt.toFixed(2), amount: amount.toFixed(2) };
};

const inp = "h-10 px-3 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all w-full";
const sel = inp + " appearance-none";
const lbl = "block text-xs font-semibold text-purple-300 mb-1";

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 pb-2 border-b border-white/10">{title}</h3>
    {children}
  </div>
);

const INITIAL_FORM = {
  // Invoice meta
  invoiceNo: '',
  invoiceDate: '',
  deliveryNoteNo: '',
  deliveryNoteDate: '',
  modeTermsOfPayment: '',
  referenceNo: '',
  referenceDate: '',
  otherReferences: '',
  buyersOrderNo: '',
  buyersOrderDate: '',
  dispatchDocNo: '',
  dispatchedThrough: '',
  destination: '',
  deliveryNoteDate2: '',
  modeOfDespatch: '',
  termsOfDelivery: '',
  // Supplier (Consignee / Ship to)
  supplierName: '',
  supplierAddress: '',
  supplierGstin: '',
  supplierStateCode: '',
  // Buyer (Bill to / Consignee)
  buyerName: '',
  buyerAddress: '',
  buyerGstin: '',
  buyerStateCode: '',
  // Ship to (if different)
  shipToName: '',
  shipToAddress: '',
  shipToGstin: '',
  shipToStateCode: '',
  // Additional
  colourCoated: '',
  remarks: '',
  attachedFile: null,
  attachedFileName: '',
};

export default function CreateSupplierPO() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [items, setItems] = useState([emptyItem()]);
  const [saved, setSaved] = useState(false);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(p => ({ ...p, attachedFile: ev.target.result, attachedFileName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (idx, k, v) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = calcItem({ ...copy[idx], [k]: v });
      return copy;
    });
  };

  const addItem = () => setItems(p => [...p, emptyItem()]);
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));

  const taxableTotal = items.reduce((s, i) => s + (parseFloat(i.taxableValue) || 0), 0);
  const cgstTotal    = items.reduce((s, i) => s + (parseFloat(i.cgstAmt) || 0), 0);
  const sgstTotal    = items.reduce((s, i) => s + (parseFloat(i.sgstAmt) || 0), 0);
  const igstTotal    = items.reduce((s, i) => s + (parseFloat(i.igstAmt) || 0), 0);
  const grandTotal   = taxableTotal + cgstTotal + sgstTotal + igstTotal;

  // const handleSave = () => {
  //   if (!form.invoiceNo || !form.supplierName || !form.invoiceDate) {
  //     alert('Please fill Invoice No, Supplier Name and Invoice Date.');
  //     return;
  //   }
  //   const existing = JSON.parse(localStorage.getItem('mveng_supplier_pos') || '[]');
  //   const newEntry = {
  //     id: form.invoiceNo,
  //     invoiceNo: form.invoiceNo,
  //     invoiceDate: form.invoiceDate,
  //     supplierName: form.supplierName,
  //     supplierGstin: form.supplierGstin,
  //     buyerName: form.buyerName,
  //     buyerGstin: form.buyerGstin,
  //     destination: form.destination,
  //     modeTermsOfPayment: form.modeTermsOfPayment,
  //     referenceNo: form.referenceNo,
  //     taxableTotal: taxableTotal.toFixed(2),
  //     cgstTotal: cgstTotal.toFixed(2),
  //     sgstTotal: sgstTotal.toFixed(2),
  //     igstTotal: igstTotal.toFixed(2),
  //     grandTotal: grandTotal.toFixed(2),
  //     items,
  //     attachedFile: form.attachedFile,
  //     attachedFileName: form.attachedFileName,
  //     colourCoated: form.colourCoated,
  //     remarks: form.remarks,
  //     dispatchedThrough: form.dispatchedThrough,
  //     buyersOrderNo: form.buyersOrderNo,
  //     deliveryNoteNo: form.deliveryNoteNo,
  //     modeOfDespatc: form.modeOfDespatc,
  //   };
  //   existing.push(newEntry);
  //   localStorage.setItem('mveng_supplier_pos', JSON.stringify(existing));
  //   setSaved(true);
  //   setTimeout(() => navigate('/dashboard/purchase/purchase-orders/supplier-po-list'), 1200);
  // };

  const handleSave = async () => {
  if (!form.invoiceNo || !form.supplierName || !form.invoiceDate) {
    alert("Please fill Invoice No, Supplier Name and Invoice Date.");
    return;
  }

  try {
   
    const payload = {
  invoiceNo: form.invoiceNo,
 invoiceDate: form.invoiceDate || null,

  deliveryNoteNo: form.deliveryNoteNo,
  deliveryNoteDate: form.deliveryNoteDate || null,
  modeTermsOfPayment: form.modeTermsOfPayment,
  referenceNo: form.referenceNo,
  otherReferences: form.otherReferences,
  buyersOrderNo: form.buyersOrderNo,
  dispatchDocNo: form.dispatchDocNo,
  dispatchedThrough: form.dispatchedThrough,
  destination: form.destination,

  supplierName: form.supplierName,
  supplierAddress: form.supplierAddress,
  supplierGstin: form.supplierGstin,
  supplierStateCode: form.supplierStateCode,

  buyerName: form.buyerName || "Default Buyer",
  buyerAddress: form.buyerAddress,
  buyerGstin: form.buyerGstin,
  buyerStateCode: form.buyerStateCode,

  shipToName: form.shipToName,
  shipToAddress: form.shipToAddress,
  shipToGstin: form.shipToGstin,
  shipToStateCode: form.shipToStateCode,

  taxableTotal,
  cgstTotal,
  sgstTotal,
  igstTotal,
  grandTotal,
  attachmentDocument: form.attachedFile,
  remarks: form.remarks,

  items: items
  .filter(item => item.description && item.quantity && item.rate)
  .map(item => ({
    description: item.description || "Item",
    hsnSac: item.hsnSac || "",
    quantity: item.quantity ? Number(item.quantity) : 0,
    uom: item.uom || "Nos",
    rate: item.rate ? Number(item.rate) : 0,
    taxableValue: item.taxableValue ? Number(item.taxableValue) : 0,
    cgstAmt: item.cgstAmt ? Number(item.cgstAmt) : 0,
    cgstRate: item.cgstRate ? Number(item.cgstRate) : 0,
    sgstAmt: item.sgstAmt ? Number(item.sgstAmt) : 0,
    sgstRate: item.sgstRate ? Number(item.sgstRate) : 0,
    igstAmt: item.igstAmt ? Number(item.igstAmt) : 0,
    igstRate: item.igstRate ? Number(item.igstRate) : 0,
    amount: item.amount ? Number(item.amount) : 0,
  }))
};

    await createSupplierPO(payload);

    setSaved(true);

    setTimeout(() => {
      navigate("/dashboard/purchase/purchase-orders/supplier-po-list");
    }, 1200);
  } catch (error) {
    console.error("Error saving supplier PO:", error);
    alert("Failed to save Supplier PO.");
  }
};

  const handleReset = () => { setForm(INITIAL_FORM); setItems([emptyItem()]); };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium flex-wrap">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')} className="hover:text-purple-300 transition-colors">Purchase Orders</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Create Supplier PO</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <FileText size={22} style={{ color: '#6366f1' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create Supplier PO</h2>
          <p className="text-sm text-gray-400">Enter supplier tax invoice details</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl mb-5 text-sm font-medium">
          Supplier PO saved! Redirecting…
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 p-6 md:p-8">

        {/* ── Invoice Details ── */}
        <Section title="Invoice Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className={lbl}>Invoice No *</label><input className={inp} value={form.invoiceNo} onChange={e => setField('invoiceNo', e.target.value)} placeholder="e.g. D335 / 545" /></div>
            <div><label className={lbl}>Invoice Date *</label><input type="date" className={inp} value={form.invoiceDate} onChange={e => setField('invoiceDate', e.target.value)} /></div>
            <div><label className={lbl}>Delivery Note No</label><input className={inp} value={form.deliveryNoteNo} onChange={e => setField('deliveryNoteNo', e.target.value)} /></div>
            <div><label className={lbl}>Delivery Note Date</label><input type="date" className={inp} value={form.deliveryNoteDate} onChange={e => setField('deliveryNoteDate', e.target.value)} /></div>
            <div><label className={lbl}>Mode / Terms of Payment</label>
              <select className={sel} value={form.modeTermsOfPayment} onChange={e => setField('modeTermsOfPayment', e.target.value)}>
                <option value="">Select</option>
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Reference No &amp; Date</label><input className={inp} value={form.referenceNo} onChange={e => setField('referenceNo', e.target.value)} placeholder="Ref no" /></div>
            <div><label className={lbl}>Other References</label><input className={inp} value={form.otherReferences} onChange={e => setField('otherReferences', e.target.value)} /></div>
            <div><label className={lbl}>Buyer's Order No</label><input className={inp} value={form.buyersOrderNo} onChange={e => setField('buyersOrderNo', e.target.value)} /></div>
            <div><label className={lbl}>Buyer's Order Date</label><input type="date" className={inp} value={form.buyersOrderDate} onChange={e => setField('buyersOrderDate', e.target.value)} /></div>
            <div><label className={lbl}>Dispatch Doc No</label><input className={inp} value={form.dispatchDocNo} onChange={e => setField('dispatchDocNo', e.target.value)} /></div>
            <div><label className={lbl}>Dispatched Through</label><input className={inp} value={form.dispatchedThrough} onChange={e => setField('dispatchedThrough', e.target.value)} placeholder="e.g. VAN, Courier" /></div>
            <div><label className={lbl}>Destination</label><input className={inp} value={form.destination} onChange={e => setField('destination', e.target.value)} placeholder="Delivery destination" /></div>
            <div><label className={lbl}>Mode of Despatch</label>
              <select className={sel} value={form.modeOfDespatch} onChange={e => setField('modeOfDespatch', e.target.value)}>
                <option value="">Select</option>
                {TRANSPORT_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Terms of Delivery</label><input className={inp} value={form.termsOfDelivery} onChange={e => setField('termsOfDelivery', e.target.value)} /></div>
            <div><label className={lbl}>Colour Coated</label><input className={inp} value={form.colourCoated} onChange={e => setField('colourCoated', e.target.value)} placeholder="e.g. RAL 7035" /></div>
          </div>
        </Section>

        {/* ── Supplier (Consignee / Ship from) ── */}
        <Section title="Supplier Details (Consignee / Seller)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2"><label className={lbl}>Supplier / Company Name *</label><input className={inp} value={form.supplierName} onChange={e => setField('supplierName', e.target.value)} placeholder="e.g. H Peer Mohammed (Barakath Steels)" /></div>
            <div className="lg:col-span-2"><label className={lbl}>Supplier Address</label><input className={inp} value={form.supplierAddress} onChange={e => setField('supplierAddress', e.target.value)} placeholder="Full address" /></div>
            <div><label className={lbl}>Supplier GSTIN</label><input className={inp} value={form.supplierGstin} onChange={e => setField('supplierGstin', e.target.value)} placeholder="e.g. 33AAHPP9535E1Z" /></div>
            <div><label className={lbl}>State Code</label><input className={inp} value={form.supplierStateCode} onChange={e => setField('supplierStateCode', e.target.value)} placeholder="e.g. 33" /></div>
          </div>
        </Section>

        {/* ── Buyer (Bill to) ── */}
        <Section title="Buyer Details (Bill To)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2"><label className={lbl}>Buyer / Company Name</label><input className={inp} value={form.buyerName} onChange={e => setField('buyerName', e.target.value)} placeholder="e.g. Aminoid Ai" /></div>
            <div className="lg:col-span-2"><label className={lbl}>Buyer Address</label><input className={inp} value={form.buyerAddress} onChange={e => setField('buyerAddress', e.target.value)} placeholder="Full billing address" /></div>
            <div><label className={lbl}>Buyer GSTIN</label><input className={inp} value={form.buyerGstin} onChange={e => setField('buyerGstin', e.target.value)} placeholder="e.g. 33AXAPM7037J1ZH" /></div>
            <div><label className={lbl}>State Code</label><input className={inp} value={form.buyerStateCode} onChange={e => setField('buyerStateCode', e.target.value)} placeholder="e.g. 33" /></div>
          </div>
        </Section>

        {/* ── Ship To (Consignee) ── */}
        <Section title="Ship To (Consignee — if different from Buyer)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2"><label className={lbl}>Ship To Name</label><input className={inp} value={form.shipToName} onChange={e => setField('shipToName', e.target.value)} /></div>
            <div className="lg:col-span-2"><label className={lbl}>Ship To Address</label><input className={inp} value={form.shipToAddress} onChange={e => setField('shipToAddress', e.target.value)} /></div>
            <div><label className={lbl}>GSTIN</label><input className={inp} value={form.shipToGstin} onChange={e => setField('shipToGstin', e.target.value)} /></div>
            <div><label className={lbl}>State Code</label><input className={inp} value={form.shipToStateCode} onChange={e => setField('shipToStateCode', e.target.value)} /></div>
          </div>
        </Section>

        {/* ── Line Items ── */}
        <Section title="Line Items">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr style={{ background: '#8b5cf6' }}>
                  {['Sl No','Description','HSN/SAC','Qty','UoM','Rate (₹)','Taxable Value','CGST %','CGST Amt','SGST %','SGST Amt','IGST %','IGST Amt','Amount (₹)',''].map(h => (
                    <th key={h} className="px-2 py-2.5 text-left text-white font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-[rgba(139,92,246,0.08)]">
                    <td className="px-2 py-1.5"><input className="w-12 px-2 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]" value={item.slNo} onChange={e => updateItem(idx, 'slNo', e.target.value)} placeholder={idx + 1} /></td>
                    <td className="px-2 py-1.5"><input className="w-40 px-2 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Item / service description" /></td>
                    <td className="px-2 py-1.5"><input className="w-20 px-2 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]" value={item.hsnSac} onChange={e => updateItem(idx, 'hsnSac', e.target.value)} placeholder="HSN" /></td>
                    <td className="px-2 py-1.5"><input type="number" className="w-16 px-2 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></td>
                    <td className="px-2 py-1.5">
                      <select className="w-20 px-2 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1] appearance-none" value={item.uom} onChange={e => updateItem(idx, 'uom', e.target.value)}>
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5"><input type="number" className="w-24 px-2 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1]" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} /></td>
                    <td className="px-2 py-1.5 font-semibold text-white">₹{item.taxableValue || '0.00'}</td>
                    <td className="px-2 py-1.5">
                      <select className="w-16 px-1 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1] appearance-none" value={item.cgstRate} onChange={e => updateItem(idx, 'cgstRate', parseFloat(e.target.value))}>
                        {[0,2.5,6,9,14].map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-gray-300">₹{item.cgstAmt || '0.00'}</td>
                    <td className="px-2 py-1.5">
                      <select className="w-16 px-1 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1] appearance-none" value={item.sgstRate} onChange={e => updateItem(idx, 'sgstRate', parseFloat(e.target.value))}>
                        {[0,2.5,6,9,14].map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-gray-300">₹{item.sgstAmt || '0.00'}</td>
                    <td className="px-2 py-1.5">
                      <select className="w-16 px-1 py-1.5 rounded-lg border border-white/10 bg-[#140f2d]/80 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-[#6366f1] appearance-none" value={item.igstRate} onChange={e => updateItem(idx, 'igstRate', parseFloat(e.target.value))}>
                        {[0,5,12,18,28].map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-gray-300">₹{item.igstAmt || '0.00'}</td>
                    <td className="px-2 py-1.5 font-bold text-white">₹{item.amount || '0.00'}</td>
                    <td className="px-2 py-1.5">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={13} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={addItem} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#6366f1] text-[#6366f1] text-sm font-semibold hover:bg-[rgba(139,92,246,0.12)] transition-colors">
            <Plus size={14} /> Add Line Item
          </button>

          {/* Summary */}
          <div className="mt-5 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              {[
                { label: 'Taxable Value',  value: taxableTotal, bold: false },
                { label: 'CGST Total',     value: cgstTotal,    bold: false },
                { label: 'SGST Total',     value: sgstTotal,    bold: false },
                { label: 'IGST Total',     value: igstTotal,    bold: false },
                { label: 'Grand Total',    value: grandTotal,   bold: true  },
              ].map(({ label, value, bold }) => (
                <div key={label} className={`flex justify-between ${bold ? 'font-bold text-white text-base border-t border-white/10 pt-2 mt-2' : 'text-gray-300'}`}>
                  <span>{label}</span>
                  <span>₹{Number(value).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Attach Document ── */}
        <Section title="Attach Document">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer w-fit px-5 py-3 rounded-xl border-2 border-dashed border-[#6366f1] text-[#6366f1] hover:bg-[rgba(139,92,246,0.12)] transition-colors">
              <Paperclip size={16} />
              <span className="text-sm font-semibold">Choose File (PDF / JPG / PNG)</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
            </label>
            {form.attachedFileName && (
              <div className="flex items-center gap-2 mt-1 text-sm text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl w-fit">
                <Paperclip size={13} />
                <span className="font-medium">{form.attachedFileName}</span>
                <button onClick={() => setForm(p => ({ ...p, attachedFile: null, attachedFileName: '' }))} className="ml-2 text-gray-400 hover:text-red-400 text-xs">✕ Remove</button>
              </div>
            )}
          </div>
        </Section>

        {/* ── Remarks ── */}
        <Section title="Remarks / Declaration">
          <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-[#140f2d]/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" value={form.remarks} onChange={e => setField('remarks', e.target.value)} placeholder="Declaration, payment terms, authorised signatory note…" />
        </Section>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:bg-white/10 transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Save size={15} /> Save Supplier PO
          </button>
        </div>
      </div>
    </div>
  );
}
