'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchStoredOperations } from '@/lib/john-deere-client';
import type { StoredFieldOperation } from '@/types/john-deere';

export function useOperations(fieldId?: string, operationType?: string) {
  const { johnDeereConnection } = useAuth();
  const orgId = johnDeereConnection?.selected_org_id;

  const [operations, setOperations] = useState<StoredFieldOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStoredOperations(fieldId, operationType);
      setOperations(data.operations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operations');
    } finally {
      setLoading(false);
    }
  }, [orgId, fieldId, operationType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { operations, loading, error, refresh };
}
