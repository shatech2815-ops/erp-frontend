import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShieldCheck, Package, AlertTriangle, History, RefreshCw } from 'lucide-react';
import api from '../../interceptors/interceptors';
import { getAllGRNs } from '../../services/purchase/grn.services';

export default function QualityInspection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialGrnId = searchParams.get('grnId') || '';

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [grns, setGrns] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    grnId: initialGrnId,
    itemId: '',
    acceptedQuantity: '',
    rejectedQuantity: '0',
    quarantineQuantity: '0',
    inspector: 'Admin',
    notes: ''
  });

  useEffect(() => {
    loadGRNs();
    loadInspections();
  }, []);

  useEffect(() => {
    if (initialGrnId && grns.length > 0) {
      handleGRNChange(initialGrnId);
    }
  }, [initialGrnId, grns]);

  const loadGRNs = async () => {
    try {
      const data = await getAllGRNs();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setGrns(list);
    } catch (err) {
      console.error('Failed to load GRNs:', err);
    }
  };

  const loadInspections = async () => {
    try {
      const res = await api.get('/stock/quality');
      setRecentInspections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load inspections:', err);
    }
  };

  const handleGRNChange = (grnIdValue) => {
    const grn = grns.find(g => String(g.id) === String(grnIdValue));
    setSelectedGRN(grn || null);
    setSelectedItem(null);
    setFormData(prev => ({
      ...prev,
      grnId: grnIdValue,
      itemId: '',
      acceptedQuantity: '',
      rejectedQuantity: '0',
      quarantineQuantity: '0'
    }));

    // If GRN only has 1 item, auto select it
    if (grn && grn.items && grn.items.length === 1) {
      const it = grn.items[0];
      handleItemSelect(it, grnIdValue);
    }
  };

  const handleItemSelect = (item, grnIdOverride) => {
    setSelectedItem(item);
    const recQty = Number(item.receivedQuantity || item.acceptedQuantity || 0);
    setFormData(prev => ({
      ...prev,
      grnId: grnIdOverride || prev.grnId,
      itemId: String(item.itemId || item.id || ''),
      acceptedQuantity: String(recQty),
      rejectedQuantity: '0',
      quarantineQuantity: '0'
    }));
  };

  const handleAcceptedQtyChange = (val) => {
    const acc = parseFloat(val) || 0;
    const totalRec = selectedItem ? Number(selectedItem.receivedQuantity || 0) : 0;
    const rej = totalRec > acc ? totalRec - acc : 0;
    setFormData(prev => ({
      ...prev,
      acceptedQuantity: val,
      rejectedQuantity: String(rej)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.grnId || !formData.itemId || formData.acceptedQuantity === '') {
      return setMsg({ type: 'error', text: 'Please select a GRN, Item, and specify Accepted Quantity.' });
    }

    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const payload = {
        grnId: Number(formData.grnId),
        itemId: Number(formData.itemId),
        acceptedQuantity: parseFloat(formData.acceptedQuantity) || 0,
        rejectedQuantity: parseFloat(formData.rejectedQuantity) || 0,
        quarantineQuantity: parseFloat(formData.quarantineQuantity) || 0,
        inspector: formData.inspector || 'Admin',
        notes: formData.notes
      };

      await api.post('/stock/quality', payload);
      setMsg({ type: 'success', text: 'Quality Inspection submitted! Accepted stock has been added to inventory.' });
      
      // Reset form
      setSelectedGRN(null);
      setSelectedItem(null);
      setFormData({
        grnId: '',
        itemId: '',
        acceptedQuantity: '',
        rejectedQuantity: '0',
        quarantineQuantity: '0',
        inspector: 'Admin',
        notes: ''
      });
      loadInspections();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to submit inspection' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" /> Quality Inspection
            </h2>
            <p className="text-sm text-gray-400">Process received goods. Only accepted quantities increase available stock.</p>
          </div>
        </div>
        <button
          onClick={() => { loadGRNs(); loadInspections(); }}
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-lg space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GRN Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
              Select GRN (Goods Receipt Note) <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={formData.grnId}
              onChange={e => handleGRNChange(e.target.value)}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">-- Choose Goods Receipt Note --</option>
              {grns.map(g => (
                <option key={g.id} value={g.id} className="bg-[#140f2d] text-white">
                  {g.grnNumber} - {g.vendor || 'Vendor'} (PO: {g.poNumber || 'N/A'}) - {g.warehouse || 'Main WH'}
                </option>
              ))}
            </select>
          </div>

          {/* Item Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
              Select Item to Inspect <span className="text-red-400">*</span>
            </label>
            {selectedGRN && selectedGRN.items && selectedGRN.items.length > 0 ? (
              <select
                required
                value={formData.itemId}
                onChange={e => {
                  const it = selectedGRN.items.find(i => String(i.itemId || i.id) === e.target.value);
                  if (it) handleItemSelect(it);
                  else setFormData({ ...formData, itemId: e.target.value });
                }}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">-- Choose Item from GRN --</option>
                {selectedGRN.items.map(it => (
                  <option key={it.id || it.itemId} value={it.itemId || it.id} className="bg-[#140f2d] text-white">
                    {it.itemName} (Rec: {it.receivedQuantity} | Ord: {it.orderedQuantity})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                required
                value={formData.itemId}
                onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder={selectedGRN ? "No items found in GRN, enter Item ID" : "Select a GRN first"}
              />
            )}
          </div>

          {/* Selected Item Detail Banner */}
          {selectedItem && (
            <div className="md:col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Package className="text-emerald-400" size={18} />
                <span className="font-bold text-white text-sm">{selectedItem.itemName}</span>
                <span className="text-gray-400">(Item ID: {selectedItem.itemId})</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-400">Ordered Qty: </span>
                  <span className="text-white font-semibold">{selectedItem.orderedQuantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Received Qty: </span>
                  <span className="text-emerald-400 font-bold text-sm">{selectedItem.receivedQuantity || 0}</span>
                </div>
                {selectedItem.batchNumber && (
                  <div>
                    <span className="text-gray-400">Batch: </span>
                    <span className="text-purple-300 font-mono">{selectedItem.batchNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accepted Quantity */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
            <label className="block text-xs font-bold text-emerald-400 mb-2 uppercase">
              Accepted Quantity (Moves to Stock) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.acceptedQuantity}
              onChange={e => handleAcceptedQtyChange(e.target.value)}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 transition-colors text-lg"
              placeholder="0.00"
            />
          </div>

          {/* Rejected Quantity */}
          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
            <label className="block text-xs font-bold text-red-400 mb-2 uppercase">
              Rejected Quantity
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.rejectedQuantity}
              onChange={e => setFormData({ ...formData, rejectedQuantity: e.target.value })}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-red-400 font-bold focus:outline-none focus:border-red-500 transition-colors text-lg"
              placeholder="0.00"
            />
          </div>

          {/* Quarantine Quantity */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
            <label className="block text-xs font-bold text-amber-400 mb-2 uppercase">
              Quarantine Quantity
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.quarantineQuantity}
              onChange={e => setFormData({ ...formData, quarantineQuantity: e.target.value })}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-amber-400 font-bold focus:outline-none focus:border-amber-500 transition-colors text-lg"
              placeholder="0.00"
            />
          </div>

          {/* Inspector Name */}
          <div className="p-4 rounded-xl">
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
              Inspector Name
            </label>
            <input
              type="text"
              value={formData.inspector}
              onChange={e => setFormData({ ...formData, inspector: e.target.value })}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Admin"
            />
          </div>

          {/* Inspection Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
              Inspection Notes / Remarks
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#1b1638] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Quality checks passed, condition normal, damages if any..."
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle size={18} />
            )}
            Submit Inspection & Update Stock
          </button>
        </div>
      </form>

      {/* Recent Inspection History */}
      <div className="bg-[#140f2d]/80 rounded-2xl p-6 border border-white/10 shadow-lg">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
          <History size={16} className="text-emerald-400" /> Recent Quality Inspection History
        </h3>
        {recentInspections.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No past inspection records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-purple-300 uppercase bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Inspection #</th>
                  <th className="px-4 py-3">GRN #</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-emerald-400">Accepted</th>
                  <th className="px-4 py-3 text-red-400">Rejected</th>
                  <th className="px-4 py-3 text-amber-400">Quarantine</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentInspections.slice(0, 10).map((qc) => (
                  <tr key={qc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-emerald-300">{qc.inspectionNumber}</td>
                    <td className="px-4 py-3 text-gray-300">{qc.grn?.grnNumber || `GRN #${qc.grn?.id || '-'}`}</td>
                    <td className="px-4 py-3 font-medium text-white">{qc.item?.name || `Item #${qc.item?.id || '-'}`}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{qc.acceptedQuantity}</td>
                    <td className="px-4 py-3 font-bold text-red-400">{qc.rejectedQuantity || 0}</td>
                    <td className="px-4 py-3 font-bold text-amber-400">{qc.quarantineQuantity || 0}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{qc.inspector || 'Admin'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {qc.status || 'Completed'}
                      </span>
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
