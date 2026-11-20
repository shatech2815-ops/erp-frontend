import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Package,
  Warehouse,
  Hash,
  FileText,
  StickyNote,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { postStockReceipt } from '../../services/stock/stockEngine.services';
import api from '../../interceptors/interceptors';

// Receipt type presets
const RECEIPT_TYPES = [
  { label: 'GRN (Purchase)', prefix: 'GRN', module: 'PURCHASE' },
  { label: 'Opening Stock', prefix: 'OPENING', module: 'WAREHOUSE' },
  { label: 'Customer Return', prefix: 'RET', module: 'SALES' },
  { label: 'Production Output', prefix: 'PROD', module: 'PRODUCTION' },
  { label: 'Transfer In', prefix: 'TRF', module: 'WAREHOUSE' },
  { label: 'Manual Adjustment', prefix: 'ADJ', module: 'WAREHOUSE' },
];

export default function StockReceipt() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [recentReceipts, setRecentReceipts] = useState([]);

  // Master data
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [balances, setBalances] = useState([]);

  const [formData, setFormData] = useState({
    itemId: '',
    warehouseId: '',
    quantity: '',
    referenceNumber: '',
    sourceModule: 'WAREHOUSE',
    reason: '',
    receiptType: 'GRN (Purchase)'
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
        if (data.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({ ...prev, warehouseId: String(data[0].id) }));
        }
      }
      if (balRes.status === 'fulfilled') {
        setBalances(Array.isArray(balRes.value.data) ? balRes.value.data : []);
      }
      if (movRes.status === 'fulfilled') {
        const allMovements = Array.isArray(movRes.value.data) ? movRes.value.data : [];
        const receipts = allMovements
          .filter(m => m.transactionType === 'RECEIPT')
          .slice(0, 5);
        setRecentReceipts(receipts);
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

  // Auto-generate reference number when receipt type changes
  const handleReceiptTypeChange = (receiptType) => {
    const preset = RECEIPT_TYPES.find(r => r.label === receiptType);
    const refNum = `${preset?.prefix || 'REF'}-${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({
      ...prev,
      receiptType,
      referenceNumber: refNum,
      sourceModule: preset?.module || 'WAREHOUSE'
    }));
  };

  // Current balance for selected item+warehouse
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
      await postStockReceipt({
        itemId: Number(formData.itemId),
        warehouseId: Number(formData.warehouseId),
        quantity: Number(formData.quantity),
        referenceNumber: formData.referenceNumber || `RCPT-${Date.now()}`,
        sourceModule: formData.sourceModule || 'WAREHOUSE',
        reason: formData.reason || formData.receiptType || 'Stock Receipt',
        transactionType: 'RECEIPT'
      });

      const selectedItem = items.find(i => String(i.id) === String(formData.itemId));
      const selectedWH = warehouses.find(w => String(w.id) === String(formData.warehouseId));

      setMsg({
        type: 'success',
        text: `✅ Stock Receipt posted! ${formData.quantity} units of "${selectedItem?.name || 'Item'}" added to "${selectedWH?.name || 'Warehouse'}".`
      });

      // Reload balances & movements
      const [balRes, movRes] = await Promise.all([
        api.get('/stock/balances').catch(() => ({ data: [] })),
        api.get('/stock/movements').catch(() => ({ data: [] }))
      ]);
      setBalances(Array.isArray(balRes.data) ? balRes.data : []);
      const allMovements = Array.isArray(movRes.data) ? movRes.data : [];
      setRecentReceipts(allMovements.filter(m => m.transactionType === 'RECEIPT').slice(0, 5));

      // Reset form quantity and reason, keep item/warehouse for batch posting
      setFormData(prev => ({ ...prev, quantity: '', reason: '' }));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to process stock receipt';
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
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="text-emerald-400" /> New Stock Receipt
            </h2>
            <p className="text-sm text-gray-400">
              Record incoming stock into a warehouse (GRN, Returns, Opening Stock)
            </p>
          </div>
        </div>
        <button
          onClick={loadMasterData}
          disabled={fetching}
          className="px-4 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-emerald-400' : ''} />
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
                <TrendingUp className="text-emerald-400" size={18} /> Stock Receipt Form
              </h3>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                Incoming Stock
              </span>
            </div>

            {/* Receipt Type */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">
                Receipt Type
              </label>
              <div className="flex flex-wrap gap-2">
                {RECEIPT_TYPES.map(rt => (
                  <button
                    key={rt.label}
                    type="button"
                    onClick={() => handleReceiptTypeChange(rt.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.receiptType === rt.label
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Package size={14} className="text-emerald-400" /> Select Item *
              </label>
              <select
                required
                value={formData.itemId}
                onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                <option value="">-- Choose Item --</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} {i.sku ? `(${i.sku})` : ''} {i.unit ? `| Unit: ${i.unit}` : ''}
                  </option>
                ))}
              </select>
              {items.length === 0 && !fetching && (
                <p className="text-[11px] text-amber-400 mt-1">No items found. Add items in Item Catalog first.</p>
              )}
            </div>

            {/* Warehouse Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Warehouse size={14} className="text-indigo-400" /> Target Warehouse *
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                <option value="">-- Choose Warehouse --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name || w.warehouseName || `Warehouse #${w.id}`} {w.code ? `(${w.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balance Info */}
            {currentBalance && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/10 text-xs">
                <div className="text-center">
                  <p className="text-gray-400">On Hand</p>
                  <p className="font-bold text-white text-base mt-0.5">{Number(currentBalance.onHand || 0).toFixed(0)}</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-gray-400">Reserved</p>
                  <p className="font-bold text-amber-400 text-base mt-0.5">{Number(currentBalance.reserved || 0).toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Available</p>
                  <p className="font-bold text-emerald-400 text-base mt-0.5">{Number(currentBalance.available || 0).toFixed(0)}</p>
                </div>
              </div>
            )}

            {!currentBalance && formData.itemId && formData.warehouseId && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                <Package size={14} />
                <span>No existing stock record for this item in this warehouse. First receipt will create a new balance.</span>
              </div>
            )}

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wide">
                  Quantity Received *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-emerald-400 font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                  <Hash size={13} /> Reference No.
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="e.g. GRN-1029"
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
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
                placeholder="Optional notes about this receipt..."
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Plus size={18} /> Process Receipt</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Recent Receipts + Stock Summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Stock Balance for current selection */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-5 border border-white/10 shadow-xl">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <FileText size={15} className="text-emerald-400" /> Current Stock Overview
            </h4>
            {fetching ? (
              <div className="text-center py-6 text-gray-500 text-xs">Loading balances...</div>
            ) : balances.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">No stock balances recorded yet.</div>
            ) : (
              <div className="space-y-2">
                {balances.slice(0, 8).map(b => (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-lg text-xs border transition-colors ${
                      String(b.item?.id) === String(formData.itemId) && String(b.warehouse?.id) === String(formData.warehouseId)
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white truncate">{b.item?.name || `Item #${b.item?.id}`}</span>
                      <span className="text-emerald-400 font-bold ml-2 shrink-0">{Number(b.available || 0).toFixed(0)}</span>
                    </div>
                    <div className="text-gray-400 flex items-center justify-between">
                      <span className="truncate">{b.warehouse?.name || `WH #${b.warehouse?.id}`}</span>
                      <span className="ml-1 shrink-0">Avail.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Receipts */}
          {recentReceipts.length > 0 && (
            <div className="bg-[#140f2d]/80 rounded-2xl p-5 border border-white/10 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={15} className="text-blue-400" /> Recent Receipts
              </h4>
              <div className="space-y-2">
                {recentReceipts.map(m => (
                  <div key={m.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span className="font-medium truncate">{m.item?.name || 'Item'}</span>
                      <span className="text-emerald-400 font-bold ml-1 shrink-0">+{Number(m.quantityIn || 0).toFixed(0)}</span>
                    </div>
                    <div className="text-gray-500 mt-0.5 flex justify-between">
                      <span>{m.warehouse?.name || 'WH'}</span>
                      <span className="font-mono">{m.referenceNumber || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
