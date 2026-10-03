import type { SectionId } from './amalan';
import type { Cadence } from './cadence';
import type { ItemDraft, Plan, PlanItem } from './plan';

/** One amalan an admin put on the group's list. Carries only what the list is, not progress. */
export type TemplateField = {
  /** Stable across edits (`g-` + a slug of the label), so a member who took it keeps the same item. */
  id: string;
  label: string;
  section: SectionId;
  kind: 'check' | 'count';
  target: number;
  unit: string;
  cadence: Cadence;
};

export const MAX_TEMPLATE_FIELDS = 60;

/** Only this many letters of the label make it into the id, so ids stay readable in stored logs. */
const SLUG_WORDS = 2;

function slug(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, SLUG_WORDS)
      .join('-') || 'amal'
  );
}

/**
 * Ids are derived from the label so the same amalan keeps its id when the admin edits the list —
 * a taken item then matches by id instead of being added a second time. Two labels that slug the
 * same still get different ids, because the second one carries a counter.
 */
export function templateFieldId(label: string, taken: string[]): string {
  const base = `g-${slug(label)}`;
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

const isSection = (v: unknown): v is SectionId => v === 'sholat' || v === 'quran' || v === 'kebaikan';

/** Reads a `group_templates.fields` payload; anything shaped wrong is dropped rather than trusted. */
export function parseTemplateFields(raw: unknown): TemplateField[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (f): f is TemplateField =>
      !!f && typeof f.id === 'string' && typeof f.label === 'string' && isSection(f.section),
  );
}

/** The member's copy of a field: what the group agreed on, with their own reminder left alone. */
export function toDraft(field: TemplateField): ItemDraft {
  return {
    label: field.label,
    section: field.section,
    kind: field.kind,
    target: field.target,
    unit: field.unit,
    cadence: field.cadence,
  };
}

/** Adds a field to the list, numbering its id against the ones already there. */
export function addField(fields: TemplateField[], field: Omit<TemplateField, 'id'>): TemplateField[] {
  if (fields.length >= MAX_TEMPLATE_FIELDS) return fields;
  return [...fields, { ...field, id: templateFieldId(field.label, fields.map((f) => f.id)) }];
}

export function updateField(fields: TemplateField[], id: string, patch: Omit<TemplateField, 'id'>): TemplateField[] {
  return fields.map((f) => (f.id === id ? { ...patch, id: f.id } : f));
}

export function removeField(fields: TemplateField[], id: string): TemplateField[] {
  return fields.filter((f) => f.id !== id);
}

/** An edited list is only worth saving when something in it actually moved. */
export function isSameTemplate(a: TemplateField[], b: TemplateField[]): boolean {
  return a.length === b.length && a.every((f, i) => JSON.stringify(f) === JSON.stringify(b[i]));
}

/** The member's items that came from the group list, matched by id. */
export function takenFields(fields: TemplateField[], items: PlanItem[]): TemplateField[] {
  const mine = new Set(items.map((it) => it.id));
  return fields.filter((f) => mine.has(f.id));
}

/** The fields the member has no item for yet; the ones they already took keep their own edits. */
function missingFields(fields: TemplateField[], items: PlanItem[]): TemplateField[] {
  const mine = new Set(items.map((it) => it.id));
  return fields.filter((f) => !mine.has(f.id));
}

/**
 * "Pakai": the group's list takes over. The member's other items are dropped, but their stored
 * counts stay, so an item put back later picks up where it left off.
 */
export function applyReplace(plan: Plan, fields: TemplateField[], now: number): Plan {
  return { items: fields.map((f) => ({ ...toDraft(f), id: f.id })), at: now };
}

/** "Gabungkan": only the fields the member lacks arrive; their own items are untouched. */
export function applyMerge(plan: Plan, fields: TemplateField[], now: number): Plan {
  const added = missingFields(fields, plan.items).map((f) => ({ ...toDraft(f), id: f.id }));
  return added.length === 0 ? plan : { items: [...plan.items, ...added], at: now };
}
