import { useEffect } from 'react';

import { pushToday } from '@/services/groupService';
import { supabase } from '@/services/supabase';

const PUSH_DELAY_MS = 2000;

/** Shares only today's percentage with group mates, never which amalan were done. */
export function useGroupSummary(ready: boolean, day: string, percent: number): void {
  useEffect(() => {
    if (!ready || !supabase) return;
    const db = supabase;
    const timer = setTimeout(() => pushToday(db, day, percent).catch(() => undefined), PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, day, percent]);
}
