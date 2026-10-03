import type { RealtimeChannel } from '@supabase/supabase-js';

import { matchesFilter } from '@/domain/liveFilter';
import { supabase } from '@/services/supabase';

/** A table to watch, optionally narrowed with a filter such as `group_id=eq.<id>`. */
export type Watch = { table: string; filter?: string };

/** A change a watcher asked for. `row` null means a delete, which carries only the primary key. */
export type Change = { table: string; row: Record<string, unknown> | null };

type Entry = { watches: Watch[]; fire: (changes: Change[]) => void };

/** Changes are collected for this long, so a burst of writes reloads each watcher once. */
const COALESCE_MS = 300;
/** Opening a screen registers several watchers in a row; rebind once they have settled. */
const SETTLE_MS = 50;

const entries = new Map<string, Entry>();
const pending = new Map<string, Change[]>();
let channel: RealtimeChannel | null = null;
let bound = '';
let settle: ReturnType<typeof setTimeout> | null = null;
let flush: ReturnType<typeof setTimeout> | null = null;

/** The tables anyone watches, as the key the open channel is bound to. */
const wanted = (): string =>
  [...new Set([...entries.values()].flatMap((e) => e.watches.map((w) => w.table)))].sort().join(',');

/** Queues the change for every watcher that asked for it. */
function touch(table: string, row: Record<string, unknown> | null): void {
  for (const [id, entry] of entries) {
    if (!entry.watches.some((w) => w.table === table && (row === null || matchesFilter(w.filter, row)))) continue;
    pending.set(id, [...(pending.get(id) ?? []), { table, row }]);
  }
  if (pending.size > 0 && !flush) flush = setTimeout(reloadPending, COALESCE_MS);
}

function reloadPending(): void {
  flush = null;
  const queued = [...pending];
  pending.clear();
  for (const [id, changes] of queued) entries.get(id)?.fire(changes);
}

/**
 * Rebinds the single channel every watcher shares: one listener per table and event, unfiltered,
 * because Realtime bills each listener separately and filtering here costs nothing.
 */
function rebind(): void {
  settle = null;
  const db = supabase;
  const key = wanted();
  if (!db || key === bound) return;
  if (channel) db.removeChannel(channel);
  channel = null;
  bound = key;
  if (key === '') return;
  const next = db.channel('live');
  for (const table of key.split(',')) {
    for (const event of ['INSERT', 'UPDATE', 'DELETE'] as const) {
      next.on('postgres_changes', { event, schema: 'public', table }, (payload) =>
        touch(table, event === 'DELETE' ? null : (payload.new as Record<string, unknown>)),
      );
    }
  }
  next.subscribe();
  channel = next;
}

/** Registers a watcher until the returned function is called. */
export function watchTables(id: string, watches: Watch[], fire: (changes: Change[]) => void): () => void {
  entries.set(id, { watches, fire });
  if (!settle) settle = setTimeout(rebind, SETTLE_MS);
  return () => {
    entries.delete(id);
    pending.delete(id);
    if (!settle) settle = setTimeout(rebind, SETTLE_MS);
  };
}
