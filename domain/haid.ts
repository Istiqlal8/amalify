import type { Care } from './care';
import { dateKey, resnapshot, type Logs } from './dayLog';
import type { DayNote } from './haidDay';
import type { PlanItem } from './plan';

/** Inclusive local dates `YYYY-MM-DD`; `end` is absent while the period is still going. `nifas` marks post-birth bleeding. */
export type Period = { start: string; end?: string; nifas?: true };

/**
 * `days`, `care`, `mandiDue` and `qadhaPaid` are absent in logs written before those existed.
 * `mandiDue` is the suci date while mandi wajib is still to be ticked; `qadhaPaid` counts
 * Ramadan fasts already made up, keyed by Hijri year.
 */
export type HaidLog = {
  periods: Period[];
  at: number;
  days?: Record<string, DayNote>;
  care?: Care;
  mandiDue?: string;
  qadhaPaid?: Record<string, number>;
  /** Set while pregnant: the date pregnancy mode began. Forecasts pause. */
  pregnant?: string;
};

export const EMPTY_HAID: HaidLog = { periods: [], at: 0 };

/** Sections that are set aside during haid. */
const PAUSED_SECTIONS = new Set(['sholat']);
/** Fasting may sit in any section, so it is recognised by name. */
const FASTING = /puasa|shaum|shiyam/i;

// Mazhab Syafi'i: haid lasts at most 15 days; blood beyond that is istihadah, when prayer is due
// again. A new haid needs at least 15 days of suci before it.
export const MAX_HAID_DAYS = 15;
export const MIN_SUCI_DAYS = 15;
/** Nifas lasts at most 60 days in the same mazhab. */
export const MAX_NIFAS_DAYS = 60;

export function maxDays(p: Period): number {
  return p.nifas ? MAX_NIFAS_DAYS : MAX_HAID_DAYS;
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + delta));
}

/** Last day that can count as haid: the end, capped at 15 days (60 for nifas). An open period runs to the cap. */
function lastHaidDay(p: Period): string {
  const cap = shiftDay(p.start, maxDays(p) - 1);
  return p.end !== undefined && p.end < cap ? p.end : cap;
}

/** Days past the 15-day limit are istihadah, so they are not haid days. */
export function isHaidDay(log: HaidLog, day: string): boolean {
  return log.periods.some((p) => p.start <= day && day <= lastHaidDay(p));
}

/** True once the open period has run past its limit (15 days, or 60 for nifas). */
export function isIstihadah(log: HaidLog, today: string): boolean {
  const open = openPeriod(log);
  return open !== undefined && dayOfPeriod(open, today) > maxDays(open);
}

export function startPregnancy(log: HaidLog, today: string, now: number): HaidLog {
  return { ...log, pregnant: today, at: now };
}

export function endPregnancy(log: HaidLog, now: number): HaidLog {
  return { ...log, pregnant: undefined, at: now };
}

/** After giving birth: pregnancy mode ends and nifas starts today. */
export function startNifas(log: HaidLog, today: string, now: number): HaidLog {
  if (openPeriod(log)) return { ...log, pregnant: undefined, at: now };
  return { ...log, pregnant: undefined, periods: [...log.periods, { start: today, nifas: true }], at: now };
}

/** Whole days of suci between the last finished period and today, or null with none finished. */
export function suciDays(log: HaidLog, today: string): number | null {
  const ends = log.periods.filter((p) => p.end !== undefined && p.end < today).map((p) => p.end!).sort();
  if (!ends.length) return null;
  return dayOfPeriod({ start: ends[ends.length - 1] }, today) - 2;
}

export function openPeriod(log: HaidLog): Period | undefined {
  return log.periods.find((p) => p.end === undefined);
}

export function startHaid(log: HaidLog, today: string, now: number): HaidLog {
  if (openPeriod(log)) return log;
  return { ...log, periods: [...log.periods, { start: today }], at: now };
}

/** Closes the open period at yesterday, so today's prayers count again. Started today → removed. */
export function endHaid(log: HaidLog, today: string, now: number): HaidLog {
  const yesterday = shiftDay(today, -1);
  const periods = log.periods
    .map((p) => (p.end === undefined ? { ...p, end: yesterday } : p))
    .filter((p) => p.end === undefined || p.start <= p.end);
  const kept = periods.length === log.periods.length;
  return { ...log, periods, at: now, mandiDue: kept ? today : log.mandiDue };
}

export function doneMandi(log: HaidLog, now: number): HaidLog {
  return { ...log, mandiDue: undefined, at: now };
}

/**
 * Moves the open period's start, e.g. when haid began before it was marked. Refused when the
 * new start is in the future or would overlap the previous period.
 */
export function setOpenStart(log: HaidLog, start: string, today: string, now: number): HaidLog {
  const open = openPeriod(log);
  if (!open || start > today) return log;
  const clash = log.periods.some((p) => p !== open && p.end !== undefined && p.end >= start);
  if (clash) return log;
  return { ...log, periods: log.periods.map((p) => (p === open ? { ...p, start } : p)), at: now };
}

/** The earliest allowed start for the open period: the day after the previous one ended. */
export function earliestStart(log: HaidLog): string | null {
  const ends = log.periods.filter((p) => p.end !== undefined).map((p) => p.end!).sort();
  return ends.length ? shiftDay(ends[ends.length - 1], 1) : null;
}

/** Adds a finished period from the past. Refused when it runs backwards, reaches past today or overlaps another. */
export function addPeriod(log: HaidLog, start: string, end: string, today: string, now: number): HaidLog {
  if (start > end || end > today) return log;
  const clash = log.periods.some((p) => p.start <= end && (p.end === undefined || p.end >= start));
  if (clash) return log;
  return { ...log, periods: [...log.periods, { start, end }], at: now };
}

export function removePeriod(log: HaidLog, start: string, now: number): HaidLog {
  return { ...log, periods: log.periods.filter((p) => p.start !== start), at: now };
}

/** 1 on the first day of the current period. */
export function dayOfPeriod(period: Period, today: string): number {
  const [a, b] = [period.start, today].map((d) => {
    const [y, m, dd] = d.split('-').map(Number);
    return Date.UTC(y, m - 1, dd);
  });
  return Math.round((b - a) / 86400000) + 1;
}

/** On a haid day prayers and fasting drop out, so the day is scored without them. */
export function itemsForDay(items: PlanItem[], haid: boolean): PlanItem[] {
  return haid ? items.filter((it) => !PAUSED_SECTIONS.has(it.section) && !FASTING.test(it.label)) : items;
}

export function isPausedSection(section: string): boolean {
  return PAUSED_SECTIONS.has(section);
}

export function newerHaid(a: HaidLog, b: HaidLog | undefined): HaidLog {
  return b && b.at > a.at ? b : a;
}

/**
 * After periods change (a start moved, one deleted), re-scores every past day whose haid status
 * flipped, so its plant matches. Today is left to the live refresh.
 */
export function restampHaidChange(logs: Logs, before: HaidLog, after: HaidLog, items: PlanItem[], today: string): Logs {
  const from = [...before.periods, ...after.periods].map((p) => p.start).sort()[0];
  let next = logs;
  for (let day = from; day && day < today; day = shiftDay(day, 1)) {
    if (isHaidDay(before, day) !== isHaidDay(after, day)) {
      next = resnapshot(next, day, itemsForDay(items, isHaidDay(after, day)));
    }
  }
  return next;
}
