import { expect, test } from '@jest/globals';

import type { HaidLog } from '../haid';
import { haidReminders } from '../haidReminders';

const now = new Date(2026, 8, 23, 10, 0);

test('test_haidReminders_predictedPeriod_remindsDayBefore', () => {
  const log: HaidLog = { periods: [{ start: '2026-08-04', end: '2026-08-08' }, { start: '2026-09-01', end: '2026-09-05' }], at: 1 };
  expect(haidReminders(log, now)[0].date).toEqual(new Date(2026, 8, 28, 9, 0));
});

test('test_haidReminders_pillTakenToday_skipsToday', () => {
  const log: HaidLog = { periods: [], at: 1, care: { pads: [], pillTaken: ['2026-09-23'], pill: { start: '2026-09-20', active: 21, placebo: 7, time: '20:00' } } };
  expect(haidReminders(log, now)[0].id).toBe('haid:pill:2026-09-24');
});

test('test_haidReminders_padChange_afterProductHours', () => {
  const at = now.getTime();
  const log: HaidLog = { periods: [], at: 1, care: { pads: [{ product: 'pembalut', at }], pillTaken: [] } };
  expect(haidReminders(log, now)[0].date.getTime()).toBe(at + 4 * 3600000);
});
