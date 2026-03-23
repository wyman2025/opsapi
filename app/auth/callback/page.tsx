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
        router.push('/dashboard');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Connection Failed</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Connecting to John Deere</h1>
          <p className="text-slate-600">Please wait while we complete the connection...</p>
        </div>
      </div>
    </div>
  );
}
