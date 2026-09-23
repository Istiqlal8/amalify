import { expect, test } from '@jest/globals';

import { addDays, cycleStats, daysBetween, formatDay } from '../cycle';
import type { HaidLog } from '../haid';

const log = (periods: HaidLog['periods']): HaidLog => ({ periods, at: 1 });

test('test_daysBetween_acrossMonth', () => {
  expect(daysBetween('2026-08-28', '2026-09-02')).toBe(5);
});

test('test_addDays_intoNextMonth', () => {
  expect(addDays('2026-09-28', 5)).toBe('2026-10-03');
});

test('test_formatDay_indonesianMonth', () => {
  expect(formatDay('2026-08-05')).toBe('5 Agu');
});

test('test_cycleStats_singlePeriod_isNull', () => {
  expect(cycleStats(log([{ start: '2026-09-01', end: '2026-09-06' }]))).toBeNull();
});

test('test_cycleStats_twoStarts_predictsNext', () => {
  const stats = cycleStats(log([{ start: '2026-08-04', end: '2026-08-10' }, { start: '2026-09-01' }]));
  expect(stats).toEqual({ avgCycle: 28, avgLength: 7, nextStart: '2026-09-29' });
});

test('test_cycleStats_outlierGap_isIgnored', () => {
  const stats = cycleStats(log([{ start: '2026-05-01', end: '2026-05-06' }, { start: '2026-08-04', end: '2026-08-09' }, { start: '2026-09-01', end: '2026-09-06' }]));
  expect(stats?.avgCycle).toBe(28);
});

test('test_cycleStats_unsortedInput_sortsByStart', () => {
  const stats = cycleStats(log([{ start: '2026-09-01' }, { start: '2026-08-04', end: '2026-08-10' }]));
  expect(stats?.nextStart).toBe('2026-09-29');
});
