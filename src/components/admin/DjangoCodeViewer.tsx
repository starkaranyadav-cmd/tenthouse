import React, { useState } from 'react';
import { 
  DJANGO_MODELS_CODE, 
  DJANGO_VIEWS_CODE, 
  DJANGO_URLS_CODE, 
  DJANGO_TESTS_CODE, 
  FIREBASE_CONFIG_CODE 
} from '../../data/djangoBackendCode';
import { Code2, Copy, Check, FileCode, Database, Terminal, Shield, Flame } from 'lucide-react';

interface DjangoCodeViewerProps {
  onClose?: () => void;
}

export const DjangoCodeViewer: React.FC<DjangoCodeViewerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'views' | 'urls' | 'tests' | 'firebase'>('models');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'models':
        return DJANGO_MODELS_CODE;
      case 'views':
        return DJANGO_VIEWS_CODE;
      case 'urls':
        return DJANGO_URLS_CODE;
      case 'tests':
        return DJANGO_TESTS_CODE;
      case 'firebase':
        return FIREBASE_CONFIG_CODE;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedTab(activeTab);
    setTimeout(() => {
      setCopiedTab(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              Python 3.12 + Django 5.x / Firebase
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Backend Architecture & Source Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Production-ready Django models with indexing, views with session validation, URL routing, automated unit tests, and Firestore schema.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {copiedTab === activeTab ? (
            <>
              <Check className="w-4 h-4 text-white" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Active File
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'models' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-500" />
          models.py (Tent, Location, Booking)
        </button>

        <button
          onClick={() => setActiveTab('views')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'views' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-blue-500" />
          views.py (Storefront & Admin)
        </button>

        <button
          onClick={() => setActiveTab('urls')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'urls' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-purple-500" />
          urls.py (Routing)
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tests' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          tests.py (Automated Unit Tests)
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'firebase' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Firebase Firestore Rules & Blueprint
        </button>
      </div>

      {/* Code Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="font-mono text-slate-300 ml-2">
              {activeTab === 'models' && 'tent_rental/models.py'}
              {activeTab === 'views' && 'tent_rental/views.py'}
              {activeTab === 'urls' && 'tent_rental/urls.py'}
              {activeTab === 'tests' && 'tent_rental/tests.py'}
              {activeTab === 'firebase' && 'firebase-blueprint.json & firestore.rules'}
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">UTF-8 • Syntactically Validated</span>
        </div>

        <pre className="p-6 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
          <code>{getActiveCode()}</code>
        </pre>
      </div>

    </div>
  );
};
