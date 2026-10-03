import { useCallback, useEffect, useState } from 'react';

import { patchProgress } from '@/domain/memberProgress';
import { type Change, useLiveRefresh } from '@/hooks/useLiveRefresh';
import * as groups from '@/services/groupService';
import { supabase } from '@/services/supabase';

type GroupsState = {
  list: groups.Group[];
  error: string | null;
  create: (name: string) => Promise<void>;
  join: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useGroups(ready: boolean): GroupsState {
  const [list, setList] = useState<groups.Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (task: () => Promise<unknown>) => {
    if (!supabase) return;
    setError(null);
    try {
      await task();
      setList(await groups.listGroups(supabase));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const refresh = useCallback(() => run(async () => undefined), [run]);
  const create = useCallback((name: string) => run(() => groups.createGroup(supabase!, name)), [run]);
  const join = useCallback((code: string) => run(() => groups.joinGroup(supabase!, code)), [run]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);
  // Membership rows change when the user leaves or an admin removes them; group rows when an
  // admin edits the announcement.
  useLiveRefresh(ready, [{ table: 'group_members' }, { table: 'groups' }], refresh);

  return { list, error, create, join, refresh };
}

/** Each member's progress today, updated live as they tick items off or join and leave. */
export function useMembersToday(groupId: string | null, day: string): groups.MemberToday[] {
  const [members, setMembers] = useState<groups.MemberToday[]>([]);
  const reload = useCallback(() => {
    if (!groupId || !supabase) return setMembers([]);
    groups.membersToday(supabase, groupId, day).then(setMembers).catch(() => setMembers([]));
  }, [groupId, day]);

  useEffect(() => reload(), [reload]);
  // A group summary row carries the progress itself, so a mate ticking a group amalan redraws the
  // board without a fetch. Rows for other days are ignored. Anything else — joining, leaving, a
  // delete, coming back to the app — refetches, because names and avatars live on other tables.
  const apply = useCallback(
    (changes: Change[]) => {
      const summaries = changes.filter((c) => c.table === 'group_day_summaries' && c.row);
      if (summaries.length === 0 || summaries.length !== changes.length) return reload();
      const rows = summaries.flatMap((c) => (c.row && c.row.day === day ? [c.row] : []));
      if (rows.length > 0) setMembers((prev) => patchProgress(prev, rows));
    },
    [reload, day],
  );
  useLiveRefresh(
    groupId !== null,
    [
      { table: 'group_day_summaries', filter: `group_id=eq.${groupId}` },
      { table: 'group_members', filter: `group_id=eq.${groupId}` },
    ],
    apply,
  );
  return members;
}
