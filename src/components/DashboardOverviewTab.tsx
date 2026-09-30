import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileCode,
  ArrowRight,
  TrendingUp,
  DownloadCloud,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { DashboardStats, OrderSubmission } from '../types.ts';
import type { NavTabId } from './Sidebar.tsx';

interface DashboardOverviewProps {
  stats: DashboardStats;
  submissions: OrderSubmission[];
  setActiveTab: (tab: NavTabId) => void;
  onSelectOrder: (order: OrderSubmission) => void;
  publicUrl: string;
}

export const DashboardOverviewTab: React.FC<DashboardOverviewProps> = ({
  stats,
  submissions,
  setActiveTab,
  onSelectOrder,
  publicUrl,
}) => {
  const recentOrders = submissions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider">
              <span>OrderFlow Pro Engine</span>
              <span>•</span>
              <span>Firestore: orderflow-hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              Store Operations Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
              Centralized order fulfillment, embedded form generator, and realtime customer sync hub.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <FileCode className="w-4 h-4" />
              <span>Get Embed Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('submissions')}
              className="px-4 py-2 bg-blue-600/70 hover:bg-blue-600 text-white border border-blue-400/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Manage Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('submissions')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.total}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Live Firestore sync
          </span>
        </div>

        <div
          onClick={() => setActiveTab('submissions')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Orders</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.todayCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Past 24 hours</span>
        </div>

        <div
          onClick={() => setActiveTab('submissions')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fulfilled</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats.statusBreakdown.completed}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Completed deliveries</span>
        </div>

        <div
          onClick={() => setActiveTab('customers')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">New Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
            {stats.statusBreakdown.new + stats.statusBreakdown.processing}
          </div>
          <span className="text-[11px] text-blue-600 mt-1 block">Requires fulfillment</span>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Submissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Directly captured through embedded website forms</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No orders received yet. Use the Live Sandbox to test form submissions.
            </div>
          ) : (
            recentOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => onSelectOrder(ord)}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                    {ord.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs truncate">
                        {ord.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {ord.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {ord.mobile} • {ord.address.replace(/\n/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      ord.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : ord.status === 'processing'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : ord.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}
                  >
                    {ord.status}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {ord.createdAtFormatted?.split(',')[0]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
