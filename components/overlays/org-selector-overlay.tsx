'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchOrganizations, selectOrganization } from '@/lib/john-deere-client';
import { Building2, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import type { JohnDeereOrganization } from '@/types/john-deere';

export function OrgSelectorOverlay() {
  const { johnDeereConnection, refreshJohnDeereConnection } = useAuth();
  const [organizations, setOrganizations] = useState<JohnDeereOrganization[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (johnDeereConnection) {
      loadOrgs();
    }
  }, [johnDeereConnection]);

  const loadOrgs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrganizations();
      setOrganizations(data.values || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedId) return;
    const org = organizations.find((o) => o.id === selectedId);
    if (!org) return;

    setIsSaving(true);
    try {
      await selectOrganization(org.id, org.name);
      await refreshJohnDeereConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select organization');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative glass-panel rounded-2xl p-8 max-w-lg w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Select Organization</h2>
            <p className="text-sm text-slate-400">Choose which account to view</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={loadOrgs}
              className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Org list */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedId(org.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
                    ${selectedId === org.id
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                      : 'bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.1]'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedId === org.id ? 'bg-emerald-500/20' : 'bg-white/5'
                  }`}>
                    <Building2 className={`w-4 h-4 ${selectedId === org.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{org.name}</p>
                    {org.type && (
                      <p className="text-xs text-slate-500 truncate">{org.type}</p>
                    )}
                  </div>
                  {selectedId === org.id && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
              {organizations.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">
                  No organizations found in your account.
                </p>
              )}
            </div>

            {/* Continue button */}
            {organizations.length > 0 && (
              <button
                onClick={handleContinue}
                disabled={!selectedId || isSaving}
                className={`
                  mt-6 w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium transition-all
                  ${selectedId
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
