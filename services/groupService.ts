import type { SupabaseClient } from '@supabase/supabase-js';

import type { ReportField } from '@/domain/groupReport';
import { isProgressHidden } from '@/storage/privacyPrefs';

/** `dues_amount` is the monthly dues in rupiah; null when the group has none. */
export type Group = {
  id: string;
  name: string;
  invite_code: string;
  dues_amount: number | null;
  logo_url: string | null;
  created_by: string | null;
  /** What the weekly report asks; set by the creator. */
  report_fields: ReportField[];
};
/** `hidden` members keep their percentage off the server; `percent` is then 0. */
export type MemberToday = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  percent: number;
  hidden: boolean;
};

type MemberRow = {
  user_id: string;
  profiles: { display_name: string; avatar_url: string | null; bio: string | null } | null;
};
type SummaryRow = { user_id: string; percent: number | null };

/** Creates the profile from the Google account on first sign-in; later edits are kept. */
export async function signInSupabase(db: SupabaseClient, idToken: string, name: string, photo: string | null): Promise<void> {
  const { data, error } = await db.auth.signInWithIdToken({ provider: 'google', token: idToken });
  if (error) throw error;
  const profile = { id: data.user.id, display_name: name.slice(0, 60), avatar_url: photo };
  const { error: profileError } = await db.from('profiles').upsert(profile, { ignoreDuplicates: true });
  if (profileError) throw profileError;
}

export async function listGroups(db: SupabaseClient): Promise<Group[]> {
  const { data, error } = await db.from('groups').select('id, name, invite_code, dues_amount, logo_url, created_by, report_fields').order('created_at');
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

export async function pushToday(db: SupabaseClient, day: string, percent: number, tilawah: number): Promise<void> {
  const shared = isProgressHidden() ? null : percent;
  const { error } = await db.from('daily_summaries').upsert({ day, percent: shared, tilawah });
  if (error) throw error;
}

export async function membersToday(db: SupabaseClient, groupId: string, day: string): Promise<MemberToday[]> {
  const members = await db
    .from('group_members')
    .select('user_id, profiles(display_name, avatar_url, bio)')
    .eq('group_id', groupId)
    .returns<MemberRow[]>();
  if (members.error) throw members.error;
  const ids = members.data.map((m) => m.user_id);
  const summaries = await db.from('daily_summaries').select('user_id, percent').eq('day', day).in('user_id', ids);
  if (summaries.error) throw summaries.error;
  const rows = summaries.data as SummaryRow[];
  const byUser = new Map(rows.map((s) => [s.user_id, s.percent]));
  return members.data
    .map((m) => ({
      userId: m.user_id,
      name: m.profiles?.display_name ?? 'Teman',
      avatarUrl: m.profiles?.avatar_url ?? null,
      bio: m.profiles?.bio ?? null,
      percent: byUser.get(m.user_id) ?? 0,
      hidden: byUser.has(m.user_id) && byUser.get(m.user_id) === null,
    }))
    .sort((a, b) => b.percent - a.percent);
}

/** Clears today's shared percentage right away when the user starts hiding it. */
export async function hideToday(db: SupabaseClient, day: string): Promise<void> {
  const { error } = await db.from('daily_summaries').update({ percent: null }).eq('day', day);
  if (error) throw error;
}
