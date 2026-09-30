import React, { useState } from 'react';
import {
  Layers,
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileCode,
  PlayCircle,
  BarChart3,
  Zap,
  Key,
  Bell,
  Settings,
  BookOpen,
  HelpCircle,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Check,
  Database,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'submissions'
  | 'customers'
  | 'builder'
  | 'preview'
  | 'analytics'
  | 'automation'
  | 'api'
  | 'notifications'
  | 'settings'
  | 'docs';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  totalSubmissions: number;
  isOnline: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeType?: 'count' | 'accent';
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'submissions', label: 'Orders', icon: ShoppingBag, badgeType: 'count' },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'builder', label: 'Forms', icon: FileCode },
  { id: 'preview', label: 'Sandbox', icon: PlayCircle },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'api', label: 'Integrations', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3', badgeType: 'accent' },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'docs', label: 'Setup', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  totalSubmissions,
  isOnline,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  onCloseMobile,
  onOpenCommandPalette,
  onOpenNotifications,
}) => {
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('orderflow_sidebar_collapsed', String(next));
    } catch (_) {}
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    const handleClick = () => {
      if (item.id === 'notifications') {
        onOpenNotifications();
        onCloseMobile();
        return;
      }
      setActiveTab(item.id);
      onCloseMobile();
    };

    return (
      <div key={item.id} className="relative group">
        <button
          type="button"
          onClick={handleClick}
          className={`w-full flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer relative ${
            isCollapsed
              ? 'justify-center p-2.5 my-1'
              : 'gap-3 px-3 py-2 my-0.5 justify-between'
          } ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          {/* Active Accent Bar on left */}
          {isActive && (
            <span
              className={`absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full ${
                isCollapsed ? 'block' : 'block'
              }`}
            />
          )}

          <div className="flex items-center gap-3 min-w-0">
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'
              }`}
            />
            {!isCollapsed && (
              <span className="truncate tracking-tight">{item.label}</span>
            )}
          </div>

          {/* Badge when expanded */}
          {!isCollapsed && (
            <>
              {item.id === 'submissions' ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-blue-200/70 text-blue-800'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {totalSubmissions}
                </span>
              ) : item.badge ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                    item.badgeType === 'accent'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </>
          )}
        </button>

        {/* Tooltip for Collapsed State */}
        {isCollapsed && (
          <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5">
              <span>{item.label}</span>
              {item.id === 'submissions' && (
                <span className="bg-slate-700 text-blue-300 px-1 rounded text-[10px]">
                  {totalSubmissions}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/90 flex flex-col transition-[width] duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
        } ${isCollapsed ? 'w-18' : 'w-64'}`}
      >
        {/* Top Header: Branding + Collapse Toggle */}
        <div className="h-14 px-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs shadow-blue-500/20 shrink-0">
              <Layers className="w-4 h-4" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">
                    OrderFlow
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    PRO
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)'}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher */}
        {!isCollapsed ? (
          <div className="px-3 pt-3 pb-1 relative">
            <button
              type="button"
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                  OF
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate leading-none">
                    OrderFlow Production
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">
                    orderflow-hub
                  </p>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Workspace Dropdown */}
            {isWorkspaceDropdownOpen && (
              <div className="absolute left-3 right-3 top-12 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Workspaces
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>OrderFlow Production</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors mt-0.5">
                  Staging Sandbox
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2 flex justify-center">
            <div
              title="Workspace: orderflow-hub"
              className="w-8 h-8 rounded-lg bg-slate-100 text-blue-700 flex items-center justify-center text-[11px] font-bold"
            >
              OF
            </div>
          </div>
        )}

        {/* Global Command Search Quick Bar */}
        <div className={`px-3 py-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className={`flex items-center rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/70 text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer ${
              isCollapsed ? 'p-2 justify-center' : 'w-full justify-between px-3 py-1.5'
            }`}
            title="Search commands or jump (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              {!isCollapsed && <span className="text-slate-500">Search...</span>}
            </div>
            {!isCollapsed && (
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 no-scrollbar">
          {/* Main Items */}
          <div>
            {!isCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Platform
              </div>
            )}
            <div className="space-y-0.5">
              {mainNavItems.map(renderNavItem)}
            </div>
          </div>

          {/* Secondary Items */}
          <div>
            {!isCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                System & Tools
              </div>
            )}
            <div className="space-y-0.5">
              {secondaryNavItems.map(renderNavItem)}
            </div>
          </div>
        </div>

        {/* Bottom Section: Database Info & Compact User Profile */}
        <div className="p-2 border-t border-slate-100 bg-slate-50/60 shrink-0 space-y-1 relative">
          {/* Compact Database Indicator */}
          {!isCollapsed ? (
            <div className="px-2 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 truncate">
                <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-slate-700 font-semibold truncate">
                  orderflow-hub
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
          ) : (
            <div
              className="flex justify-center py-1 group relative cursor-pointer"
              title="Firestore Database: orderflow-hub (Connected)"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2 py-1 bg-slate-900 text-white text-[10px] font-mono rounded shadow z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Firestore: orderflow-hub
              </div>
            </div>
          )}

          {/* Compact User Profile Button */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center rounded-xl p-1.5 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center' : 'gap-2.5 justify-between'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200/60">
                VB
              </div>
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      Varshith B.
                    </span>
                    <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    varshithbhimanathi163@gmail.com
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>

          {/* User Popover Menu */}
          {isUserMenuOpen && (
            <div
              className={`absolute bottom-14 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100 ${
                isCollapsed ? 'left-16 w-56' : 'left-2 right-2'
              }`}
            >
              <div className="px-2 py-1 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">Varshith Bhimanathi</p>
                <p className="text-[11px] text-slate-500 truncate">
                  varshithbhimanathi163@gmail.com
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('docs');
                  setIsUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Help & Documentation</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
