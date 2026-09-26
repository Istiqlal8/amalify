import { expect, test } from '@jest/globals';

import { cityLabel, countdown, monthsToLoad, todayOf, upcomingPrayers, type PrayerDay } from '../prayer';

const day = (date: string): PrayerDay => ({
  date, subuh: '04:35', dzuhur: '11:53', ashar: '15:11', maghrib: '17:56', isya: '19:01',
});
const days = [day('2026-09-23'), day('2026-09-24')];

test('test_upcomingPrayers_afternoon_startsWithAshar', () => {
  expect(upcomingPrayers(days, new Date(2026, 8, 23, 13, 0))[0].id).toBe('ashar');
});

test('test_upcomingPrayers_afterIsya_rollsToTomorrowSubuh', () => {
  const [next] = upcomingPrayers(days, new Date(2026, 8, 23, 20, 0));
  expect([next.id, next.at.getDate()]).toEqual(['subuh', 24]);
});

test('test_todayOf_matchesLocalDate', () => {
  expect(todayOf(days, new Date(2026, 8, 24, 9))?.date).toBe('2026-09-24');
});

test('test_countdown_hoursAndMinutes', () => {
  expect(countdown(new Date(2026, 8, 23, 13, 0), new Date(2026, 8, 23, 15, 11))).toBe('2 jam 11 menit');
});

test('test_countdown_underAMinute_saysSo', () => {
  expect(countdown(new Date(2026, 8, 23, 13, 0, 10), new Date(2026, 8, 23, 13, 0, 50))).toBe('kurang dari 1 menit');
});

test('test_monthsToLoad_december_rollsIntoNextYear', () => {
  expect(monthsToLoad(new Date(2026, 11, 20))).toEqual([{ year: 2026, month: 12 }, { year: 2027, month: 1 }]);
});

test('test_cityLabel_capitals_becomeTitleCase', () => {
  expect(cityLabel('KAB. BANDUNG BARAT')).toBe('Kab. Bandung Barat');
});
