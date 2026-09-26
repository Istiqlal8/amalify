import type { SupabaseClient } from '@supabase/supabase-js';

import type { GroupReport, ReportDraft, ReportEntry, ReportField } from '@/domain/groupReport';

type Row = { id: string; day: string; time: string; location: string; entries: ReportEntry[]; created_by: string | null };

export async function listReports(db: SupabaseClient, groupId: string): Promise<GroupReport[]> {
  const { data, error } = await db
    .from('group_reports')
    .select('id, day, time, location, entries, created_by')
    .eq('group_id', groupId)
    .returns<Row[]>();
  if (error) throw error;
  return data.map((r) => ({ id: r.id, day: r.day, time: r.time, location: r.location, entries: r.entries, createdBy: r.created_by }));
}

export async function addReport(db: SupabaseClient, groupId: string, draft: ReportDraft): Promise<void> {
  const { error } = await db.from('group_reports').insert({ group_id: groupId, ...draft });
  if (error) throw error;
}

export async function updateReport(db: SupabaseClient, id: string, draft: ReportDraft): Promise<void> {
  const { error } = await db.from('group_reports').update(draft).eq('id', id);
  if (error) throw error;
}

export async function removeReport(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('group_reports').delete().eq('id', id);
  if (error) throw error;
}

/** Creator only; the server refuses anyone else. */
export async function setReportFields(db: SupabaseClient, groupId: string, fields: ReportField[]): Promise<void> {
  const { error } = await db.rpc('set_report_fields', { g: groupId, fields });
  if (error) throw error;
}
