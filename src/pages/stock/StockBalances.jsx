import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, Box } from 'lucide-react';
import { getStockBalances } from '../../services/stock/stockEngine.services';

export default function StockBalances() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getStockBalances();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMsg("Failed to load stock balances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/stock')} className="hover:text-amber-300">Stock Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Physical Stock Balances</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
          <Box size={22} style={{ color: '#10b981' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Stock Balances</h2>
          <p className="text-sm text-gray-400">Real-time view of On-Hand, Reserved, and Available Stock</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border bg-red-500/10 border-red-500/30 text-red-400`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-sm font-bold text-emerald-400">Live Inventory Positions</h3>
           <button onClick={fetchRecords} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><Search size={12}/> Refresh</button>
        </div>
        
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#047857' }}>
                  {['Item SKU', 'Item Name', 'Warehouse', 'Location', 'On Hand', 'Reserved', 'Blocked', 'Available'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No stock found in any warehouse.</td></tr>
                  : records.map((r, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs font-semibold text-white">{r.item?.sku || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.item?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-emerald-300 font-medium">{r.warehouse?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.location?.locationCode || '-'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">{parseFloat(r.onHand).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-amber-400 font-bold">{parseFloat(r.reserved).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-red-400 font-bold">{parseFloat(r.blocked).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">{parseFloat(r.available).toFixed(2)}</td>
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
