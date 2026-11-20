import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Minus,
  PackageMinus,
  Warehouse,
  Hash,
  FileText,
  StickyNote,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { postStockIssue } from '../../services/stock/stockEngine.services';
import api from '../../interceptors/interceptors';

// Issue type presets
const ISSUE_TYPES = [
  { label: 'Sales Delivery', prefix: 'SDEL', module: 'SALES' },
  { label: 'Internal Consumption', prefix: 'CONS', module: 'WAREHOUSE' },
  { label: 'Production Issue', prefix: 'PROD_ISS', module: 'PRODUCTION' },
  { label: 'Manual Issue', prefix: 'ISSUE', module: 'WAREHOUSE' },
];

export default function StockIssue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [recentIssues, setRecentIssues] = useState([]);

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
    issueType: 'Internal Consumption'
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
        const issues = allMovements
          .filter(m => m.transactionType === 'ISSUE')
          .slice(0, 5);
        setRecentIssues(issues);
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

  // Auto-generate reference number when issue type changes
  const handleIssueTypeChange = (issueType) => {
    const preset = ISSUE_TYPES.find(r => r.label === issueType);
    const refNum = `${preset?.prefix || 'REF'}-${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({
      ...prev,
      issueType,
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
      await postStockIssue({
        itemId: Number(formData.itemId),
        warehouseId: Number(formData.warehouseId),
        quantity: Number(formData.quantity),
        referenceNumber: formData.referenceNumber || `ISSUE-${Date.now()}`,
        sourceModule: formData.sourceModule || 'WAREHOUSE',
        reason: formData.reason || formData.issueType || 'Stock Issue',
        transactionType: 'ISSUE'
      });

      const selectedItem = items.find(i => String(i.id) === String(formData.itemId));
      const selectedWH = warehouses.find(w => String(w.id) === String(formData.warehouseId));

      setMsg({
        type: 'success',
        text: `✅ Stock Issue posted! ${formData.quantity} units of "${selectedItem?.name || 'Item'}" removed from "${selectedWH?.name || 'Warehouse'}".`
      });

      // Reload balances & movements
      const [balRes, movRes] = await Promise.all([
        api.get('/stock/balances').catch(() => ({ data: [] })),
        api.get('/stock/movements').catch(() => ({ data: [] }))
      ]);
      setBalances(Array.isArray(balRes.data) ? balRes.data : []);
      const allMovements = Array.isArray(movRes.data) ? movRes.data : [];
      setRecentIssues(allMovements.filter(m => m.transactionType === 'ISSUE').slice(0, 5));

      // Reset form quantity and reason, keep item/warehouse for batch posting
      setFormData(prev => ({ ...prev, quantity: '', reason: '' }));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to process stock issue';
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
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PackageMinus className="text-amber-400" /> New Stock Issue
            </h2>
            <p className="text-sm text-gray-400">
              Consume stock from a warehouse (Sales Delivery, Internal Consumption)
            </p>
          </div>
        </div>
        <button
          onClick={loadMasterData}
          disabled={fetching}
          className="px-4 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-amber-400' : ''} />
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
                <TrendingDown className="text-amber-400" size={18} /> Stock Issue Form
              </h3>
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                Outgoing Stock
              </span>
            </div>

            {/* Issue Type */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wide">
                Issue Type
              </label>
              <div className="flex flex-wrap gap-2">
                {ISSUE_TYPES.map(rt => (
                  <button
                    key={rt.label}
                    type="button"
                    onClick={() => handleIssueTypeChange(rt.label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formData.issueType === rt.label
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
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
                <PackageMinus size={14} className="text-amber-400" /> Select Item *
              </label>
              <select
                required
                value={formData.itemId}
                onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              >
                <option value="">-- Choose Item --</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} {i.sku ? `(${i.sku})` : ''} {i.unit ? `| Unit: ${i.unit}` : ''}
                  </option>
                ))}
              </select>
              {items.length === 0 && !fetching && (
                <p className="text-[11px] text-red-400 mt-1">No items found. Add items in Item Catalog first.</p>
              )}
            </div>

            {/* Warehouse Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Warehouse size={14} className="text-indigo-400" /> Source Warehouse *
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
                  <p className="font-bold text-red-400 text-base mt-0.5">{Number(currentBalance.reserved || 0).toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Available</p>
                  <p className="font-bold text-amber-400 text-base mt-0.5">{Number(currentBalance.available || 0).toFixed(0)}</p>
                </div>
              </div>
            )}

            {!currentBalance && formData.itemId && formData.warehouseId && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>No stock available for this item in this warehouse.</span>
              </div>
            )}

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wide">
                  Quantity Issued *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-amber-400 font-bold text-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
                  placeholder="e.g. ISSUE-1029"
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
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
                placeholder="Optional notes about this issue..."
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <><RefreshCw size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Minus size={18} /> Process Issue</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Recent Issues + Stock Summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Stock Balance for current selection */}
          <div className="bg-[#140f2d]/80 rounded-2xl p-5 border border-white/10 shadow-xl">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <FileText size={15} className="text-amber-400" /> Current Stock Overview
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
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white truncate">{b.item?.name || `Item #${b.item?.id}`}</span>
                      <span className="text-amber-400 font-bold ml-2 shrink-0">{Number(b.available || 0).toFixed(0)}</span>
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

          {/* Recent Issues */}
          {recentIssues.length > 0 && (
            <div className="bg-[#140f2d]/80 rounded-2xl p-5 border border-white/10 shadow-xl">
              <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <TrendingDown size={15} className="text-red-400" /> Recent Issues
              </h4>
              <div className="space-y-2">
                {recentIssues.map(m => (
                  <div key={m.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span className="font-medium truncate">{m.item?.name || 'Item'}</span>
                      <span className="text-red-400 font-bold ml-1 shrink-0">-{Number(m.quantityOut || 0).toFixed(0)}</span>
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
