import { expect, test } from '@jest/globals';

import { addPeriod, containingPeriod, dayOfPeriod, editPeriod, earliestStart, EMPTY_HAID, endHaid, isHaidDay, itemsForDay, removePeriod, restampHaidChange, saveOpenPeriod, setOpenStart, startHaid, startNifas, suciDays, type HaidLog } from '../haid';
import type { PlanItem } from '../plan';

const open: HaidLog = { periods: [{ start: '2026-09-20' }], at: 1 };

test('test_isHaidDay_openPeriod_coversFutureDays', () => {
  expect(isHaidDay(open, '2026-09-30')).toBe(true);
});

test('test_isHaidDay_beforeStart_isFalse', () => {
  expect(isHaidDay(open, '2026-09-19')).toBe(false);
});

test('test_startHaid_alreadyOpen_changesNothing', () => {
  expect(startHaid(open, '2026-09-23', 5)).toBe(open);
});

test('test_startHaid_none_opensToday', () => {
  expect(startHaid(EMPTY_HAID, '2026-09-23', 5).periods).toEqual([{ start: '2026-09-23' }]);
});

test('test_endHaid_closesAtYesterday', () => {
  expect(endHaid(open, '2026-09-23', 5).periods).toEqual([{ start: '2026-09-20', end: '2026-09-22' }]);
});

test('test_endHaid_startedToday_dropsPeriod', () => {
  expect(endHaid({ periods: [{ start: '2026-09-23' }], at: 1 }, '2026-09-23', 5).periods).toEqual([]);
});

test('test_endHaid_acrossMonth_yesterdayIsLastOfMonth', () => {
  const log = { periods: [{ start: '2026-09-28' }], at: 1 };
  expect(endHaid(log, '2026-10-01', 5).periods[0].end).toBe('2026-09-30');
});

test('test_dayOfPeriod_startDay_isOne', () => {
  expect(dayOfPeriod({ start: '2026-09-20' }, '2026-09-23')).toBe(4);
});

test('test_itemsForDay_haid_dropsSholatOnly', () => {
  const items = [
    { id: 'subuh', section: 'sholat' },
    { id: 'tilawah', section: 'quran' },
  ] as PlanItem[];
  expect(itemsForDay(items, true).map((i) => i.id)).toEqual(['tilawah']);
});

const withPast: HaidLog = { periods: [{ start: '2026-08-25', end: '2026-08-31' }, { start: '2026-09-23' }], at: 1 };

test('test_setOpenStart_earlierDay_movesStart', () => {
  expect(setOpenStart(withPast, '2026-09-21', '2026-09-23', 5).periods[1].start).toBe('2026-09-21');
});

test('test_setOpenStart_future_isRefused', () => {
  expect(setOpenStart(withPast, '2026-09-25', '2026-09-23', 5)).toBe(withPast);
});

test('test_setOpenStart_overlapsPrevious_isRefused', () => {
  expect(setOpenStart(withPast, '2026-08-30', '2026-09-23', 5)).toBe(withPast);
});

test('test_earliestStart_dayAfterPreviousEnd', () => {
  expect(earliestStart(withPast)).toBe('2026-09-01');
});

test('test_restampHaidChange_earlierStart_rescoresNewHaidDays', () => {
  const items = [
    { id: 'subuh', section: 'sholat', target: 1 },
    { id: 'tilawah', section: 'quran', target: 1 },
  ] as PlanItem[];
  const logs = { '2026-09-22': { counts: { tilawah: 1 }, at: 1, percent: 50 } };
  const after = setOpenStart(withPast, '2026-09-22', '2026-09-23', 5);
  expect(restampHaidChange(logs, withPast, after, items, '2026-09-23')['2026-09-22'].percent).toBe(100);
});

test('test_removePeriod_dropsOnlyThatStart', () => {
  expect(removePeriod(withPast, '2026-08-25', 5).periods).toEqual([{ start: '2026-09-23' }]);
});

test('test_addPeriod_pastRange_isAdded', () => {
  expect(addPeriod(EMPTY_HAID, '2026-08-01', '2026-08-05', '2026-09-23', 5).periods).toEqual([{ start: '2026-08-01', end: '2026-08-05' }]);
});

test('test_addPeriod_overlapsOpen_isRefused', () => {
  expect(addPeriod(open, '2026-09-21', '2026-09-22', '2026-09-23', 5)).toBe(open);
});

