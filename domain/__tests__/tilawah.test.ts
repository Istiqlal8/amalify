import { expect, test } from '@jest/globals';

import { addSession, EMPTY_TILAWAH, khatamCount, nextStart, pageOf, pagesBetween, removeSession, type TilawahSession } from '../tilawah';

const session = (id: string, from: [number, number], to: [number, number], at: number): TilawahSession => ({
  id, day: '2026-09-23', from: { surah: from[0], ayah: from[1] }, to: { surah: to[0], ayah: to[1] }, pages: 1, at,
});

test('test_pageOf_fatihah_isPageOne', () => {
  expect(pageOf({ surah: 1, ayah: 7 })).toBe(1);
});

test('test_pageOf_baqarah6_isPageThree', () => {
  expect(pageOf({ surah: 2, ayah: 6 })).toBe(3);
});

test('test_pageOf_anNas_isLastPage', () => {
  expect(pageOf({ surah: 114, ayah: 6 })).toBe(604);
});

test('test_pagesBetween_samePage_isOne', () => {
  expect(pagesBetween({ surah: 2, ayah: 6 }, { surah: 2, ayah: 16 })).toBe(1);
});

test('test_pagesBetween_backwards_isNull', () => {
  expect(pagesBetween({ surah: 2, ayah: 10 }, { surah: 2, ayah: 5 })).toBeNull();
});

test('test_pagesBetween_ayahOutOfRange_isNull', () => {
  expect(pagesBetween({ surah: 1, ayah: 1 }, { surah: 1, ayah: 8 })).toBeNull();
});

test('test_nextStart_endOfSurah_movesToNext', () => {
  expect(nextStart(addSession(EMPTY_TILAWAH, session('a', [1, 1], [1, 7], 1), 1))).toEqual({ surah: 2, ayah: 1 });
});

test('test_nextStart_afterKhatam_wrapsToFatihah', () => {
  expect(nextStart(addSession(EMPTY_TILAWAH, session('a', [114, 1], [114, 6], 1), 1))).toEqual({ surah: 1, ayah: 1 });
});

test('test_khatamCount_countsEndingSessions', () => {
  expect(khatamCount(addSession(EMPTY_TILAWAH, session('a', [110, 1], [114, 6], 1), 1))).toBe(1);
});

test('test_removeSession_fallsBackToPreviousLastRead', () => {
  const log = addSession(addSession(EMPTY_TILAWAH, session('a', [2, 1], [2, 5], 1), 1), session('b', [2, 6], [2, 20], 2), 2);
  expect(nextStart(removeSession(log, 'b', 3))).toEqual({ surah: 2, ayah: 6 });
});
