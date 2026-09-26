import { dateKey } from './dayLog';
import type { Clock } from './reminders';

export type PrayerId = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

/** One day of the Kemenag schedule, keyed by local date `YYYY-MM-DD`. */
export type PrayerDay = { date: string } & Record<PrayerId, Clock>;

export type City = { id: string; name: string };

export type NextPrayer = { id: PrayerId; name: string; at: Date };

export const PRAYERS: { id: PrayerId; name: string }[] = [
  { id: 'subuh', name: 'Subuh' },
  { id: 'dzuhur', name: 'Dzuhur' },
  { id: 'ashar', name: 'Ashar' },
  { id: 'maghrib', name: 'Maghrib' },
  { id: 'isya', name: 'Isya' },
];

export function atClock(date: string, clock: Clock): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = clock.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

/** Every prayer time from now on, in order. */
export function upcomingPrayers(days: PrayerDay[], now: Date): NextPrayer[] {
  return days
    .flatMap((day) => PRAYERS.map((p) => ({ id: p.id, name: p.name, at: atClock(day.date, day[p.id]) })))
    .filter((p) => p.at.getTime() > now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}

export function todayOf(days: PrayerDay[], now: Date): PrayerDay | undefined {
  const key = dateKey(now);
  return days.find((d) => d.date === key);
}

/** "2 jam 5 menit", "40 menit", "kurang dari 1 menit". */
export function countdown(from: Date, to: Date): string {
  const minutes = Math.floor((to.getTime() - from.getTime()) / 60000);
  if (minutes < 1) return 'kurang dari 1 menit';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 ? `${h} jam` : '', m > 0 ? `${m} menit` : ''].filter(Boolean).join(' ');
}

/** Year and month of `now` and the month after, so a week of reminders never runs off the end. */
export function monthsToLoad(now: Date): { year: number; month: number }[] {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return [
    { year: now.getFullYear(), month: now.getMonth() + 1 },
    { year: next.getFullYear(), month: next.getMonth() + 1 },
  ];
}

/** The API sends names in capitals ("KOTA BANDUNG"); shown as "Kota Bandung". */
export function cityLabel(name: string): string {
  return name.toLowerCase().replace(/(^|[\s.(-])(\S)/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}
