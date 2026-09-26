import { expect, test } from '@jest/globals';

import type { Logs } from '../dayLog';
import { EMPTY_HAID } from '../haid';
import { dayPoints, earnedPoints, streakBonus } from '../points';

const done = (percent: number) => ({ counts: { a: 1 }, at: 1, percent });
const empty = { counts: {}, at: 1, percent: 0 };

/** `n` consecutive days with progress ending on 2026-09-20. */
function run(n: number, percent = 50): Logs {
  const logs: Logs = {};
  for (let i = 0; i < n; i++) {
    const d = new Date(2026, 8, 20 - i);
    logs[`2026-09-${String(d.getDate()).padStart(2, '0')}`] = done(percent);
  }
  return logs;
}

test('test_dayPoints_partial_isOnePerTenPercent', () => {
  expect(dayPoints(0)).toBe(0);
  expect(dayPoints(59)).toBe(5);
});

test('test_dayPoints_perfect_addsBonus', () => {
  expect(dayPoints(100)).toBe(15);
});

test('test_streakBonus_sixDays_isZero', () => {
  expect(streakBonus(run(6), '2026-09-21')).toBe(0);
});

test('test_streakBonus_fourteenDays_paysTwice', () => {
  expect(streakBonus(run(14), '2026-09-21')).toBe(20);
});

test('test_streakBonus_emptyDayInRun_resets', () => {
  const logs = { ...run(7), '2026-09-17': empty };
  expect(streakBonus(logs, '2026-09-21')).toBe(0);
});

test('test_streakBonus_missingDay_resets', () => {
  const logs = run(8);
  delete logs['2026-09-16'];
  expect(streakBonus(logs, '2026-09-21')).toBe(0);
});

test('test_earnedPoints_pastUsesSnapshotTodayUsesLive', () => {
  const logs: Logs = { '2026-09-19': done(100), '2026-09-20': done(10) };
  expect(earnedPoints(logs, [], EMPTY_HAID, '2026-09-20', 40)).toBe(15 + 4);
});

test('test_earnedPoints_futureKeys_areIgnored', () => {
  const logs: Logs = { '2026-09-25': done(100) };
  expect(earnedPoints(logs, [], EMPTY_HAID, '2026-09-20', 0)).toBe(0);
});
