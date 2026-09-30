import React, { useState } from 'react';
import { Zap, Send, CheckCircle2, Globe, BellRing, ArrowRight, ShieldCheck } from 'lucide-react';

interface AutomationTabProps {
  publicUrl: string;
}

export const AutomationTab: React.FC<AutomationTabProps> = ({ publicUrl }) => {
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.zapier.com/hooks/catch/sample');
  const [notifyOnNew, setNotifyOnNew] = useState(true);
  const [autoStatusAdvance, setAutoStatusAdvance] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Automations & Event Triggers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure automatic webhook dispatches, Zapier triggers, and order status transitions
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            {saved ? 'Rules Saved!' : 'Save Automation Rules'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outbound Webhook Trigger */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Outbound Webhook Dispatch</h3>
              <p className="text-xs text-slate-500">Post JSON payloads on each new order submission</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Destination Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Event Trigger:</div>
            <p>Fires <code className="text-blue-600 font-mono">order.created</code> immediately after customer submits form.</p>
          </div>
        </div>

        {/* Pipeline Automation Rules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pipeline Rules</h3>
              <p className="text-xs text-slate-500">Auto-transition orders and trigger notifications</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnNew}
                onChange={(e) => setNotifyOnNew(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">Instant In-App Alerts</span>
                <span className="text-slate-500">Show notification banner whenever an order is submitted</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={autoStatusAdvance}
                onChange={(e) => setAutoStatusAdvance(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">Auto-Advance to Processing</span>
                <span className="text-slate-500">Automatically switch "new" orders to "processing" after 1 hour</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
