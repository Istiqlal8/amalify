import type { SupabaseClient } from '@supabase/supabase-js';

/** Shared percentages of `ids` from `from` to `to` (inclusive, YYYY-MM-DD); hidden days come back as null. */
export async function summariesBetween(db: SupabaseClient, ids: string[], from: string, to: string): Promise<{ user_id: string; day: string; percent: number | null }[]> {
  const { data, error } = await db.from('daily_summaries').select('user_id, day, percent').in('user_id', ids).gte('day', from).lte('day', to);
  if (error) throw error;
  return data;
}
