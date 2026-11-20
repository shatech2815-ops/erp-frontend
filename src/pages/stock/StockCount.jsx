import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Save, FileSpreadsheet, CheckCircle, 
  Warehouse, AlertTriangle, RefreshCw, History, ArrowUpRight, ArrowDownRight, Minus 
} from 'lucide-react';
import api from '../../interceptors/interceptors';
import { getAllWarehouses } from '../../services/stock/wareHouse.services';

export default function StockCount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);

  useEffect(() => {
    loadWarehouses();
    loadAdjustmentHistory();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await getAllWarehouses();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setWarehouses(list);
      if (list.length > 0 && !warehouseId) {
        setWarehouseId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const loadAdjustmentHistory = async () => {
    try {
      const res = await api.get('/stock/adjustments');
      setAdjustmentHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load adjustment history:', err);
    }
  };

  const handleFetchStock = async () => {
    if (!warehouseId) {
      setMsg({ type: 'error', text: 'Please select a Warehouse to load stock snapshot.' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      // Fetch both current balances and all catalog items in parallel
      const [balancesRes, itemsRes] = await Promise.all([
        api.get('/stock/balances').catch(() => ({ data: [] })),
        api.get('/items').catch(() => ({ data: [] }))
      ]);

      const balances = Array.isArray(balancesRes.data) ? balancesRes.data : [];
      const catalogItems = Array.isArray(itemsRes.data) ? itemsRes.data : [];

      const targetWhId = Number(warehouseId);
      const whBalances = balances.filter(b => 
        (b.warehouse?.id === targetWhId) || (Number(b.warehouseId) === targetWhId)
      );

      // Create a map of items with their system quantity
      const countData = catalogItems.map(it => {
        const bal = whBalances.find(b => 
          (b.item?.id === it.id) || (Number(b.itemId) === it.id)
        );
        const sysQty = bal ? Number(bal.onHand ?? bal.available ?? 0) : Number(it.quantity || 0);

        return {
          itemId: it.id,
          itemName: it.name,
          sku: it.sku || `ITM-${String(it.id).padStart(4, '0')}`,
          category: it.category || 'General',
          systemQuantity: sysQty,
          physicalQuantity: '',
          variance: 0,
          notes: ''
        };
      });

      setItems(countData);

      if (countData.length === 0) {
        setMsg({ type: 'error', text: 'No items found in system catalog to count.' });
      } else {
        const whName = warehouses.find(w => String(w.id) === String(warehouseId))?.name || `Warehouse #${warehouseId}`;
        setMsg({ type: 'success', text: `Loaded stock snapshot for "${whName}" (${countData.length} items found).` });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to fetch stock snapshot. ' + (err.message || '') });
    } finally {
      setLoading(false);
    }
  };

  const handlePhysicalChange = (index, val) => {
    const updated = [...items];
    updated[index].physicalQuantity = val;
    if (val === '' || isNaN(val)) {
      updated[index].variance = 0;
    } else {
      const physical = Number(val);
      updated[index].variance = physical - updated[index].systemQuantity;
    }
    setItems(updated);
  };

  const handlePostAdjustments = async () => {
    const itemsToAdjust = items.filter(r => r.physicalQuantity !== '' && r.variance !== 0);
    if (itemsToAdjust.length === 0) {
      setMsg({ type: 'error', text: 'No discrepancies entered. Enter physical quantities with variances to adjust.' });
      return;
    }

    setLoading(true);
    let successCount = 0;
    const selectedWh = warehouses.find(w => String(w.id) === String(warehouseId));
    const whName = selectedWh ? (selectedWh.name || selectedWh.warehouseName) : `Warehouse ${warehouseId}`;

    try {
      for (const row of itemsToAdjust) {
        const isAddition = row.variance > 0;
        const diffQty = Math.abs(row.variance);

        // 1. Post to Stock Adjustments Audit Log
        await api.post('/stock/adjustments', {
          adjustmentType: isAddition ? 'Addition' : 'Deduction',
          adjustmentQty: diffQty,
          warehouse: whName,
          reason: row.notes || `Physical Stock Count Variance (${isAddition ? '+' : '-'}${diffQty})`,
          adjustedBy: 'Admin',
          adjustmentDate: new Date().toISOString().split('T')[0],
          remarks: `System: ${row.systemQuantity}, Physical: ${row.physicalQuantity}`
        });

        // 2. Post Movement to update actual Stock Balance atomically
        await api.post(isAddition ? '/stock/receipt' : '/stock/issue', {
          itemId: row.itemId,
          warehouseId: Number(warehouseId),
          quantity: diffQty,
          referenceNumber: `CNT-ADJ-${Date.now()}`,
          sourceModule: 'STOCK_COUNT',
          reason: row.notes || 'Physical Count Reconciliation',
          user: 'Admin'
        });

        successCount++;
      }

      setMsg({ 
        type: 'success', 
        text: `Successfully applied ${successCount} variance adjustment(s)! Stock balances have been updated.` 
      });
      // Refresh snapshot and history
      handleFetchStock();
      loadAdjustmentHistory();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to post adjustments: ' + (err.response?.data?.error || err.message) });
    } finally {
      setLoading(false);
    }
  };

  // Calculations for summary stats
  const itemsWithDiscrepancy = items.filter(i => i.physicalQuantity !== '' && i.variance !== 0).length;
  const itemsCounted = items.filter(i => i.physicalQuantity !== '').length;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="text-purple-400" /> Physical Stock Count
            </h2>
            <p className="text-sm text-gray-400">Compare System Stock vs Physical Stock and post variance adjustments automatically.</p>
          </div>
        </div>

        <button
          onClick={() => { loadWarehouses(); loadAdjustmentHistory(); }}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 px-3 py-2 rounded-xl transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border flex items-center gap-2 ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {msg.text}
        </div>
      )}

      {/* Control Panel - Dynamic Warehouse Dropdown */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-1.5">
              <Warehouse size={14} className="text-purple-400" /> Select Warehouse <span className="text-red-400">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
            >
              <option value="">-- Choose Warehouse --</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id} className="bg-[#140f2d] text-white">
                  {w.name || w.warehouseName} {w.code ? `(${w.code})` : ''} - ID #{w.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button 
              onClick={handleFetchStock} 
              disabled={loading || !warehouseId} 
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={18} />
              )}
              Load Snapshot
            </button>
          </div>
        </div>

        {/* Stats strip if items loaded */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-center">
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="block text-xs text-gray-400 uppercase">Total Items</span>
              <span className="text-lg font-bold text-white">{items.length}</span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="block text-xs text-gray-400 uppercase">Counted</span>
              <span className="text-lg font-bold text-purple-300">{itemsCounted} / {items.length}</span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="block text-xs text-gray-400 uppercase">Discrepancies</span>
              <span className={`text-lg font-bold ${itemsWithDiscrepancy > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {itemsWithDiscrepancy}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid Table */}
      {items.length > 0 && (
        <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-purple-400" /> Stock Audit Snapshot
            </h3>
            {itemsWithDiscrepancy > 0 && (
              <button
                onClick={handlePostAdjustments}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-xs"
              >
                <Save size={16} /> Apply {itemsWithDiscrepancy} Adjustment(s)
              </button>
            )}
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-purple-300 uppercase bg-white/5">
                  <th className="p-3">Item Details</th>
                  <th className="p-3">SKU / Code</th>
                  <th className="p-3 text-right">System Qty</th>
                  <th className="p-3 text-right w-40 text-purple-300">Physical Qty</th>
                  <th className="p-3 text-right">Variance</th>
                  <th className="p-3">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {items.map((row, idx) => (
                  <tr key={row.itemId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{row.itemName}</div>
                      <div className="text-xs text-gray-400">{row.category}</div>
                    </td>
                    <td className="p-3 font-mono text-xs text-purple-300">{row.sku}</td>
                    <td className="p-3 text-gray-300 font-bold text-right">{row.systemQuantity}</td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={row.physicalQuantity} 
                        onChange={e => handlePhysicalChange(idx, e.target.value)}
                        className="w-full bg-[#1b1638] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-right font-bold text-sm" 
                        placeholder="Counted..."
                      />
                    </td>
                    <td className="p-3 text-right">
                      {row.physicalQuantity === '' ? (
                        <span className="text-gray-500 text-xs flex items-center justify-end gap-1"><Minus size={12} /> Pending</span>
                      ) : row.variance > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <ArrowUpRight size={12} /> +{row.variance}
                        </span>
                      ) : row.variance < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          <ArrowDownRight size={12} /> {row.variance}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-300">
                          Matched (0)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <input 
                        type="text" 
                        value={row.notes} 
                        onChange={e => {
                          const updated = [...items];
                          updated[idx].notes = e.target.value;
                          setItems(updated);
                        }}
                        className="w-full bg-[#1b1638] border border-transparent rounded-lg px-3 py-1.5 text-gray-300 focus:outline-none focus:border-white/20 text-xs" 
                        placeholder="e.g. Damage, Miscount, Expiry..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={handlePostAdjustments}
              disabled={loading || itemsWithDiscrepancy === 0}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-40"
            >
              <Save size={18} /> Apply {itemsWithDiscrepancy} Variance Adjustment(s) & Reconcile Stock
            </button>
          </div>
        </div>
      )}

      {/* Adjustment History */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <History size={16} className="text-purple-400" /> Recent Stock Adjustments History
        </h3>
        {adjustmentHistory.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No past stock count adjustments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-purple-300 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">ID #</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Adjustment Qty</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Adjusted By</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {adjustmentHistory.slice(0, 10).map((adj) => (
                  <tr key={adj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-purple-300">#{adj.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        adj.adjustmentType === 'Addition' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {adj.adjustmentType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">{adj.adjustmentQty}</td>
                    <td className="px-4 py-3 text-gray-300">{adj.warehouse || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{adj.reason || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{adj.adjustedBy || 'Admin'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {adj.adjustmentDate || (adj.createdAt ? new Date(adj.createdAt).toLocaleDateString() : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
