import { expect, test } from '@jest/globals';

import { addMissing, dueDay, mergeRules, postDue, ruleFromDraft, type RecurringRule } from '../recurringFinance';

const rule = (over: Partial<RecurringRule> = {}): RecurringRule => ({
  id: 'kos', kind: 'keluar', amount: 900000, category: 'tagihan', note: 'Kos', dayOfMonth: 5, doneThrough: '2026-08', ...over,
});

test('test_dueDay_shortMonth_clampsToLastDay', () => {
  expect(dueDay('2027-02', 31)).toBe('2027-02-28');
});

test('test_ruleFromDraft_startsWithItsOwnMonthPending', () => {
  const made = ruleFromDraft({ kind: 'keluar', amount: 1, category: 'tagihan', note: 'Kos', day: '2026-10-05' }, 'x');
  expect([made.dayOfMonth, made.doneThrough]).toEqual([5, '2026-09']);
});

test('test_postDue_missedMonths_postsEachOnce', () => {
  const { entries } = postDue([rule()], '2026-10-08');
  expect(entries.map((e) => e.day)).toEqual(['2026-09-05', '2026-10-05']);
});

test('test_postDue_advancesTheRule', () => {
  expect(postDue([rule()], '2026-10-08').rules[0].doneThrough).toBe('2026-10');
});

test('test_postDue_beforeDueDay_postsNothing', () => {
  const now = rule({ doneThrough: '2026-09' });
  expect(postDue([now], '2026-10-04')).toEqual({ entries: [], rules: [now] });
});

test('test_postDue_entryId_isStablePerMonth', () => {
  expect(postDue([rule({ doneThrough: '2026-09' })], '2026-10-08').entries[0].id).toBe('rkos-2026-10');
});

test('test_addMissing_knownId_isNotAddedAgain', () => {
  const { entries } = postDue([rule({ doneThrough: '2026-09' })], '2026-10-08');
  expect(addMissing(entries, entries)).toBe(entries);
});

test('test_mergeRules_sameId_keepsFurtherProgress', () => {
  const merged = mergeRules([rule({ doneThrough: '2026-10' })], [rule({ doneThrough: '2026-09' })]);
  expect(merged[0].doneThrough).toBe('2026-10');
});

test('test_mergeRules_remoteOnly_isAdded', () => {
  expect(mergeRules([], [rule()])).toHaveLength(1);
});
