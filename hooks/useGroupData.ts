import { useCallback, useEffect, useState } from 'react';

import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import { supabase } from '@/services/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type GroupData<T> = {
  data: T[];
  error: string | null;
  /** Runs a write, then reloads; errors land in `error`. */
  run: (task: (db: SupabaseClient) => Promise<unknown>) => Promise<void>;
};

/**
 * Loads one group's rows with `load`, reloads after every write made through `run`, and
 * reloads live when anyone else changes `table` for this group.
 */
export function useGroupData<T>(
  groupId: string | null,
  load: (db: SupabaseClient, groupId: string) => Promise<T[]>,
  table: string,
): GroupData<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (task: (db: SupabaseClient) => Promise<unknown>) => {
      if (!supabase || !groupId) return setData([]);
      setError(null);
      try {
        await task(supabase);
        setData(await load(supabase, groupId));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [groupId, load],
  );

  const reload = useCallback(() => run(async () => undefined), [run]);
  useEffect(() => {
    reload();
  }, [reload]);
  useLiveRefresh(groupId !== null, [{ table, filter: `group_id=eq.${groupId}` }], reload);

  return { data, error, run };
}
