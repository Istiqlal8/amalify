import { dateKey } from './dayLog';

/** How often an amalan comes round. `harian` is the daily plan; the rest keep a bucket of their own. */
export type Cadence = 'harian' | 'mingguan' | 'bulanan' | '3bulan' | '5bulan';

export const CADENCES: { id: Cadence; label: string }[] = [
  { id: 'harian', label: 'Harian' },
  { id: 'mingguan', label: 'Mingguan' },
  { id: 'bulanan', label: 'Bulanan' },
  { id: '3bulan', label: '3 bulan' },
  { id: '5bulan', label: '5 bulan' },
];

/** The cadences with a bucket and a tree of their own, in the order they are shown. */
export const LONG_CADENCES: Cadence[] = ['mingguan', 'bulanan', '3bulan', '5bulan'];

const MONTH_SPAN: Record<Cadence, number> = { harian: 0, mingguan: 0, bulanan: 1, '3bulan': 3, '5bulan': 5 };

// Multi-month buckets are counted from January 2000, so a bucket always covers the same months no
// matter when the item was made; with that anchor the 3-month ones fall on the calendar quarters.
const EPOCH_YEAR = 2000;
const DAY_MS = 86400000;

/** Items stored before cadences existed have no field, so they are daily. */
export function cadenceOf(item: { cadence?: Cadence }): Cadence {
  return item.cadence ?? 'harian';
}

export function isDaily(item: { cadence?: Cadence }): boolean {
  return cadenceOf(item) === 'harian';
}

export function cadenceLabel(cadence: Cadence): string {
  return CADENCES.find((c) => c.id === cadence)?.label ?? cadence;
}

function monthIndex(day: string): number {
  const [y, m] = day.split('-').map(Number);
  return (y - EPOCH_YEAR) * 12 + (m - 1);
}

function monthValue(index: number): string {
  const year = EPOCH_YEAR + Math.floor(index / 12);
  const month = ((index % 12) + 12) % 12;
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/** The Thursday of a date's week; it decides which year an ISO week belongs to. */
function toThursday(d: Date): Date {
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  return thursday;
}

/** ISO week `YYYY-Www`; weeks start on Monday, as in `period.ts`. */
function weekValue(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const thursday = toThursday(new Date(Date.UTC(y, m - 1, d)));
  const year = thursday.getUTCFullYear();
  const first = toThursday(new Date(Date.UTC(year, 0, 4)));
  const week = 1 + Math.round((thursday.getTime() - first.getTime()) / (7 * DAY_MS));
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Monday of an ISO week, as a local date. */
function weekStart(value: string): Date {
  const [year, week] = value.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  return new Date(year, 0, 4 - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);
}

/** The bucket a day belongs to, e.g. `mingguan:2026-W39` or `3bulan:2026-07`. */
export function cadenceKey(cadence: Cadence, day: string): string {
  if (cadence === 'harian') return `harian:${day}`;
  if (cadence === 'mingguan') return `mingguan:${weekValue(day)}`;
  const span = MONTH_SPAN[cadence];
  return `${cadence}:${monthValue(Math.floor(monthIndex(day) / span) * span)}`;
}

/** Inclusive first and last day of a bucket, for the range shown on its card. */
export function cadenceRange(cadence: Cadence, key: string): { from: string; to: string } {
  const value = key.slice(key.indexOf(':') + 1);
  if (cadence === 'harian') return { from: value, to: value };
  if (cadence === 'mingguan') {
    const start = weekStart(value);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return { from: dateKey(start), to: dateKey(end) };
  }
  const [y, m] = value.split('-').map(Number);
  return { from: dateKey(new Date(y, m - 1, 1)), to: dateKey(new Date(y, m - 1 + MONTH_SPAN[cadence], 0)) };
}
