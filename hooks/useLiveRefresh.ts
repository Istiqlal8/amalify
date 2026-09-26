import { useEffect, useId, useRef } from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/services/supabase';

/** A table to watch, optionally narrowed with a Realtime filter such as `group_id=eq.<id>`. */
export type Watch = { table: string; filter?: string };

/**
 * Calls `reload` whenever a watched table changes on Supabase, and when the app comes back
 * to the foreground (the socket is closed while it sleeps, so changes made then are missed).
 * `enabled` false skips both, e.g. before sign-in.
 */
export function useLiveRefresh(enabled: boolean, watches: Watch[], reload: () => void): void {
  const id = useId();
  const reloadRef = useRef(reload);
  const key = JSON.stringify(watches);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (state) => state === 'active' && reloadRef.current());
    return () => sub.remove();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !supabase || key === '[]') return;
    const db = supabase;
    const channel = db.channel(`live${id}`);
    for (const { table, filter } of JSON.parse(key) as Watch[]) {
      const fire = () => reloadRef.current();
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter }, fire);
      channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter }, fire);
      // Delete events cannot be filtered, so any delete on the table triggers a reload.
      channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table }, fire);
    }
    channel.subscribe();
    return () => {
      db.removeChannel(channel);
    };
  }, [enabled, key, id]);
}
