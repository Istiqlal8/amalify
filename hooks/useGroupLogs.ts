import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { bucketOf, bucketsFor, upsertLog, type GroupLog } from '@/domain/groupProgress';
import type { TemplateField } from '@/domain/groupTemplate';
import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import { listGroupLogs, setGroupLog } from '@/services/groupLogService';
import { supabase } from '@/services/supabase';

type State = {
  logs: GroupLog[];
  loading: boolean;
  error: string | null;
  /** Sets the signed-in member's count on one field for `day`'s bucket. */
  set: (field: TemplateField, value: number) => void;
};

/**
 * Ticks on the group list for the buckets that hold `day`, kept live. A member sees only their
 * own rows and an admin sees everyone's, because the server's row policy decides, not this hook.
 */
export function useGroupLogs(groupId: string | null, fields: TemplateField[], day: string, me: string | null): State {
  const [logs, setLogs] = useState<GroupLog[]>([]);
  const [loading, setLoading] = useState(groupId !== null);
  const [error, setError] = useState<string | null>(null);
  const bucketKey = bucketsFor(fields, day).join(',');
  const buckets = useMemo(() => (bucketKey ? bucketKey.split(',') : []), [bucketKey]);
  /** Bumped on every local write so a slower, older fetch cannot overwrite a newer tick. */
  const version = useRef(0);

  const reload = useCallback(() => {
    if (!groupId || !supabase) {
      setLogs([]);
      setLoading(false);
      return;
    }
    const asked = version.current;
    listGroupLogs(supabase, groupId, buckets)
      .then((rows) => asked === version.current && setLogs(rows))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [groupId, buckets]);

  useEffect(reload, [reload]);
  useLiveRefresh(groupId !== null, [{ table: 'group_item_logs', filter: `group_id=eq.${groupId}` }], reload);

  const set = useCallback(
    (field: TemplateField, value: number) => {
      if (!groupId || !supabase || !me) return;
      const bucket = bucketOf(field, day);
      const count = Math.max(0, value);
      version.current += 1;
      setError(null);
      setLogs((prev) => upsertLog(prev, { userId: me, bucket, fieldId: field.id, count }));
      setGroupLog(supabase, groupId, bucket, field.id, count).catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        reload();
      });
    },
    [groupId, me, day, reload],
  );

  return { logs, loading, error, set };
}
