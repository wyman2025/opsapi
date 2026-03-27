'use client';

import { useAuth } from '@/contexts/auth-context';
import { getJohnDeereAuthUrl } from '@/lib/john-deere-client';
import { Link2, LogOut, Tractor } from 'lucide-react';

export function ConnectOverlay() {
  const { signOut } = useAuth();

  const handleConnect = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem('jd_oauth_state', state);
    const authUrl = getJohnDeereAuthUrl(redirectUri, state);
    window.location.href = authUrl;
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative glass-panel rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
          <Tractor className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          Connect to Operations Center
        </h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Link your John Deere account to access your fields, operations, and farm data in one place.
        </p>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
        >
          <Link2 className="w-5 h-5" />
          Connect John Deere Account
        </button>

        {/* Sign out link */}
        <button
          onClick={handleSignOut}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 mx-auto transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out instead
        </button>
      </div>
    </div>
  );
}
