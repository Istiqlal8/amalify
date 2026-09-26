import { expect, test } from '@jest/globals';

import { ayahFor, MOODS } from '../mood';

const sedih = MOODS.find((m) => m.id === 'sedih')!;

test('test_ayahFor_sameDay_returnsSameAyah', () => {
  expect(ayahFor(sedih, new Date(2026, 8, 26, 7))).toEqual(ayahFor(sedih, new Date(2026, 8, 26, 22)));
});

test('test_ayahFor_nextDay_returnsNextAyah', () => {
  const today = sedih.ayat.indexOf(ayahFor(sedih, new Date(2026, 8, 26)));
  expect(ayahFor(sedih, new Date(2026, 8, 27))).toEqual(sedih.ayat[(today + 1) % sedih.ayat.length]);
});
