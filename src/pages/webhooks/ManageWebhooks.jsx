import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Link } from 'lucide-react';
import apiInterceptor from '../../interceptors/interceptors';

const ManageWebhooks = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Outgoing', url: '', events: '' });

  const fetchWebhooks = async () => {
    try {
      const res = await apiInterceptor.get('/webhooks');
      setWebhooks(res.data);
    } catch (e) {
      console.error('Failed to fetch webhooks', e);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiInterceptor.delete(`/webhooks/${id}`);
      fetchWebhooks();
    } catch (e) {
      console.error('Failed to delete webhook', e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiInterceptor.post('/webhooks', {
        ...formData,
        events: formData.events.split(',').map(e => e.trim())
      });
      setIsModalOpen(false);
      fetchWebhooks();
      setFormData({ name: '', type: 'Outgoing', url: '', events: '' });
    } catch (e) {
      console.error('Failed to create webhook', e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-rose-500" />
            Manage Webhooks
          </h2>
          <p className="text-gray-400 text-sm mt-1">Configure external integrations</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-rose-500/25"
        >
          <Plus size={18} />
          <span>New Webhook</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webhooks.map((wh) => (
          <div key={wh.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-white">{wh.name}</h3>
              <button onClick={() => handleDelete(wh.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${wh.type === 'Outgoing' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {wh.type}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${wh.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {wh.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 p-2 rounded-lg break-all">
                <Link size={14} className="shrink-0" />
                <span className="truncate">
                  {wh.type === 'Incoming' 
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:7002/api'}/webhooks/incoming/${wh.id}`
                    : wh.url}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {wh.events.map((evt, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/5">
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {webhooks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl">
             <Zap size={48} className="text-gray-600 mb-4" />
             <p className="text-gray-400">No webhooks configured</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#15161c] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">New Webhook</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5">
                X
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Webhook Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  placeholder="e.g. Slack Integration"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors appearance-none"
                >
                  <option className="bg-[#15161c]" value="Outgoing">Outgoing (Send data to URL)</option>
                  <option className="bg-[#15161c]" value="Incoming">Incoming (Receive data here)</option>
                </select>
              </div>

              {formData.type === 'Outgoing' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">URL</label>
                  <input 
                    required
                    type="url" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                    placeholder="https://api.example.com/webhook"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Events (Comma Separated)</label>
                <input 
                  required
                  type="text" 
                  value={formData.events}
                  onChange={(e) => setFormData({...formData, events: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
                  placeholder="project.created, invoice.paid"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold transition-colors shadow-lg">
                  Create Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWebhooks;
