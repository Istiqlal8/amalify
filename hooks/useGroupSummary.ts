import { useEffect } from 'react';

import { pushToday } from '@/services/groupService';
import { supabase } from '@/services/supabase';

const PUSH_DELAY_MS = 2000;

/** Shares only today's percentage and tilawah pages, never which amalan were done. */
export function useGroupSummary(ready: boolean, day: string, percent: number, tilawah: number): void {
  useEffect(() => {
    if (!ready || !supabase) return;
    const db = supabase;
    const timer = setTimeout(() => pushToday(db, day, percent, tilawah).catch(() => undefined), PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, day, percent, tilawah]);
}
