import React from 'react';
import {
  Layers,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Table,
  PlayCircle,
  BookOpen,
  ExternalLink,
  DownloadCloud,
  Key,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'submissions' | 'builder' | 'preview' | 'docs' | 'api';
  setActiveTab: (tab: 'submissions' | 'builder' | 'preview' | 'docs' | 'api') => void;
  totalSubmissions: number;
  publicUrl: string;
  isOnline: boolean;
  onOpenImportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalSubmissions,
  publicUrl,
  isOnline,
  onOpenImportModal,
}) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">OrderFlow</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  Form Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {isOnline ? 'API Ready' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Embeddable Customer Order Form Generator & Central Management Hub
              </p>
            </div>
          </div>

          {/* Quick Endpoint Info Badge & Sync Action */}
          <div className="flex items-center gap-2 text-xs">
            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Sync or import an order from standalone HTML"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Import / Sync Order</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 font-mono">
              <span className="text-slate-400">Target Endpoint:</span>
              <span className="text-blue-700 font-medium truncate max-w-xs">{publicUrl || 'Detecting...'}</span>
              <button
                onClick={copyUrl}
                title="Copy Base URL"
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-100 pt-1 -mb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'submissions'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Submissions Table</span>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === 'submissions'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {totalSubmissions}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'builder'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Form Builder & HTML</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Live Embed Tester</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'api'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-600" />
            <span>API Keys & Sync</span>
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Setup & Architecture Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
