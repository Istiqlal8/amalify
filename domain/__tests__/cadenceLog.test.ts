import { expect, test } from '@jest/globals';

import { cadencePercent, mergeCadenceLogs, setCadenceCount, type CadenceLogs } from '../cadenceLog';
import type { PlanItem } from '../plan';

const items: PlanItem[] = [
  { id: 'khatam', label: 'Khatam', section: 'quran', kind: 'count', target: 30, unit: 'juz', cadence: '3bulan' },
  { id: 'sedekah', label: 'Sedekah', section: 'kebaikan', kind: 'check', target: 1, unit: '', cadence: '3bulan' },
];
const key = '3bulan:2026-07';

test('test_setCadenceCount_storesCountAndPercent', () => {
  const logs = setCadenceCount({}, key, 'sedekah', 1, 5, items);
  expect(logs[key]).toEqual({ counts: { sedekah: 1 }, at: 5, percent: 50 });
});

test('test_setCadenceCount_negative_clampsToZero', () => {
  expect(setCadenceCount({}, key, 'khatam', -3, 5, items)[key].counts.khatam).toBe(0);
});

test('test_setCadenceCount_keepsOtherBuckets', () => {
  const logs = setCadenceCount({ 'bulanan:2026-07': { counts: { a: 1 }, at: 1 } }, key, 'sedekah', 1, 5, items);
  expect(Object.keys(logs).sort()).toEqual(['3bulan:2026-07', 'bulanan:2026-07']);
});

test('test_cadencePercent_overTarget_capsAtFull', () => {
  expect(cadencePercent({ counts: { khatam: 60, sedekah: 1 }, at: 1 }, items)).toBe(100);
});

test('test_cadencePercent_noEntry_isZero', () => {
  expect(cadencePercent(undefined, items)).toBe(0);
});

test('test_mergeCadenceLogs_newerEntry_wins', () => {
  const mine: CadenceLogs = { [key]: { counts: { sedekah: 1 }, at: 2 } };
  const theirs: CadenceLogs = { [key]: { counts: { sedekah: 0 }, at: 3 } };
  expect(mergeCadenceLogs(mine, theirs)[key].at).toBe(3);
});

test('test_mergeCadenceLogs_olderEntry_isIgnored', () => {
  const mine: CadenceLogs = { [key]: { counts: { sedekah: 1 }, at: 4 } };
  expect(mergeCadenceLogs(mine, { [key]: { counts: {}, at: 1 } })[key].counts.sedekah).toBe(1);
});

test('test_mergeCadenceLogs_unknownBucket_isAdded', () => {
  expect(Object.keys(mergeCadenceLogs({}, { [key]: { counts: {}, at: 1 } }))).toEqual([key]);
});
