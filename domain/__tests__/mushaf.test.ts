import { expect, test } from '@jest/globals';

import { groupLines, isCenteredLine } from '../mushaf';

const w = (line: number, surah: number, ayah: number, end = false) => ({
  line,
  word: { code1: 'x', code2: 'y', surah, ayah, end },
});

test('test_groupLines_wordsOnSameLine_shareOneLine', () => {
  expect(groupLines([w(3, 2, 1), w(3, 2, 1, true), w(4, 2, 2)]).map((l) => l.words.length)).toEqual([2, 1]);
});

test('test_groupLines_lineOpeningAyahOne_marksSurahStart', () => {
  expect(groupLines([w(9, 113, 5, true), w(10, 114, 1)]).map((l) => l.surahStart)).toEqual([null, 114]);
});

test('test_groupLines_secondLineOfAyahOne_isNotASurahStart', () => {
  expect(groupLines([w(3, 2, 1), w(4, 2, 1)]).map((l) => l.surahStart)).toEqual([2, null]);
});

test('test_isCenteredLine_firstPages_areCentered', () => {
  expect(isCenteredLine(2, 7)).toBe(true);
});

test('test_isCenteredLine_ordinaryLine_isJustified', () => {
  expect(isCenteredLine(3, 7)).toBe(false);
});

test('test_isCenteredLine_anNasLastLine_isCentered', () => {
  expect(isCenteredLine(604, 15)).toBe(true);
});
