import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  Package, 
  AlertCircle, 
  Warehouse,
  ExternalLink
} from 'lucide-react';
import api from '../../interceptors/interceptors'; 

export default function LowStockAlerts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, OUT_OF_STOCK, LOW_STOCK

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [itemsRes, balRes] = await Promise.all([
        api.get('/items'),
        api.get('/stock/balances')
      ]);

      const items = itemsRes.data || [];
      const balances = balRes.data || [];
      
      const lowStockList = [];

      items.forEach(item => {
        const reorderLevel = Number(item.reorderLevel || item.reorder_level || 0);
        if (reorderLevel > 0) {
          // Find matching balances for this item across all warehouses
          // Handles both b.item.id relation object and b.itemId scalar
          const itemBalances = balances.filter(b => 
            (b.item?.id === item.id) || (Number(b.itemId) === item.id)
          );

          let totalAvailable = 0;
          let warehouseBreakdown = [];

          if (itemBalances.length > 0) {
            totalAvailable = itemBalances.reduce((sum, b) => {
              // StockBalance stores 'available', or fallback to (onHand - reserved - blocked - damaged)
              const avail = b.available != null 
                ? Number(b.available) 
                : (b.availableQuantity != null 
                    ? Number(b.availableQuantity) 
                    : (Number(b.onHand || 0) - Number(b.reserved || 0) - Number(b.blocked || 0) - Number(b.damaged || 0) - Number(b.quarantine || 0)));
              return sum + (Number.isNaN(avail) ? 0 : Math.max(0, avail));
            }, 0);

            warehouseBreakdown = itemBalances.map(b => ({
              warehouseId: b.warehouse?.id || b.warehouseId,
              warehouseName: b.warehouse?.name || `WH #${b.warehouse?.id || b.warehouseId || 1}`,
              available: Number(b.available ?? b.availableQuantity ?? b.onHand ?? 0),
              onHand: Number(b.onHand || 0),
              reserved: Number(b.reserved || 0)
            }));
          } else {
            // Fallback to item catalog stock if no warehouse balances exist yet
            const qty = Number(item.quantity ?? item.stock ?? item.currentStock ?? 0);
            const reserved = Number(item.reservedQuantity ?? 0);
            totalAvailable = Math.max(0, qty - reserved);
          }

          if (totalAvailable <= reorderLevel) {
            const configuredReorderQty = item.reorderQuantity ?? item.reorder_quantity;
            const reorderQtyVal = (configuredReorderQty != null && Number(configuredReorderQty) > 0) 
              ? Number(configuredReorderQty) 
              : null;
            const deficit = Math.max(0, reorderLevel - totalAvailable);

            lowStockList.push({
              id: item.id,
              sku: item.sku || `ITM-${String(item.id).padStart(4, '0')}`,
              name: item.name || item.itemName || 'Unnamed Item',
              available: totalAvailable,
              reorderLevel: reorderLevel,
              reorderQuantity: reorderQtyVal ?? (deficit > 0 ? `${deficit} (Need)` : '—'),
              rawReorderQty: reorderQtyVal,
              deficit: deficit,
              warehouses: warehouseBreakdown,
              unit: item.unit || item.stockUom || 'Units'
            });
          }
        }
      });

      // Sort with critical out-of-stock items first, then by largest deficit
      lowStockList.sort((a, b) => {
        if (a.available <= 0 && b.available > 0) return -1;
        if (a.available > 0 && b.available <= 0) return 1;
        return (b.reorderLevel - b.available) - (a.reorderLevel - a.available);
      });

      setAlerts(lowStockList);
    } catch (e) {
      console.error("Error fetching low stock alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(item => {
      const matchSearch = !search || 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      
      const isOutOfStock = item.available <= 0;
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'OUT_OF_STOCK' && isOutOfStock) ||
        (statusFilter === 'LOW_STOCK' && !isOutOfStock);

      return matchSearch && matchStatus;
    });
  }, [alerts, search, statusFilter]);

  const outOfStockCount = alerts.filter(a => a.available <= 0).length;
  const lowStockCount = alerts.filter(a => a.available > 0).length;
  const totalDeficit = alerts.reduce((acc, a) => acc + (a.deficit || 0), 0);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-400 hover:bg-amber-500/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" /> Low Stock Alerts
            </h2>
            <p className="text-sm text-gray-400">Items that have fallen below their configured Reorder Level.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-amber-400" : ""} /> Refresh
          </button>
          <button
            onClick={() => navigate('/dashboard/stock/inventory/receipt')}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Package size={14} /> Stock Receipt (IN)
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#140f2d]/80 rounded-2xl p-4 border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Low Stock Items</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{lowStockCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Available stock is &le; reorder level</p>
        </div>

        <div className="bg-[#140f2d]/80 rounded-2xl p-4 border border-red-500/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Out of Stock</span>
            <AlertCircle size={16} className="text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{outOfStockCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Zero available units in inventory</p>
        </div>

        <div className="bg-[#140f2d]/80 rounded-2xl p-4 border border-blue-500/20 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Total Reorder Deficit</span>
            <TrendingDown size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalDeficit.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">Units required to reach reorder points</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
        {/* Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input 
              type="text"
              placeholder="Search by SKU or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'LOW_STOCK'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === 'OUT_OF_STOCK'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Calculating real-time warehouse inventory...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
              <TrendingDown size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Stock levels are healthy</h3>
            <p className="text-gray-400 mt-2">No items are currently below their configured reorder points.</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No items matched your filter or search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase">
                  <th className="p-3">Item ID / SKU</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3 text-right">Available Qty</th>
                  <th className="p-3 text-right">Reorder Level</th>
                  <th className="p-3 text-right">Reorder Qty</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(item => {
                  const isOutOfStock = item.available <= 0;
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 text-gray-300 font-mono text-xs">
                        <span className="text-gray-400">{item.id}</span> / <span className="text-purple-300 font-semibold">{item.sku}</span>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-bold text-sm">{item.name}</div>
                        {item.warehouses && item.warehouses.length > 0 && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Warehouse size={11} className="text-emerald-400" />
                            <span>
                              {item.warehouses.map(w => `${w.warehouseName}: ${w.available}`).join(' | ')}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className={`p-3 font-bold text-right text-sm ${isOutOfStock ? 'text-red-400' : 'text-amber-400'}`}>
                        {Number(item.available).toLocaleString()}
                        <span className="text-[10px] text-gray-500 font-normal ml-1">{item.unit}</span>
                      </td>
                      <td className="p-3 text-gray-300 font-bold text-right text-sm">
                        {Number(item.reorderLevel).toLocaleString()}
                      </td>
                      <td className="p-3 text-blue-400 font-bold text-right text-sm">
                        {item.reorderQuantity}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          isOutOfStock 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/stock/inventory/receipt`)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Receive stock for this item"
                        >
                          Receive <ExternalLink size={10} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
