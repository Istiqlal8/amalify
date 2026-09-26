import { expect, test } from '@jest/globals';

import { EMPTY_HAID, type HaidLog, type Period } from '../haid';
import { healthFlags, pmsSymptoms, regularity } from '../haidAnalysis';

const withPeriods = (periods: Period[], days: HaidLog['days'] = {}): HaidLog => ({ ...EMPTY_HAID, periods, days });
const steady = [
  { start: '2026-01-01', end: '2026-01-05' },
  { start: '2026-01-29', end: '2026-02-02' },
  { start: '2026-02-26', end: '2026-03-02' },
  { start: '2026-03-26', end: '2026-03-30' },
];

test('test_regularity_steadyCycles_isRegular', () => {
  expect(regularity(withPeriods(steady))).toEqual({ regular: true, spread: 0 });
});

test('test_regularity_fewerThanThreeCycles_isNull', () => {
  expect(regularity(withPeriods(steady.slice(0, 3)))).toBeNull();
});

test('test_healthFlags_normalSteadyCycle_raisesNothing', () => {
  expect(healthFlags(withPeriods(steady), '2026-04-10', true)).toEqual([]);
});

test('test_healthFlags_twoWeeksLate_flagsLate', () => {
  expect(healthFlags(withPeriods(steady), '2026-05-07', true)[0]).toMatch(/telat 14 hari/);
});

test('test_pmsSymptoms_symptomBeforeTwoPeriods_isReported', () => {
  const days = { '2026-01-27': { symptoms: ['Jerawat'] }, '2026-02-24': { symptoms: ['Jerawat'] } };
  expect(pmsSymptoms(withPeriods(steady, days), 3)).toEqual([{ symptom: 'Jerawat', cycles: 2 }]);
});
