import type { SupabaseClient } from '@supabase/supabase-js';

import { parseTemplateFields, type TemplateField } from '@/domain/groupTemplate';

/** The group's amal list and who last changed it; null when the group has none yet. */
export type GroupTemplate = { fields: TemplateField[]; updatedBy: string | null; updatedAt: string };

type Row = { fields: unknown; updated_by: string | null; updated_at: string };

export async function getTemplate(db: SupabaseClient, groupId: string): Promise<GroupTemplate | null> {
  const { data, error } = await db
    .from('group_templates')
    .select('fields, updated_by, updated_at')
    .eq('group_id', groupId)
    .maybeSingle<Row>();
  if (error) throw error;
  if (!data) return null;
  return { fields: parseTemplateFields(data.fields), updatedBy: data.updated_by, updatedAt: data.updated_at };
}

/** Creator or admin only; the server refuses anyone else and caps the list at 60 items. */
export async function setTemplate(db: SupabaseClient, groupId: string, fields: TemplateField[]): Promise<void> {
  const { error } = await db.rpc('set_group_template', { g: groupId, fields });
  if (error) throw error;
}
