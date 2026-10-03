import type { SupabaseClient } from '@supabase/supabase-js';

import { parseLogs, type GroupLog } from '@/domain/groupProgress';

/**
 * Ticks on the group list for the given buckets. RLS decides whose rows come back: a member gets
 * only their own, an admin gets the whole group's.
 */
export async function listGroupLogs(db: SupabaseClient, groupId: string, buckets: string[]): Promise<GroupLog[]> {
  if (buckets.length === 0) return [];
  const { data, error } = await db
    .from('group_item_logs')
    .select('user_id, bucket, field_id, count')
    .eq('group_id', groupId)
    .in('bucket', buckets);
  if (error) throw error;
  return parseLogs(data);
}

/** Records the signed-in member's count on one group amalan; the server fills in `user_id`. */
export async function setGroupLog(db: SupabaseClient, groupId: string, bucket: string, fieldId: string, count: number): Promise<void> {
  const { error } = await db
    .from('group_item_logs')
    .upsert({ group_id: groupId, bucket, field_id: fieldId, count: Math.max(0, Math.round(count)), updated_at: new Date().toISOString() });
  if (error) throw error;
}
