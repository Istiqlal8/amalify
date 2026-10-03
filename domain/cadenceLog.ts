import { dayPercent, type DayEntry } from './dayLog';
import type { PlanItem } from './plan';

/** Keyed by `cadenceKey`: one entry per bucket, shaped exactly like a day's. */
export type CadenceLogs = Record<string, DayEntry>;

/** A bucket is scored by the same rule as a day, read under its own name. */
export { dayPercent as cadencePercent } from './dayLog';

export function setCadenceCount(
  logs: CadenceLogs,
  key: string,
  id: string,
  value: number,
  now: number,
  items: PlanItem[],
): CadenceLogs {
  const counts = { ...logs[key]?.counts, [id]: Math.max(0, value) };
  const entry: DayEntry = { counts, at: now };
  return { ...logs, [key]: { ...entry, percent: dayPercent(entry, items) } };
}

/** Per bucket, the most recently edited entry wins, as with days. */
export function mergeCadenceLogs(a: CadenceLogs, b: CadenceLogs): CadenceLogs {
  const merged: CadenceLogs = { ...a };
  for (const [key, entry] of Object.entries(b)) {
    const mine = merged[key];
    if (!mine || entry.at > mine.at) merged[key] = entry;
  }
  return merged;
}
