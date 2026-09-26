import { expect, test } from '@jest/globals';

import type { PrayerDay } from '../prayer';
import { prayersDueOnSuci } from '../suciPrayers';

const day: PrayerDay = { date: '2026-09-26', subuh: '04:22', dzuhur: '11:45', ashar: '14:54', maghrib: '17:52', isya: '18:57' };
const at = (h: number, m: number) => new Date(2026, 8, 26, h, m);

test('test_prayersDueOnSuci_duringAshar_dzuhurAndAshar', () => {
  expect(prayersDueOnSuci(day, at(15, 30))).toEqual(['dzuhur', 'ashar']);
});

test('test_prayersDueOnSuci_beforeSubuh_maghribAndIsya', () => {
  expect(prayersDueOnSuci(day, at(3, 0))).toEqual(['maghrib', 'isya']);
});

test('test_prayersDueOnSuci_duringMaghrib_onlyMaghrib', () => {
  expect(prayersDueOnSuci(day, at(18, 10))).toEqual(['maghrib']);
});
