import { useCallback, useEffect, useState } from 'react';

import { useLiveRefresh } from '@/hooks/useLiveRefresh';
import { getTemplate, type GroupTemplate } from '@/services/templateService';
import { supabase } from '@/services/supabase';

type State = { template: GroupTemplate | null; loading: boolean };

/**
 * The group's amal list, kept current: an admin saving it while a member has the app open arrives
 * over the same shared channel the rest of the group layer uses, so nobody has to reopen a screen.
 */
export function useGroupTemplate(groupId: string | null): State {
  const [template, setTemplate] = useState<GroupTemplate | null>(null);
  const [loading, setLoading] = useState(groupId !== null);

  const reload = useCallback(() => {
    if (!groupId || !supabase) {
      setTemplate(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTemplate(supabase, groupId)
      .then(setTemplate)
      .catch(() => setTemplate(null))
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(reload, [reload]);
  // Saving a list replaces the row outright, so a reload is both simpler and always correct.
  useLiveRefresh(groupId !== null, [{ table: 'group_templates', filter: `group_id=eq.${groupId}` }], reload);

  return { template, loading };
}
