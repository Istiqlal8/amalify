import { expect, test } from '@jest/globals';

import { audioUrl, ayahAt, cycleRepeat, formatTime, initials, nextSurah, previousSurah, reciterById } from '../murottal';

test('test_audioUrl_padsSurahToThreeDigits', () => {
  expect(audioUrl(reciterById('01'), 2)).toBe('https://cdn.equran.id/audio-full/Abdullah-Al-Juhany/002.mp3');
});

test('test_reciterById_unknownId_fallsBackToDefault', () => {
  expect(reciterById('99').id).toBe('05');
});

test('test_nextSurah_off_advances', () => {
  expect(nextSurah(1, 'off')).toBe(2);
});

test('test_nextSurah_offAtAnNas_stops', () => {
  expect(nextSurah(114, 'off')).toBeNull();
});

test('test_nextSurah_allAtAnNas_wrapsToFatihah', () => {
  expect(nextSurah(114, 'all')).toBe(1);
});

test('test_nextSurah_one_repeatsSame', () => {
  expect(nextSurah(18, 'one')).toBe(18);
});

test('test_previousSurah_fatihah_wrapsToAnNas', () => {
  expect(previousSurah(1)).toBe(114);
});

test('test_cycleRepeat_goesOffAllOneOff', () => {
  expect([cycleRepeat('off'), cycleRepeat('all'), cycleRepeat('one')]).toEqual(['all', 'one', 'off']);
});

test('test_initials_skipsArticle', () => {
  expect(initials('Misyari Rasyid Al-Afasi')).toBe('MA');
});

test('test_formatTime_underAnHour_isMinutesSeconds', () => {
  expect(formatTime(65.9)).toBe('1:05');
});

test('test_formatTime_overAnHour_hasHours', () => {
  expect(formatTime(3725)).toBe('1:02:05');
});

test('test_audioUrl_unpaddedReciter_usesBareNumber', () => {
  expect(audioUrl(reciterById('husary-muallim'), 2)).toBe('https://download.quranicaudio.com/qdc/khalil_al_husary/muallim/2.mp3');
});

const TIMINGS = [
  { ayah: 1, from: 0, to: 6090 },
  { ayah: 2, from: 6090, to: 11680 },
  { ayah: 3, from: 11680, to: 16300 },
];

test('test_ayahAt_midSecondAyah_isTwo', () => {
  expect(ayahAt(TIMINGS, 8000)).toBe(2);
});

test('test_ayahAt_exactBoundary_isNextAyah', () => {
  expect(ayahAt(TIMINGS, 11680)).toBe(3);
});

test('test_ayahAt_beforeFirstStart_isFirst', () => {
  expect(ayahAt([{ ayah: 1, from: 3080, to: 9000 }], 500)).toBe(1);
});

test('test_ayahAt_noTimings_isNull', () => {
  expect(ayahAt([], 500)).toBeNull();
});
