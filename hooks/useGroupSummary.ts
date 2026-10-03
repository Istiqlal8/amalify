import { useEffect } from 'react';

import { pushToday } from '@/services/groupService';
import { supabase } from '@/services/supabase';

const PUSH_DELAY_MS = 2000;

/** Shares only today's tilawah pages; group progress comes from the group's own list. */
export function useGroupSummary(ready: boolean, day: string, tilawah: number): void {
  useEffect(() => {
    if (!ready || !supabase) return;
    const db = supabase;
    const timer = setTimeout(() => pushToday(db, day, tilawah).catch(() => undefined), PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, day, tilawah]);
}
