import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckSquare, 
  PackageOpen, 
  PlayCircle, 
  RefreshCw, 
  Warehouse, 
  ShoppingBag, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search,
  Box
} from 'lucide-react';
import api from '../../interceptors/interceptors';

export default function PickList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Data lists
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [balances, setBalances] = useState([]);
  const [activePickLists, setActivePickLists] = useState([]);

  // Selected Order and its items
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const defaultPicker = (() => {
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        return parsed.name || parsed.username || 'Warehouse Staff';
      }
    } catch {
      // ignore
    }
    return localStorage.getItem('username') || 'Warehouse Staff';
  })();

  const [formData, setFormData] = useState({
    salesOrderId: '',
    customerId: '',
    warehouseId: '',
    itemId: '',
    requiredQuantity: '',
    picker: defaultPicker
  });

  // Filter for Active Pick Lists
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load Initial Master Data
  const loadInitialData = async () => {
    setFetching(true);
    try {
      const [ordersRes, whRes, itemsRes, balRes, pickRes] = await Promise.allSettled([
        api.get('/orders?page=0&size=100'),
        api.get('/warehouses'),
        api.get('/items'),
        api.get('/stock/balances'),
        api.get('/stock/picklist')
      ]);

      // Orders
      if (ordersRes.status === 'fulfilled') {
        const orderData = ordersRes.value.data?.orders || (Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
        setOrders(orderData);
      }

      // Warehouses
      if (whRes.status === 'fulfilled') {
        const whData = Array.isArray(whRes.value.data) ? whRes.value.data : (whRes.value.data?.data || []);
        setWarehouses(whData);
        // Default warehouse if not set
        if (whData.length > 0 && !formData.warehouseId) {
          setFormData(prev => ({ ...prev, warehouseId: String(whData[0].id) }));
        }
      }

      // Items Catalog
      if (itemsRes.status === 'fulfilled') {
        const itemData = Array.isArray(itemsRes.value.data) ? itemsRes.value.data : (itemsRes.value.data?.data || []);
        setCatalogItems(itemData);
      }

      // Balances
      if (balRes.status === 'fulfilled') {
        const balData = Array.isArray(balRes.value.data) ? balRes.value.data : [];
        setBalances(balData);
      }

      // Pick Lists
      if (pickRes.status === 'fulfilled') {
        const plData = Array.isArray(pickRes.value.data) ? pickRes.value.data : [];
        setActivePickLists(plData);
      }

    } catch (err) {
      console.error('Error loading pick list dependencies:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When user selects a Sales Order
  const handleOrderSelect = async (orderId) => {
    if (!orderId) {
      setSelectedOrder(null);
      setOrderItems([]);
      setFormData(prev => ({
        ...prev,
        salesOrderId: '',
        customerId: '',
        itemId: '',
        requiredQuantity: ''
      }));
      return;
    }

    const orderSummary = orders.find(o => String(o.id) === String(orderId));
    const custId = orderSummary?.clientId ? (Number(orderSummary.clientId) || 1) : 1;

    setFormData(prev => ({
      ...prev,
      salesOrderId: orderId,
      customerId: custId,
      itemId: '',
      requiredQuantity: ''
    }));

    setLoadingOrderDetails(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      const fullOrder = res.data;
      setSelectedOrder(fullOrder);

      const items = fullOrder?.items || [];
      setOrderItems(items);

      if (items.length > 0) {
        // Auto-select the first line item
        const first = items[0];
        const itmId = first.itemId || first.id;
        const pending = Math.max(0, Number(first.quantity || 0) - Number(first.reservedQty || 0));
        setFormData(prev => ({
          ...prev,
          customerId: fullOrder?.clientId ? (Number(fullOrder.clientId) || 1) : 1,
          itemId: String(itmId),
          requiredQuantity: String(pending > 0 ? pending : first.quantity || 1)
        }));
      }
    } catch (err) {
      console.error('Failed to fetch full order details:', err);
      setSelectedOrder(orderSummary);
      setOrderItems([]);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // When user selects an Item from the order
  const handleItemSelect = (selectedItemId) => {
    if (!selectedItemId) {
      setFormData(prev => ({ ...prev, itemId: '', requiredQuantity: '' }));
      return;
    }

    const matchedOrderItem = orderItems.find(
      i => String(i.itemId || i.id) === String(selectedItemId)
    );

    let defaultQty = '1';
    if (matchedOrderItem) {
      const pending = Math.max(0, Number(matchedOrderItem.quantity || 0) - Number(matchedOrderItem.reservedQty || 0));
      defaultQty = String(pending > 0 ? pending : matchedOrderItem.quantity || 1);
    }

    setFormData(prev => ({
      ...prev,
      itemId: selectedItemId,
      requiredQuantity: defaultQty
    }));
  };

  // Calculate current available stock for selected Warehouse & Item
  const currentAvailableStock = (() => {
    if (!formData.warehouseId || !formData.itemId) return null;
    const match = balances.find(
      b => (String(b.warehouse?.id) === String(formData.warehouseId) || String(b.warehouseId) === String(formData.warehouseId)) &&
           (String(b.item?.id) === String(formData.itemId) || String(b.itemId) === String(formData.itemId))
    );
    return match ? Number(match.available || 0) : 0;
  })();

  // Submit: Create & Reserve
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.salesOrderId) {
      setMsg({ type: 'error', text: 'Please select a Sales Order.' });
      return;
    }
    if (!formData.warehouseId) {
      setMsg({ type: 'error', text: 'Please select a Warehouse.' });
      return;
    }
    if (!formData.itemId) {
      setMsg({ type: 'error', text: 'Please select an Item.' });
      return;
    }
    if (!formData.requiredQuantity || Number(formData.requiredQuantity) <= 0) {
      setMsg({ type: 'error', text: 'Required Quantity must be greater than 0.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/stock/picklist', {
        salesOrderId: Number(formData.salesOrderId),
        customerId: Number(formData.customerId) || 1,
        warehouseId: Number(formData.warehouseId),
        picker: formData.picker || 'Warehouse Staff',
        items: [
          { itemId: Number(formData.itemId), requiredQuantity: Number(formData.requiredQuantity) }
        ]
      });

      setMsg({ type: 'success', text: 'Pick List created & stock reserved successfully!' });
      
      // Reset Item & Quantity, keep order & warehouse
      setFormData(prev => ({
        ...prev,
        itemId: '',
        requiredQuantity: ''
      }));

      // Reload pick lists & balances
      const [newPickLists, newBalances] = await Promise.all([
        api.get('/stock/picklist').catch(() => ({ data: [] })),
        api.get('/stock/balances').catch(() => ({ data: [] }))
      ]);
      setActivePickLists(Array.isArray(newPickLists.data) ? newPickLists.data : []);
      setBalances(Array.isArray(newBalances.data) ? newBalances.data : []);

    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create pick list';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // Complete Pick
  const handleComplete = async (id) => {
    setCompletingId(id);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/stock/picklist/${id}/complete`, { 
        picker: formData.picker || "Warehouse Staff" 
      });
      setMsg({ type: 'success', text: `Pick List #${id} completed. Stock officially issued for delivery!` });
      
      // Reload pick lists & balances
      const [newPickLists, newBalances] = await Promise.all([
        api.get('/stock/picklist').catch(() => ({ data: [] })),
        api.get('/stock/balances').catch(() => ({ data: [] }))
      ]);
      setActivePickLists(Array.isArray(newPickLists.data) ? newPickLists.data : []);
      setBalances(Array.isArray(newBalances.data) ? newBalances.data : []);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to complete pick list';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setCompletingId(null);
    }
  };

  // Filter pick lists
  const filteredPickLists = activePickLists.filter(pl => {
    const matchesSearch = 
      (pl.pickListNumber && pl.pickListNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (pl.salesOrderId && String(pl.salesOrderId).includes(searchTerm)) ||
      (pl.picker && pl.picker.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || pl.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helpers to resolve display names
  const getWarehouseName = (whId) => {
    const wh = warehouses.find(w => String(w.id) === String(whId));
    return wh ? `${wh.name || wh.warehouseName || 'Warehouse'} (${wh.code || wh.id})` : `WH #${whId}`;
  };

  const getOrderNumber = (soId) => {
    const ord = orders.find(o => String(o.id) === String(soId));
    return ord?.orderNumber ? ord.orderNumber : `SO #${soId}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-colors shadow-sm"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PackageOpen className="text-blue-400" /> Sales Pick Lists
            </h2>
            <p className="text-sm text-gray-400">
              Select confirmed Sales Orders, reserve warehouse stock, and issue items for delivery.
            </p>
          </div>
        </div>

        <button
          onClick={loadInitialData}
          disabled={fetching}
          className="px-4 py-2 rounded-xl bg-[#140f2d]/80 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-sm shadow-sm"
        >
          <RefreshCw size={15} className={fetching ? 'animate-spin text-blue-400' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Alert Notification */}
      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border flex items-center justify-between gap-3 transition-all ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{msg.text}</span>
          </div>
          <button 
            onClick={() => setMsg({ type: '', text: '' })} 
            className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form (5 Cols) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCreate} className="bg-[#140f2d]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2 text-base">
                <PlayCircle className="text-blue-400" size={18} /> Generate Pick List
              </h3>
              <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                Step 1: Reserve Stock
              </span>
            </div>

            {/* Sales Order Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-blue-400" /> Select Sales Order *
              </label>
              <select
                required
                value={formData.salesOrderId}
                onChange={e => handleOrderSelect(e.target.value)}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">-- Choose Sales Order --</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber || `SO #${o.id}`} • Client: {o.clientId || 'Client'} ({o.status || 'Active'})
                  </option>
                ))}
              </select>
              {selectedOrder && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-gray-300 flex items-center justify-between">
                  <span>Client: <strong className="text-white">{selectedOrder.clientId || 'N/A'}</strong></span>
                  <span>Amount: <strong className="text-blue-400">₹{selectedOrder.totalAmount || selectedOrder.orderAmount || 0}</strong></span>
                  <span>Items: <strong className="text-emerald-400">{orderItems.length} in Order</strong></span>
                </div>
              )}
              {orders.length === 0 && !fetching && (
                <p className="text-[11px] text-amber-400/90 mt-1">No sales orders found. Please create an order first.</p>
              )}
            </div>

            {/* Warehouse Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Warehouse size={14} className="text-indigo-400" /> Source Warehouse *
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">-- Choose Warehouse --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name || w.warehouseName || `Warehouse #${w.id}`} {w.code ? `(${w.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Item Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Box size={14} className="text-cyan-400" /> Select Item to Pick *
                </label>
                {loadingOrderDetails && (
                  <span className="text-[11px] text-blue-400 animate-pulse">Loading order items...</span>
                )}
              </div>

              {orderItems.length > 0 ? (
                <select
                  required
                  value={formData.itemId}
                  onChange={e => handleItemSelect(e.target.value)}
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">-- Choose Item from Order --</option>
                  {orderItems.map((item, idx) => {
                    const itmId = item.itemId || item.id;
                    const ordQty = Number(item.quantity || 0);
                    const resQty = Number(item.reservedQty || 0);
                    return (
                      <option key={`${itmId}-${idx}`} value={itmId}>
                        {item.itemName || item.name || `Item #${itmId}`} (Ordered: {ordQty}, Reserved: {resQty})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <select
                  required
                  value={formData.itemId}
                  onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">
                    {formData.salesOrderId ? '-- No line items in order, choose from catalog --' : '-- Choose Item Catalog --'}
                  </option>
                  {catalogItems.map(itm => (
                    <option key={itm.id} value={itm.id}>
                      {itm.name} {itm.sku ? `(${itm.sku})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity and Available Stock indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-400">Required Quantity *</label>
                {currentAvailableStock !== null && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    currentAvailableStock > 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    Available in WH: {currentAvailableStock}
                  </span>
                )}
              </div>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formData.requiredQuantity}
                onChange={e => setFormData({ ...formData, requiredQuantity: e.target.value })}
                placeholder="Enter pick quantity"
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2.5 text-blue-400 font-bold text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />

              {currentAvailableStock !== null && currentAvailableStock === 0 && (
                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>Warning: Available stock in this warehouse is 0. You may need to record a Stock Receipt before reservation.</span>
                </div>
              )}
            </div>

            {/* Assigned Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-gray-400" /> Assigned Picker
              </label>
              <input
                type="text"
                value={formData.picker}
                onChange={e => setFormData({ ...formData, picker: e.target.value })}
                placeholder="Picker Name / Staff"
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-3.5 py-2 text-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Reserving Stock...
                  </>
                ) : (
                  <>
                    <PlayCircle size={18} /> Create & Reserve Stock
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Pick Lists Table (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-[#140f2d]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl h-full flex flex-col">
            <div className="border-b border-white/10 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <PackageOpen className="text-emerald-400" size={18} /> Active Pick Lists
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Lists reserved items awaiting physical pick & stock issuance.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search pick lists..."
                    className="w-40 sm:w-48 bg-[#1b1638] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#1b1638] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="Created">Created</option>
                  <option value="Picked">Picked</option>
                </select>
              </div>
            </div>

            {/* Pick Lists Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-3">Pick List #</th>
                    <th className="p-3">Sales Order</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredPickLists.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                        <Box size={32} className="mx-auto mb-2 opacity-30 text-gray-400" />
                        No active pick lists found. Select an order and click &quot;Create &amp; Reserve&quot; to begin.
                      </td>
                    </tr>
                  ) : (
                    filteredPickLists.map(pl => {
                      const isPicked = pl.status === 'Picked';
                      const isCompleting = completingId === pl.id;

                      return (
                        <tr key={pl.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="p-3">
                            <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                              {pl.pickListNumber || `PL-${pl.id}`}
                            </span>
                            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                              <User size={11} /> {pl.picker || 'UNASSIGNED'}
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="text-gray-200 font-medium">
                              {getOrderNumber(pl.salesOrderId)}
                            </span>
                            <div className="text-[11px] text-gray-400">
                              Cust ID: {pl.customerId || 'N/A'}
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="text-gray-300 text-xs font-medium">
                              {getWarehouseName(pl.warehouseId)}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isPicked 
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            }`}>
                              {isPicked ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {isPicked ? 'Picked' : 'Created'}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            {!isPicked ? (
                              <button
                                onClick={() => handleComplete(pl.id)}
                                disabled={isCompleting}
                                className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm disabled:opacity-50"
                                title="Issue Stock and Mark as Picked"
                              >
                                {isCompleting ? (
                                  <>
                                    <RefreshCw size={13} className="animate-spin" /> Issuing...
                                  </>
                                ) : (
                                  <>
                                    <CheckSquare size={13} /> Complete Pick
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                Stock Issued
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="border-t border-white/10 pt-3 mt-auto flex items-center justify-between text-xs text-gray-400">
              <span>Total Pick Lists: {filteredPickLists.length}</span>
              <span className="text-gray-400">
                Completed ({filteredPickLists.filter(p => p.status === 'Picked').length}) / Pending ({filteredPickLists.filter(p => p.status !== 'Picked').length})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
