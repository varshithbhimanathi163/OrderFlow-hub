import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Play,
  Code,
  FileText,
  RefreshCw,
  ExternalLink,
  Lock,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Server,
  HelpCircle,
} from 'lucide-react';
import type { ApiKey } from '../types.ts';

interface ApiKeysTabProps {
  publicUrl: string;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ publicUrl }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<'read' | 'read_write' | 'admin'>('read_write');
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'sheets' | 'python' | 'node' | 'curl' | 'zapier'>('sheets');

  // Interactive Tester State
  const [testerKey, setTesterKey] = useState('');
  const [testerEndpoint, setTesterEndpoint] = useState('/api/sync/orders');
  const [testerLimit, setTesterLimit] = useState('10');
  const [testerSince, setTesterSince] = useState('');
  const [testerLoading, setTesterLoading] = useState(false);
  const [testerResponse, setTesterResponse] = useState<any>(null);
  const [testerStatus, setTesterStatus] = useState<number | null>(null);

  const baseUrl = publicUrl.replace(/\/$/, '');

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/keys?reveal=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.keys)) {
        setKeys(data.keys);
        if (data.keys.length > 0 && !testerKey) {
          // Pre-fill tester with the first available key
          setTesterKey(data.keys[0].key || data.keys[0].keyPrefix);
        }
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          role: newKeyRole,
        }),
      });
      const data = await res.json();
      if (data.success && data.key) {
        setCreatedKey(data.key);
        setTesterKey(data.key.key);
        setNewKeyName('');
        setIsCreating(false);
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any apps using it will lose access.')) return;
    try {
      const res = await fetch(`/api/keys/${id}/revoke`, { method: 'PATCH' });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Permanently delete this API key? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKeys();
        if (createdKey?.id === id) {
          setCreatedKey(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const runTesterRequest = async () => {
    try {
      setTesterLoading(true);
      setTesterResponse(null);
      setTesterStatus(null);

      const params = new URLSearchParams();
      if (testerLimit) params.append('limit', testerLimit);
      if (testerSince) params.append('since', testerSince);

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const targetUrl = `${testerEndpoint}${queryStr}`;

      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testerKey}`,
        },
      });

      setTesterStatus(res.status);
      const data = await res.json();
      setTesterResponse(data);
    } catch (err: any) {
      setTesterStatus(500);
      setTesterResponse({ error: err.message || 'Network request failed' });
    } finally {
      setTesterLoading(false);
    }
  };

  const [cronSecret] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('orderflow_cron_secret') : null;
    if (saved) return saved;
    const generated = 'of_cron_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    if (typeof window !== 'undefined') localStorage.setItem('orderflow_cron_secret', generated);
    return generated;
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeKeyToken = createdKey?.key || keys.find((k) => k.key)?.key || 'of_live_your_api_key_token_here';

  const copyFieldValue = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Key className="w-3.5 h-3.5" />
              <span>External API & Table Sync</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              API Keys & Data Sync Engine
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Generate secure API keys to sync your customer order submissions table into Google Sheets, Zapier, Make.com, Python scripts, or your own custom mobile/web application.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New API Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Newly Created Key Alert Banner */}
      {createdKey && createdKey.key && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-white mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-950">
                  New API Key Generated: {createdKey.name}
                </h4>
                <p className="text-xs text-emerald-800">
                  Please copy your secret key token now. For security purposes, it will be masked on future page reloads.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-3 py-2 bg-white rounded-lg border border-emerald-300 font-mono text-xs text-emerald-900 font-bold select-all overflow-x-auto max-w-xl shadow-inner">
                    {createdKey.key}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdKey.key!);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Copied!' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCreatedKey(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Sync App Configuration & Credentials Card */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200/80 shadow-md p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <Server className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>External App Sync Credentials</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  DATABASE_URL & CRON_SECRET
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                When another application, sync worker, or scheduled cron job connects to sync this table, provide these values:
              </p>
            </div>
          </div>
        </div>

        {/* Two-Column Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. DATABASE_URL */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>DATABASE_URL</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Order Data Source</span>
            </div>
            <p className="text-[11px] text-slate-600">
              The public API URL where orders are queried and synchronized:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${baseUrl}/api/sync/orders`}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold select-all"
              />
              <button
                type="button"
                onClick={() => copyFieldValue(`${baseUrl}/api/sync/orders`, 'DATABASE_URL')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                {copiedField === 'DATABASE_URL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'DATABASE_URL' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              💡 <em>Note: If your other app is a custom SQL worker saving orders into Postgres, set its destination Postgres connection string here.</em>
            </div>
          </div>

          {/* 2. CRON_SECRET */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>CRON_SECRET</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Scheduled Sync Token</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Secret key used to authorize scheduled automated synchronization:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={cronSecret}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold select-all"
              />
              <button
                type="button"
                onClick={() => copyFieldValue(cronSecret, 'CRON_SECRET')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                {copiedField === 'CRON_SECRET' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'CRON_SECRET' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              💡 <em>Pass via <code className="bg-white px-1 py-0.5 rounded border border-slate-200">Authorization: Bearer &lt;CRON_SECRET&gt;</code> to trigger sync.</em>
            </div>
          </div>
        </div>

        {/* Helper Explanation Banner */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-indigo-900">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>How does your other app use these details?</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] text-indigo-900/90 leading-relaxed">
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
              <strong>Scenario A: If the app fetches data FROM OrderFlow:</strong>
              <p className="mt-1 text-slate-600">
                Set <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">DATABASE_URL</code> to <span className="font-mono font-semibold">{baseUrl}/api/sync/orders</span> and set <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">CRON_SECRET</code> to your API key or the secret above.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
              <strong>Scenario B: If the app is a scheduled worker saving to SQL:</strong>
              <p className="mt-1 text-slate-600">
                Set <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">DATABASE_URL</code> to your own PostgreSQL/Supabase database URL, and set <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-700">CRON_SECRET</code> to secure its cron endpoint (<code className="font-mono">{baseUrl}/api/cron/sync</code>).
              </p>
            </div>
          </div>
        </div>
      </div>
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Generate New API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Description / Application Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Sheets Sync, Zapier Integration, Mobile CRM"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Access Permissions (Scope)
                </label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="read">Read Only (Sync orders and view submissions table)</option>
                  <option value="read_write">Read & Write (Sync orders + submit orders via API)</option>
                  <option value="admin">Full Admin (Read, write, update status, and manage records)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  For automated spreadsheets and dashboards, <strong>Read Only</strong> is recommended.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newKeyName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Active API Keys</h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
              {keys.length}
            </span>
          </div>
          <button
            onClick={fetchKeys}
            title="Refresh Keys"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-6">Name / Purpose</th>
                <th className="py-3 px-6">Key Token</th>
                <th className="py-3 px-6">Permissions</th>
                <th className="py-3 px-6">Created</th>
                <th className="py-3 px-6">Last Used</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No API keys created yet. Click "Generate New API Key" above.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-6 font-semibold text-slate-900">
                      <div>{k.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{k.id}</div>
                    </td>
                    <td className="py-3 px-6 font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {k.key ? k.key : k.keyPrefix}
                        </span>
                        <button
                          onClick={() => copyToClipboard(k.key || k.keyPrefix, k.id)}
                          title="Copy Key Token"
                          className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {copiedKeyId === k.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          k.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : k.role === 'read_write'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {k.role === 'admin' ? 'Admin (Full)' : k.role === 'read_write' ? 'Read / Write' : 'Read Only'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-500 text-[11px]">
                      {k.createdAtFormatted || 'Just now'}
                    </td>
                    <td className="py-3 px-6 text-slate-500 text-[11px]">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          k.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            k.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {k.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {k.status === 'active' && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            title="Revoke Key"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          title="Delete Key"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Live API Tester */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Play className="w-4 h-4 fill-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive API Request Tester</h3>
              <p className="text-xs text-slate-500">
                Execute live requests against your API right here to verify auth and view formatted responses.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select or Enter API Key
            </label>
            <input
              type="text"
              value={testerKey}
              onChange={(e) => setTesterKey(e.target.value)}
              placeholder="of_live_..."
              className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Sync Endpoint
            </label>
            <select
              value={testerEndpoint}
              onChange={(e) => setTesterEndpoint(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="/api/sync/orders">GET /api/sync/orders (Incremental Sync)</option>
              <option value="/api/submissions">GET /api/submissions (Admin Table Query)</option>
              <option value="/api/submissions/stats">GET /api/submissions/stats (Dashboard Metrics)</option>
              <option value="/api/keys/verify">GET /api/keys/verify (Verify Token Validity)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Batch Limit
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                value={testerLimit}
                onChange={(e) => setTesterLimit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={runTesterRequest}
                disabled={testerLoading || !testerKey}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {testerLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                <span>Send Request</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Response Viewer */}
        {testerStatus !== null && (
          <div className="space-y-2 pt-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <span>Response Output:</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                    testerStatus >= 200 && testerStatus < 300
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  HTTP {testerStatus}
                </span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {testerResponse?.submissions ? `${testerResponse.submissions.length} items returned` : 'OK'}
              </span>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed shadow-inner">
              {JSON.stringify(testerResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Sync Documentation Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">How to Sync Table Data in Another App</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Use your API key in the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-semibold">Authorization: Bearer &lt;KEY&gt;</code> or <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-semibold">x-api-key: &lt;KEY&gt;</code> HTTP header.
          </p>
        </div>

        {/* Code Tabs */}
        <div className="flex space-x-2 border-b border-slate-100 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveCodeTab('sheets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'sheets'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📊 Google Sheets (Auto-Sync)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('python')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'python'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>🐍 Python (Pandas/Requests)</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('node')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'node'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>⚡ Node.js / JavaScript</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('curl')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'curl'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>💻 cURL Terminal</span>
          </button>
          <button
            onClick={() => setActiveCodeTab('zapier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeCodeTab === 'zapier'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>⚡ Zapier & Make.com</span>
          </button>
        </div>

        {/* 1. Google Sheets Code */}
        {activeCodeTab === 'sheets' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <span>Auto-Sync to Google Sheets (Step-by-Step)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] pt-1 text-emerald-800">
                <li>Open a new spreadsheet in <strong>Google Sheets</strong>.</li>
                <li>Click <strong>Extensions &rarr; Apps Script</strong>.</li>
                <li>Paste the script below and click <strong>Save</strong>.</li>
                <li>Click <strong>Run &rarr; syncOrders()</strong> to pull all your table rows instantly into your spreadsheet!</li>
                <li>(Optional) Add a 5-minute Trigger in Apps Script to keep the spreadsheet synchronized 24/7!</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
{`function syncOrders() {
  const API_URL = "${baseUrl}/api/sync/orders?limit=100";
  const API_KEY = "${activeKeyToken}";

  const options = {
    method: "get",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(API_URL, options);
  const data = JSON.parse(response.getContentText());

  if (!data.success) {
    Logger.log("Sync Error: " + data.error);
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Set headers if first run
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Order ID", "Customer Name", "Mobile Number", "Delivery Address", "Status", "Date & Time", "Notes"]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // Clear existing data rows and replace with latest
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).clearContent();
  }

  // Populate orders
  const rows = data.submissions.map(order => [
    order.id,
    order.name,
    order.mobile,
    order.address,
    order.status,
    order.createdAtFormatted,
    order.notes || ""
  ]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }

  Logger.log("Successfully synced " + rows.length + " orders!");
}`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`function syncOrders() {\n  const API_URL = "${baseUrl}/api/sync/orders?limit=100";\n  const API_KEY = "${activeKeyToken}";\n\n  const options = {\n    method: "get",\n    headers: {\n      "Authorization": "Bearer " + API_KEY,\n      "Content-Type": "application/json"\n    },\n    muteHttpExceptions: true\n  };\n\n  const response = UrlFetchApp.fetch(API_URL, options);\n  const data = JSON.parse(response.getContentText());\n\n  if (!data.success) {\n    Logger.log("Sync Error: " + data.error);\n    return;\n  }\n\n  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();\n  \n  if (sheet.getLastRow() === 0) {\n    sheet.appendRow(["Order ID", "Customer Name", "Mobile Number", "Delivery Address", "Status", "Date & Time", "Notes"]);\n    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");\n  }\n\n  if (sheet.getLastRow() > 1) {\n    sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).clearContent();\n  }\n\n  const rows = data.submissions.map(order => [\n    order.id,\n    order.name,\n    order.mobile,\n    order.address,\n    order.status,\n    order.createdAtFormatted,\n    order.notes || ""\n  ]);\n\n  if (rows.length > 0) {\n    sheet.getRange(2, 1, rows.length, 7).setValues(rows);\n  }\n\n  Logger.log("Successfully synced " + rows.length + " orders!");\n}`);
                  alert('Google Apps Script copied to clipboard!');
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Script</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Python Code */}
        {activeCodeTab === 'python' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-600">
              Fetch orders into Python, convert to a Pandas DataFrame, or sync into your own PostgreSQL/MySQL database:
            </p>
            <div className="relative">
              <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
{`import requests
import pandas as pd

API_URL = "${baseUrl}/api/sync/orders"
API_KEY = "${activeKeyToken}"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# 1. Fetch latest orders
params = {
    "limit": 50,
    # Optional incremental sync: only fetch orders submitted after this timestamp:
    # "since": "2026-09-29T00:00:00.000Z"
}

response = requests.get(API_URL, headers=headers, params=params)
data = response.json()

if data.get("success"):
    orders = data.get("submissions", [])
    print(f"✅ Successfully synced {len(orders)} orders.")
    
    # 2. Convert to DataFrame or export to CSV
    df = pd.DataFrame(orders)
    print(df[["id", "name", "mobile", "status", "createdAtFormatted"]])
    
    # Save to CSV or upload to your warehouse
    df.to_csv("synced_orders.csv", index=False)
else:
    print("❌ Sync failed:", data.get("error"))
`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`import requests\nimport pandas as pd\n\nAPI_URL = "${baseUrl}/api/sync/orders"\nAPI_KEY = "${activeKeyToken}"\n\nheaders = {\n    "Authorization": f"Bearer {API_KEY}",\n    "Content-Type": "application/json"\n}\n\nparams = {\n    "limit": 50,\n}\n\nresponse = requests.get(API_URL, headers=headers, params=params)\ndata = response.json()\n\nif data.get("success"):\n    orders = data.get("submissions", [])\n    print(f"✅ Successfully synced {len(orders)} orders.")\n    df = pd.DataFrame(orders)\n    print(df[["id", "name", "mobile", "status", "createdAtFormatted"]])\n    df.to_csv("synced_orders.csv", index=False)\nelse:\n    print("❌ Sync failed:", data.get("error"))\n`);
                  alert('Python code copied to clipboard!');
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Python</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Node.js / JavaScript */}
        {activeCodeTab === 'node' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-600">
              Fetch orders using standard JavaScript / TypeScript in modern Node.js or browser frontend:
            </p>
            <div className="relative">
              <pre className="bg-slate-900 text-indigo-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
{`async function syncOrdersFromOrderFlow(lastSyncTime) {
  const endpoint = new URL('${baseUrl}/api/sync/orders');
  endpoint.searchParams.set('limit', '100');
  
  // Incremental sync: only download new orders since last sync
  if (lastSyncTime) {
    endpoint.searchParams.set('since', lastSyncTime);
  }

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ${activeKeyToken}',
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to sync orders');
  }

  console.log(\`Received \${data.count} new orders. Total available: \${data.totalAvailable}\`);
  
  // Iterate through synced records
  for (const order of data.submissions) {
    console.log(\`Order \${order.id} for \${order.name} - Status: \${order.status}\`);
    // Save to your local database / CRM here
  }

  return {
    submissions: data.submissions,
    newSyncTimestamp: data.lastSyncTimestamp
  };
}

// Execute
syncOrdersFromOrderFlow();
`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`async function syncOrdersFromOrderFlow(lastSyncTime) {\n  const endpoint = new URL('${baseUrl}/api/sync/orders');\n  endpoint.searchParams.set('limit', '100');\n  if (lastSyncTime) {\n    endpoint.searchParams.set('since', lastSyncTime);\n  }\n\n  const response = await fetch(endpoint.toString(), {\n    method: 'GET',\n    headers: {\n      'Authorization': 'Bearer ${activeKeyToken}',\n      'Content-Type': 'application/json'\n    }\n  });\n\n  const data = await response.json();\n  return data;\n}\n\nsyncOrdersFromOrderFlow();`);
                  alert('JavaScript code copied to clipboard!');
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JS</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. cURL Terminal */}
        {activeCodeTab === 'curl' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-600">
              Execute from any terminal, Cron job, or Bash script:
            </p>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-700 mb-1">1. Sync latest orders:</div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
{`curl -X GET "${baseUrl}/api/sync/orders?limit=25" \\
  -H "Authorization: Bearer ${activeKeyToken}" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-700 mb-1">2. Incremental Sync (New orders since timestamp):</div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
{`curl -X GET "${baseUrl}/api/sync/orders?since=2026-09-29T00:00:00.000Z" \\
  -H "Authorization: Bearer ${activeKeyToken}"`}
                </pre>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-700 mb-1">3. Create / Push an order via API:</div>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
{`curl -X POST "${baseUrl}/api/submissions" \\
  -H "Authorization: Bearer ${activeKeyToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "David Martinez",
    "mobile": "+1 555-882-9911",
    "address": "808 Pine Street, Seattle, WA 98101",
    "notes": "Submitted via API Key"
  }'`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 5. Zapier & Make.com */}
        {activeCodeTab === 'zapier' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <span>Connecting Zapier or Make.com</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                You can easily trigger notifications (Slack, Discord, Email, SMS) or add new rows into Airtable/Notion whenever orders arrive:
              </p>
              <div className="space-y-2 text-[11px] text-amber-900 pt-1">
                <div>
                  <strong>In Zapier:</strong> Choose the <strong>"Webhooks by Zapier"</strong> app &rarr; Select <strong>"Custom Request"</strong> (GET) &rarr; Set URL to <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">{baseUrl}/api/sync/orders</code>.
                </div>
                <div>
                  <strong>Headers:</strong> Add <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">Authorization: Bearer {activeKeyToken}</code>.
                </div>
                <div>
                  <strong>Schedule:</strong> Run every 5 or 15 minutes to poll for new orders!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
