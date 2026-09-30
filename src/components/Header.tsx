import React, { useState } from 'react';
import {
  Menu,
  Copy,
  Check,
  DownloadCloud,
  Database,
  RefreshCw,
  Search,
  Bell,
  HelpCircle,
} from 'lucide-react';
import type { NavTabId } from './Sidebar.tsx';

interface HeaderProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  totalSubmissions: number;
  publicUrl: string;
  isOnline: boolean;
  onOpenImportModal?: () => void;
  onOpenMobileNav?: () => void;
  onManualRefresh?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenNotifications?: () => void;
}

const tabMeta: Record<NavTabId, { category: string; title: string; subtitle: string }> = {
  dashboard: {
    category: 'Platform',
    title: 'Dashboard Overview',
    subtitle: 'High-level store performance, ingestion volume, and quick actions',
  },
  submissions: {
    category: 'Platform',
    title: 'Customer Orders',
    subtitle: 'Manage, fulfill, and update orders submitted via embedded HTML forms',
  },
  customers: {
    category: 'Platform',
    title: 'Customer Directory',
    subtitle: 'Aggregated contact records and order history captured through embed forms',
  },
  builder: {
    category: 'Platform',
    title: 'Embeddable Forms',
    subtitle: 'Customize HTML/CSS order forms with instant copy & download generator',
  },
  preview: {
    category: 'Platform',
    title: 'Live Embed Sandbox',
    subtitle: 'Test form submissions in a real-time iframe sandbox with direct API dispatch',
  },
  analytics: {
    category: 'Platform',
    title: 'Analytics & Fulfillment',
    subtitle: 'Conversion metrics, delivery velocity, and status distributions',
  },
  automation: {
    category: 'System',
    title: 'Automation & Webhooks',
    subtitle: 'Configure outbound webhook payloads and Zapier event triggers',
  },
  api: {
    category: 'System',
    title: 'Integrations & API Keys',
    subtitle: 'Manage authentication tokens for Zapier, external CRMs, and webhooks',
  },
  notifications: {
    category: 'System',
    title: 'Activity Notifications',
    subtitle: 'Real-time order submission alerts and sync event logs',
  },
  settings: {
    category: 'System',
    title: 'Workspace Settings',
    subtitle: 'Workspace preferences, database status, and embed defaults',
  },
  docs: {
    category: 'System',
    title: 'Embed & Setup Guide',
    subtitle: 'Detailed developer specifications for embedding forms and syncing',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  totalSubmissions,
  publicUrl,
  isOnline,
  onOpenImportModal,
  onOpenMobileNav,
  onManualRefresh,
  onOpenCommandPalette,
  onOpenNotifications,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const currentMeta = tabMeta[activeTab] || tabMeta.submissions;

  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs h-14">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Nav Toggle & Breadcrumb / Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              {currentMeta.category}
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 truncate">
              {currentMeta.title}
            </h1>
          </div>
        </div>

        {/* Right: Quick Search, Database Pill, Copy URL, & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Search Trigger in Header */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-white border border-slate-200 text-slate-400">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Database Live Status */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono text-slate-800 font-medium">orderflow-hub</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>

          {/* Target Host URL Copy */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-600">
            <span className="text-slate-400 font-sans hidden 2xl:inline">Host:</span>
            <span className="text-blue-700 font-medium truncate max-w-[130px] lg:max-w-[170px]">
              {publicUrl.replace(/^https?:\/\//, '')}
            </span>
            <button
              type="button"
              onClick={copyUrl}
              title="Copy public host URL for embedded forms"
              className="p-0.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Refresh Action */}
          {onManualRefresh && (
            <button
              type="button"
              onClick={onManualRefresh}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Refresh submissions from Firestore"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Notifications Trigger */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer relative"
              title="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
            </button>
          )}

          {/* Import / Sync Order CTA Button */}
          {onOpenImportModal && (
            <button
              type="button"
              onClick={onOpenImportModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Import or sync orders from standalone HTML"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import Order</span>
              <span className="sm:hidden">Import</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