test('test_removePeriod_keepsDayNotes', () => {
  const log: HaidLog = { ...open, days: { '2026-09-20': { flow: 'deras', symptoms: [] } } };
  expect(removePeriod(log, '2026-09-20', 5).days).toEqual(log.days);
});

test('test_isHaidDay_day16OfOpenPeriod_isIstihadahNotHaid', () => {
  const log = { ...EMPTY_HAID, periods: [{ start: '2026-09-01' }] };
  expect([isHaidDay(log, '2026-09-15'), isHaidDay(log, '2026-09-16')]).toEqual([true, false]);
});

test('test_itemsForDay_haid_dropsFastingItems', () => {
  const puasa = { id: 'p', label: 'Puasa sunnah', section: 'kebaikan', kind: 'check', target: 1, unit: '' } as PlanItem;
  expect(itemsForDay([puasa], true)).toEqual([]);
});

test('test_endHaid_closesPeriod_setsMandiDue', () => {
  const log = { ...EMPTY_HAID, periods: [{ start: '2026-09-01' }] };
  expect(endHaid(log, '2026-09-07', 1).mandiDue).toBe('2026-09-07');
});

test('test_suciDays_countsDaysBetweenLastEndAndToday', () => {
  const log = { ...EMPTY_HAID, periods: [{ start: '2026-09-01', end: '2026-09-07' }] };
  expect(suciDays(log, '2026-09-12')).toBe(4);
});

test('test_isHaidDay_nifasDay40_isStillNifas', () => {
  const log = startNifas({ ...EMPTY_HAID, pregnant: '2026-01-01' }, '2026-09-01', 1);
  expect(isHaidDay(log, '2026-10-10')).toBe(true);
});

test('test_startNifas_endsPregnancyMode', () => {
  expect(startNifas({ ...EMPTY_HAID, pregnant: '2026-01-01' }, '2026-09-01', 1).pregnant).toBeUndefined();
});

test('test_editPeriod_newDates_replacesPeriod', () => {
  const log = addPeriod(EMPTY_HAID, '2026-08-01', '2026-08-05', '2026-09-23', 1);
  expect(editPeriod(log, '2026-08-01', '2026-08-02', '2026-08-07', '2026-09-23', 2).periods).toEqual([{ start: '2026-08-02', end: '2026-08-07' }]);
});

test('test_editPeriod_clashesWithOther_unchanged', () => {
  const one = addPeriod(EMPTY_HAID, '2026-08-01', '2026-08-05', '2026-09-23', 1);
  const two = addPeriod(one, '2026-08-29', '2026-09-03', '2026-09-23', 2);
  expect(editPeriod(two, '2026-08-01', '2026-08-01', '2026-08-30', '2026-09-23', 3)).toBe(two);
});

test('test_saveOpenPeriod_moveStartOnly_keepsRunning', () => {
  const next = saveOpenPeriod(withPast, '2026-09-21', undefined, '2026-09-23', 5);
  expect(next.periods).toEqual([{ start: '2026-08-25', end: '2026-08-31' }, { start: '2026-09-21', end: undefined }]);
});

test('test_saveOpenPeriod_withEnd_closesRunning', () => {
  const next = saveOpenPeriod(withPast, '2026-09-20', '2026-09-22', '2026-09-23', 5);
  expect(next.periods).toEqual([{ start: '2026-08-25', end: '2026-08-31' }, { start: '2026-09-20', end: '2026-09-22' }]);
});

test('test_saveOpenPeriod_endBeforeStart_isRefused', () => {
  expect(saveOpenPeriod(withPast, '2026-09-22', '2026-09-21', '2026-09-23', 5)).toBe(withPast);
});

test('test_saveOpenPeriod_overlapsPrevious_isRefused', () => {
  expect(saveOpenPeriod(withPast, '2026-08-30', undefined, '2026-09-23', 5)).toBe(withPast);
});

test('test_saveOpenPeriod_noChange_isSameRef', () => {
  expect(saveOpenPeriod(withPast, '2026-09-23', undefined, '2026-09-23', 5)).toBe(withPast);
});

test('test_containingPeriod_openPeriod_findsIt', () => {
  expect(containingPeriod(withPast, '2026-09-23')?.start).toBe('2026-09-23');
});

test('test_containingPeriod_gapDay_isUndefined', () => {
  expect(containingPeriod(withPast, '2026-09-10')).toBeUndefined();
});
