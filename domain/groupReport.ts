import { formatDay } from './cycle';

export type FieldKind = 'text' | 'number' | 'long';

/** One question a weekly report asks, as set by the group's creator. */
export type ReportField = { id: string; label: string; kind: FieldKind; unit: string };

/** A field's answer, carrying its own label so old reports survive format changes. */
export type ReportEntry = { label: string; kind: FieldKind; unit: string; value: string };

export type ReportDraft = { day: string; time: string; location: string; entries: ReportEntry[] };
export type GroupReport = ReportDraft & { id: string; createdBy: string | null };

export const KINDS: { id: FieldKind; label: string }[] = [
  { id: 'text', label: 'Teks' },
  { id: 'number', label: 'Angka' },
  { id: 'long', label: 'Catatan' },
];

export const MAX_FIELDS = 20;

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Answers for the current format, prefilled from `previous` by label. Earlier answers whose field
 * has since been removed are kept at the end, so editing an old report never drops them.
 */
export function entriesFor(fields: ReportField[], previous: ReportEntry[] = []): ReportEntry[] {
  const current = fields.map((f) => ({
    label: f.label,
    kind: f.kind,
    unit: f.unit,
    value: previous.find((e) => e.label === f.label)?.value ?? '',
  }));
  const dropped = previous.filter((e) => e.value.trim() && !fields.some((f) => f.label === e.label));
  return [...current, ...dropped];
}

export function newField(label: string, kind: FieldKind, unit: string, now: number): ReportField {
  return { id: `f${now.toString(36)}`, label: label.trim(), kind, unit: kind === 'number' ? unit.trim() : '' };
}

/** "Sabtu, 26 Sep 2026". */
export function reportDate(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return `${DAYS[new Date(y, m - 1, d).getDay()]}, ${formatDay(day)} ${y}`;
}

/** "12 halaman" for numbers with a unit, the plain value otherwise. */
export function entryText(e: ReportEntry): string {
  return e.kind === 'number' && e.unit ? `${e.value} ${e.unit}` : e.value;
}

/** Newest meeting first. */
export function sortReports(reports: GroupReport[]): GroupReport[] {
  return [...reports].sort((a, b) => `${b.day}${b.time}`.localeCompare(`${a.day}${a.time}`));
}

/** Plain text for sharing a report to WhatsApp or similar. */
export function reportShareText(r: ReportDraft, groupName: string): string {
  const lines = [`*Laporan pekanan ${groupName}*`, `${reportDate(r.day)} · ${r.time}`];
  if (r.location.trim()) lines.push(`Lokasi: ${r.location.trim()}`);
  lines.push('');
  for (const e of r.entries) if (e.value.trim()) lines.push(`${e.label}: ${entryText(e).trim()}`);
  return lines.join('\n');
}
