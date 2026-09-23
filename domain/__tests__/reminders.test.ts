import { expect, test } from '@jest/globals';

import type { Logs } from '../dayLog';
import { EMPTY_HAID } from '../haid';
import type { PlanItem } from '../plan';
import type { NextPrayer } from '../prayer';
import { buildSchedule, formatClock, MAX_PENDING, parseClock, type ScheduleInput } from '../reminders';

const now = new Date(2026, 8, 23, 12, 0);
const off = { enabled: false, time: '20:30' };
const on = { enabled: true, time: '20:30' };
const run = (p: Partial<ScheduleInput>) =>
  buildSchedule({ items: [], logs: {}, evening: off, prayers: [], city: 'KOTA BANDUNG', haid: EMPTY_HAID, now, ...p });
const item = (id: string, reminder?: string): PlanItem => ({
  id, label: id, section: 'sholat', kind: 'check', target: 1, unit: '', reminder,
});

test('test_parseClock_formatClock_roundTrip', () => {
  const { hour, minute } = parseClock('05:07');
  expect(formatClock(hour, minute)).toBe('05:07');
});

test('test_buildSchedule_pastTimeToday_startsTomorrow', () => {
  const first = run({ items: [item('subuh', '04:30')] })[0];
  expect(first.id).toBe('2026-09-24:subuh');
});

test('test_buildSchedule_laterToday_includesToday', () => {
  expect(run({ items: [item('isya', '19:30')] })[0].id).toBe('2026-09-23:isya');
});

test('test_buildSchedule_itemDoneToday_skipsToday', () => {
  const logs: Logs = { '2026-09-23': { counts: { isya: 1 }, at: 1 } };
  expect(run({ items: [item('isya', '19:30')], logs })[0].id).toBe('2026-09-24:isya');
});

test('test_buildSchedule_noReminderTimes_isEmpty', () => {
  expect(run({ items: [item('a'), item('b')] })).toEqual([]);
});

test('test_buildSchedule_eveningOn_oncePerDayForAWeek', () => {
  expect(run({ items: [item('a')], evening: on }).filter((r) => r.id.endsWith('evening'))).toHaveLength(7);
});

test('test_buildSchedule_dayComplete_skipsEvening', () => {
  const logs: Logs = { '2026-09-23': { counts: { a: 1 }, at: 1 } };
  expect(run({ items: [item('a')], logs, evening: on })[0].id).toBe('2026-09-24:evening');
});

test('test_buildSchedule_manyReminders_capsPending', () => {
  const items = Array.from({ length: 20 }, (_, i) => item(`i${i}`, '21:00'));
  expect(run({ items, evening: on })).toHaveLength(MAX_PENDING);
});

const maghrib = (d: number): NextPrayer => ({ id: 'maghrib', name: 'Maghrib', at: new Date(2026, 8, d, 17, 56) });

test('test_buildSchedule_adzan_titledWithPrayerAndCity', () => {
  const [r] = run({ prayers: [maghrib(23)] });
  expect([r.title, r.body]).toEqual(['Waktunya sholat Maghrib', '17:56 · KOTA BANDUNG']);
});

test('test_buildSchedule_prayerAlreadyTicked_skipsAdzan', () => {
  const logs: Logs = { '2026-09-23': { counts: { maghrib: 1 }, at: 1 } };
  expect(run({ items: [item('maghrib')], logs, prayers: [maghrib(23), maghrib(24)] })[0].id).toBe('2026-09-24:adzan-maghrib');
});

test('test_buildSchedule_prayerBeyondWeek_isLeftOut', () => {
  expect(run({ prayers: [maghrib(23), maghrib(30)] })).toHaveLength(1);
});

const haidFrom24 = { periods: [{ start: '2026-09-24' }], at: 1 };

test('test_buildSchedule_haid_skipsAdzanFromStart', () => {
  expect(run({ prayers: [maghrib(23), maghrib(24), maghrib(25)], haid: haidFrom24 }).map((r) => r.id)).toEqual(['2026-09-23:adzan-maghrib']);
});

test('test_buildSchedule_haid_keepsNonSholatReminders', () => {
  const tilawah = { ...item('tilawah', '21:00'), section: 'quran' as const };
  expect(run({ items: [item('isya', '19:30'), tilawah], haid: haidFrom24 }).filter((r) => r.id.startsWith('2026-09-24')).map((r) => r.id)).toEqual(['2026-09-24:tilawah']);
});
