import { expect, test } from '@jest/globals';

import {
  balance,
  duesPeriodStart,
  formatPeriodStart,
  formatRupiah,
  monthOf,
  nextPeriodStart,
  paidFor,
  paidThrough,
  parseRupiah,
  unpaidPeriodStarts,
  weekOf,
  type CashEntry,
} from '../cash';

const entry = (over: Partial<CashEntry>): CashEntry => ({
  id: 'c', amount: 0, note: 'x', day: '2026-09-23', duesFor: null, duesMonth: null, createdBy: 'u', ...over,
});

const dues = (member: string, start: string): CashEntry => entry({ amount: 20000, duesFor: member, duesMonth: start });

test('test_balance_inAndOut_sums', () => {
  expect(balance([entry({ amount: 50000 }), entry({ amount: -20000 })])).toBe(30000);
});

test('test_monthOf_day_firstOfMonth', () => {
  expect(monthOf('2026-09-23')).toBe('2026-09-01');
});

test('test_paidFor_otherMonthIgnored', () => {
  const list = [entry({ duesFor: 'a', duesMonth: '2026-09-01' }), entry({ duesFor: 'b', duesMonth: '2026-08-01' })];
  expect([...paidFor(list, '2026-09-01')]).toEqual(['a']);
});

test('test_formatRupiah_negative_groupsThousands', () => {
  expect(formatRupiah(-1250000)).toBe('-Rp 1.250.000');
});

test('test_parseRupiah_withPrefixAndDots_wholeNumber', () => {
  expect(parseRupiah('Rp 50.000')).toBe(50000);
});

test('test_parseRupiah_noDigits_zero', () => {
  expect(parseRupiah('abc')).toBe(0);
});

test('test_weekOf_sunday_previousMonday', () => {
  expect(weekOf('2026-09-27')).toBe('2026-09-21');
});

test('test_weekOf_acrossMonth_mondayInPreviousMonth', () => {
  expect(weekOf('2026-10-02')).toBe('2026-09-28');
});

test('test_duesPeriodStart_month_firstOfMonth', () => {
  expect(duesPeriodStart('2026-09-27', 'month')).toBe('2026-09-01');
});

test('test_nextPeriodStart_december_nextYearJanuary', () => {
  expect(nextPeriodStart('2026-12-01', 'month')).toBe('2027-01-01');
});

test('test_nextPeriodStart_monthEndDay_stillFirst', () => {
  expect(nextPeriodStart('2026-01-01', 'month')).toBe('2026-02-01');
});

test('test_nextPeriodStart_week53_nextYearMonday', () => {
  expect(nextPeriodStart('2020-12-28', 'week')).toBe('2021-01-04');
});

test('test_unpaidPeriodStarts_monthly_runsIntoNextYear', () => {
  expect(unpaidPeriodStarts([], 'a', '2026-11-01', 'month', 3)).toEqual(['2026-11-01', '2026-12-01', '2027-01-01']);
});

test('test_unpaidPeriodStarts_alreadyPaidPeriod_skipped', () => {
  const list = [dues('a', '2026-10-01')];
  expect(unpaidPeriodStarts(list, 'a', '2026-09-01', 'month', 2)).toEqual(['2026-09-01', '2026-11-01']);
});

test('test_unpaidPeriodStarts_otherMembersDues_ignored', () => {
  const list = [dues('b', '2026-09-01')];
  expect(unpaidPeriodStarts(list, 'a', '2026-09-01', 'month', 1)).toEqual(['2026-09-01']);
});

test('test_unpaidPeriodStarts_weekly_stepsSevenDays', () => {
  expect(unpaidPeriodStarts([], 'a', '2020-12-28', 'week', 2)).toEqual(['2020-12-28', '2021-01-04']);
});

test('test_paidThrough_currentPeriodUnpaid_null', () => {
  expect(paidThrough([dues('a', '2026-10-01')], 'a', '2026-09-01', 'month')).toBeNull();
});

test('test_paidThrough_paidAhead_lastConsecutivePeriod', () => {
  const list = [dues('a', '2026-11-01'), dues('a', '2026-12-01'), dues('a', '2027-01-01')];
  expect(paidThrough(list, 'a', '2026-11-01', 'month')).toBe('2027-01-01');
});

test('test_paidThrough_gapAfterCurrent_stopsBeforeGap', () => {
  const list = [dues('a', '2026-11-01'), dues('a', '2027-01-01')];
  expect(paidThrough(list, 'a', '2026-11-01', 'month')).toBe('2026-11-01');
});

test('test_formatPeriodStart_month_monthAndYear', () => {
  expect(formatPeriodStart('2026-12-01', 'month')).toBe('Des 2026');
});

test('test_formatPeriodStart_week_dayMonthYear', () => {
  expect(formatPeriodStart('2020-12-28', 'week')).toBe('28 Des 2020');
});
