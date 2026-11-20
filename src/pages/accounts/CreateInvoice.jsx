import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FilePlus, Plus, Trash2, Send, Mail } from 'lucide-react';

import {
  createInvoice,
} from "../../services/account/accountInvoice.services";
import api from '../../interceptors/interceptors';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
const GST_RATES = ['0%','5%','12%','18%','28%'];
const UNITS = ['Nos','Kgs','Ltrs','Mtrs','Sqft','Hours','Days','Box','Pcs','Set','Pair'];
const PAYMENT_TERMS = ['Immediate','Net 7','Net 15','Net 30','Net 45','Net 60','Net 90'];
const CURRENCIES = ['INR','USD','EUR','GBP','AED','SGD'];
const INVOICE_STATUSES = ['Draft','Sent','Pending','Paid','Overdue','Cancelled'];

const emptyItem = () => ({ itemId: '', itemName: '', hsnSac: '', qty: 1, unit: 'Nos', rate: 0, discount: 0, gstPercent: 0, amount: 0 });

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Master Data
  const [clients, setClients] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);

  const [form, setForm] = useState({
    invoiceNumber: 'INV-0001',
    invoiceDate: '',
    dueDate: '',
    status: 'Draft',
    customerId: '',
    customerName: '',
    customerGstin: '',
    customerPan: '',
    customerEmail: '',
    billingAddress: '',
    shippingAddress: '',
    paymentTerms: 'Immediate',
    currency: 'INR',
    referenceNo: '',
    placeOfSupply: 'Tamil Nadu',
    salesPerson: '',
    project: '',
    bankAccount: 'HDFC — ****1234',
    notes: '',
    internalRemarks: '',
    attachDocument: null,
  });

  const [items, setItems] = useState([emptyItem()]);

  useEffect(() => {
    // Load Master Data
    Promise.allSettled([
      api.get('/clients'),
      api.get('/items')
    ]).then(([clientsRes, itemsRes]) => {
      if (clientsRes.status === 'fulfilled') {
        setClients(Array.isArray(clientsRes.value.data) ? clientsRes.value.data : []);
      }
      if (itemsRes.status === 'fulfilled') {
        setCatalogItems(Array.isArray(itemsRes.value.data) ? itemsRes.value.data : []);
      }
    });
  }, []);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => String(c.id) === String(clientId));
    
    if (client) {
      setForm(p => ({
        ...p,
        customerId: client.id,
        customerName: client.companyName || client.name || '',
        customerGstin: client.gstin || client.gstNo || '',
        customerPan: client.pan || '',
        customerEmail: client.email || '',
        billingAddress: client.address || client.billingAddress || '',
        shippingAddress: client.shippingAddress || client.address || '',
      }));
    } else {
      setForm(p => ({
        ...p,
        customerId: '',
        customerName: '',
        customerGstin: '',
        customerPan: '',
        customerEmail: '',
        billingAddress: '',
        shippingAddress: '',
      }));
    }
  };

  const handleCatalogItemChange = (idx, itemId) => {
    const catalogItem = catalogItems.find(i => String(i.id) === String(itemId));
    if (catalogItem) {
      setItems(prev => {
        const copy = [...prev];
        copy[idx] = calcItem({
          ...copy[idx],
          itemId: catalogItem.id,
          itemName: catalogItem.itemName || catalogItem.name || '',
          hsnSac: catalogItem.hsnCode || catalogItem.sku || '',
          unit: catalogItem.unit || 'Nos',
          rate: catalogItem.price || 0,
          gstPercent: catalogItem.taxRate || 18,
        });
        return copy;
      });
    } else {
      updateItem(idx, 'itemId', '');
      updateItem(idx, 'itemName', '');
    }
  };

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const calcItem = (item) => {
    const base = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
    const disc = base * ((parseFloat(item.discount) || 0) / 100);
    const taxable = base - disc;
    const gst = taxable * ((parseFloat(item.gstPercent) || 0) / 100);
    return { ...item, amount: taxable + gst };
  };

  const updateItem = (idx, k, v) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = calcItem({ ...copy[idx], [k]: v });
      return copy;
    });
  };

  const subtotal   = items.reduce((s, i) => s + ((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0) - ((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0))*((parseFloat(i.discount)||0)/100)), 0);
  const totalDisc  = items.reduce((s, i) => s + ((parseFloat(i.qty)||0)*(parseFloat(i.rate)||0))*((parseFloat(i.discount)||0)/100), 0);
  const isIGST     = form.placeOfSupply !== 'Tamil Nadu'; // simplified
  const totalGst   = items.reduce((s, i) => { const base=(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0)-(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0)*((parseFloat(i.discount)||0)/100); return s+base*((parseFloat(i.gstPercent)||0)/100); }, 0);
  const cgst       = isIGST ? 0 : totalGst / 2;
  const sgst       = isIGST ? 0 : totalGst / 2;
  const igst       = isIGST ? totalGst : 0;
  const grandTotal = subtotal + totalGst;

  const buildPayload = () => ({
    invoiceNumber: form.invoiceNumber,
    invoiceDate: form.invoiceDate || null,
    dueDate: form.dueDate || null,
    status: form.status.toUpperCase(),

    // CUSTOMER
    customerId: form.customerId || null,
    customerName: form.customerName,
    gstNo: form.customerGstin,
    email: form.customerEmail,

    // ADDRESS
    address: form.billingAddress,
    deliveryAddress: form.shippingAddress,

    // PAYMENT & SETTINGS
    paymentMethod: form.paymentTerms,
    currency: form.currency,
    buyerOrderNo: form.referenceNo,
    placeOfSupply: form.placeOfSupply,

    // AMOUNT
    totalAmount: grandTotal,
    
    // ITEMS
    items: items.map(i => ({
      itemId: i.itemId || null,
      itemName: i.itemName,
      hsn: i.hsnSac,
      quantity: parseFloat(i.qty) || 0,
      uom: i.unit,
      price: parseFloat(i.rate) || 0,
      tax: parseFloat(i.gstPercent) || 0
    }))
  });

  const handleSave = async () => {
    setSaving(true);
    setMsg('');

    try {
      const payload = buildPayload();
      const response = await createInvoice(payload);

      setMsg('Invoice saved successfully!');
      console.log('Saved Invoice:', response);

      setTimeout(() => {
        navigate('/dashboard/accounts/invoices/list');
      }, 1000);
    } catch (error) {
      console.error('Save invoice error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        'Failed to save invoice.';
      setMsg(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDraft = async () => {
    setSaving(true);
    setMsg('');

    try {
      const payload = {
        ...buildPayload(),
        status: 'DRAFT',
      };
      const response = await createInvoice(payload);
      setMsg('Saved as draft!');
      console.log('Draft Invoice:', response);
    } catch (error) {
      console.error('Draft save error:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        'Failed to save draft invoice.';
      setMsg(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "block text-xs font-semibold text-purple-300 mb-1";
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-[#1b1638]";

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/accounts')} className="hover:text-amber-300">Accounts Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/accounts/invoices/list')} className="hover:text-amber-300">Invoice List</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Create Invoice</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <FilePlus size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Create Invoice</h2>
          <p className="text-sm text-gray-400">Create a new customer invoice with GST</p>
        </div>
      </div>

      {msg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('Error')||msg.includes('Failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>{msg}</div>}

      {/* Invoice Details */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Invoice Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Invoice Number *</label>
            <input value={form.invoiceNumber} onChange={e => setField('invoiceNumber', e.target.value)} className={inputCls} placeholder="INV-0001" />
            <p className="text-xs text-gray-400 mt-1">Auto-increments if blank</p>
          </div>
          <div>
            <label className={labelCls}>Invoice Date *</label>
            <input type="date" value={form.invoiceDate} onChange={e => setField('invoiceDate', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Due Date *</label>
            <input type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Select Customer *</label>
            <select value={form.customerId} onChange={handleClientChange} className={inputCls}>
              <option value="">-- Choose Customer --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.companyName || c.name || `Client #${c.id}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Customer Name</label>
            <input value={form.customerName} onChange={e => setField('customerName', e.target.value)} className={inputCls} placeholder="Customer Name" />
          </div>
          <div>
            <label className={labelCls}>Customer GSTIN</label>
            <input value={form.customerGstin} onChange={e => setField('customerGstin', e.target.value)} className={inputCls} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className={labelCls}>Customer PAN</label>
            <input value={form.customerPan} onChange={e => setField('customerPan', e.target.value)} className={inputCls} placeholder="AAAAA0000A" />
          </div>
          <div>
            <label className={labelCls}>Customer Email</label>
            <input type="email" value={form.customerEmail} onChange={e => setField('customerEmail', e.target.value)} className={inputCls} placeholder="customer@email.com" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Billing Address *</label>
            <textarea value={form.billingAddress} onChange={e => setField('billingAddress', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Street, City, State, PIN" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Shipping Address</label>
            <textarea value={form.shippingAddress} onChange={e => setField('shippingAddress', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Same as billing or different" />
          </div>
          <div>
            <label className={labelCls}>Payment Terms</label>
            <select value={form.paymentTerms} onChange={e => setField('paymentTerms', e.target.value)} className={inputCls}>
              {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select value={form.currency} onChange={e => setField('currency', e.target.value)} className={inputCls}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Reference / PO Number</label>
            <input value={form.referenceNo} onChange={e => setField('referenceNo', e.target.value)} className={inputCls} placeholder="PO-XXXX" />
          </div>
          <div>
            <label className={labelCls}>Place of Supply</label>
            <select value={form.placeOfSupply} onChange={e => setField('placeOfSupply', e.target.value)} className={inputCls}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sales Person</label>
            <input value={form.salesPerson} onChange={e => setField('salesPerson', e.target.value)} className={inputCls} placeholder="Assigned sales person" />
          </div>
          <div>
            <label className={labelCls}>Project / Cost Center</label>
            <input value={form.project} onChange={e => setField('project', e.target.value)} className={inputCls} placeholder="Optional" />
          </div>
         <div>
            <label className={labelCls}>Bank Account for Payment</label>
            <input value={form.bankAccount} onChange={e => setField('bankAccount', e.target.value)} className={inputCls} placeholder="e.g. HDFC — **1234" />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4 overflow-hidden">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Line Items</h3>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.08), rgba(251,191,36,0.08))' }}>
                {['#','Select Catalog Item','Item Description','HSN/SAC','Qty','Unit','Rate (₹)','Discount','GST %','Amount (₹)',''].map((h, i) => (
                  <th key={i} className="text-left px-3 py-2.5 text-xs font-bold text-white whitespace-nowrap" style={{ background: '#8b5cf6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-white/10">
                  <td className="px-3 py-2 text-xs text-gray-400">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <select value={item.itemId || ''} onChange={e => handleCatalogItemChange(idx, e.target.value)} className="w-36 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 bg-[#140f2d]/80 text-gray-200">
                      <option value="">- Custom Item -</option>
                      {catalogItems.map(ci => (
                        <option key={ci.id} value={ci.id}>{ci.itemName || ci.name || `Item #${ci.id}`}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input value={item.itemName} onChange={e => updateItem(idx, 'itemName', e.target.value)} className="w-36 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 bg-[#140f2d]/80 text-gray-200" placeholder="Item name" /></td>
                  <td className="px-3 py-2"><input value={item.hsnSac} onChange={e => updateItem(idx, 'hsnSac', e.target.value)} className="w-20 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80 text-gray-200" placeholder="HSN" /></td>
                  <td className="px-3 py-2"><input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} className="w-16 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80 text-gray-200" /></td>
                  <td className="px-3 py-2">
                    <select value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} className="w-20 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80 text-gray-200">
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input type="number" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} className="w-24 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80 text-gray-200" /></td>
                  <td className="px-3 py-2">
                    <select value={item.discount + '%'} onChange={e => updateItem(idx, 'discount', parseFloat(e.target.value))} className="w-20 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80 text-gray-200">
                      {['0%','5%','10%','15%','20%','25%'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select value={item.gstPercent + '%'} onChange={e => updateItem(idx, 'gstPercent', parseFloat(e.target.value))} className="w-20 px-2 py-1.5 rounded-lg border border-white/10 text-xs focus:outline-none bg-[#140f2d]/80 text-gray-200">
                      {GST_RATES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 font-semibold text-xs text-white">₹{Number(item.amount||0).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    {items.length > 1 && (
                      <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setItems(prev => [...prev, emptyItem()])}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-[#d97706] text-amber-300 text-sm font-semibold hover:bg-amber-500/10 transition-colors">
          <Plus size={14} /> Add Line Item
        </button>

        {/* Summary */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-sm space-y-2 text-sm">
            {[
              { label: 'Subtotal',        value: subtotal,   bold: false },
              { label: 'Total Discount',  value: totalDisc,  bold: false },
              ...(isIGST
                ? [{ label: 'IGST',       value: igst,       bold: false }]
                : [{ label: 'CGST',       value: cgst,       bold: false }, { label: 'SGST', value: sgst, bold: false }]
              ),
              { label: 'Round Off',       value: 0,          bold: false },
              { label: 'Grand Total',     value: grandTotal, bold: true  },
            ].map(({ label, value, bold }) => (
              <div key={label} className={`flex justify-between ${bold ? 'font-bold text-white text-base border-t border-white/10 pt-2' : 'text-gray-300'}`}>
                <span>{label}</span>
                <span>₹{Number(value||0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-purple-300 mb-4 pb-2 border-b border-white/10">Additional Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Notes / Terms &amp; Conditions</label>
            <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Payment terms, bank details, thank you note…" />
          </div>
          <div>
            <label className={labelCls}>Internal Remarks</label>
            <textarea value={form.internalRemarks} onChange={e => setField('internalRemarks', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Not visible on invoice PDF" />
          </div>
          <div>
            <label className={labelCls}>Attach Document</label>
            <input type="file" accept=".pdf,.jpg,.png" onChange={e => setField('attachDocument', e.target.files[0])}
              className="w-full px-3 py-2 rounded-xl border border-white/10 text-sm bg-white/5 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#fef3c7] file:text-[#d97706] file:text-xs file:font-semibold" />
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 5MB</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          Save Invoice
        </button>
        <button onClick={handleDraft} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
          Save as Draft
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
          Preview PDF
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10">
          <Mail size={14} /> Send via Email
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-[#059669] hover:bg-green-50">
          <Send size={14} /> Send via WhatsApp
        </button>
      </div>
    </div>
  );
}