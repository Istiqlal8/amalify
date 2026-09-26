import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MemberMonth } from '@/domain/groupFarm';
import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import type { MemberToday } from '@/services/groupService';
import { summariesBetween } from '@/services/summaryService';
import { supabase } from '@/services/supabase';

/** Every member's shared percentage for each day of this month so far, updated live. */
export function useGroupMonth(members: MemberToday[], today: string): MemberMonth[] {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof summariesBetween>>>([]);
  const from = `${today.slice(0, 8)}01`;
  const ids = members.map((m) => m.userId).join(',');
  const reload = useCallback(() => {
    if (!supabase || !ids) return setRows([]);
    summariesBetween(supabase, ids.split(','), from, today).then(setRows).catch(() => setRows([]));
  }, [ids, from, today]);

  useEffect(() => reload(), [reload]);
  useLiveRefresh(ids !== '', [{ table: 'daily_summaries', filter: `day=gte.${from}` }], reload);
  return useMemo(
    () =>
      members.map((m) => ({
        userId: m.userId,
        name: m.name,
        days: Object.fromEntries(rows.filter((r) => r.user_id === m.userId).map((r) => [r.day, r.percent ?? 0])),
      })),
    [members, rows],
  );
}
