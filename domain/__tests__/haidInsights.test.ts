import { expect, test } from '@jest/globals';

import type { HaidLog } from '../haid';
import { cycleLengths, periodLengths, topSymptoms } from '../haidInsights';

const log: HaidLog = {
  periods: [{ start: '2026-08-04', end: '2026-08-08' }, { start: '2026-09-01' }],
  at: 1,
  days: { a: { symptoms: ['Kram', 'Pusing'] }, b: { symptoms: ['Kram'] } },
};

test('test_cycleLengths_twoStarts_oneCycle', () => {
  expect(cycleLengths(log)).toEqual([{ label: '2026-08-04', value: 28 }]);
});

test('test_periodLengths_skipsOpenPeriod', () => {
  expect(periodLengths(log)).toEqual([{ label: '2026-08-04', value: 5 }]);
});

test('test_topSymptoms_mostFrequentFirst', () => {
  expect(topSymptoms(log, 1)).toEqual([{ label: 'Kram', value: 2 }]);
});
