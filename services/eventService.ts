import type { SupabaseClient } from '@supabase/supabase-js';

import type { EventDraft, GroupEvent } from '@/domain/groupEvent';

type Row = {
  id: string;
  group_id: string;
  title: string;
  starts_at: string;
  pic: string | null;
  target: number;
  unit: string;
  progress: number;
  created_by: string;
};

const fromRow = (r: Row): GroupEvent => ({
  id: r.id,
  groupId: r.group_id,
  title: r.title,
  startsAt: r.starts_at,
  pic: r.pic,
  target: r.target,
  unit: r.unit,
  progress: r.progress,
  createdBy: r.created_by,
});

export async function listEvents(db: SupabaseClient, groupId: string): Promise<GroupEvent[]> {
  const { data, error } = await db.from('group_events').select('*').eq('group_id', groupId).returns<Row[]>();
  if (error) throw error;
  return data.map(fromRow);
}

export async function addEvent(db: SupabaseClient, groupId: string, draft: EventDraft): Promise<void> {
  const { title, startsAt, pic, target, unit } = draft;
  const row = { group_id: groupId, title, starts_at: startsAt, pic, target, unit };
  const { error } = await db.from('group_events').insert(row);
  if (error) throw error;
}

export async function setEventProgress(db: SupabaseClient, id: string, progress: number): Promise<void> {
  const { error } = await db.from('group_events').update({ progress }).eq('id', id);
  if (error) throw error;
}

export async function removeEvent(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('group_events').delete().eq('id', id);
  if (error) throw error;
}
