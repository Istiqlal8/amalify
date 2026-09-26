import { expect, test } from '@jest/globals';

import { doaCategory, doaOfDay, DOA_CATEGORIES, repeatCount } from '../doa';

test('test_repeatCount_threeTimes_returnsThree', () => {
  expect(repeatCount('Dibaca 3x')).toBe(3);
});

test('test_repeatCount_severalCounts_takesFirst', () => {
  expect(repeatCount('Dibaca 1x atau 10x di pagi hari, Dibaca 100x dalam sehari')).toBe(1);
});

test('test_repeatCount_noNotes_isOne', () => {
  expect(repeatCount(undefined)).toBe(1);
});

test('test_categories_allHaveArabicText', () => {
  expect(DOA_CATEGORIES.every((c) => c.items.length > 0 && c.items.every((d) => d.arabic && d.translation))).toBe(true);
});

test('test_doaCategory_unknownId_isUndefined', () => {
  expect(doaCategory('x')).toBeUndefined();
});

test('test_doaOfDay_sameDay_sameDoa', () => {
  expect(doaOfDay(new Date(2026, 8, 26, 5))).toBe(doaOfDay(new Date(2026, 8, 26, 23)));
});

test('test_doaOfDay_nextDay_changes', () => {
  expect(doaOfDay(new Date(2026, 8, 27))).not.toBe(doaOfDay(new Date(2026, 8, 26)));
});
