import { expect, test } from '@jest/globals';

import { canManageCash, canManageRecords, ROLE_LABELS, ROLE_ORDER } from '../groupRole';

test('test_canManageCash_bendaharaAndAdmin_true', () => {
  expect([canManageCash('admin'), canManageCash('bendahara')]).toEqual([true, true]);
});

test('test_canManageCash_sekretarisOrMember_false', () => {
  expect([canManageCash('sekretaris'), canManageCash('member'), canManageCash(null)]).toEqual([false, false, false]);
});

test('test_canManageRecords_sekretarisAndAdmin_true', () => {
  expect([canManageRecords('admin'), canManageRecords('sekretaris')]).toEqual([true, true]);
});

test('test_canManageRecords_bendaharaOrMember_false', () => {
  expect([canManageRecords('bendahara'), canManageRecords('member'), canManageRecords(null)]).toEqual([false, false, false]);
});

test('test_ROLE_ORDER_coversEveryLabel', () => {
  expect(ROLE_ORDER.map((r) => ROLE_LABELS[r])).toEqual(['Admin', 'Bendahara', 'Sekretaris', 'Anggota']);
});
