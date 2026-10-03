import { expect, test } from '@jest/globals';

import { cadenceKey, cadenceLabel, cadenceOf, cadenceRange, isDaily } from '../cadence';

test('test_cadenceOf_missingField_isHarian', () => {
  expect([cadenceOf({}), isDaily({}), isDaily({ cadence: 'mingguan' as const })]).toEqual(['harian', true, false]);
});

test('test_cadenceLabel_threeMonths_isIndonesian', () => {
  expect(cadenceLabel('3bulan')).toBe('3 bulan');
});

test('test_cadenceKey_harian_isTheDay', () => {
  expect(cadenceKey('harian', '2026-09-23')).toBe('harian:2026-09-23');
});

test('test_cadenceKey_mingguan_wednesdayAndSunday_shareAWeek', () => {
  expect(cadenceKey('mingguan', '2026-09-23')).toBe(cadenceKey('mingguan', '2026-09-27'));
});

test('test_cadenceKey_mingguan_monday_startsANewWeek', () => {
  expect([cadenceKey('mingguan', '2026-09-27'), cadenceKey('mingguan', '2026-09-28')]).toEqual([
    'mingguan:2026-W39',
    'mingguan:2026-W40',
  ]);
});

test('test_cadenceKey_mingguan_newYearsDayOnFriday_staysInLastYearsWeek53', () => {
  expect(cadenceKey('mingguan', '2027-01-01')).toBe('mingguan:2026-W53');
});

test('test_cadenceKey_mingguan_januaryThirdOnSunday_staysInWeek53', () => {
  expect(cadenceKey('mingguan', '2016-01-03')).toBe('mingguan:2015-W53');
});

test('test_cadenceKey_mingguan_newYearsDayOnThursday_isWeek1', () => {
  expect(cadenceKey('mingguan', '2026-01-01')).toBe('mingguan:2026-W01');
});

test('test_cadenceKey_bulanan_isYearAndMonth', () => {
  expect(cadenceKey('bulanan', '2026-09-30')).toBe('bulanan:2026-09');
});

test('test_cadenceKey_threeMonths_anchorsOnCalendarQuarters', () => {
  expect([cadenceKey('3bulan', '2026-07-01'), cadenceKey('3bulan', '2026-09-30'), cadenceKey('3bulan', '2026-10-01')]).toEqual([
    '3bulan:2026-07',
    '3bulan:2026-07',
    '3bulan:2026-10',
  ]);
});

test('test_cadenceKey_fiveMonths_anchorsOnJanuary2000', () => {
  expect([cadenceKey('5bulan', '2026-04-01'), cadenceKey('5bulan', '2026-08-31'), cadenceKey('5bulan', '2026-09-01')]).toEqual([
    '5bulan:2026-04',
    '5bulan:2026-04',
    '5bulan:2026-09',
  ]);
});

test('test_cadenceKey_fiveMonths_acrossYearEnd_keepsOneBucket', () => {
  expect(cadenceKey('5bulan', '2027-01-31')).toBe(cadenceKey('5bulan', '2026-12-01'));
});

test('test_cadenceRange_mingguan_isMondayToSunday', () => {
  expect(cadenceRange('mingguan', 'mingguan:2026-W39')).toEqual({ from: '2026-09-21', to: '2026-09-27' });
});

test('test_cadenceRange_mingguan_week1_startsInPreviousYear', () => {
  expect(cadenceRange('mingguan', 'mingguan:2026-W01')).toEqual({ from: '2025-12-29', to: '2026-01-04' });
});

test('test_cadenceRange_bulanan_coversTheWholeMonth', () => {
  expect(cadenceRange('bulanan', 'bulanan:2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
});

test('test_cadenceRange_threeMonths_endsOnTheLastDayOfTheQuarter', () => {
  expect(cadenceRange('3bulan', '3bulan:2026-07')).toEqual({ from: '2026-07-01', to: '2026-09-30' });
});

test('test_cadenceRange_fiveMonths_acrossYearEnd_endsInTheNextYear', () => {
  expect(cadenceRange('5bulan', '5bulan:2026-09')).toEqual({ from: '2026-09-01', to: '2027-01-31' });
});

test('test_cadenceRange_everyDayOfAWeek_mapsBackToItsOwnRange', () => {
  for (const day of ['2026-09-21', '2026-09-24', '2026-09-27']) {
    const { from, to } = cadenceRange('mingguan', cadenceKey('mingguan', day));
    expect(from <= day && day <= to).toBe(true);
  }
});
