import { isHaidDay, type HaidLog } from './haid';

/**
 * Ramadan by Hijri year, inclusive local dates. 1444–1446 follow the Kemenag isbat; later years
 * are hisab estimates (Umm al-Qura + 1 day, as Indonesia usually starts a day later) and should
 * be checked against each year's isbat.
 */
export const RAMADAN: { year: string; start: string; end: string }[] = [
  { year: '1444', start: '2023-03-23', end: '2023-04-21' },
  { year: '1445', start: '2024-03-12', end: '2024-04-09' },
  { year: '1446', start: '2025-03-01', end: '2025-03-30' },
  { year: '1447', start: '2026-02-19', end: '2026-03-20' },
  { year: '1448', start: '2027-02-09', end: '2027-03-09' },
  { year: '1449', start: '2028-01-29', end: '2028-02-26' },
];

export type Qadha = { year: string; owed: number; paid: number; left: number };

function nextDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

/** Ramadan fasts missed to haid, per year, with how many are made up. Years with none are left out. */
export function qadhaPuasa(log: HaidLog, today: string): Qadha[] {
  return RAMADAN.flatMap(({ year, start, end }) => {
    let owed = 0;
    for (let day = start; day <= end && day <= today; day = nextDay(day)) {
      if (isHaidDay(log, day)) owed++;
    }
    const paid = Math.min(log.qadhaPaid?.[year] ?? 0, owed);
    return owed > 0 ? [{ year, owed, paid, left: owed - paid }] : [];
  });
}

/** Records how many of a year's missed fasts are made up. */
export function setQadhaPaid(log: HaidLog, year: string, paid: number, now: number): HaidLog {
  return { ...log, qadhaPaid: { ...log.qadhaPaid, [year]: Math.max(0, paid) }, at: now };
}
