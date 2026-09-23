import { useCallback, useEffect, useState } from 'react';

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

  return { list, error, create, join, refresh };
}

export function useMembersToday(groupId: string | null, day: string): groups.MemberToday[] {
  const [members, setMembers] = useState<groups.MemberToday[]>([]);
  useEffect(() => {
    if (!groupId || !supabase) return setMembers([]);
    groups.membersToday(supabase, groupId, day).then(setMembers).catch(() => setMembers([]));
  }, [groupId, day]);
  return members;
}
