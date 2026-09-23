import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/services/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type GroupData<T> = {
  data: T[];
  error: string | null;
  /** Runs a write, then reloads; errors land in `error`. */
  run: (task: (db: SupabaseClient) => Promise<unknown>) => Promise<void>;
};

/** Loads one group's rows with `load` and reloads after every write made through `run`. */
export function useGroupData<T>(
  groupId: string | null,
  load: (db: SupabaseClient, groupId: string) => Promise<T[]>,
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

  useEffect(() => {
    run(async () => undefined);
  }, [run]);

  return { data, error, run };
}
