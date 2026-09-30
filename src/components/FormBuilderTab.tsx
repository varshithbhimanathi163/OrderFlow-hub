import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Code2,
  Palette,
  Sliders,
  Eye,
  FileCode2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import type { FormConfig } from '../types.ts';
import { DEFAULT_FORM_CONFIG, generateEmbedHtml } from '../utils/formGenerator.ts';

interface FormBuilderTabProps {
  publicBaseUrl: string;
  onJumpToTester: () => void;
}

const COLOR_PRESETS = [
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Sunset Amber', hex: '#d97706' },
  { name: 'Crimson', hex: '#e11d48' },
  { name: 'Dark Slate', hex: '#0f172a' },
];

export const FormBuilderTab: React.FC<FormBuilderTabProps> = ({
  publicBaseUrl,
  onJumpToTester,
}) => {
  const [config, setConfig] = useState<FormConfig>({
    ...DEFAULT_FORM_CONFIG,
    apiUrl: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/api/submissions` : '',
  });

  const [generatedHtml, setGeneratedHtml] = useState<string>(() =>
    generateEmbedHtml({ ...DEFAULT_FORM_CONFIG, apiUrl: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/api/submissions` : '' }, publicBaseUrl)
  );

  const [copied, setCopied] = useState(false);
  const [isGeneratedFresh, setIsGeneratedFresh] = useState(false);

  const effectiveApiUrl = config.apiUrl || `${publicBaseUrl.replace(/\/$/, '')}/api/submissions`;

  const handleGenerate = () => {
    const html = generateEmbedHtml(config, publicBaseUrl);
    setGeneratedHtml(html);
    setIsGeneratedFresh(true);
    setTimeout(() => setIsGeneratedFresh(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const freshHtml = generateEmbedHtml(config, publicBaseUrl);
    const fullHtmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
</head>
<body style="margin: 0; padding: 2rem 1rem; background-color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
${freshHtml}
</body>
</html>`;

    const blob = new Blob([fullHtmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'order-form.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Re-generate if base URL changes
  React.useEffect(() => {
    setGeneratedHtml(generateEmbedHtml(config, publicBaseUrl));
  }, [publicBaseUrl]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-xs border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" /> Standalone HTML Generator
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Embeddable Order Form Builder
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Customize your customer submission form with required fields for{' '}
            <strong className="text-white">Name</strong>, <strong className="text-white">Mobile Number</strong>, and{' '}
            <strong className="text-white">Address</strong>. Click <strong className="text-white">Generate HTML Code</strong> to copy a 100% self-contained snippet ready to paste on any website!
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Main Builder Grid: Left Settings / Right Code View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Customization (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Form Configuration</span>
            </h3>
            <span className="text-xs text-slate-400">3 Required Fields</span>
          </div>

          {/* Form Fields Summary Pill */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">Core Form Fields (Included):</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200">
                <Check className="w-3 h-3 text-emerald-600" /> Name (Text, Required)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200">
                <Check className="w-3 h-3 text-emerald-600" /> Mobile (Phone, Required)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200">
                <Check className="w-3 h-3 text-emerald-600" /> Address (Multiline, Required)
              </span>
            </div>
          </div>

          {/* Form Title & Subtitle */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Form Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Customer Order Submission"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Form Subtitle / Instructions
              </label>
              <input
                type="text"
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Please enter your details below..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Submit Button Label
              </label>
              <input
                type="text"
                value={config.buttonText}
                onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Submit Order"
              />
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Primary Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setConfig({ ...config, accentColor: color.hex })}
                  style={{ backgroundColor: color.hex }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative ${
                    config.accentColor === color.hex
                      ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 shadow-xs'
                      : 'hover:scale-105'
                  }`}
                  title={color.name}
                >
                  {config.accentColor === color.hex && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0"
                />
                <span className="text-xs font-mono text-slate-500">{config.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Target Backend API URL & Presets */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Submission Target API URL
              </label>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                CORS Enabled
              </span>
            </div>

            <div className="text-[11px] text-slate-500 leading-normal">
              Choose where your external HTML form sends customer orders:
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setConfig({ ...config, apiUrl: `${publicBaseUrl.replace(/\/$/, '')}/api/submissions` })}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                  (config.apiUrl || effectiveApiUrl) === `${publicBaseUrl.replace(/\/$/, '')}/api/submissions` && !(config.apiUrl || '').includes('vercel.app')
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-semibold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] truncate flex items-center justify-between">
                  <span>☁️ Live Host</span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded">Default</span>
                </div>
                <div className="text-[10px] text-slate-400">Direct Dashboard Sync</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const current = config.apiUrl || '';
                  if (current.includes('vercel.app')) {
                    setConfig({ ...config, apiUrl: current });
                  } else {
                    const promptVal = prompt(
                      'Enter your Vercel App Domain (e.g. your-project.vercel.app):'
                    );
                    if (promptVal) {
                      const clean = promptVal.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
                      setConfig({ ...config, apiUrl: `https://${clean}/api/submissions` });
                    }
                  }
                }}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                  (config.apiUrl || '').includes('vercel.app')
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] text-emerald-700 truncate">▲ Vercel URL</div>
                <div className="text-[10px] text-slate-400">For Custom Domains</div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, apiUrl: 'http://localhost:3000/api/submissions' })}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                  (config.apiUrl || effectiveApiUrl) === 'http://localhost:3000/api/submissions'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 font-semibold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] truncate">🖥️ Localhost</div>
                <div className="text-[10px] text-slate-400">PC testing only</div>
              </button>
            </div>

            {/* Warning if localhost is selected */}
            {(config.apiUrl || effectiveApiUrl).includes('localhost') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-[11px]">Important for Odoo / Live Websites:</div>
                  <div className="text-[11px] leading-relaxed text-amber-800">
                    You have <code className="bg-white/80 px-1 py-0.5 rounded font-mono border border-amber-300">localhost:3000</code> selected. Localhost only works on your personal computer. Live HTTPS websites (like your Odoo site) cannot connect to localhost.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const promptVal = prompt('Enter your Vercel App Domain (e.g. your-project.vercel.app):');
                      if (promptVal) {
                        const clean = promptVal.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
                        setConfig({ ...config, apiUrl: `https://${clean}/api/submissions` });
                      }
                    }}
                    className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 mt-1 cursor-pointer block"
                  >
                    &rarr; Switch to Vercel HTTPS URL for Odoo
                  </button>
                </div>
              </div>
            )}

            {/* Custom Input & Test Connection Button */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={config.apiUrl || effectiveApiUrl}
                  onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                  placeholder="https://your-app.vercel.app/api/submissions"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const testUrl = config.apiUrl || effectiveApiUrl;
                    try {
                      const res = await fetch(testUrl, { method: 'OPTIONS' });
                      if (res.ok || res.status === 204) {
                        alert(`✅ Connection Successful!\n\nTarget URL: ${testUrl}\nThe endpoint is online and responding with valid CORS headers.`);
                      } else {
                        alert(`⚠️ Endpoint responded with status: ${res.status}\nURL: ${testUrl}`);
                      }
                    } catch (e: any) {
                      alert(`❌ Connection Error (Failed to fetch)\n\nCould not reach: ${testUrl}\n\nTroubleshooting tips:\n1. If testing index.html locally on PC, choose "Localhost (Port 3000)".\n2. If embedding in Odoo, Shopify, or WordPress, click "Vercel URL" and enter your public https://*.vercel.app domain.`);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  title="Test if this endpoint is reachable from your browser"
                >
                  Ping Test
                </button>
              </div>
            </div>
          </div>

          {/* Big Action: Generate HTML Code */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate HTML Code</span>
            </button>
            {isGeneratedFresh && (
              <p className="text-xs text-center text-emerald-600 font-semibold mt-2 animate-bounce">
                HTML Code updated and regenerated!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            {/* Code Header Bar */}
            <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs font-mono text-slate-400 pl-2">
                  order-form-embed.html
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                  {generatedHtml.split('\n').length} lines &bull; {(generatedHtml.length / 1024).toFixed(1)} KB
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Download as ready-to-use HTML file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .html</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body Textarea */}
            <div className="relative">
              <textarea
                readOnly
                value={generatedHtml}
                rows={18}
                className="w-full bg-slate-900 text-blue-200/90 font-mono text-xs sm:text-[13px] leading-relaxed p-4 sm:p-5 outline-none resize-none selection:bg-blue-600 selection:text-white border-0"
                spellCheck={false}
              />
            </div>

            {/* Code Footer / Callouts */}
            <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Zero external dependencies. Pure responsive HTML + CSS + JS.
              </span>
              <button
                type="button"
                onClick={onJumpToTester}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Test code in live sandbox</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick 3-Step Embedding Guide */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>How to use this code on any website:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-800 mb-1">1. Copy Code</div>
                <p className="text-slate-600">
                  Click the blue <strong className="text-slate-800">Copy Code</strong> button above to copy the snippet to your clipboard.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-800 mb-1">2. Paste Into Webpage</div>
                <p className="text-slate-600">
                  Paste it into any HTML file, WordPress Custom HTML block, Webflow, Shopify Liquid, or Wix Embed.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-800 mb-1">3. Instant Orders</div>
                <p className="text-slate-600">
                  Customers submit and receive a unique Order ID. All records appear immediately in your Submissions Table!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
