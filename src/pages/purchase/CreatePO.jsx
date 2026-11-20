import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ChevronRight, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

import { createOrder } from "../../services/purchase/purchaseOrder.services";
import { getAllVendors } from "../../services/vendor/vendor.services";
import { getAllWarehouses } from "../../services/stock/wareHouse.services";
import { getItems } from "../../services/purchase/inventory.services";

const PAYMENT_STATUS_OPTIONS = [
  { value: 'Paid',    label: 'Paid' },
  { value: 'Unpaid',  label: 'Unpaid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Partial', label: 'Partial' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'Cash',          label: 'Cash' },
  { value: 'Cheque',        label: 'Cheque' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI',           label: 'UPI' },
  { value: 'NEFT',          label: 'NEFT' },
  { value: 'RTGS',          label: 'RTGS' },
];

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const INITIAL_ITEM = {
  itemId: '',
  itemName: '',
  quantity: 1,
  unitPrice: 0,
  taxAmount: 0,
  discount: 0,
  totalAmount: 0
};

const INITIAL = {
  orderNumber:          '',
  orderDate:            '',
  expectedDeliveryDate: '',  
  supplierName:         '',  
  supplierContact:      '',  
  supplierEmail:        '',  
  vendorAddress:        '',
  vendorTaxDetails:     '',
  deliveryAddress:      '',
  warehouse:            '',
  totalAmount:          '',
  taxAmount:            '',
  discount:             '',
  netAmount:            '',
  currency:             'INR',
  paymentStatus:        '',
  paymentMethod:        '',
  status:               'CREATED',
  remarks:              '',
  createdBy:            '',
};

const InputField = ({ label, name, value, onChange, type = 'text', placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder || label}
      className="h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#6366f1]/50 transition-all" />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">{label}</label>
    <select name={name} value={value} onChange={onChange}
      className="h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#6366f1]/50 transition-all appearance-none"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}>
      <option value="" className="bg-[#140f2d]">{label}</option>
      {options.map(o => <option key={o.value} value={o.value} className="bg-[#140f2d]">{o.label}</option>)}
    </select>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 pb-2 border-b border-white/10">{title}</h3>
    {children}
  </div>
);

