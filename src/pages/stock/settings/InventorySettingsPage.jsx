
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Settings, Save, CheckCircle, AlertCircle,
  Building2, Package, Bell, Ruler, DollarSign, RefreshCw,
} from 'lucide-react';

import {
  getInventorySettings,
  saveInventorySettings,
} from "../../../services/stock/settings/inventorySettings.services";

const defaultSettings = {
  companyName:          '',
  defaultWarehouse:     '',
  allowNegativeStock:   false,
  autoStockUpdate:      true,
  defaultReorderLevel:  10,
  lowStockAlert:        true,
  expiryAlert:          false,
  enableMultiUOM:       true,
  enableAutoConversion: true,
  allowDiscount:        true,
  includeTax:           false,
  enableBatchTracking:  false,
  enableSerialTracking: false,
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const isErr = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold border ${isErr ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
      <span className={`w-2 h-2 rounded-full ${isErr ? 'bg-red-400' : 'bg-emerald-400'}`} />
      {toast.msg}
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-[#140f2d]/80 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
    <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-white/5 flex items-center gap-2">
      {Icon && <Icon size={14} style={{ color: '#dc2626' }} />}
      <p className="text-xs font-bold text-[#dc2626] uppercase tracking-widest">{title}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-[rgba(240,247,255,0.15)] last:border-0">
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button type="button" onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${value ? 'bg-[#dc2626]' : 'bg-white/10'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-[#140f2d]/80 transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const InputRow = ({ label, desc, value, onChange, type = 'text', placeholder }) => (
  <div className="flex items-center justify-between py-3 border-b border-[rgba(240,247,255,0.15)] last:border-0">
    <div className="flex-1 mr-4">
      <p className="text-sm font-semibold text-white">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-48 rounded-xl border border-white/10 bg-[#140f2d]/80 px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all" />
  </div>
);

export default function InventorySettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  // const fetchSettings = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch('/api/inventory-settings');
  //     if (res.ok) {
  //       const d = await res.json();
  //       if (d) setSettings({ ...defaultSettings, ...d });
  //     }
  //   } catch {}
  //   finally { setLoading(false); }
  // };

  const fetchSettings = async () => {
  setLoading(true);

  try {
    const data = await getInventorySettings();

    if (data) {
      setSettings({
        ...defaultSettings,
        ...data,
      });
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    showToast("Failed to load settings.", "error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchSettings(); }, []);

  // const handleSave = async () => {
  //   setSaving(true);
  //   try {
  //     const payload = {
  //       ...settings,
  //       defaultReorderLevel: Number(settings.defaultReorderLevel) || 0,
  //     };
  //     const res = await fetch('/api/inventory-settings', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });
  //     if (res.ok) { showToast('Settings saved successfully!'); }
  //     else { showToast('Failed to save settings.', 'error'); }
  //   } catch { showToast('Server error saving settings.', 'error'); }
  //   finally { setSaving(false); }
  // };

  const handleSave = async () => {
  setSaving(true);

  try {
    const payload = {
      ...settings,
      defaultReorderLevel:
        Number(settings.defaultReorderLevel) || 0,
    };

    await saveInventorySettings(payload);

    showToast("Settings saved successfully!");
  } catch (error) {
    console.error("Error saving settings:", error);

    if (error.response?.data?.message) {
      showToast(error.response.data.message, "error");
    } else {
      showToast("Failed to save settings.", "error");
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="space-y-5 w-full">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/stock/settings')}
          className="w-10 h-10 rounded-xl bg-[#140f2d]/80 border border-white/10 flex items-center justify-center text-purple-300 hover:bg-white/10 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <Settings size={22} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Inventory Settings</h2>
          <p className="text-sm text-gray-400">Configure inventory, stock and UOM behaviour</p>
        </div>
        <button onClick={fetchSettings} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-[rgba(255,255,255,0.10)]">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reload
        </button>
      </div>

      {/* General Settings */}
      <Section title="General Settings" icon={Building2}>
        <InputRow label="Company Name" desc="Name shown on reports and invoices" value={settings.companyName} onChange={v => set('companyName', v)} placeholder="e.g. Aminoid Ai" />
        <InputRow label="Default Warehouse" desc="Primary warehouse for stock operations" value={settings.defaultWarehouse} onChange={v => set('defaultWarehouse', v)} placeholder="e.g. Main Warehouse" />
      </Section>

      {/* Stock Settings */}
      <Section title="Stock Settings" icon={Package}>
        <ToggleRow label="Allow Negative Stock" desc="Allow stock to go below zero" value={settings.allowNegativeStock} onChange={v => set('allowNegativeStock', v)} />
        <ToggleRow label="Auto Stock Update" desc="Automatically update stock on transactions" value={settings.autoStockUpdate} onChange={v => set('autoStockUpdate', v)} />
        <InputRow label="Default Reorder Level" desc="Minimum stock quantity before reorder alert" value={settings.defaultReorderLevel} onChange={v => set('defaultReorderLevel', v)} type="number" placeholder="e.g. 10" />
      </Section>

      {/* Alert Settings */}
      <Section title="Alert Settings" icon={Bell}>
        <ToggleRow label="Low Stock Alert" desc="Notify when stock falls below reorder level" value={settings.lowStockAlert} onChange={v => set('lowStockAlert', v)} />
        <ToggleRow label="Expiry Alert" desc="Notify before batch items expire" value={settings.expiryAlert} onChange={v => set('expiryAlert', v)} />
      </Section>

      {/* UOM Settings */}
      <Section title="UOM Settings" icon={Ruler}>
        <ToggleRow label="Enable Multi UOM" desc="Allow items to have multiple units of measurement" value={settings.enableMultiUOM} onChange={v => set('enableMultiUOM', v)} />
        <ToggleRow label="Auto Conversion" desc="Automatically convert between units" value={settings.enableAutoConversion} onChange={v => set('enableAutoConversion', v)} />
      </Section>

      {/* Pricing Settings */}
      <Section title="Pricing Settings" icon={DollarSign}>
        <ToggleRow label="Allow Discount" desc="Enable discounts on items and orders" value={settings.allowDiscount} onChange={v => set('allowDiscount', v)} />
        <ToggleRow label="Include Tax in Price" desc="Show prices with tax included" value={settings.includeTax} onChange={v => set('includeTax', v)} />
      </Section>

      {/* Transaction Settings */}
      <Section title="Transaction Settings" icon={Settings}>
        <ToggleRow label="Batch Tracking" desc="Track inventory by batch or lot number" value={settings.enableBatchTracking} onChange={v => set('enableBatchTracking', v)} />
        <ToggleRow label="Serial Tracking" desc="Track inventory by individual serial numbers" value={settings.enableSerialTracking} onChange={v => set('enableSerialTracking', v)} />
      </Section>

      {/* Save Button */}
      <div className="pb-6">
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-60 text-base"
          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          <Save size={18} />{saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}