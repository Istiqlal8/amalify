import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MemberMonth } from '@/domain/groupFarm';
import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import { groupDaysBetween, type GroupDayRow } from '@/services/groupDaySummaryService';
import type { MemberToday } from '@/services/groupService';
import { supabase } from '@/services/supabase';

/** Every member's percentage on the group's own daily list for each day of this month so far, updated live. */
export function useGroupMonth(groupId: string, members: MemberToday[], today: string): MemberMonth[] {
  const [rows, setRows] = useState<GroupDayRow[]>([]);
  const from = `${today.slice(0, 8)}01`;
  const reload = useCallback(() => {
    if (!supabase) return;
    groupDaysBetween(supabase, groupId, from, today).then(setRows).catch(() => setRows([]));
  }, [groupId, from, today]);

  useEffect(() => reload(), [reload]);
  useLiveRefresh(true, [{ table: 'group_day_summaries', filter: `group_id=eq.${groupId}` }], reload);
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
