import { atClock, type PrayerDay, type PrayerId } from './prayer';

/**
 * Prayers that become due when haid ends at `now`, per mazhab Syafi'i: suci within Ashar also
 * makes Dzuhur due, and suci within Isya (up to Subuh) also makes Maghrib due, since each pair
 * can be joined. Suci within Subuh only counts before sunrise, which the schedule does not carry,
 * so Subuh is returned for the whole Subuh–Dzuhur stretch and the caller says so.
 */
export function prayersDueOnSuci(day: PrayerDay, now: Date): PrayerId[] {
  const at = (id: PrayerId) => atClock(day.date, day[id]).getTime();
  const t = now.getTime();
  if (t < at('subuh')) return ['maghrib', 'isya'];
  if (t < at('dzuhur')) return ['subuh'];
  if (t < at('ashar')) return ['dzuhur'];
  if (t < at('maghrib')) return ['dzuhur', 'ashar'];
  if (t < at('isya')) return ['maghrib'];
  return ['maghrib', 'isya'];
}
