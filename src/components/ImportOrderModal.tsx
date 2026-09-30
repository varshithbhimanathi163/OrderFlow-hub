import React, { useState } from 'react';
import { DownloadCloud, Check, X, AlertCircle, Clipboard, ArrowRight } from 'lucide-react';

interface ImportOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderImported: () => void;
}

export const ImportOrderModal: React.FC<ImportOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderImported,
}) => {
  const [syncCode, setSyncCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setSyncCode(text.trim());
        setError(null);
      }
    } catch {
      setError('Clipboard access denied. Please manually paste into the field below.');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const code = syncCode.trim();
    if (!code) {
      setError('Please paste a sync code or order JSON payload.');
      return;
    }

    try {
      setLoading(true);
      let payload: any;

      if (code.startsWith('{')) {
        try {
          payload = JSON.parse(code);
        } catch {
          throw new Error('Invalid JSON format. Please paste the exact sync code copied from the form.');
        }
      } else {
        // If user pasted just an Order ID or raw text
        const orderIdMatch = code.match(/ORD-\d{8}-\d{6}/i);
        if (orderIdMatch) {
          const orderId = orderIdMatch[0].toUpperCase();
          payload = {
            id: orderId,
            name: 'Customer (Standalone Form)',
            mobile: '+1 555-0199',
            address: 'Order placed via downloaded order-form.html',
            notes: `Imported standalone order (${orderId})`,
          };
        } else {
          throw new Error('Could not parse order data. Please paste the complete sync JSON or valid Order ID (e.g. ORD-20260930-XXXXXX).');
        }
      }

      if (!payload.name || !payload.mobile || !payload.address) {
        throw new Error('Payload is missing required fields (name, mobile, address).');
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payload.id, // Preserve exact order ID
          name: payload.name,
          mobile: payload.mobile,
          address: payload.address,
          notes: payload.notes || 'Imported from standalone HTML form',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`Order imported successfully! Assigned ID: ${data.orderId}`);
        setSyncCode('');
        onOrderImported();
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1800);
      } else {
        setError(data.error || 'Failed to import order.');
      }
    } catch (err: any) {
      setError(err.message || 'Error parsing and saving order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import / Sync Standalone Order</h3>
              <p className="text-[11px] text-slate-500">Sync orders submitted from downloaded HTML files</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleImport} className="p-6 space-y-4">
          <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/60 border border-blue-100 rounded-xl p-3 space-y-1">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5">
              <span>💡 How to Sync Orders from Local Files</span>
            </div>
            <p className="text-[11px] text-blue-800">
              When testing <code>order-form.html</code> on your local computer, click <strong>"Copy Dashboard Sync Code"</strong> on the form's success screen, then paste it here to record the order in the database.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Order Sync Code (JSON Payload)
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste from Clipboard</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value)}
              placeholder='{"name": "Jane Doe", "mobile": "+1 555-0192", "address": "123 Elm St..."}'
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-xs text-emerald-800 font-semibold">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !syncCode.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>Importing...</span>
              ) : (
                <>
                  <span>Save Order to Database</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
