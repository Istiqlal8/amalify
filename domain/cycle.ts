import { dateKey } from './dayLog';
import type { HaidLog, Period } from './haid';

export type CycleStats = {
  /** Days from one start to the next, averaged. */
  avgCycle: number;
  /** Days bleeding, averaged over finished periods; null until one has finished. */
  avgLength: number | null;
  nextStart: string;
};

/** Cycles outside this range are almost always a missed or doubled entry, not a real cycle. */
const MIN_CYCLE = 15;
const MAX_CYCLE = 60;
const RECENT = 6;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function toUtc(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86400000);
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}

export function formatDay(day: string): string {
  const [, m, d] = day.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** Haid periods oldest first; nifas is left out since it is not part of the cycle. */
export function sortedPeriods(log: HaidLog): Period[] {
  return log.periods.filter((p) => !p.nifas).sort((a, b) => a.start.localeCompare(b.start));
}

function average(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** null while pregnant, and until two periods give a usable cycle. */
export function cycleStats(log: HaidLog): CycleStats | null {
  if (log.pregnant) return null;
  const periods = sortedPeriods(log).slice(-(RECENT + 1));
  const cycles = periods
    .slice(1)
    .map((p, i) => daysBetween(periods[i].start, p.start))
    .filter((n) => n >= MIN_CYCLE && n <= MAX_CYCLE);
  if (cycles.length === 0) return null;
  const lengths = periods.filter((p) => p.end).map((p) => daysBetween(p.start, p.end!) + 1);
  const avgCycle = average(cycles);
  return {
    avgCycle,
    avgLength: lengths.length ? average(lengths) : null,
    nextStart: addDays(periods[periods.length - 1].start, avgCycle),
  };
}
