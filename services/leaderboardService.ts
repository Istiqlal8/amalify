import type { SupabaseClient } from '@supabase/supabase-js';

export type BoardRow = { userId: string; name: string; pages: number };

type Row = { user_id: string; display_name: string; pages: number };

/** Tilawah pages over `from`..`to`; the whole app when `groupId` is null. */
export async function tilawahBoard(
  db: SupabaseClient,
  from: string,
  to: string,
  groupId: string | null,
): Promise<BoardRow[]> {
  const { data, error } = await db.rpc('tilawah_board', { from_day: from, to_day: to, only_group: groupId });
  if (error) throw error;
  return (data as Row[]).map((r) => ({ userId: r.user_id, name: r.display_name, pages: Number(r.pages) }));
}
