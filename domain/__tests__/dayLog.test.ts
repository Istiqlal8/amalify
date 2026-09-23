import { expect, test } from '@jest/globals';

import { dateKey, dayPercent, lastDays, mergeLogs, migrateLogs, pastPercent, setCount, streak, type Logs } from '../dayLog';
import type { PlanItem } from '../plan';

const today = new Date(2026, 8, 23);
const items: PlanItem[] = [
  { id: 'subuh', label: 'Subuh', section: 'sholat', kind: 'check', target: 1, unit: '' },
  { id: 'tilawah', label: 'Tilawah', section: 'quran', kind: 'count', target: 4, unit: 'halaman' },
];
const entry = (counts: Record<string, number>, at = 1) => ({ counts, at });

test('test_dateKey_localDate_padsMonthAndDay', () => {
  expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
});

test('test_lastDays_three_endsToday', () => {
  expect(lastDays(3, today)).toEqual(['2026-09-21', '2026-09-22', '2026-09-23']);
});

test('test_migrateLogs_legacyDoneArray_becomesCounts', () => {
  expect(migrateLogs({ d: { done: ['a', 'b'], at: 3 } })).toEqual({ d: { counts: { a: 1, b: 1 }, at: 3 } });
});

test('test_dayPercent_partialCount_countsFraction', () => {
  expect(dayPercent(entry({ subuh: 1, tilawah: 2 }), items)).toBe(75);
});

test('test_dayPercent_overTarget_capsItemAtFull', () => {
  expect(dayPercent(entry({ tilawah: 9 }), items)).toBe(50);
});

test('test_setCount_negative_clampsToZero', () => {
  expect(setCount({}, 'd', 'tilawah', -2, 5, items).d.counts.tilawah).toBe(0);
});

test('test_setCount_records_percentSnapshot', () => {
  expect(setCount({}, 'd', 'subuh', 1, 5, items).d.percent).toBe(50);
});

test('test_pastPercent_planGrewLater_keepsSnapshot', () => {
  const logs = setCount({}, 'd', 'subuh', 1, 5, items.slice(0, 1));
  expect(pastPercent(logs.d, items)).toBe(100);
});

test('test_mergeLogs_newerRemote_wins', () => {
  expect(mergeLogs({ d: entry({ a: 1 }, 1) }, { d: entry({}, 2) }).d.counts).toEqual({});
});

test('test_mergeLogs_olderRemote_keepsLocal', () => {
  const local: Logs = { d: entry({ a: 1 }, 5) };
  const remote: Logs = { d: entry({ b: 1 }, 2), e: entry({ c: 1 }, 1) };
  expect(mergeLogs(local, remote)).toEqual({ d: local.d, e: remote.e });
});

test('test_streak_todayEmpty_countsFromYesterday', () => {
  const logs: Logs = { '2026-09-22': entry({ a: 1 }), '2026-09-21': entry({ a: 2 }), '2026-09-23': entry({ a: 0 }) };
  expect(streak(logs, today)).toBe(2);
});

test('test_streak_gap_stopsCounting', () => {
  const logs: Logs = { '2026-09-23': entry({ a: 1 }), '2026-09-21': entry({ a: 1 }) };
  expect(streak(logs, today)).toBe(1);
});
