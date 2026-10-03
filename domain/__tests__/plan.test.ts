import { expect, test } from '@jest/globals';

import { addItem, DEFAULT_PLAN, newerPlan, normalizeDraft, removeItem, updateItem, type ItemDraft } from '../plan';

const draft: ItemDraft = { label: '  Puasa  ', section: 'kebaikan', kind: 'check', target: 7, unit: 'hari' };

test('test_normalizeDraft_check_resetsTargetAndUnit', () => {
  expect(normalizeDraft(draft)).toEqual({ ...draft, label: 'Puasa', target: 1, unit: '', cadence: 'harian' });
});

test('test_normalizeDraft_countBelowOne_raisesToOne', () => {
  expect(normalizeDraft({ ...draft, kind: 'count', target: 0 }).target).toBe(1);
});

test('test_normalizeDraft_chosenCadence_isKept', () => {
  expect(normalizeDraft({ ...draft, cadence: '3bulan' }).cadence).toBe('3bulan');
});

test('test_addItem_appends_andStampsTime', () => {
  const plan = addItem(DEFAULT_PLAN, draft, 'x', 9);
  expect([plan.items.at(-1)?.id, plan.at]).toEqual(['x', 9]);
});

test('test_updateItem_keepsId_changesLabel', () => {
  const plan = updateItem(DEFAULT_PLAN, 'subuh', { ...draft, label: 'Fajr' }, 9);
  expect(plan.items.find((it) => it.id === 'subuh')?.label).toBe('Fajr');
});

test('test_removeItem_dropsOnlyThatItem', () => {
  expect(removeItem(DEFAULT_PLAN, 'subuh', 9).items).toHaveLength(DEFAULT_PLAN.items.length - 1);
});

test('test_newerPlan_remoteNewer_wins', () => {
  const remote = { items: [], at: 5 };
  expect(newerPlan(DEFAULT_PLAN, remote)).toBe(remote);
});

test('test_newerPlan_noRemote_keepsLocal', () => {
  expect(newerPlan(DEFAULT_PLAN, undefined)).toBe(DEFAULT_PLAN);
});

test('test_normalizeDraft_allSevenWeekdays_storesAsEveryDay', () => {
  const out = normalizeDraft({ ...draft, reminder: '05:00', reminderDays: [0, 1, 2, 3, 4, 5, 6] });
  expect(out.reminderDays).toBeUndefined();
});

test('test_normalizeDraft_duplicateWeekdays_dedupesAndSorts', () => {
  const out = normalizeDraft({ ...draft, reminder: '05:00', reminderDays: [5, 1, 5] });
  expect(out.reminderDays).toEqual([1, 5]);
});

test('test_normalizeDraft_weekdaysWithoutReminder_areDropped', () => {
  expect(normalizeDraft({ ...draft, reminderDays: [1] }).reminderDays).toBeUndefined();
});
