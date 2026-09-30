import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar, type NavTabId } from './components/Sidebar.tsx';
import { StatsCards } from './components/StatsCards.tsx';
import { SubmissionsTable } from './components/SubmissionsTable.tsx';
import { OrderDetailModal } from './components/OrderDetailModal.tsx';
import { FormBuilderTab } from './components/FormBuilderTab.tsx';
import { LiveEmbedSimulator } from './components/LiveEmbedSimulator.tsx';
import { SetupInstructionsTab } from './components/SetupInstructionsTab.tsx';
import { ImportOrderModal } from './components/ImportOrderModal.tsx';
import { ApiKeysTab } from './components/ApiKeysTab.tsx';
import { DashboardOverviewTab } from './components/DashboardOverviewTab.tsx';
import { CustomersTab } from './components/CustomersTab.tsx';
import { AnalyticsTab } from './components/AnalyticsTab.tsx';
import { AutomationTab } from './components/AutomationTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { CommandPaletteModal } from './components/CommandPaletteModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { subscribeToOrders } from './firebase.ts';
import type { OrderSubmission, DashboardStats } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('submissions');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('orderflow_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Firestore Data State
  const [submissions, setSubmissions] = useState<OrderSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'id' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderSubmission | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    todayCount: 0,
    lastOrderId: null,
    statusBreakdown: {
      new: 0,
      contacted: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    },
  });

  const [publicUrl, setPublicUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });

  const [isOnline, setIsOnline] = useState(true);
  const pollTimerRef = useRef<any>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setIsCollapsed((prev) => {
          const next = !prev;
          try {
            localStorage.setItem('orderflow_sidebar_collapsed', String(next));
          } catch (_) {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Public host URL from backend
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const res = await fetch('/api/app-info');
        if (res.ok) {
          const data = await res.json();
          if (data.publicUrl) {
            setPublicUrl(data.publicUrl);
          }
        }
      } catch (err) {
        console.warn('Could not retrieve /api/app-info, falling back to window.location');
      }
    };
    fetchAppInfo();
  }, []);

  // Compute stats helper
  const computeStatsFromOrders = (orders: OrderSubmission[]) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let todayCount = 0;
    const breakdown: DashboardStats['statusBreakdown'] = {
      new: 0,
      contacted: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      if (new Date(o.createdAt).getTime() >= startOfDay) todayCount++;
      if (o.status in breakdown) breakdown[o.status]++;
    }
    return {
      total: orders.length,
      todayCount,
      lastOrderId: orders.length > 0 ? orders[0].id : null,
      statusBreakdown: breakdown,
    };
  };

  // Fetch stats from backend
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Fetch submissions from backend
  const fetchSubmissions = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        params.append('page', String(page));
        params.append('pageSize', String(pageSize));

        const res = await fetch(`/api/submissions?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setIsOnline(false);
      } finally {
        if (!isSilent) setLoading(false);
        setIsInitialLoading(false);
      }
    },
    [searchQuery, statusFilter, sortBy, sortOrder, page, pageSize]
  );

  // Sync any pending offline submissions from localStorage
  const syncPendingOfflineOrders = useCallback(async () => {
    try {
      const raw = localStorage.getItem('orderflow_offline_orders');
      if (!raw) return;
      const orders = JSON.parse(raw);
      if (!Array.isArray(orders) || orders.length === 0) return;

      for (const ord of orders) {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: ord.id,
            name: ord.name,
            mobile: ord.mobile,
            address: ord.address,
            notes: ord.notes || 'Submitted via standalone HTML form',
          }),
        });
      }

      localStorage.removeItem('orderflow_offline_orders');
      fetchSubmissions(true);
      fetchStats();
    } catch (e) {
      console.warn('Sync pending offline orders error:', e);
    }
  }, [fetchSubmissions, fetchStats]);

  // Check URL query params for 1-click import from downloaded HTML forms
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const importOrderParam = urlParams.get('import_order');
    if (importOrderParam) {
      try {
        const orderData = JSON.parse(importOrderParam);
        if (orderData && orderData.name && orderData.mobile && orderData.address) {
          fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: orderData.id,
              name: orderData.name,
              mobile: orderData.mobile,
              address: orderData.address,
              notes: orderData.notes || '1-Click Direct Import from HTML Form file',
            }),
          }).then(() => {
            fetchSubmissions(true);
            fetchStats();
            window.history.replaceState({}, document.title, window.location.pathname);
          });
        }
      } catch (e) {
        console.warn('Could not parse import_order param:', e);
      }
    }
  }, [fetchSubmissions, fetchStats]);

  // Direct Real-time Firestore Subscription & Initial Loading Lifecycle
  useEffect(() => {
    let isMounted = true;

    // 1. Subscribe to Firebase Firestore orders collection directly
    const unsubscribe = subscribeToOrders(
      (realtimeOrders) => {
        if (!isMounted) return;
        setSubmissions(realtimeOrders);
        setTotal(realtimeOrders.length);
        setTotalPages(Math.max(1, Math.ceil(realtimeOrders.length / pageSize)));
        setStats(computeStatsFromOrders(realtimeOrders));
        setIsOnline(true);
        setIsInitialLoading(false);
        setLoading(false);
      },
      (err) => {
        console.warn('[Firebase] Client direct sync fallback notice:', err.message);
      }
    );

    // 2. Hydrate from server API (which awaits Firestore readiness)
    fetchSubmissions();
    fetchStats();
    syncPendingOfflineOrders();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Listen to BroadcastChannel for real-time order updates from embedded forms
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('orderflow_channel');

    channel.onmessage = async (event) => {
      if (event.data && event.data.type === 'NEW_ORDER') {
        const ord = event.data.order;
        try {
          await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: ord.id,
              name: ord.name,
              mobile: ord.mobile,
              address: ord.address,
              notes: ord.notes,
            }),
          });
          fetchSubmissions(true);
          fetchStats();
        } catch (err) {
          console.error('Failed to save broadcast order to backend:', err);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [fetchSubmissions, fetchStats]);

  // Live auto-refresh polling (every 8 seconds when enabled)
  useEffect(() => {
    if (!autoRefresh) return;

    pollTimerRef.current = setInterval(() => {
      fetchSubmissions(true);
      fetchStats();
    }, 8000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [autoRefresh, fetchSubmissions, fetchStats]);

  // Handle status update
  const handleUpdateStatus = async (
    id: string,
    status: OrderSubmission['status'],
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.submission);
        // Optimistically update in state while Firestore sync confirms
        setSubmissions((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status, notes: notes !== undefined ? notes : o.notes } : o))
        );
        fetchStats();
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update order status');
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedOrder(null);
        setSubmissions((prev) => prev.filter((o) => o.id !== id));
        fetchSubmissions(true);
        fetchStats();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex">
      {/* Modern SaaS Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalSubmissions={stats.total}
        isOnline={isOnline}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Content Layout with Dynamic Responsive Padding */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-18' : 'md:pl-64'
        }`}
      >
        {/* Compact Structured Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          totalSubmissions={stats.total}
          publicUrl={publicUrl}
          isOnline={isOnline}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onManualRefresh={() => {
            fetchSubmissions();
            fetchStats();
          }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {/* Initial Loading State: prevents flashing empty state before Firestore loads */}
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-800 tracking-tight">
                Synchronizing with Firebase Firestore...
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Database: orderflow-hub
              </p>
            </div>
          ) : (
            <>
              {/* View 1: Dashboard Overview */}
              {activeTab === 'dashboard' && (
                <DashboardOverviewTab
                  stats={stats}
                  submissions={submissions}
                  setActiveTab={setActiveTab}
                  onSelectOrder={(order) => setSelectedOrder(order)}
                  publicUrl={publicUrl}
                />
              )}

              {/* View 2: Orders & Submissions Table */}
              {activeTab === 'submissions' && (
                <div className="space-y-6">
                  <StatsCards stats={stats} />
                  <SubmissionsTable
                    submissions={submissions}
                    total={total}
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    onRefresh={() => {
                      fetchSubmissions();
                      fetchStats();
                    }}
                    onSelectOrder={(order) => setSelectedOrder(order)}
                    onDeleteOrder={handleDeleteOrder}
                    autoRefresh={autoRefresh}
                    setAutoRefresh={setAutoRefresh}
                  />
                </div>
              )}

              {/* View 3: Customers Directory */}
              {activeTab === 'customers' && (
                <CustomersTab
                  submissions={submissions}
                  onSelectOrder={(order) => setSelectedOrder(order)}
                />
              )}

              {/* View 4: Form Builder & HTML Generator */}
              {activeTab === 'builder' && (
                <FormBuilderTab
                  publicBaseUrl={publicUrl}
                  onJumpToTester={() => setActiveTab('preview')}
                />
              )}

              {/* View 5: Live Embed Sandbox */}
              {activeTab === 'preview' && (
                <LiveEmbedSimulator
                  publicBaseUrl={publicUrl}
                  onOrderSubmitted={() => {
                    fetchSubmissions(true);
                    fetchStats();
                  }}
                  onGoToSubmissions={() => setActiveTab('submissions')}
                />
              )}

              {/* View 6: Analytics & Fulfillment */}
              {activeTab === 'analytics' && (
                <AnalyticsTab stats={stats} submissions={submissions} />
              )}

              {/* View 7: Automation & Webhook Triggers */}
              {activeTab === 'automation' && <AutomationTab publicUrl={publicUrl} />}

              {/* View 8: API Keys & External Integrations */}
              {activeTab === 'api' && <ApiKeysTab publicUrl={publicUrl} />}

              {/* View 9: Workspace Settings */}
              {activeTab === 'settings' && <SettingsTab publicUrl={publicUrl} />}

              {/* View 10: Setup & Architecture Documentation */}
              {activeTab === 'docs' && <SetupInstructionsTab publicUrl={publicUrl} />}
            </>
          )}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        submissions={submissions}
        publicUrl={publicUrl}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        submissions={submissions}
        onSelectOrder={(order) => setSelectedOrder(order)}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteOrder}
        />
      )}

      {/* Standalone Order Import / Sync Modal */}
      <ImportOrderModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onOrderImported={() => {
          fetchSubmissions(true);
          fetchStats();
        }}
      />
    </div>
  );
}