const CreatePO = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(INITIAL);
  const [items, setItems] = useState([{ ...INITIAL_ITEM, id: Date.now() }]);
  const [saved, setSaved] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');

  // Auto PO Number and default Order Date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const autoPoNum = `PO-${new Date().getFullYear()}-${randomSuffix}`;
    setForm(prev => ({
      ...prev,
      orderNumber: prev.orderNumber || autoPoNum,
      orderDate: prev.orderDate || today,
    }));
  }, []);

  // Auto-fill from QuotationComparison if present
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const autoPoNum = `PO-${Date.now().toString().slice(-6)}`;
    
    if (location.state && location.state.vendor) {
      const v = location.state.vendor;
      const rfq = location.state.rfq || {};
      const itemName = rfq.itemName || rfq.item || 'Industrial Steel Rods (100 Kg)';
      const quantity = Number(rfq.quantity) || 100;
      const defaultDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setForm(prev => ({
        ...prev,
        orderNumber: prev.orderNumber || autoPoNum,
        orderDate: prev.orderDate || today,
        supplierName: v.name,
        expectedDeliveryDate: rfq.requiredDeliveryDate || defaultDelivery,
        remarks: `Auto-generated from Quotation Comparison (${v.name}, RFQ: ${rfq.rfqNumber || 'N/A'}${location.state.reason ? ' - Reason: ' + location.state.reason : ''})`
      }));
      setSelectedVendorId(v.id || v.vendorId);
      
      // Auto fill item from quotation
      setItems([{
        id: Date.now(),
        itemId: 101,
        itemName: itemName,
        quantity: quantity,
        unitPrice: v.unitPrice || 420,
        taxAmount: v.tax || 0,
        discount: v.discount || 0,
        totalAmount: v.total || (quantity * (v.unitPrice || 420))
      }]);
    } else {
      setForm(prev => ({
        ...prev,
        orderNumber: prev.orderNumber || autoPoNum,
        orderDate: prev.orderDate || today
      }));
    }
  }, [location.state]);

  useEffect(() => {
    getAllVendors()
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]));

    getAllWarehouses()
      .then(data => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));

    getItems()
      .then(data => setCatalogItems(Array.isArray(data) ? data : []))
      .catch(() => setCatalogItems([]));
  }, []);

  // Update total amounts whenever items change
  useEffect(() => {
    let tAmount = 0, tTax = 0, tDisc = 0, nAmount = 0;
    items.forEach(i => {
      tAmount += (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0);
      tTax += parseFloat(i.taxAmount) || 0;
      tDisc += parseFloat(i.discount) || 0;
      nAmount += parseFloat(i.totalAmount) || 0;
    });
    setForm(prev => ({
      ...prev,
      totalAmount: tAmount.toFixed(2),
      taxAmount: tTax.toFixed(2),
      discount: tDisc.toFixed(2),
      netAmount: nAmount.toFixed(2)
    }));
  }, [items]);

  const handleVendorSelect = (e) => {
    const id = e.target.value;
    setSelectedVendorId(id);
    if (!id) {
      setForm(prev => ({
        ...prev,
        supplierName: '',
        supplierContact: '',
        supplierEmail: '',
        vendorAddress: '',
        vendorTaxDetails: '',
      }));
      return;
    }
    const vendor = vendors.find(v => String(v.id) === String(id));
    if (vendor) {
      setForm(prev => ({
        ...prev,
        supplierName:    vendor.legalName || vendor.tradeName || vendor.companyName || vendor.vendorName || '',
        supplierContact: vendor.phone || vendor.alternatePhone || vendor.mobileNumber || '',
        supplierEmail:   vendor.email || '',
        vendorAddress:   vendor.registeredAddress || vendor.billingAddress || vendor.address || '',
        vendorTaxDetails: vendor.gstNumber || vendor.pan || vendor.taxRegistrationNumber || '',
      }));
    }
  };

  const handleCatalogItemSelect = (id, selectedVal) => {
    const found = catalogItems.find(
      ci => String(ci.id) === String(selectedVal) || ci.sku === selectedVal || ci.name === selectedVal
    );
    setItems(items.map(item => {
      if (item.id === id) {
        if (found) {
          const price = Number(found.costPrice || found.price || 0);
          const q = parseFloat(item.quantity) || 1;
          const t = parseFloat(item.taxAmount) || 0;
          const d = parseFloat(item.discount) || 0;
          return {
            ...item,
            itemId: found.id,
            itemName: found.name || found.itemName || '',
            unitPrice: price,
            totalAmount: ((q * price) + t - d).toFixed(2)
          };
        }
        return { ...item, itemName: selectedVal };
      }
      return item;
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (['quantity', 'unitPrice', 'taxAmount', 'discount'].includes(field)) {
           const q = parseFloat(updated.quantity) || 0;
           const u = parseFloat(updated.unitPrice) || 0;
           const t = parseFloat(updated.taxAmount) || 0;
           const d = parseFloat(updated.discount) || 0;
           updated.totalAmount = ((q * u) + t - d).toFixed(2);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => setItems([...items, { ...INITIAL_ITEM, id: Date.now() }]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  const handleSubmit = async () => {
  if (!form.orderNumber || !form.supplierName || !form.orderDate) {
    alert("Please fill Order Number, Supplier Name and Order Date.");
    return;
  }

  try {
    const payload = {
      ...form,
      totalAmount: parseFloat(form.totalAmount) || 0,
      taxAmount: parseFloat(form.taxAmount) || 0,
      discount: parseFloat(form.discount) || 0,
      netAmount: parseFloat(form.netAmount) || 0,
      status: form.status || "PENDING_APPROVAL",
      items: items.map(i => ({
        itemId: Number(i.itemId) || 0,
        itemName: i.itemName,
        quantity: Number(i.quantity) || 0,
        unitPrice: Number(i.unitPrice) || 0,
        taxAmount: Number(i.taxAmount) || 0,
        discount: Number(i.discount) || 0,
        totalAmount: Number(i.totalAmount) || 0
      }))
    };

    const response = await createOrder(payload);

    console.log("PO Created:", response);
    setSaved(true);

    setTimeout(() => {
      navigate("/dashboard/purchase/purchase-orders/po-list");
    }, 1200);
  } catch (error) {
    console.error("Error saving purchase order:", error);
    alert(error?.response?.data?.message || "Failed to create purchase order");
  }
};

  const handleReset = () => {
    setForm(INITIAL);
    setItems([{ ...INITIAL_ITEM, id: Date.now() }]);
  };

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')} className="hover:text-purple-300 transition-colors">Purchase Orders</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Create PO</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/purchase-orders')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(139,92,246,0.12)' }}>
          <ShoppingCart size={22} style={{ color: '#6366f1' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create Purchase Order</h2>
          <p className="text-sm text-gray-400">Fill in the details to raise a new PO</p>
        </div>
      </div>

      {location.state?.vendor && (
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShoppingCart size={16} />
            </div>
            <div>
              <p className="text-xs text-purple-300 font-semibold uppercase tracking-wide">Winning Vendor from Quotation Comparison</p>
              <p className="text-sm font-bold text-white">
                {location.state.vendor.name} • Bid: ₹{Number(location.state.vendor.total || 0).toLocaleString()} (RFQ: {location.state.rfq?.rfqNumber || 'N/A'})
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
            Vendor Selected
          </span>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl mb-5 text-sm font-medium">
          PO saved successfully! Redirecting to PO List…
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-3xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 md:p-8">
          <Section title="Order Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Order Number"    name="orderNumber"          value={form.orderNumber}          onChange={handleChange} placeholder="e.g. PO-2025-001" />
              <InputField label="Order Date"      name="orderDate"            value={form.orderDate}            onChange={handleChange} type="date" />
              <InputField label="Expected Delivery Date" name="expectedDeliveryDate" value={form.expectedDeliveryDate} onChange={handleChange} type="date" />
            </div>
          </Section>

          <Section title="Supplier Information">
            <div className="mb-4">
              <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide block mb-1">Select Vendor</label>
              <select
                value={selectedVendorId}
                onChange={handleVendorSelect}
                className="h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#6366f1]/50 transition-all w-full md:w-1/2"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', appearance: 'none' }}>
                <option value="" className="bg-[#140f2d] text-white">— Select Vendor (ID - Name) —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id} className="bg-[#140f2d] text-white">
                    {v.vendorId || v.id} - {v.legalName || v.tradeName || v.companyName || v.vendorName || 'Vendor'}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Supplier Name"    name="supplierName"    value={form.supplierName}    onChange={handleChange} placeholder="Supplier company name" />
              <InputField label="Supplier Contact" name="supplierContact" value={form.supplierContact} onChange={handleChange} placeholder="Phone number" />
              <InputField label="Supplier Email"   name="supplierEmail"   value={form.supplierEmail}   onChange={handleChange} placeholder="email@supplier.com" type="email" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField label="Vendor Address"    name="vendorAddress"    value={form.vendorAddress}    onChange={handleChange} placeholder="Full address" />
              <InputField label="Vendor Tax Details" name="vendorTaxDetails" value={form.vendorTaxDetails} onChange={handleChange} placeholder="GST/Tax ID" />
            </div>
          </Section>

          <Section title="Delivery Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Delivery Address" name="deliveryAddress" value={form.deliveryAddress} onChange={handleChange} placeholder="Shipping address" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Warehouse</label>
                {warehouses.length > 0 ? (
                  <select
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    className="h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#6366f1]/50 transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234C708E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}>
                    <option value="" className="bg-[#140f2d] text-gray-400">Select Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.name || w.warehouseName} className="bg-[#140f2d] text-white">
                        {w.name || w.warehouseName} {w.code ? `(${w.code})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    placeholder="Warehouse Name"
                    className="h-11 px-4 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#6366f1]/50 transition-all"
                  />
                )}
              </div>
            </div>
          </Section>

          <Section title="Line Items">
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-purple-300 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item Details</th>
                    <th className="px-4 py-3 font-semibold w-24">Qty</th>
                    <th className="px-4 py-3 font-semibold w-32">Unit Price</th>
                    <th className="px-4 py-3 font-semibold w-28">Tax</th>
                    <th className="px-4 py-3 font-semibold w-28">Discount</th>
                    <th className="px-4 py-3 font-semibold w-32">Total</th>
                    <th className="px-4 py-3 font-semibold w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="px-4 py-3 min-w-[200px]">
                        {catalogItems.length > 0 && (
                          <select
                            className="w-full bg-[#140f2d] border border-white/10 rounded-lg p-1.5 text-xs text-purple-200 mb-1.5 focus:outline-none focus:border-indigo-500"
                            value={item.itemId || ''}
                            onChange={(e) => handleCatalogItemSelect(item.id, e.target.value)}
                          >
                            <option value="">— Pick from Catalog —</option>
                            {catalogItems.map(ci => (
                              <option key={ci.id} value={ci.id} className="bg-[#140f2d] text-white">
                                {ci.name || ci.itemName} {ci.sku ? `(${ci.sku})` : ''} — ₹{ci.costPrice || ci.price || 0}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2">
                          <input type="text" placeholder="ID" className="w-16 bg-transparent border-b border-white/20 text-white text-xs focus:outline-none focus:border-indigo-500" 
                            value={item.itemId} onChange={e => updateItem(item.id, 'itemId', e.target.value)} />
                          <input type="text" placeholder="Item Name" className="flex-1 bg-transparent border-b border-white/20 text-white text-sm focus:outline-none focus:border-indigo-500" 
                            value={item.itemName} onChange={e => updateItem(item.id, 'itemName', e.target.value)} required />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white focus:outline-none" 
                          value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} min="1" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white focus:outline-none" 
                          value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white focus:outline-none" 
                          value={item.taxAmount} onChange={e => updateItem(item.id, 'taxAmount', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white focus:outline-none" 
                          value={item.discount} onChange={e => updateItem(item.id, 'discount', e.target.value)} />
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        ₹{item.totalAmount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> Add Item
            </button>
          </Section>

          <Section title="Financial Details">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <InputField label="Total Amount (₹)" name="totalAmount" value={form.totalAmount} onChange={handleChange} type="number" placeholder="0.00" />
              <InputField label="Tax Amount (₹)"   name="taxAmount"   value={form.taxAmount}   onChange={handleChange} type="number" placeholder="0.00" />
              <InputField label="Discount (₹)"     name="discount"    value={form.discount}    onChange={handleChange} type="number" placeholder="0.00" />
              <InputField label="Net Amount (₹)"   name="netAmount"   value={form.netAmount}   onChange={handleChange} type="number" placeholder="Auto calculated" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Currency"       name="currency"       value={form.currency}       onChange={handleChange} options={CURRENCY_OPTIONS} />
              <SelectField label="Payment Method" name="paymentMethod"  value={form.paymentMethod}  onChange={handleChange} options={PAYMENT_METHOD_OPTIONS} />
            </div>
          </Section>

          <Section title="Notes">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField  label="Created By"   name="createdBy" value={form.createdBy} onChange={handleChange} placeholder="Your name" />
              <InputField  label="Remarks"      name="remarks"   value={form.remarks}   onChange={handleChange} placeholder="Optional notes" />
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:bg-white/10 transition-colors">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Save size={15} /> Save Purchase Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePO;