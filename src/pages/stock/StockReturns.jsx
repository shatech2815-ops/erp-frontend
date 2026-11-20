import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Package,
  Warehouse,
  Hash,
  StickyNote,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import api from '../../interceptors/interceptors';

export default function StockReturns() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [returnType, setReturnType] = useState('CUSTOMER'); // CUSTOMER or VENDOR
  
  // Master data
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [balances, setBalances] = useState([]);

  const [formData, setFormData] = useState({
    itemId: '',
    warehouseId: '',
    quantity: '',
    referenceNumber: '',
    reason: ''
  });

  const loadMasterData = async () => {
    setFetching(true);
    try {
      const [itemsRes, whRes, balRes] = await Promise.allSettled([
        api.get('/items'),
        api.get('/warehouses'),
        api.get('/stock/balances'),
      ]);

      if (itemsRes.status === 'fulfilled') {
        const data = Array.isArray(itemsRes.value.data) ? itemsRes.value.data : [];
        setItems(data);
      }
      if (whRes.status === 'fulfilled') {
        const data = Array.isArray(whRes.value.data) ? whRes.value.data : (whRes.value.data?.data || []);
        setWarehouses(data);
        if (data.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({ ...prev, warehouseId: String(data[0].id) }));
        }
      }
      if (balRes.status === 'fulfilled') {
        setBalances(Array.isArray(balRes.value.data) ? balRes.value.data : []);
      }
    } catch (err) {
      console.error('Failed loading master data:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate Reference Number
  const generateRef = () => {
    const prefix = returnType === 'CUSTOMER' ? 'CRET' : 'VRET';
    setFormData(prev => ({ ...prev, referenceNumber: `${prefix}-${Date.now().toString().slice(-6)}` }));
  };

  const currentBalance = (() => {
    if (!formData.itemId || !formData.warehouseId) return null;
    return balances.find(
      b => (String(b.item?.id) === String(formData.itemId)) &&
           (String(b.warehouse?.id) === String(formData.warehouseId))
    );
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.warehouseId || !formData.quantity) {
      return setMsg({ type: 'error', text: 'Item, Warehouse, and Quantity are required.' });
    }
    if (Number(formData.quantity) <= 0) {
      return setMsg({ type: 'error', text: 'Quantity must be greater than 0.' });
    }

    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      if (returnType === 'CUSTOMER') {
         // Customer return -> Stock comes IN
         await api.post('/stock/receipt', {
            itemId: Number(formData.itemId),
            warehouseId: Number(formData.warehouseId),
            quantity: Number(formData.quantity),
            referenceNumber: formData.referenceNumber || `CRET-${Date.now()}`,
            sourceModule: 'SALES_RETURN',
            reason: `Customer Return: ${formData.reason}`,
            transactionType: 'RECEIPT'
         });
      } else {
         // Vendor return -> Stock goes OUT
         await api.post('/stock/issue', {
            itemId: Number(formData.itemId),
            warehouseId: Number(formData.warehouseId),
            quantity: Number(formData.quantity),
            referenceNumber: formData.referenceNumber || `VRET-${Date.now()}`,
            sourceModule: 'PURCHASE_RETURN',
            reason: `Vendor Return: ${formData.reason}`,
            transactionType: 'ISSUE'
         });
      }

      const selectedItem = items.find(i => String(i.id) === String(formData.itemId));
      const action = returnType === 'CUSTOMER' ? 'added to' : 'removed from';
      setMsg({ 
        type: 'success', 
        text: `✅ ${returnType === 'CUSTOMER' ? 'Customer' : 'Vendor'} Return processed successfully! ${formData.quantity} units ${action} stock.` 
      });

      // Reload balances
      const balRes = await api.get('/stock/balances').catch(() => ({ data: [] }));
      setBalances(Array.isArray(balRes.data) ? balRes.data : []);

      setFormData(prev => ({ ...prev, quantity: '', referenceNumber: '', reason: '' }));
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || err.response?.data?.message || 'Failed to process return.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors shadow-sm"><ArrowLeft size={16} /></button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><RotateCcw className="text-rose-400" /> Stock Returns</h2>
            <p className="text-sm text-gray-400">Process Customer Returns (Stock IN) or Vendor Returns (Stock OUT).</p>
          </div>
        </div>
        <button
          onClick={loadMasterData}
          disabled={fetching}
          className="px-4 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-rose-400' : ''} />
          Refresh
        </button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border flex items-start gap-3 ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} className="ml-auto text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md shrink-0">✕</button>
        </div>
      )}

      {/* Return Type Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setReturnType('CUSTOMER')}
          className={`flex-1 flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-all ${
            returnType === 'CUSTOMER' 
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'bg-[#140f2d]/50 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
          }`}
        >
          <TrendingUp size={24} className={returnType === 'CUSTOMER' ? 'text-emerald-400 mb-2' : 'text-gray-500 mb-2'} />
          <span className={`font-bold ${returnType === 'CUSTOMER' ? 'text-emerald-400' : 'text-gray-400'}`}>Customer Return</span>
          <span className="text-xs text-gray-500 mt-1">Stock flows IN (Receipt)</span>
        </button>

        <button
          onClick={() => setReturnType('VENDOR')}
          className={`flex-1 flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-all ${
            returnType === 'VENDOR' 
              ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
              : 'bg-[#140f2d]/50 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
          }`}
        >
          <TrendingDown size={24} className={returnType === 'VENDOR' ? 'text-amber-400 mb-2' : 'text-gray-500 mb-2'} />
          <span className={`font-bold ${returnType === 'VENDOR' ? 'text-amber-400' : 'text-gray-400'}`}>Vendor Return</span>
          <span className="text-xs text-gray-500 mt-1">Stock flows OUT (Issue)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`bg-[#140f2d]/80 rounded-2xl p-6 border-t-4 shadow-lg space-y-6 ${returnType === 'CUSTOMER' ? 'border-t-emerald-500' : 'border-t-amber-500'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Item */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Package size={14} className="text-rose-400" /> Select Item *
            </label>
            <select
              required
              value={formData.itemId}
              onChange={e => setFormData({ ...formData, itemId: e.target.value })}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            >
              <option value="">-- Choose Item --</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} {i.sku ? `(${i.sku})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Warehouse size={14} className="text-indigo-400" /> Target Warehouse *
            </label>
            <select
              required
              value={formData.warehouseId}
              onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="">-- Choose Warehouse --</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name || w.warehouseName || `Warehouse #${w.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Balance Info */}
          <div className="md:col-span-2 flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-sm text-gray-400">Current Available Balance:</span>
              {currentBalance ? (
                <span className={`text-xl font-bold ${returnType === 'VENDOR' ? 'text-amber-400' : 'text-emerald-400'}`}>
                   {Number(currentBalance.available || 0).toFixed(0)}
                </span>
              ) : (
                <span className="text-sm font-semibold text-gray-500">No stock record</span>
              )}
          </div>

          {/* Quantity */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${returnType === 'CUSTOMER' ? 'text-emerald-400' : 'text-amber-400'}`}>
              Quantity Returned *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0.00"
              className={`w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 font-bold text-lg focus:outline-none focus:ring-1 transition-colors ${returnType === 'CUSTOMER' ? 'text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500' : 'text-amber-400 focus:border-amber-500 focus:ring-amber-500'}`}
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between uppercase tracking-wide">
              <span className="flex items-center gap-1"><Hash size={13} /> Return Ref.</span>
              <button type="button" onClick={generateRef} className="text-[10px] text-blue-400 hover:underline capitalize">Auto-generate</button>
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
              placeholder={returnType === 'CUSTOMER' ? 'e.g. CRET-001' : 'e.g. VRET-001'}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Reason */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
              <StickyNote size={13} /> Reason for Return
            </label>
            <textarea
              rows={2}
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="E.g. Defective goods, Wrong item shipped..."
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
              returnType === 'CUSTOMER'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/20'
            }`}
          >
            {loading ? (
              <><RefreshCw size={18} className="animate-spin" /> Processing...</>
            ) : (
              <><RotateCcw size={18} /> Process {returnType === 'CUSTOMER' ? 'Customer' : 'Vendor'} Return</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
