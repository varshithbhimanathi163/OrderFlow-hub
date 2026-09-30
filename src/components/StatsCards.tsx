import React from 'react';
import { Package, Clock, Hash, CheckCircle2, TrendingUp, Copy, Check } from 'lucide-react';
import type { DashboardStats } from '../types.ts';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const [copiedId, setCopiedId] = React.useState(false);

  const copyLatestId = () => {
    if (!stats.lastOrderId) return;
    navigator.clipboard.writeText(stats.lastOrderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Submissions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Submissions
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">records in database</span>
        </div>
        <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          Permanent storage active
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
      </div>

      {/* 2. Today's Submissions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Today's Orders
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats.todayCount}
          </span>
          <span className="text-xs text-slate-500">since midnight</span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Auto-generating sequential daily IDs
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>
      </div>

      {/* 3. Latest Order ID */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Latest Order ID
          </span>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1">
          <span className="text-base sm:text-lg font-mono font-bold text-indigo-950 truncate">
            {stats.lastOrderId || 'No orders yet'}
          </span>
          {stats.lastOrderId && (
            <button
              onClick={copyLatestId}
              title="Copy Order ID"
              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
        <div className="mt-3 text-xs text-slate-500 font-mono">
          Format: ORD-YYYYMMDD-000001
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
      </div>

      {/* 4. Processing Status */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pipeline Status
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {stats.statusBreakdown?.new || 0} New
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
            {stats.statusBreakdown?.processing || 0} In Progress
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            {stats.statusBreakdown?.completed || 0} Done
          </span>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Instant updates upon submission
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
      </div>
    </div>
  );
};
