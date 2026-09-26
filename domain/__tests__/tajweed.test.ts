import { expect, test } from '@jest/globals';

import { joinSegments, parseTajweed } from '../tajweed';

const IKHLAS_1 = 'قُلْ هُوَ <tajweed class=ham_wasl>ٱ</tajweed>للَّهُ أَحَ<tajweed class=qalaqah>د</tajweed>ٌ <span class=end>١</span>';

test('test_parseTajweed_taggedLetters_getTheirRule', () => {
  const rules = parseTajweed(IKHLAS_1).filter((s) => s.rule).map((s) => [s.text, s.rule]);
  expect(rules).toEqual([['ٱ', 'silent'], ['د', 'qalqalah']]);
});

test('test_parseTajweed_ayahNumberSpan_isDropped', () => {
  expect(parseTajweed(IKHLAS_1).map((s) => s.text).join('')).toBe('قُلْ هُوَ ٱللَّهُ أَحَدٌ ');
});

test('test_parseTajweed_plainText_isOneUncolouredRun', () => {
  expect(parseTajweed('قُلْ')).toEqual([{ text: 'قُلْ', rule: null }]);
});

test('test_joinSegments_midWordBoundary_getsJoinersBothSides', () => {
  const joined = joinSegments([{ text: 'أَحَ', rule: null }, { text: 'د', rule: 'qalqalah' }]);
  expect(joined.map((s) => s.text)).toEqual(['أَحَ\u200D', '\u200Dد']);
});

test('test_joinSegments_boundaryAtSpace_isLeftAlone', () => {
  const joined = joinSegments([{ text: 'هُوَ ', rule: null }, { text: 'ٱ', rule: 'silent' }]);
  expect(joined.map((s) => s.text)).toEqual(['هُوَ ', 'ٱ']);
});

test('test_parseTajweed_wordRuleTag_isParsedLikeTajweedTag', () => {
  expect(parseTajweed('أَحَ<rule class=qalaqah>د</rule>ٌ')).toEqual([
    { text: 'أَحَ', rule: null },
    { text: 'د', rule: 'qalqalah' },
    { text: 'ٌ', rule: null },
  ]);
});

test('test_parseTajweed_nestedHyphenatedClass_takesKnownOuterRule', () => {
  const markup = 'ذ<rule class=madda_normal><rule class=custom-alef-maksora>ٰ</rule></rule>لِكَ';
  expect(parseTajweed(markup)).toEqual([
    { text: 'ذ', rule: null },
    { text: 'ٰ', rule: 'mad' },
    { text: 'لِكَ', rule: null },
  ]);
});

test('test_parseTajweed_unlistedMaddaVariant_isMad', () => {
  expect(parseTajweed('<rule class=madda_obligatory_mottasel>آ</rule>')).toEqual([{ text: 'آ', rule: 'mad' }]);
});
