import { cadenceKey, cadenceOf, type Cadence } from './cadence';
import type { DayEntry } from './dayLog';
import { addField, MAX_TEMPLATE_FIELDS, type TemplateField } from './groupTemplate';
import type { PlanItem } from './plan';

/** One member's count on one group amalan, for one cadence bucket. Mirrors `group_item_logs`. */
export type GroupLog = { userId: string; bucket: string; fieldId: string; count: number };

/** What a member did on the group list over the buckets that hold `day`. */
export type MemberRecap = {
  /** Fields fully done. */
  done: number;
  total: number;
  /** Mean of each field's `count / target`, capped at 1, as a whole percent. */
  percent: number;
  /** Count per field id; missing means nothing recorded. */
  counts: Record<string, number>;
};

/** The bucket a field's tick for `day` lands in. */
export function bucketOf(field: TemplateField, day: string): string {
  return cadenceKey(cadenceOf(field), day);
}

/** The distinct buckets the list touches on `day`, so one query fetches them all. */
export function bucketsFor(fields: TemplateField[], day: string): string[] {
  return [...new Set(fields.map((f) => bucketOf(f, day)))].sort();
}

export function fieldsOf(fields: TemplateField[], cadence: Cadence): TemplateField[] {
  return fields.filter((f) => cadenceOf(f) === cadence);
}

/** A member's counts on `fields` for `day`, keyed by field id. */
export function countsFor(logs: GroupLog[], userId: string, fields: TemplateField[], day: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const f of fields) {
    const bucket = bucketOf(f, day);
    const row = logs.find((l) => l.userId === userId && l.fieldId === f.id && l.bucket === bucket);
    if (row) counts[f.id] = row.count;
  }
  return counts;
}

/** The same counts shaped like a personal day entry, so the shared checklist rows can render them. */
export function entryFor(logs: GroupLog[], userId: string, fields: TemplateField[], day: string): DayEntry {
  return { counts: countsFor(logs, userId, fields, day), at: 0 };
}

export function recap(logs: GroupLog[], userId: string, fields: TemplateField[], day: string): MemberRecap {
  const counts = countsFor(logs, userId, fields, day);
  if (fields.length === 0) return { done: 0, total: 0, percent: 0, counts };
  let sum = 0;
  let done = 0;
  for (const f of fields) {
    const ratio = Math.min((counts[f.id] ?? 0) / Math.max(1, f.target), 1);
    sum += ratio;
    if (ratio >= 1) done += 1;
  }
  return { done, total: fields.length, percent: Math.round((sum / fields.length) * 100), counts };
}

/** How many of `userIds` finished one field on `day`. */
export function finishedBy(logs: GroupLog[], userIds: string[], field: TemplateField, day: string): number {
  const bucket = bucketOf(field, day);
  const target = Math.max(1, field.target);
  return userIds.filter((id) =>
    logs.some((l) => l.userId === id && l.fieldId === field.id && l.bucket === bucket && l.count >= target),
  ).length;
}

/** Replaces (or adds) one row after a member ticks an item, so the screen updates before the server answers. */
export function upsertLog(logs: GroupLog[], next: GroupLog): GroupLog[] {
  const same = (l: GroupLog) => l.userId === next.userId && l.bucket === next.bucket && l.fieldId === next.fieldId;
  return logs.some(same) ? logs.map((l) => (same(l) ? next : l)) : [...logs, next];
}

const norm = (label: string) => label.trim().toLowerCase();

/** Whether the list already has an amalan with this label, so an import does not add it twice. */
export function hasLabel(fields: TemplateField[], label: string): boolean {
  return fields.some((f) => norm(f.label) === norm(label));
}

/**
 * An admin's personal amalan copied onto the group list. Reminders stay personal; labels already on
 * the list are skipped, and the list never grows past its cap.
 */
export function importItems(fields: TemplateField[], items: PlanItem[]): TemplateField[] {
  let next = fields;
  for (const it of items) {
    if (next.length >= MAX_TEMPLATE_FIELDS || hasLabel(next, it.label)) continue;
    next = addField(next, {
      label: it.label.trim(),
      section: it.section,
      kind: it.kind,
      target: it.kind === 'count' ? Math.max(1, it.target) : 1,
      unit: it.kind === 'count' ? it.unit : '',
      cadence: cadenceOf(it),
    });
  }
  return next;
}

type Row = { user_id: string; bucket: string; field_id: string; count: number };

/** Reads `group_item_logs` rows; anything malformed is dropped. */
export function parseLogs(rows: unknown): GroupLog[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(
      (r): r is Row =>
        !!r && typeof r.user_id === 'string' && typeof r.bucket === 'string' && typeof r.field_id === 'string' && typeof r.count === 'number',
    )
    .map((r) => ({ userId: r.user_id, bucket: r.bucket, fieldId: r.field_id, count: r.count }));
}
