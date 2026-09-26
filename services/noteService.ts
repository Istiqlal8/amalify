import type { SupabaseClient } from '@supabase/supabase-js';

export type GroupNote = { id: string; title: string; body: string; createdBy: string | null; updatedAt: string };
export type NoteDraft = { title: string; body: string };

type Row = { id: string; title: string; body: string; created_by: string | null; updated_at: string };

/** Newest first. */
export async function listNotes(db: SupabaseClient, groupId: string): Promise<GroupNote[]> {
  const { data, error } = await db
    .from('group_notes')
    .select('id, title, body, created_by, updated_at')
    .eq('group_id', groupId)
    .order('updated_at', { ascending: false })
    .returns<Row[]>();
  if (error) throw error;
  return data.map((r) => ({ id: r.id, title: r.title, body: r.body, createdBy: r.created_by, updatedAt: r.updated_at }));
}

export async function addNote(db: SupabaseClient, groupId: string, draft: NoteDraft): Promise<void> {
  const { error } = await db.from('group_notes').insert({ group_id: groupId, ...draft });
  if (error) throw error;
}

export async function updateNote(db: SupabaseClient, id: string, draft: NoteDraft): Promise<void> {
  const { error } = await db.from('group_notes').update({ ...draft, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function removeNote(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('group_notes').delete().eq('id', id);
  if (error) throw error;
}
