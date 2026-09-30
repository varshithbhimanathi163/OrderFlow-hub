import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Server,
  Database,
  Globe,
  Shield,
  Layers,
  Terminal,
  Code,
  CheckCircle2,
} from 'lucide-react';

interface SetupInstructionsTabProps {
  publicUrl: string;
}

export const SetupInstructionsTab: React.FC<SetupInstructionsTabProps> = ({ publicUrl }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlExample = `curl -X POST "${publicUrl || 'http://localhost:3000'}/api/submissions" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "mobile": "+1 555-019-2834",
    "address": "456 Oak Street, Suite 300, Denver, CO 80202"
  }'`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              System Architecture & Deployment Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Complete technical specification, database configuration, and third-party embedding guides.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Architecture Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>1. Architecture & Component Separation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-900 mb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Public Embed Form</span>
            </div>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              Standalone, dependency-free HTML + CSS + JS snippet. Pasted onto third-party sites (WordPress, Shopify, etc.). Submits via AJAX/fetch directly to backend API.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-900 mb-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Backend REST API</span>
            </div>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Express.js server with full CORS enabled. Handles input validation, HTML sanitization, sequential Order ID calculation, and query pagination.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 mb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Layer</span>
            </div>
            <p className="text-xs text-emerald-800/80 leading-relaxed">
              Permanent JSON store with atomic file renaming (`.tmp` write + rename) and in-memory queue to guarantee zero lost writes or overlapping order IDs.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Files & Code Organization */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span>2. Project File Structure</span>
        </h3>
        <p className="text-xs text-slate-600">
          Where each piece of the application lives:
        </p>

        <div className="bg-slate-900 rounded-xl p-4 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{`├── server.ts                    # Express entry point (APIs, CORS, Vite middlewares)
├── server/
│   └── db.ts                    # Database persistence & sequential Order ID engine
├── data/
│   └── orders.json              # Permanent database file (atomic writes)
├── src/
│   ├── types.ts                 # TypeScript interfaces (OrderSubmission, FormConfig)
│   ├── utils/
│   │   └── formGenerator.ts     # Standalone HTML/CSS/JS snippet generator
│   ├── components/
│   │   ├── Header.tsx           # Navigation & connection status
│   │   ├── StatsCards.tsx       # Metrics summary cards
│   │   ├── SubmissionsTable.tsx # Admin table with search, sort, pagination
│   │   ├── OrderDetailModal.tsx # Full multiline address & status manager
│   │   ├── FormBuilderTab.tsx   # Customizer & code copy box
│   │   ├── LiveEmbedSimulator.tsx# Isolated iframe tester
│   │   └── SetupInstructionsTab.tsx# Documentation
│   ├── App.tsx                  # Main application orchestrator
│   └── main.tsx                 # React DOM root`}</pre>
        </div>
      </div>

      {/* Section 3: Sequential Order ID Logic */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>3. Sequential Order ID Generation (`ORD-YYYYMMDD-000001`)</span>
        </h3>
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            Every submission triggers the server-side generator in <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">server/db.ts</code>:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Calculates the current UTC date string: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">YYYYMMDD</code> (e.g. <code className="font-mono font-bold text-slate-800">20260929</code>).</li>
            <li>Scans all existing records in the database matching <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">^ORD-YYYYMMDD-[0-9]+$</code> to find the maximum existing sequence number.</li>
            <li>Increments that number by 1, padding to 6 digits (e.g. <code className="font-mono font-bold text-blue-700">ORD-20260929-000001</code>).</li>
            <li>Runs through a uniqueness collision set check to guarantee that no order ID can ever be overwritten.</li>
            <li>Saves the submission atomically to disk before returning the ID in the response.</li>
          </ul>
        </div>
      </div>

      {/* Section 4: How Third-Party Websites Embed the Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>4. How Third-Party Websites Use the Generated HTML</span>
        </h3>

        <div className="space-y-4 text-xs text-slate-700">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 mb-1">WordPress</h4>
            <p className="text-slate-600 mb-2">
              In Gutenberg editor, add a <strong>Custom HTML</strong> block and paste the generated snippet directly into the block. In Elementor, drag an <strong>HTML</strong> widget onto the canvas and paste the code.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 mb-1">Shopify</h4>
            <p className="text-slate-600 mb-2">
              Go to <em>Online Store &gt; Pages</em>. Switch the content editor to <strong>Show HTML</strong> (<code className="font-mono">&lt;&gt;</code>) and paste the code.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 mb-1">Webflow / Wix / Squarespace</h4>
            <p className="text-slate-600 mb-2">
              Add an <strong>Embed</strong> / <strong>Custom Code</strong> component and paste the snippet. Publish the site.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 mb-1">Plain Static HTML Website</h4>
            <p className="text-slate-600 mb-2">
              Paste the code anywhere inside the <code className="font-mono">&lt;body&gt;</code> of your <code className="font-mono">index.html</code>. No script tags or external CSS links are needed!
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Direct cURL API Example */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span>5. Direct API Submission (cURL / REST)</span>
          </h3>
          <button
            onClick={() => copySnippet(curlExample, 'curl')}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            {copiedSection === 'curl' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 text-emerald-300 font-mono text-xs overflow-x-auto">
          <pre>{curlExample}</pre>
        </div>
      </div>

      {/* Section 6: Running Locally & Deploying */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <span>6. Deploying to Vercel (1-Click Ready)</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
            <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
              <span>🚀 Ready for Vercel Deployment</span>
            </div>
            <p className="text-emerald-800">
              Your repository already includes <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">vercel.json</code> and <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300">api/index.ts</code>. You can deploy directly via Git or the Vercel CLI:
            </p>

            <div className="bg-slate-900 p-3 rounded-lg text-emerald-300 font-mono text-[11px] space-y-1 mt-2">
              <div># Option A: Deploy via Vercel CLI</div>
              <div className="text-white font-bold">npm i -g vercel && vercel</div>
              <div className="text-slate-400 mt-2"># Option B: Push to GitHub / GitLab</div>
              <div className="text-slate-300">Import repository in vercel.com dashboard &rarr; Click Deploy (Default settings)</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Local Development:</div>
            <code className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-blue-600 block w-max">
              npm run dev
            </code>
            <p className="mt-1.5 text-slate-500">
              Starts <code className="font-mono">tsx server.ts</code> on port 3000 with Vite middleware attached.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800 mb-1">Production Build:</div>
            <code className="font-mono bg-white px-2 py-1 rounded border border-slate-200 text-blue-600 block w-max">
              npm run build
            </code>
            <p className="mt-1.5 text-slate-500">
              Compiles static assets into <code className="font-mono">dist/</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
