import React from 'react';
import { Bell, CheckCircle2, Clock, Key, ShieldCheck, X, ShoppingBag } from 'lucide-react';
import type { OrderSubmission } from '../types.ts';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: OrderSubmission[];
  onSelectOrder: (order: OrderSubmission) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  submissions,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  const recentOrders = submissions.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/30 backdrop-blur-xs">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">Notifications</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">
              {recentOrders.length + 2}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification list */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {/* Firestore connected event */}
          <div className="p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900">
                  Firestore Connected
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Database <span className="font-mono text-slate-700">orderflow-hub</span> active & ready.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Live</span>
              </div>
            </div>
          </div>

          {/* Sync Key active */}
          <div className="p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900">
                  API Token Ready
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  External sync endpoint available for Zapier and webhooks.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">System</span>
              </div>
            </div>
          </div>

          {/* Recent Orders notifications */}
          {recentOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => {
                onSelectOrder(ord);
                onClose();
              }}
              className="p-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">
                      New Order Received
                    </p>
                    <span className="text-[10px] font-mono text-blue-700 font-semibold">
                      {ord.id.split('-').pop()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {ord.name} • {ord.mobile}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {ord.createdAtFormatted || 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-400">All notifications synced from Firebase</span>
        </div>
      </div>
    </div>
  );
};
