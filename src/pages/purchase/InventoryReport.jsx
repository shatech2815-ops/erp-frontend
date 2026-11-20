
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Package, Search,
  Download, AlertTriangle, CheckCircle, TrendingDown,
} from 'lucide-react';



import {
  getInventoryValuation,
  getStockMovement,
  getInventoryAccuracy
} from "../../services/purchase/inventoryReport.services";
import { getAllCategories } from "../../services/stock/category.services";
// Backend response shape:
// { id, itemId, warehouseName, storeName, quantity, reservedQuantity, availableQuantity, lastUpdatedBy, date, lastUpdated }

const getStockStatus = (available) => {
  if (available === 0)       return { label: 'Out of Stock', color: '#dc2626', bg: 'rgba(239,68,68,0.15)', icon: AlertTriangle };
  if (available <= 5)        return { label: 'Low Stock',    color: '#d97706', bg: 'rgba(245,158,11,0.15)', icon: TrendingDown };
  return                            { label: 'In Stock',     color: '#059669', bg: 'rgba(16,185,129,0.15)', icon: CheckCircle };
};

export default function InventoryReport() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [category,  setCategory]  = useState('');
  const [product,   setProduct]   = useState('');
  const [data,      setData]      = useState([]);
  const [allData,   setAllData]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [fetched,   setFetched]   = useState(false);
  const [categories, setCategories] = useState([]);

  // const fetchFromBackend = async (sDate, eDate, cat, prod) => {
  //   setLoading(true);
  //   try {
  //     const params = new URLSearchParams({
  //       startDate: sDate || new Date(Date.now() - 90*24*60*60*1000).toISOString().split('T')[0],
  //       endDate:   eDate || new Date().toISOString().split('T')[0],
  //       category:  cat  || 'All',
  //       product:   prod || 'All',
  //     });
  //     const res = await fetch(`/api/inventory-report?${params}`);
  //     if (res.ok) {
  //       const json = await res.json();
  //       const arr = Array.isArray(json) ? json : [];
  //       setAllData(arr);
  //       setData(arr);
  //       setFetched(true);
  //     } else {
  //       setAllData([]);
  //       setData([]);
  //       setFetched(true);
  //     }
  //   } catch {
  //     setAllData([]);
  //     setData([]);
  //     setFetched(true);
  //   }
  //   setLoading(false);
  // };

  const fetchFromBackend = async () => {
  setLoading(true);

  try {
    const movement = await getStockMovement();
    const valuation = await getInventoryValuation();
    const accuracy = await getInventoryAccuracy();

    const arr = Array.isArray(movement) ? movement : [];

    setAllData(arr);
    setData(arr);

    console.log("Valuation:", valuation);
    console.log("Accuracy:", accuracy);

    setFetched(true);
  } catch (error) {
    console.error("Error loading inventory report:", error);
    setAllData([]);
    setData([]);
    setFetched(true);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    loadCategories();
    fetchFromBackend('', '', '', '');
  }, []);

  const handleGenerate = () => {
    fetchFromBackend(startDate, endDate, category, product);
  };

  const handleReset = () => {
    setStartDate(''); setEndDate(''); setCategory(''); setProduct('');
    fetchFromBackend('', '', '', '');
  };

  const handleExport = () => {
    const headers = ['ID', 'Item Name', 'Warehouse', 'Store', 'Quantity', 'Reserved', 'Available', 'Last Updated By', 'Date', 'Status']
    const rows = data.map(r => {
      const ss = getStockStatus(r.availableQuantity);
      return [r.id, r.itemName, r.warehouseName, r.storeName, r.quantity, r.reservedQuantity, r.availableQuantity, r.lastUpdatedBy, r.date, ss.label];
    });
    const csv = [headers, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'inventory-report.csv'; a.click();
  };

  const inStockCount    = data.filter(r => (r.availableQuantity || 0) > 5).length;
  const lowStockCount   = data.filter(r => (r.availableQuantity || 0) > 0 && (r.availableQuantity || 0) <= 5).length;
  const outOfStockCount = data.filter(r => (r.availableQuantity || 0) === 0).length;

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/purchase')} className="hover:text-purple-300 transition-colors">Purchase Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate('/dashboard/purchase/reports')} className="hover:text-purple-300 transition-colors">Reports</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Inventory Report</span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard/purchase/reports')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <Package size={22} style={{ color: '#d97706' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Inventory Report</h2>
          <p className="text-sm text-gray-400">Stock levels, item movement & requests</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-[#140f2d]/80 text-sm font-semibold text-purple-300 hover:bg-white/10 transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Items',  value: data.length,    icon: Package,       color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
          { label: 'In Stock',     value: inStockCount,   icon: CheckCircle,   color: '#059669', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Low Stock',    value: lowStockCount,  icon: TrendingDown,  color: '#d97706', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Out of Stock', value: outOfStockCount,icon: AlertTriangle, color: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#140f2d]/80 rounded-2xl p-4 shadow-sm border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 w-40">
              <option value="" className="bg-[#140f2d]">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name} className="bg-[#140f2d]">{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 mb-1">Product</label>
            <input type="text" placeholder="Product name" value={product} onChange={e => setProduct(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white/5 w-40" />
          </div>
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            <Search size={14} /> Generate Report
          </button>
          <button onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-colors">
            Reset
          </button>
        </div>
      </div>

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.08), rgba(251,191,36,0.08))' }}>
                  {['ID', 'Item ID', 'Warehouse', 'Store', 'Quantity', 'Reserved', 'Available', 'Last Updated By', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-purple-300 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-14 text-gray-400">
                    <Package size={36} className="mx-auto mb-2 opacity-30" />
                    <p>{fetched ? 'No records found' : 'Click Generate Report to load data'}</p>
                  </td></tr>
                ) : data.map(r => {
                  const available = r.availableQuantity ?? 0;
                  const ss = getStockStatus(available);
                  const StockIcon = ss.icon;
                  return (
                    <tr key={r.id} className="hover:bg-[rgba(255,253,245,0.12)] transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{r.id}</td>
                      <td className="px-4 py-3 font-bold text-amber-300 text-xs">{r.itemName || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap text-xs">{r.warehouseName || '—'}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">{r.storeName || '—'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-white">{r.quantity ?? 0}</td>
                      <td className="px-4 py-3 text-center text-gray-400">{r.reservedQuantity ?? 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-base ${available === 0 ? 'text-red-400' : available <= 5 ? 'text-yellow-500' : 'text-[#059669]'}`}>
                          {available}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.lastUpdatedBy || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.date || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: ss.bg, color: ss.color }}>
                          <StockIcon size={11} /> {ss.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-4">
          <p className="text-xs text-gray-400">Showing {data.length} items</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> In Stock</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Low Stock</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Out of Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}