import type { SupabaseClient } from '@supabase/supabase-js';

import type { CashEntry } from '@/domain/cash';

type Row = {
  id: string;
  amount: number;
  note: string;
  day: string;
  dues_for: string | null;
  dues_month: string | null;
  created_by: string;
};

export type CashDraft = Omit<CashEntry, 'id' | 'createdBy'>;

export async function listCash(db: SupabaseClient, groupId: string): Promise<CashEntry[]> {
  const { data, error } = await db
    .from('cash_entries')
    .select('id, amount, note, day, dues_for, dues_month, created_by')
    .eq('group_id', groupId)
    .order('day', { ascending: false })
    .order('created_at', { ascending: false })
    .returns<Row[]>();
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    note: r.note,
    day: r.day,
    duesFor: r.dues_for,
    duesMonth: r.dues_month,
    createdBy: r.created_by,
  }));
}

export async function addCash(db: SupabaseClient, groupId: string, draft: CashDraft): Promise<void> {
  const { amount, note, day, duesFor, duesMonth } = draft;
  const row = { group_id: groupId, amount, note, day, dues_for: duesFor, dues_month: duesMonth };
  const { error } = await db.from('cash_entries').insert(row);
  if (error) throw error;
}

export async function removeCash(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('cash_entries').delete().eq('id', id);
  if (error) throw error;
}

/** `amount` null turns monthly dues off. */
export async function setDues(db: SupabaseClient, groupId: string, amount: number | null): Promise<void> {
  const { error } = await db.rpc('set_group_dues', { g: groupId, amount });
  if (error) throw error;
}
