import type { SupabaseClient } from '@supabase/supabase-js';

import { isProgressHidden } from '@/storage/privacyPrefs';

export type GroupDayRow = { user_id: string; day: string; percent: number | null };

/** Shares the signed-in member's percentage on the group's daily list; null when they hide progress. */
export async function pushGroupDay(db: SupabaseClient, groupId: string, day: string, percent: number): Promise<void> {
  const shared = isProgressHidden() ? null : Math.max(0, Math.min(100, Math.round(percent)));
  const { error } = await db
    .from('group_day_summaries')
    .upsert({ group_id: groupId, day, percent: shared, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Every member's group percentage from `from` to `to` (inclusive, YYYY-MM-DD). */
export async function groupDaysBetween(db: SupabaseClient, groupId: string, from: string, to: string): Promise<GroupDayRow[]> {
  const { data, error } = await db
    .from('group_day_summaries')
    .select('user_id, day, percent')
    .eq('group_id', groupId)
    .gte('day', from)
    .lte('day', to);
  if (error) throw error;
  return data;
}

/** Clears today's shared group percentages right away when the user starts hiding progress. */
export async function hideGroupDays(db: SupabaseClient, day: string): Promise<void> {
  const { error } = await db.from('group_day_summaries').update({ percent: null }).eq('day', day);
  if (error) throw error;
}
