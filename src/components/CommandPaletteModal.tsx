import React, { useState, useEffect } from 'react';
import {
  Search,
  Table,
  FileCode,
  PlayCircle,
  Key,
  BookOpen,
  LayoutDashboard,
  Users,
  BarChart3,
  Zap,
  Settings,
  X,
  ExternalLink,
  DownloadCloud,
  Copy,
  Check,
} from 'lucide-react';
import type { NavTabId } from './Sidebar.tsx';
import type { OrderSubmission } from '../types.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: NavTabId) => void;
  submissions: OrderSubmission[];
  publicUrl: string;
  onOpenImportModal: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  submissions,
  publicUrl,
  onOpenImportModal,
}) => {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or shortcut
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navActions: { id: NavTabId; label: string; group: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', group: 'Navigation', icon: LayoutDashboard },
    { id: 'submissions', label: 'Orders & Fulfillment', group: 'Navigation', icon: Table },
    { id: 'customers', label: 'Customers Directory', group: 'Navigation', icon: Users },
    { id: 'builder', label: 'Forms & Embed Generator', group: 'Navigation', icon: FileCode },
    { id: 'preview', label: 'Sandbox & Live Simulator', group: 'Navigation', icon: PlayCircle },
    { id: 'analytics', label: 'Analytics & Reports', group: 'Navigation', icon: BarChart3 },
    { id: 'automation', label: 'Automation & Webhooks', group: 'Navigation', icon: Zap },
    { id: 'api', label: 'Integrations & API Keys', group: 'Navigation', icon: Key },
    { id: 'settings', label: 'Settings & Workspace', group: 'Navigation', icon: Settings },
    { id: 'docs', label: 'Setup Documentation', group: 'Navigation', icon: BookOpen },
  ];

  const filteredNav = navActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredOrders = submissions
    .filter(
      (o) =>
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        o.mobile.includes(query)
    )
    .slice(0, 5);

  const copyHostUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, search orders, or jump to page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportModal();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Import / Sync Offline Order</span>
              </button>
              <button
                type="button"
                onClick={copyHostUrl}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">Copy Form Target URL</span>
                </div>
                {copied ? (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> Copied
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono truncate max-w-[180px]">
                    {publicUrl}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Jump to Page
              </div>
              <div className="space-y-0.5">
                {filteredNav.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(action.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      <span className="font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Orders */}
          {query.trim().length > 0 && filteredOrders.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Orders
              </div>
              <div className="space-y-0.5">
                {filteredOrders.map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setActiveTab('submissions');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {ord.id}
                      </span>
                      <span className="font-medium text-slate-900">{ord.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{ord.mobile}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Database:</span>
            <span className="font-mono text-slate-600 font-medium">orderflow-hub</span>
          </div>
          <span>Use ⌘K to open anytime</span>
        </div>
      </div>
    </div>
  );
};
