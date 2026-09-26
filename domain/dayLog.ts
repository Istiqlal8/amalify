import type { PlanItem } from './plan';

/**
 * Units done per item id (a checklist item is 0 or 1), plus the day's percentage as of the last
 * edit, so later plan changes do not rewrite how past days grew.
 */
export type DayEntry = { counts: Record<string, number>; at: number; percent?: number };

/** Keyed by local date, `YYYY-MM-DD`. */
export type Logs = Record<string, DayEntry>;

/** Entries written before counted items existed stored a `done` array of ids. */
type LegacyEntry = { done: string[]; at: number };

export function migrateLogs(raw: Record<string, DayEntry | LegacyEntry>): Logs {
  const logs: Logs = {};
  for (const [day, entry] of Object.entries(raw)) {
    logs[day] = 'counts' in entry ? entry : { counts: Object.fromEntries(entry.done.map((id) => [id, 1])), at: entry.at };
  }
  return logs;
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function lastDays(count: number, today: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (count - 1 - i));
    return dateKey(d);
  });
}

export function setCount(logs: Logs, day: string, id: string, value: number, now: number, items: PlanItem[]): Logs {
  const counts = { ...logs[day]?.counts, [id]: Math.max(0, value) };
  const entry: DayEntry = { counts, at: now };
  return { ...logs, [day]: { ...entry, percent: dayPercent(entry, items) } };
}

export function countOf(entry: DayEntry | undefined, id: string): number {
  return entry?.counts[id] ?? 0;
}

export function dayPercent(entry: DayEntry | undefined, items: PlanItem[]): number {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, it) => acc + Math.min(countOf(entry, it.id) / it.target, 1), 0);
  return Math.round((sum / items.length) * 100);
}

/** Refreshes a day's stored percentage after the items that count for it change (e.g. haid marked). */
export function resnapshot(logs: Logs, day: string, items: PlanItem[]): Logs {
  const entry = logs[day];
  if (!entry) return logs;
  const percent = dayPercent(entry, items);
  return percent === entry.percent ? logs : { ...logs, [day]: { ...entry, percent } };
}

/** Past days keep the percentage they were recorded with; entries from before that was stored fall back to the current plan. */
export function pastPercent(entry: DayEntry | undefined, items: PlanItem[]): number {
  return entry?.percent ?? dayPercent(entry, items);
}

/** Per day, the most recently edited entry wins, so an un-check on one device is not undone by another. */
export function mergeLogs(a: Logs, b: Logs): Logs {
  const merged: Logs = { ...a };
  for (const [day, entry] of Object.entries(b)) {
    const mine = merged[day];
    if (!mine || entry.at > mine.at) merged[day] = entry;
  }
  return merged;
}

/** A day counts towards a streak once anything was done. */
export function hasProgress(entry: DayEntry | undefined): boolean {
  return Object.values(entry?.counts ?? {}).some((n) => n > 0);
}

export function streak(logs: Logs, today: Date = new Date()): number {
  let count = 0;
  const d = new Date(today);
  if (!hasProgress(logs[dateKey(d)])) d.setDate(d.getDate() - 1);
  while (hasProgress(logs[dateKey(d)])) {
    count += 1;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
