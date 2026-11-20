import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search, Activity } from 'lucide-react';
import { getStockMovements } from '../../services/stock/stockEngine.services';

export default function StockMovements() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getStockMovements();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setMsg("Failed to load stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const getTypeColor = (type) => {
    if (type.includes('IN') || type === 'RECEIPT') return 'text-emerald-400 bg-emerald-500/10';
    if (type.includes('OUT') || type === 'ISSUE') return 'text-amber-400 bg-amber-500/10';
    if (type.includes('ADJUSTMENT')) return 'text-purple-400 bg-purple-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-purple-300 mb-4 font-medium">
        <button onClick={() => navigate('/dashboard/stock')} className="hover:text-amber-300">Stock Management</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-white font-semibold">Movement Ledger</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-amber-300 hover:bg-amber-500/10 shadow-sm"><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
          <Activity size={22} style={{ color: '#3b82f6' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Stock Movement Ledger</h2>
          <p className="text-sm text-gray-400">Complete immutable audit trail of all physical stock transactions</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold border bg-red-500/10 border-red-500/30 text-red-400`}>
          {msg}
        </div>
      )}

      <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
           <h3 className="text-sm font-bold text-blue-400">Transaction History</h3>
           <button onClick={fetchRecords} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white"><Search size={12}/> Refresh</button>
        </div>
        
        {loading ? <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#1e3a8a' }}>
                  {['Date', 'Movement ID', 'Transaction', 'Reference', 'Item', 'Warehouse', 'Qty IN', 'Qty OUT', 'Balance', 'Source Module'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-white">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {records.length === 0 ? <tr><td colSpan={10} className="text-center py-12 text-gray-400">No stock movements found.</td></tr>
                  : records.map((r, i) => (
                  <tr key={i} className="hover:bg-[rgba(255,253,245,0.12)]">
                    <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.transactionDate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-mono text-purple-300">{r.movementId}</td>
                    <td className="px-4 py-3 text-[10px] font-bold">
                      <span className={`px-2 py-1 rounded-md ${getTypeColor(r.transactionType)}`}>{r.transactionType}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.referenceNumber || '-'}</td>
                    <td className="px-4 py-3 text-xs text-white font-medium">{r.item?.name}</td>
                    <td className="px-4 py-3 text-xs text-blue-300">{r.warehouse?.name}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-400">{parseFloat(r.quantityIn) > 0 ? `+${parseFloat(r.quantityIn)}` : '-'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-400">{parseFloat(r.quantityOut) > 0 ? `-${parseFloat(r.quantityOut)}` : '-'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">{parseFloat(r.runningBalance)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.sourceModule || 'SYSTEM'}</td>
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
