import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { StatsCards } from './components/StatsCards.tsx';
import { SubmissionsTable } from './components/SubmissionsTable.tsx';
import { OrderDetailModal } from './components/OrderDetailModal.tsx';
import { FormBuilderTab } from './components/FormBuilderTab.tsx';
import { LiveEmbedSimulator } from './components/LiveEmbedSimulator.tsx';
import { SetupInstructionsTab } from './components/SetupInstructionsTab.tsx';
import { ImportOrderModal } from './components/ImportOrderModal.tsx';
import { ApiKeysTab } from './components/ApiKeysTab.tsx';
import type { OrderSubmission, DashboardStats } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'builder' | 'preview' | 'docs' | 'api'>('submissions');
  const [submissions, setSubmissions] = useState<OrderSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
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
    return 'http://localhost:3000';
  });

  const [isOnline, setIsOnline] = useState(true);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch App info and public target URL
  const fetchAppInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/app-info');
      if (res.ok) {
        const data = await res.json();
        if (data.publicUrl) {
          setPublicUrl(data.publicUrl);
        }
        setIsOnline(true);
      }
    } catch (err) {
      console.warn('Could not fetch app info:', err);
    }
  }, []);

  // Fetch stats summary
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          setIsOnline(true);
        }
      }
    } catch (err) {
      console.warn('Could not fetch stats:', err);
      setIsOnline(false);
    }
  }, []);

  // Fetch Submissions Table
  const fetchSubmissions = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`/api/submissions?${queryParams.toString()}`);
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
    }
  }, [searchQuery, statusFilter, sortBy, sortOrder, page, pageSize]);

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
              notes: orderData.notes || 'Synced from downloaded HTML form',
            }),
          }).then((res) => {
            if (res.ok) {
              fetchSubmissions(true);
              fetchStats();
              setActiveTab('submissions');
              // Clean the URL without reloading
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, '', cleanUrl);
            }
          });
        }
      } catch (e) {
        console.error('Failed to auto-import order from URL param:', e);
      }
    }
  }, [fetchSubmissions, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchAppInfo();
    fetchStats();
    fetchSubmissions();
    syncPendingOfflineOrders();
  }, [fetchAppInfo, fetchStats, fetchSubmissions, syncPendingOfflineOrders]);

  // BroadcastChannel listener for instant cross-tab / standalone form sync
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('orderflow_orders_channel');

    channel.onmessage = async (event) => {
      if (event.data?.type === 'SYNC_OFFLINE_ORDER' && event.data.order) {
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
        fetchSubmissions(true);
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
        fetchSubmissions();
        fetchStats();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalSubmissions={stats.total}
        publicUrl={publicUrl}
        isOnline={isOnline}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Submissions Table (Admin Dashboard) */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <StatsCards stats={stats} />

            {/* Submissions Data Table */}
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

        {/* Tab 2: Form Builder & HTML Generator */}
        {activeTab === 'builder' && (
          <FormBuilderTab
            publicBaseUrl={publicUrl}
            onJumpToTester={() => setActiveTab('preview')}
          />
        )}

        {/* Tab 3: Live Embed Sandbox */}
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

        {/* Tab 4: Setup & Architecture Documentation */}
        {activeTab === 'docs' && <SetupInstructionsTab publicUrl={publicUrl} />}

        {/* Tab 5: API Keys & External Sync Engine */}
        {activeTab === 'api' && <ApiKeysTab publicUrl={publicUrl} />}
      </main>

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
