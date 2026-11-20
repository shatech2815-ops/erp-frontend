import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRightLeft,
  MoveRight,
  Package,
  Warehouse,
  Hash,
  FileText,
  StickyNote,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { postStockTransfer } from '../../services/stock/stockEngine.services';
import api from '../../interceptors/interceptors';

export default function StockTransfer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [recentTransfers, setRecentTransfers] = useState([]);

  // Master data
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [balances, setBalances] = useState([]);

  const [formData, setFormData] = useState({
    itemId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    referenceNumber: '',
    sourceModule: 'WAREHOUSE',
    reason: ''
  });

  // Load master data
  const loadMasterData = async () => {
    setFetching(true);
    try {
      const [itemsRes, whRes, balRes, movRes] = await Promise.allSettled([
        api.get('/items'),
        api.get('/warehouses'),
        api.get('/stock/balances'),
        api.get('/stock/movements')
      ]);

      if (itemsRes.status === 'fulfilled') {
        const data = Array.isArray(itemsRes.value.data) ? itemsRes.value.data : [];
        setItems(data);
      }
      if (whRes.status === 'fulfilled') {
        const data = Array.isArray(whRes.value.data) ? whRes.value.data : (whRes.value.data?.data || []);
        setWarehouses(data);
      }
      if (balRes.status === 'fulfilled') {
        setBalances(Array.isArray(balRes.value.data) ? balRes.value.data : []);
      }
      if (movRes.status === 'fulfilled') {
        const allMovements = Array.isArray(movRes.value.data) ? movRes.value.data : [];
        const transfers = allMovements
          .filter(m => m.transactionType === 'TRANSFER_OUT' || m.transactionType === 'TRANSFER_IN')
          .slice(0, 8); // Showing more since IN/OUT comes in pairs
        setRecentTransfers(transfers);
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
    setFormData(prev => ({ ...prev, referenceNumber: `TRF-${Date.now().toString().slice(-6)}` }));
  };

  // Current balances for selected item in both warehouses
  const sourceBalance = (() => {
    if (!formData.itemId || !formData.fromWarehouseId) return null;
    return balances.find(
      b => (String(b.item?.id) === String(formData.itemId)) &&
           (String(b.warehouse?.id) === String(formData.fromWarehouseId))
    );
  })();

  const destBalance = (() => {
    if (!formData.itemId || !formData.toWarehouseId) return null;
    return balances.find(
      b => (String(b.item?.id) === String(formData.itemId)) &&
           (String(b.warehouse?.id) === String(formData.toWarehouseId))
    );
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.fromWarehouseId || !formData.toWarehouseId || !formData.quantity) {
      return setMsg({ type: 'error', text: 'Item, Warehouses, and Quantity are required.' });
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
       return setMsg({ type: 'error', text: 'Source and Destination warehouses cannot be the same.' });
    }
    if (Number(formData.quantity) <= 0) {
      return setMsg({ type: 'error', text: 'Quantity must be greater than 0.' });
    }

    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await postStockTransfer({
        itemId: Number(formData.itemId),
        fromWarehouseId: Number(formData.fromWarehouseId),
        toWarehouseId: Number(formData.toWarehouseId),
        quantity: Number(formData.quantity),
        referenceNumber: formData.referenceNumber || `TRF-${Date.now()}`,
        sourceModule: formData.sourceModule || 'WAREHOUSE',
        reason: formData.reason || 'Stock Transfer',
      });

      const selectedItem = items.find(i => String(i.id) === String(formData.itemId));
      setMsg({
        type: 'success',
        text: `✅ Transfer successful! ${formData.quantity} units of "${selectedItem?.name || 'Item'}" moved.`
      });

      // Reload balances & movements
      const [balRes, movRes] = await Promise.all([
        api.get('/stock/balances').catch(() => ({ data: [] })),
        api.get('/stock/movements').catch(() => ({ data: [] }))
      ]);
      setBalances(Array.isArray(balRes.data) ? balRes.data : []);
      const allMovements = Array.isArray(movRes.data) ? movRes.data : [];
      setRecentTransfers(allMovements.filter(m => m.transactionType === 'TRANSFER_OUT' || m.transactionType === 'TRANSFER_IN').slice(0, 8));

      // Reset form quantity, reason, and ref
      setFormData(prev => ({ ...prev, quantity: '', reason: '', referenceNumber: '' }));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to process stock transfer';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="text-blue-400" /> Stock Transfer
            </h2>
            <p className="text-sm text-gray-400">
              Move physical stock between warehouses atomically
            </p>
          </div>
        </div>
        <button
          onClick={loadMasterData}
          disabled={fetching}
          className="px-4 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-blue-400' : ''} />
          Refresh
        </button>
      </div>

      {/* Alert */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#140f2d]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2 text-base">
                <MoveRight className="text-blue-400" size={18} /> Transfer Details
              </h3>
            </div>

            {/* Item Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Package size={14} className="text-blue-400" /> Select Item *
              </label>
              <select
                required
                value={formData.itemId}
                onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">-- Choose Item --</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} {i.sku ? `(${i.sku})` : ''} {i.unit ? `| Unit: ${i.unit}` : ''}
                  </option>
                ))}
              </select>
              {items.length === 0 && !fetching && (
                <p className="text-[11px] text-red-400 mt-1">No items found.</p>
              )}
            </div>

            {/* Warehouse Dropdowns (From -> To) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                  <Warehouse size={14} /> Source Warehouse (From) *
                </label>
                <select
                  required
                  value={formData.fromWarehouseId}
                  onChange={e => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">-- Source --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id} disabled={String(w.id) === String(formData.toWarehouseId)}>
                      {w.name || w.warehouseName || `Warehouse #${w.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:flex absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#140f2d] border border-white/10 items-center justify-center z-10 text-blue-400 shadow-lg">
                <MoveRight size={14} />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                  <Warehouse size={14} /> Dest Warehouse (To) *
                </label>
                <select
                  required
                  value={formData.toWarehouseId}
                  onChange={e => setFormData({ ...formData, toWarehouseId: e.target.value })}
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Destination --</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id} disabled={String(w.id) === String(formData.fromWarehouseId)}>
                      {w.name || w.warehouseName || `Warehouse #${w.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Balances Comparison */}
            <div className="grid grid-cols-2 gap-4">
               {/* Source */}
               <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex flex-col justify-between">
                  <span className="text-gray-400">Available in Source:</span>
                  {sourceBalance ? (
                    <span className="text-lg font-bold text-amber-400 mt-1">{Number(sourceBalance.available || 0).toFixed(0)}</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 mt-1">No stock</span>
                  )}
               </div>
               {/* Dest */}
               <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs flex flex-col justify-between">
                  <span className="text-gray-400">Available in Dest:</span>
                  {destBalance ? (
                    <span className="text-lg font-bold text-emerald-400 mt-1">{Number(destBalance.available || 0).toFixed(0)}</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 mt-1">No stock</span>
                  )}
               </div>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-400 mb-1.5 uppercase tracking-wide">
                  Transfer Quantity *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-blue-400 font-bold text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between uppercase tracking-wide">
                  <span className="flex items-center gap-1"><Hash size={13} /> Reference No.</span>
                  <button type="button" onClick={generateRef} className="text-[10px] text-blue-400 hover:underline capitalize">Auto-generate</button>
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="e.g. TRF-1029"
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                <StickyNote size={13} /> Reason / Notes
              </label>
              <textarea
                rows={2}
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Optional notes about this transfer..."
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><MoveRight size={18} /> Execute Transfer</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Recent Transfers */}
        <div className="lg:col-span-1 space-y-4">
          {recentTransfers.length > 0 ? (
            <div className="bg-[#140f2d]/80 rounded-2xl p-5 border border-white/10 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <ArrowRightLeft size={15} className="text-blue-400" /> Recent Transfers
              </h4>
              <div className="space-y-2">
                {recentTransfers.map(m => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-300 truncate">{m.item?.name || 'Item'}</span>
                      <span className={`font-bold ml-1 shrink-0 ${m.transactionType === 'TRANSFER_IN' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {m.transactionType === 'TRANSFER_IN' ? '+' : '-'}{Number(m.quantityIn || m.quantityOut || 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 text-[10px]">
                      <span className="truncate">{m.warehouse?.name || 'WH'}</span>
                      <span className="font-mono bg-black/20 px-1 py-0.5 rounded">{m.referenceNumber || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#140f2d]/80 rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col items-center justify-center text-center py-10 opacity-70">
              <ArrowRightLeft size={32} className="text-gray-500 mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No recent transfers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
