import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Calendar,
  Phone,
  User,
  MapPin,
  Clock,
  ExternalLink,
  Shield,
  Save,
  Trash2,
} from 'lucide-react';
import type { OrderSubmission } from '../types.ts';

interface OrderDetailModalProps {
  order: OrderSubmission | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderSubmission['status'], notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  if (!order) return null;

  const [status, setStatus] = useState<OrderSubmission['status']>(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(order.id, status, notes);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete order ${order.id}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(order.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg text-slate-900 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs">
              {order.id}
            </span>
            <button
              onClick={() => copyToClipboard(order.id, 'orderId')}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              title="Copy Order ID"
            >
              {copiedField === 'orderId' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Customer Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Customer Name
                </span>
                <button
                  onClick={() => copyToClipboard(order.name, 'name')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedField === 'name' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-base font-semibold text-slate-900">{order.name}</div>
            </div>

            {/* Mobile Number */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Number
                </span>
                <button
                  onClick={() => copyToClipboard(order.mobile, 'mobile')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedField === 'mobile' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${order.mobile}`}
                  className="text-base font-semibold text-blue-600 hover:underline"
                >
                  {order.mobile}
                </a>
              </div>
            </div>
          </div>

          {/* Full Multiline Address Box */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> Complete Delivery Address
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => copyToClipboard(order.address, 'address')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Copy Address"
                >
                  {copiedField === 'address' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs">
              {order.address}
            </div>
          </div>

          {/* Submission Timestamp & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Submitted At:</span>
                <span className="font-mono">{order.createdAtFormatted}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  ({new Date(order.createdAt).toISOString()})
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
              <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 block">Submission Source:</span>
                <span className="font-mono truncate block max-w-xs">{order.sourceUrl || 'Direct Embedded Form'}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">IP: {order.ip || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          {/* Status & Management Controls */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Order Management & Notes</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Fulfillment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderSubmission['status'])}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">🔵 New / Unprocessed</option>
                  <option value="contacted">🟡 Customer Contacted</option>
                  <option value="processing">🟠 Processing / Packaging</option>
                  <option value="completed">🟢 Completed & Delivered</option>
                  <option value="cancelled">🔴 Cancelled / Void</option>
                </select>
              </div>

              <div className="flex items-end justify-end space-x-2 pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Internal Staff Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this order, customer preferences, or delivery tracking..."
                rows={2}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Order</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
