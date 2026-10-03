import type { SectionId } from '@/domain/amalan';
import type { Cadence } from '@/domain/cadence';
import type { TemplateField } from '@/domain/groupTemplate';

/** One row of the admin's editor, kept as strings while it is being typed. */
export type FieldDraft = {
  /** Null while the row is new; a saved row keeps its id so members stay matched to it. */
  id: string | null;
  label: string;
  section: SectionId;
  kind: 'check' | 'count';
  target: string;
  unit: string;
  cadence: Cadence;
};

export const EMPTY_DRAFT: Omit<FieldDraft, 'section'> = {
  id: null,
  label: '',
  kind: 'check',
  target: '1',
  unit: '',
  cadence: 'harian',
};

export const SECTION_OPTIONS: { id: SectionId; label: string }[] = [
  { id: 'sholat', label: 'Sholat' },
  { id: 'quran', label: 'Quran & Dzikir' },
  { id: 'kebaikan', label: 'Kebaikan' },
];

export const KIND_OPTIONS: { id: 'check' | 'count'; label: string }[] = [
  { id: 'check', label: 'Centang' },
  { id: 'count', label: 'Hitung' },
];

export function draftOf(field: TemplateField): FieldDraft {
  return {
    id: field.id,
    label: field.label,
    section: field.section,
    kind: field.kind,
    target: String(field.target),
    unit: field.unit,
    cadence: field.cadence,
  };
}

/** The line under each saved row, so the admin can see a counted amalan's target at a glance. */
export function fieldSummary(field: TemplateField): string {
  const section = SECTION_OPTIONS.find((s) => s.id === field.section)?.label ?? '';
  return field.kind === 'count' ? `${section} · ${field.target} ${field.unit}` : section;
}
