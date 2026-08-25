import React, { useState } from 'react';
import { loginAdmin } from '../../services/storageService';
import { AdminUser } from '../../types';
import { Lock, Mail, ShieldCheck, KeyRound, Sparkles, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [email, setEmail] = useState('admin@canopycraft.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }, 400);
  };

  const handleDemoQuickLogin = (demoRole: 'admin' | 'dispatcher') => {
    const demoEmail = demoRole === 'admin' ? 'admin@canopycraft.com' : 'ops.lead@canopycraft.com';
    setEmail(demoEmail);
    setPassword('admin123');
    const res = loginAdmin(demoEmail, 'admin123');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin & Operations Portal</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized management access for fleet inventory, booking approvals, and service zone logistics.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Credentials Buttons */}
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-emerald-950 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Demo Access
            </span>
            <span className="text-[10px] text-emerald-700 font-mono">1-Click Login</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoQuickLogin('admin')}
              className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl font-semibold text-xs shadow-2xs transition-all cursor-pointer text-center"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoQuickLogin('dispatcher')}
              className="px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl font-semibold text-xs shadow-2xs transition-all cursor-pointer text-center"
            >
              🚛 Operations Lead
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              Admin Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Security Password / PIN
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Management Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            ← Return to Public Customer Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
