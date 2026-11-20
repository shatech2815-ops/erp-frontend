import React, { useEffect, useState } from 'react';
import { CheckCircle, Globe2, Save, Server, Settings, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'erp-system-settings';

const defaultSettings = {
  companyName: 'Aminoid AI',
  timezone: 'Asia/Kolkata',
  sessionTimeout: '30',
  maintenanceMode: false,
  emailNotifications: true,
  auditLogging: true,
};

const Toggle = ({ label, description, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 cursor-pointer">
    <span>
      <span className="block text-sm font-semibold text-white">{label}</span>
      <span className="mt-0.5 block text-xs text-gray-400">{description}</span>
    </span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-indigo-500" />
  </label>
);

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    } catch {
      // Use defaults when saved preferences cannot be read.
    }
  }, []);

  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-300"><Settings size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
            <p className="text-sm text-gray-400">Configure organization-wide ERP preferences.</p>
          </div>
        </div>
        <button type="button" onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
          <Save size={16} /> Save changes
        </button>
      </div>

      {saved && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><CheckCircle size={17} /> System settings saved.</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[#140f2d]/80 p-6">
          <div className="mb-5 flex items-center gap-2 text-indigo-300"><Globe2 size={18} /><h2 className="font-bold text-white">Organization</h2></div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Company name<input value={settings.companyName} onChange={(event) => update('companyName', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" /></label>
            <label className="block text-sm font-medium text-gray-300">Time zone<select value={settings.timezone} onChange={(event) => update('timezone', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"><option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option></select></label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#140f2d]/80 p-6">
          <div className="mb-5 flex items-center gap-2 text-indigo-300"><Server size={18} /><h2 className="font-bold text-white">System behavior</h2></div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Session timeout (minutes)<input type="number" min="5" value={settings.sessionTimeout} onChange={(event) => update('sessionTimeout', event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500" /></label>
            <Toggle label="Maintenance mode" description="Restrict normal user access while system maintenance is in progress." checked={settings.maintenanceMode} onChange={(value) => update('maintenanceMode', value)} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#140f2d]/80 p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2 text-indigo-300"><ShieldCheck size={18} /><h2 className="font-bold text-white">Notifications and audit</h2></div>
          <div className="grid gap-3 md:grid-cols-2">
            <Toggle label="Email notifications" description="Send operational notifications to configured recipients." checked={settings.emailNotifications} onChange={(value) => update('emailNotifications', value)} />
            <Toggle label="Audit logging" description="Record key system and user actions for traceability." checked={settings.auditLogging} onChange={(value) => update('auditLogging', value)} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
