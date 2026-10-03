import { useEffect } from 'react';

import { pushGroupDay } from '@/services/groupDaySummaryService';
import { supabase } from '@/services/supabase';

const PUSH_DELAY_MS = 2000;

/** Shares only the day's percentage on the group's daily list, never which amalan were ticked. */
export function useGroupDaySummary(ready: boolean, groupId: string, day: string, percent: number): void {
  useEffect(() => {
    if (!ready || !supabase) return;
    const db = supabase;
    const timer = setTimeout(() => pushGroupDay(db, groupId, day, percent).catch(() => undefined), PUSH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, groupId, day, percent]);
}
