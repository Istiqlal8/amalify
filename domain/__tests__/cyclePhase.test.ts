import { expect, test } from '@jest/globals';

import { dayMark, forecast, phaseOn } from '../cyclePhase';
import type { HaidLog } from '../haid';

const log: HaidLog = { periods: [{ start: '2026-08-04', end: '2026-08-08' }, { start: '2026-09-01', end: '2026-09-05' }], at: 1 };
const f = forecast(log)!;

test('test_forecast_onePeriod_isNull', () => {
  expect(forecast({ periods: [{ start: '2026-09-01' }], at: 1 })).toBeNull();
});

test('test_phaseOn_ovulationDay_isOvulasi', () => {
  // 28-day cycle from 1 Sep: ovulation 14 days before 29 Sep.
  expect(phaseOn(f, '2026-09-15', false)).toBe('ovulasi');
});

test('test_phaseOn_pastNextStart_isTelat', () => {
  expect(phaseOn(f, '2026-10-01', false)).toBe('telat');
});

test('test_dayMark_nextCycle_isPredicted', () => {
  expect(dayMark(f, '2026-09-30', true)).toBe('predicted');
});

test('test_dayMark_fertilityOff_hidesFertile', () => {
  expect(dayMark(f, '2026-09-12', false)).toBeNull();
});
