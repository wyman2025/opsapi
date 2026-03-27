'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens } from '@/lib/john-deere-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader as Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshJohnDeereConnection } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (hasProcessed.current) {
        return;
      }

      console.log('[callback] Starting callback handler');
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('[callback] Code present:', !!code);
      console.log('[callback] Error param:', errorParam);
      console.log('[callback] User:', user?.id);

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        return;
      }

      if (!user) {
        // Don't show error immediately - user might still be loading
        return;
      }

      // Mark as processing to prevent duplicate runs
      hasProcessed.current = true;
      setIsProcessing(true);

      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        console.log('[callback] Calling exchangeCodeForTokens...');
        await exchangeCodeForTokens(code, redirectUri);
        console.log('[callback] Token exchange complete, refreshing connection...');
        await refreshJohnDeereConnection();
        console.log('[callback] Connection refreshed, redirecting to dashboard');
        router.push('/map');
      } catch (err) {
        console.error('[callback] Error during callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to John Deere');
        setIsProcessing(false);
        hasProcessed.current = false; // Allow retry
      }
    };

    if (user !== undefined) {
      handleCallback();
    }
  }, [searchParams, user, router, refreshJohnDeereConnection]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Connection Failed</h1>
            <p className="text-slate-400 mb-6 text-sm">{error}</p>
            <button
              onClick={() => router.push('/map')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/25"
            >
              Back to Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-white mb-2">Connecting to John Deere</h1>
          <p className="text-slate-400 text-sm">Please wait while we complete the connection...</p>
        </div>
      </div>
    </div>
  );
}
