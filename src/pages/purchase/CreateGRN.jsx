import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, PackageSearch, Truck } from 'lucide-react';
import { createGRN } from "../../services/purchase/grn.services";
import { getAllOrders } from "../../services/purchase/purchaseOrder.services";
import { getAllWarehouses } from "../../services/stock/wareHouse.services";

const INITIAL_ITEM = {
  itemId: '',
  itemName: '',
  orderedQuantity: 0,
  receivedQuantity: 0,
  acceptedQuantity: 0,
  rejectedQuantity: 0,
  batchNumber: '',
  serialNumber: '',
  expiryDate: ''
};

const CreateGRN = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    poNumber: '',
    vendor: '',
    warehouse: '',
    receivedDate: new Date().toISOString().split('T')[0],
    deliveryChallanNumber: '',
    transportDetails: '',
    remarks: '',
    receivedBy: 'Admin', // In real app, from auth context
    status: 'RECEIVED'
  });

  const [items, setItems] = useState([{ ...INITIAL_ITEM, id: Date.now() }]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const applyPoData = (po) => {
    if (!po) return;
    setFormData(prev => ({
      ...prev,
      poNumber: po.orderNumber,
      vendor: po.supplierName || po.supplier || prev.vendor,
      warehouse: po.warehouse || prev.warehouse,
      deliveryChallanNumber: prev.deliveryChallanNumber || `DC-${Date.now().toString().slice(-5)}`,
      transportDetails: prev.transportDetails || 'Direct Road Freight / Lorry Transport',
    }));

    if (po.items && Array.isArray(po.items) && po.items.length > 0) {
      setItems(po.items.map((it, idx) => {
        const qty = Number(it.quantity) || 1;
        return {
          id: Date.now() + idx,
          itemId: it.itemId || it.id || '',
          itemName: it.itemName || it.name || 'Materials',
          orderedQuantity: qty,
          receivedQuantity: qty,
          acceptedQuantity: qty,
          rejectedQuantity: 0,
          batchNumber: `B-${String(idx + 1).padStart(3, '0')}`,
          serialNumber: '',
          expiryDate: ''
        };
      }));
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    getAllWarehouses()
      .then(data => setWarehouses(Array.isArray(data) ? data : []))
      .catch(() => setWarehouses([]));

    if (location.state?.po) {
      applyPoData(location.state.po);
    }
  }, [location.state]);

  const loadPurchaseOrders = async () => {
    try {
      const pos = await getAllOrders();
      setPurchaseOrders(pos || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePOSelect = (e) => {
    const poNum = e.target.value;
    const po = purchaseOrders.find(p => p.orderNumber === poNum || String(p.id) === poNum);
    if (po) {
      applyPoData(po);
    } else {
      setFormData(prev => ({ ...prev, poNumber: poNum }));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto calculate accepted/rejected
        if (field === 'receivedQuantity' || field === 'rejectedQuantity' || field === 'acceptedQuantity') {
           const rec = parseFloat(updated.receivedQuantity) || 0;
           if (field === 'rejectedQuantity') {
             updated.acceptedQuantity = rec - (parseFloat(updated.rejectedQuantity) || 0);
           } else {
             updated.rejectedQuantity = rec - (parseFloat(updated.acceptedQuantity) || 0);
           }
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => setItems([...items, { ...INITIAL_ITEM, id: Date.now() }]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        items: items.map(i => ({
          itemId: Number(i.itemId) || 0,
          itemName: i.itemName,
          orderedQuantity: Number(i.orderedQuantity) || 0,
          receivedQuantity: Number(i.receivedQuantity) || 0,
          acceptedQuantity: Number(i.acceptedQuantity) || 0,
          rejectedQuantity: Number(i.rejectedQuantity) || 0,
          batchNumber: i.batchNumber,
          serialNumber: i.serialNumber,
          expiryDate: i.expiryDate || null
        }))
      };
      await createGRN(payload);
      navigate('/dashboard/purchase/grn-list');
    } catch (error) {
      console.error(error);
      alert('Failed to create GRN: ' + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <div className="pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d] flex items-center justify-center text-emerald-300 border border-white/10 hover:bg-white/10">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Create Goods Receipt Note (GRN)</h2>
          <p className="text-sm text-gray-400">Record goods receipt, inspection and inventory update</p>
        </div>
      </div>

      {location.state?.po && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wide">Goods Receiving Inward (GRN)</p>
              <p className="text-sm font-bold text-white">
                PO Number: {location.state.po.orderNumber} • Vendor: {location.state.po.supplier || location.state.po.supplierName}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
            Linked from PO
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GRN Header */}
        <div className="bg-[#140f2d]/80 p-6 rounded-2xl border border-white/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2"><PackageSearch size={16} className="text-emerald-500" /> Receipt Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">PO Number <span className="text-red-400">*</span></label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 appearance-none" 
                value={formData.poNumber} onChange={handlePOSelect} required>
                <option value="">Select PO...</option>
                {purchaseOrders.map(po => (
                  <option key={po.id} value={po.orderNumber}>{po.orderNumber} - {po.supplierName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Vendor Name <span className="text-red-400">*</span></label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500" 
                value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} required placeholder="Vendor from PO" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Received Date <span className="text-red-400">*</span></label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500" 
                value={formData.receivedDate} onChange={e => setFormData({...formData, receivedDate: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Warehouse / Location <span className="text-red-400">*</span></label>
              {warehouses.length > 0 ? (
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:ring-1 focus:ring-emerald-500 appearance-none"
                  value={formData.warehouse}
                  onChange={e => setFormData({ ...formData, warehouse: e.target.value })}
                  required
                >
                  <option value="" className="bg-[#140f2d] text-gray-400">Select Warehouse...</option>
                  {formData.warehouse && !warehouses.some(w => (w.name || w.warehouseName) === formData.warehouse) && (
                    <option value={formData.warehouse} className="bg-[#140f2d] text-white">{formData.warehouse} (From PO)</option>
                  )}
                  {warehouses.map(w => (
                    <option key={w.id} value={w.name || w.warehouseName} className="bg-[#140f2d] text-white">
                      {w.name || w.warehouseName} {w.code ? `(${w.code})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500"
                  value={formData.warehouse}
                  onChange={e => setFormData({ ...formData, warehouse: e.target.value })}
                  required
                  placeholder="e.g. Main WH"
                />
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Delivery Challan No <span className="text-red-400">*</span></label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500" 
                value={formData.deliveryChallanNumber} onChange={e => setFormData({...formData, deliveryChallanNumber: e.target.value})} required placeholder="DC No from Vendor" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Received By</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500" 
                value={formData.receivedBy} onChange={e => setFormData({...formData, receivedBy: e.target.value})} required />
            </div>
            <div className="col-span-1 md:col-span-3">
              <label className="block text-xs text-gray-400 mb-1">Transport & Gate Pass Details</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500" 
                value={formData.transportDetails} onChange={e => setFormData({...formData, transportDetails: e.target.value})} placeholder="Vehicle No, Driver Name, LR No..." />
            </div>
          </div>
        </div>

        {/* Item & Quality Inspection List */}
        <div className="bg-[#140f2d]/80 p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Items & Quality Inspection</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-purple-300 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item Details</th>
                  <th className="px-4 py-3 font-semibold w-24">Ord. Qty</th>
                  <th className="px-4 py-3 font-semibold w-24 text-blue-300">Rec. Qty</th>
                  <th className="px-4 py-3 font-semibold w-24 text-emerald-400">Acc. Qty</th>
                  <th className="px-4 py-3 font-semibold w-24 text-red-400">Rej. Qty</th>
                  <th className="px-4 py-3 font-semibold">Batch / Serial</th>
                  <th className="px-4 py-3 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <input type="text" placeholder="Item ID" className="w-16 bg-transparent border-b border-white/20 text-white text-xs mb-1 focus:outline-none focus:border-emerald-500" 
                        value={item.itemId} onChange={e => updateItem(item.id, 'itemId', e.target.value)} required />
                      <input type="text" placeholder="Item Name" className="w-full bg-transparent border-b border-white/20 text-white text-sm focus:outline-none focus:border-emerald-500" 
                        value={item.itemName} onChange={e => updateItem(item.id, 'itemName', e.target.value)} required />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white focus:outline-none" 
                        value={item.orderedQuantity} onChange={e => updateItem(item.id, 'orderedQuantity', e.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-full bg-blue-500/10 border border-blue-500/30 rounded p-1.5 text-blue-300 focus:outline-none font-bold" 
                        value={item.receivedQuantity} onChange={e => updateItem(item.id, 'receivedQuantity', e.target.value)} required />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded p-1.5 text-emerald-400 focus:outline-none font-bold" 
                        value={item.acceptedQuantity} onChange={e => updateItem(item.id, 'acceptedQuantity', e.target.value)} required />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-full bg-red-500/10 border border-red-500/30 rounded p-1.5 text-red-400 focus:outline-none font-bold" 
                        value={item.rejectedQuantity} onChange={e => updateItem(item.id, 'rejectedQuantity', e.target.value)} required />
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <input type="text" placeholder="Batch No" className="w-full bg-transparent border-b border-white/20 text-white text-xs focus:outline-none focus:border-emerald-500" 
                        value={item.batchNumber} onChange={e => updateItem(item.id, 'batchNumber', e.target.value)} />
                      <input type="date" className="w-full bg-transparent border-b border-white/20 text-gray-400 text-xs focus:outline-none focus:border-emerald-500" 
                        value={item.expiryDate} onChange={e => updateItem(item.id, 'expiryDate', e.target.value)} title="Expiry Date" />
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
        </div>

        <div className="bg-[#140f2d]/80 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-400 mb-1">Inspection Remarks / Comments</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-emerald-500" 
              value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="Notes about condition, damages, etc." />
          </div>
          <div className="flex-shrink-0 pt-5">
            <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-8 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all">
              <Save size={18} /> Confirm GRN & Update Inventory
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default CreateGRN;
