import { expect, test } from '@jest/globals';

import { formatHijri, toHijri } from '../hijri';

test('test_toHijri_idulAdha1447_isTenthDzulhijjah', () => {
  expect(toHijri(new Date(2026, 4, 27))).toEqual({ day: 10, month: 12, year: 1447 });
});

test('test_toHijri_lateSeptember2026_isRabiulAkhir1448', () => {
  expect(toHijri(new Date(2026, 8, 26))).toMatchObject({ month: 4, year: 1448 });
});

test('test_formatHijri_ramadhan_namesMonth', () => {
  expect(formatHijri({ day: 1, month: 9, year: 1447 })).toBe('1 Ramadhan 1447 H');
});
