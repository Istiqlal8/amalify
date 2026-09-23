import { expect, test } from '@jest/globals';

import { periodRange } from '../period';

test('test_periodRange_hari_isTodayOnly', () => {
  expect(periodRange('hari', '2026-09-23')).toEqual({ from: '2026-09-23', to: '2026-09-23' });
});

test('test_periodRange_mingguOnWednesday_startsMonday', () => {
  expect(periodRange('minggu', '2026-09-23').from).toBe('2026-09-21');
});

test('test_periodRange_mingguOnSunday_startsPreviousMonday', () => {
  expect(periodRange('minggu', '2026-09-27').from).toBe('2026-09-21');
});

test('test_periodRange_mingguAcrossMonth_startsInPreviousMonth', () => {
  expect(periodRange('minggu', '2026-10-01').from).toBe('2026-09-28');
});

test('test_periodRange_bulan_startsOnFirst', () => {
  expect(periodRange('bulan', '2026-09-23').from).toBe('2026-09-01');
});
