import type { SupabaseClient } from '@supabase/supabase-js';

export type Group = { id: string; name: string; invite_code: string };
export type MemberToday = { userId: string; name: string; percent: number };

type MemberRow = { user_id: string; profiles: { display_name: string } | null };
type SummaryRow = { user_id: string; percent: number };

export async function signInSupabase(db: SupabaseClient, idToken: string, name: string): Promise<void> {
  const { data, error } = await db.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) throw error;
  const profile = { id: data.user.id, display_name: name.slice(0, 60) };
  const { error: profileError } = await db.from('profiles').upsert(profile);
  if (profileError) throw profileError;
}

export async function listGroups(db: SupabaseClient): Promise<Group[]> {
  const { data, error } = await db.from('groups').select('id, name, invite_code').order('created_at');
  if (error) throw error;
  return data;
}

export async function createGroup(db: SupabaseClient, name: string): Promise<Group> {
  const { data, error } = await db.rpc('create_group', { group_name: name });
  if (error) throw error;
  return data as Group;
}

export async function joinGroup(db: SupabaseClient, code: string): Promise<Group> {
  const { data, error } = await db.rpc('join_group', { code });
  if (error) throw error;
  return data as Group;
}

export async function pushToday(db: SupabaseClient, day: string, percent: number): Promise<void> {
  const { error } = await db.from('daily_summaries').upsert({ day, percent });
  if (error) throw error;
}

export async function membersToday(db: SupabaseClient, groupId: string, day: string): Promise<MemberToday[]> {
  const members = await db
    .from('group_members')
    .select('user_id, profiles(display_name)')
    .eq('group_id', groupId)
    .returns<MemberRow[]>();
  if (members.error) throw members.error;
  const ids = members.data.map((m) => m.user_id);
  const summaries = await db.from('daily_summaries').select('user_id, percent').eq('day', day).in('user_id', ids);
  if (summaries.error) throw summaries.error;
  const byUser = new Map((summaries.data as SummaryRow[]).map((s) => [s.user_id, s.percent]));
  return members.data
    .map((m) => ({ userId: m.user_id, name: m.profiles?.display_name ?? 'Teman', percent: byUser.get(m.user_id) ?? 0 }))
    .sort((a, b) => b.percent - a.percent);
}
