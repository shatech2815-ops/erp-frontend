import React, { useState, useEffect } from 'react';
import { Activity, Radio } from 'lucide-react';
import apiInterceptor from '../../interceptors/interceptors';
import { io } from 'socket.io-client';

const WebhookLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiInterceptor.get('/webhooks/logs');
        setLogs(res.data);
      } catch (e) {
        console.error('Failed to fetch webhook logs', e);
      }
    };
    
    fetchLogs();

    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:7002';
    const socket = io(socketUrl);
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('webhook.logged', (newLog) => {
      setLogs(prev => [newLog, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-500" />
            Webhook Logs
          </h2>
          <p className="text-gray-400 text-sm mt-1">Real-time webhook event deliveries</p>
        </div>
        <div className="flex items-center gap-2 bg-black/20 border border-white/10 px-4 py-2 rounded-xl">
          <div className="relative flex items-center justify-center">
            <Radio size={16} className={isConnected ? 'text-emerald-500' : 'text-red-500'} />
            {isConnected && <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></span>}
          </div>
          <span className="text-sm font-semibold text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-black/20 border border-white/10 rounded-2xl flex flex-col">
        <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-1">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${log.type === 'Outgoing' ? 'bg-blue-500/20 text-blue-400' : 'bg-fuchsia-500/20 text-fuchsia-400'}`}>
                    {log.type}
                  </span>
                  <span className="font-semibold text-white">{log.webhook?.name || 'Unknown Webhook'}</span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{log.event}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`px-2 py-1 rounded font-bold ${log.status >= 200 && log.status < 300 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    HTTP {log.status || 500}
                  </span>
                  <span className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-2">Payload</p>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto custom-scrollbar">
                    {log.payload}
                  </pre>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] uppercase text-gray-500 font-bold mb-2">Response</p>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto custom-scrollbar">
                    {log.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-gray-500">
               <Activity size={48} className="mb-4 opacity-50" />
               <p>No webhook logs found. Events will appear here in real-time.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebhookLogs;
