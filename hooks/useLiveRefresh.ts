import { useEffect, useId, useRef } from 'react';
import { AppState } from 'react-native';

import { type Change, watchTables, type Watch } from '@/hooks/liveBus';

export type { Change, Watch };

/**
 * Calls `reload` with the changed rows whenever a watched table changes on Supabase, and with no
 * rows when the app comes back
 * to the foreground (the socket is closed while it sleeps, so changes made then are missed).
 * A caller that ignores the rows simply refetches.
 * `enabled` false skips both, e.g. before sign-in. Every caller shares one channel, so the
 * same change is delivered — and billed — once however many screens are listening.
 */
export function useLiveRefresh(enabled: boolean, watches: Watch[], reload: (changes: Change[]) => void): void {
  const id = useId();
  const reloadRef = useRef(reload);
  const key = JSON.stringify(watches);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (state) => state === 'active' && reloadRef.current([]));
    return () => sub.remove();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || key === '[]') return;
    return watchTables(id, JSON.parse(key) as Watch[], (changes) => reloadRef.current(changes));
  }, [enabled, key, id]);
}
