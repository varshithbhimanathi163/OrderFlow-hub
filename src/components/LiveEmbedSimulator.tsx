import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { generateEmbedHtml, DEFAULT_FORM_CONFIG } from '../utils/formGenerator.ts';

interface LiveEmbedSimulatorProps {
  publicBaseUrl: string;
  onOrderSubmitted: () => void;
  onGoToSubmissions: () => void;
}

export const LiveEmbedSimulator: React.FC<LiveEmbedSimulatorProps> = ({
  publicBaseUrl,
  onOrderSubmitted,
  onGoToSubmissions,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const standaloneHtml = generateEmbedHtml(DEFAULT_FORM_CONFIG, publicBaseUrl);

  const fullSandboxHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>External Website Simulated Sandbox</title>
  <style>
    body {
      margin: 0;
      padding: 24px 16px;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    .mock-site-nav {
      width: 100%;
      max-width: 640px;
      margin-bottom: 20px;
      padding: 12px 20px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .mock-site-logo {
      font-weight: 700;
      font-size: 14px;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .mock-site-badge {
      font-size: 11px;
      color: #0284c7;
      background: #e0f2fe;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="mock-site-nav">
    <div class="mock-site-logo">
      <span>🌐 Third-Party Website Simulation</span>
    </div>
    <span class="mock-site-badge">Isolated iFrame Test</span>
  </div>

  ${standaloneHtml}

  <script>
    // Listen for successful fetch to notify parent app
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await origFetch.apply(this, args);
      const clone = response.clone();
      try {
        const data = await clone.json();
        if (data && data.success && data.orderId) {
          window.parent.postMessage({ type: 'ORDERFLOW_SUBMISSION_SUCCESS', orderId: data.orderId }, '*');
        }
      } catch(e) {}
      return response;
    };
  </script>
</body>
</html>`;

  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'ORDERFLOW_SUBMISSION_SUCCESS') {
        setLastSubmittedId(e.data.orderId);
        onOrderSubmitted();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onOrderSubmitted]);

  return (
    <div className="space-y-6">
      {/* Simulator Header / Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Live Embed Sandbox & Test Environment
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Isolated iFrame
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test the standalone HTML form right here. Any submission creates a real order in the backend database and shows up in your table immediately!
          </p>
        </div>

        {/* Viewport switch and reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                device === 'desktop'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>

            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                device === 'mobile'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIframeKey((k) => k + 1);
              setLastSubmittedId(null);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title="Reload sandbox"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert if an order was just submitted in the sandbox */}
      {lastSubmittedId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                Order Received! Order ID: <span className="font-mono">{lastSubmittedId}</span>
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Saved permanently in the database. Head to the Submissions Table to view it.
              </p>
            </div>
          </div>
          <button
            onClick={onGoToSubmissions}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <span>View in Submissions Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sandbox Frame Container */}
      <div className="flex justify-center bg-slate-100/90 rounded-2xl p-4 sm:p-8 border border-slate-200/80 min-h-[580px]">
        <div
          className={`transition-all duration-300 w-full ${
            device === 'mobile'
              ? 'max-w-[420px] bg-slate-800 p-3 rounded-[36px] shadow-2xl border-4 border-slate-700'
              : 'max-w-4xl bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden'
          }`}
        >
          {device === 'mobile' && (
            <div className="w-24 h-4 bg-slate-700 rounded-full mx-auto mb-2"></div>
          )}

          <iframe
            key={iframeKey}
            srcDoc={fullSandboxHtml}
            title="Embedded Form Sandbox"
            className={`w-full bg-slate-50 border-0 ${
              device === 'mobile'
                ? 'h-[640px] rounded-[24px]'
                : 'h-[680px] rounded-lg'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
