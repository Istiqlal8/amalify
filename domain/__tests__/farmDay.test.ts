import { expect, test } from '@jest/globals';

import type { FarmDay } from '../farm';
import { dayHeadline, dayStatus, dayView, monthSummary } from '../farmDay';

const TODAY = '2026-09-27';

const day = (key: string, over: Partial<FarmDay> = {}): FarmDay => ({
  key,
  percent: 80,
  onHaid: false,
  recorded: true,
  ...over,
});

test('test_dayStatus_future_returnsNanti', () => {
  expect(dayStatus(day('2026-09-28'), TODAY)).toBe('nanti');
});

test('test_dayStatus_haidDay_returnsKhusus', () => {
  expect(dayStatus(day('2026-09-20', { onHaid: true }), TODAY)).toBe('khusus');
});

test('test_dayStatus_noEntry_returnsBelumNotZero', () => {
  expect(dayStatus(day('2026-09-20', { recorded: false, percent: 0 }), TODAY)).toBe('belum');
});

test('test_dayStatus_loggedDay_returnsTercatat', () => {
  expect(dayStatus(day('2026-09-20'), TODAY)).toBe('tercatat');
});

test('test_dayView_unrecordedDay_bandIsKosong', () => {
  expect(dayView(day('2026-09-20', { recorded: false, percent: 0 }), TODAY).band).toBe('kosong');
});

test('test_dayView_fullDay_bandIsPenuh', () => {
  expect(dayView(day('2026-09-20', { percent: 100 }), TODAY).band).toBe('penuh');
});

test('test_dayHeadline_unrecordedDay_readsBelumDicatat', () => {
  const view = dayView(day('2026-09-20', { recorded: false, percent: 0 }), TODAY);
  expect(dayHeadline(view)).toBe('Belum dicatat');
});

test('test_dayHeadline_recordedDay_readsPercentage', () => {
  expect(dayHeadline(dayView(day('2026-09-20', { percent: 45 }), TODAY))).toBe('45%');
});

test('test_monthSummary_nothingLogged_countsZeroWithoutAverage', () => {
  const days = ['2026-09-01', '2026-09-02'].map((k) => day(k, { recorded: false, percent: 0 }));
  expect(monthSummary(days, TODAY)).toEqual({ average: 0, counted: 0 });
});

test('test_monthSummary_mixedMonth_averagesOnlyRecordedDays', () => {
  const days = [
    day('2026-09-01', { percent: 100 }),
    day('2026-09-02', { percent: 50 }),
    day('2026-09-03', { recorded: false, percent: 0 }),
  ];
  expect(monthSummary(days, TODAY)).toEqual({ average: 75, counted: 2 });
});

test('test_monthSummary_haidDays_leftOutOfTheAverage', () => {
  const days = [day('2026-09-01', { percent: 100 }), day('2026-09-02', { percent: 0, onHaid: true })];
  expect(monthSummary(days, TODAY)).toEqual({ average: 100, counted: 1 });
});

test('test_monthSummary_futureDays_notCounted', () => {
  const days = [day('2026-09-27', { percent: 60 }), day('2026-09-30', { percent: 0 })];
  expect(monthSummary(days, TODAY)).toEqual({ average: 60, counted: 1 });
});
