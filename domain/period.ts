import { dateKey } from './dayLog';

export type Period = 'hari' | 'minggu' | 'bulan';

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'hari', label: 'Hari ini' },
  { id: 'minggu', label: 'Minggu ini' },
  { id: 'bulan', label: 'Bulan ini' },
];

/** Inclusive day range ending today; weeks start on Monday. */
export function periodRange(period: Period, today: string): { from: string; to: string } {
  const [y, m, d] = today.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  if (period === 'minggu') start.setDate(d - ((start.getDay() + 6) % 7));
  if (period === 'bulan') start.setDate(1);
  return { from: dateKey(start), to: today };
}
