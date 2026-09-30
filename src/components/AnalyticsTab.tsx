import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import type { DashboardStats, OrderSubmission } from '../types.ts';

interface AnalyticsTabProps {
  stats: DashboardStats;
  submissions: OrderSubmission[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ stats, submissions }) => {
  const total = stats.total || 1;
  const completed = stats.statusBreakdown.completed || 0;
  const processing = stats.statusBreakdown.processing || 0;
  const newCount = stats.statusBreakdown.new || 0;
  const cancelled = stats.statusBreakdown.cancelled || 0;
  const contacted = stats.statusBreakdown.contacted || 0;

  const fulfillmentRate = Math.round((completed / total) * 100);
  const inProgressRate = Math.round(((processing + contacted + newCount) / total) * 100);

  const statuses = [
    { label: 'Completed', count: completed, color: 'bg-emerald-500', barBg: 'bg-emerald-100', text: 'text-emerald-700' },
    { label: 'Processing', count: processing, color: 'bg-indigo-500', barBg: 'bg-indigo-100', text: 'text-indigo-700' },
    { label: 'New Submissions', count: newCount, color: 'bg-blue-500', barBg: 'bg-blue-100', text: 'text-blue-700' },
    { label: 'Contacted', count: contacted, color: 'bg-amber-500', barBg: 'bg-amber-100', text: 'text-amber-700' },
    { label: 'Cancelled', count: cancelled, color: 'bg-rose-500', barBg: 'bg-rose-100', text: 'text-rose-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Performance & Fulfillment Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Live funnel conversion metrics, fulfillment velocity, and status distributions
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/70">
            <TrendingUp className="w-4 h-4" />
            <span>Fulfillment Rate: {fulfillmentRate}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Ingestion
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.total}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Orders processed via embed forms
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Fulfillment Completion
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {completed}
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            {fulfillmentRate}% verified & delivered
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active In Pipeline
          </span>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">
            {newCount + processing + contacted}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Pending fulfillment operations
          </p>
        </div>
      </div>

      {/* Status Breakdown Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Order Status Volume Distribution
        </h3>
        <div className="space-y-4">
          {statuses.map((s, idx) => {
            const pct = Math.round((s.count / total) * 100);
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{s.count} orders</span>
                    <span className="text-slate-400">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                    style={{ width: `${Math.max(pct, s.count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
