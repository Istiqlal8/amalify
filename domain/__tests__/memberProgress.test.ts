import { expect, test } from '@jest/globals';

import { patchProgress } from '../memberProgress';

const board = [
  { userId: 'a', percent: 80, hidden: false },
  { userId: 'b', percent: 20, hidden: false },
];

test('test_patchProgress_newPercent_replacesIt', () => {
  expect(patchProgress(board, [{ user_id: 'b', percent: 90 }])[0]).toEqual({ userId: 'b', percent: 90, hidden: false });
});

test('test_patchProgress_newPercent_reordersBoard', () => {
  expect(patchProgress(board, [{ user_id: 'b', percent: 90 }]).map((m) => m.userId)).toEqual(['b', 'a']);
});

test('test_patchProgress_memberNotMentioned_keepsPercent', () => {
  expect(patchProgress(board, [{ user_id: 'b', percent: 90 }])[1].percent).toBe(80);
});

test('test_patchProgress_nullPercent_marksHidden', () => {
  expect(patchProgress(board, [{ user_id: 'a', percent: null }])[1]).toEqual({ userId: 'a', percent: 0, hidden: true });
});

test('test_patchProgress_unknownMember_isIgnored', () => {
  expect(patchProgress(board, [{ user_id: 'zz', percent: 50 }])).toHaveLength(2);
});

test('test_patchProgress_rowWithoutUserId_isIgnored', () => {
  expect(patchProgress(board, [{ percent: 50 }])).toEqual(board);
});

test('test_patchProgress_keepsOtherFields', () => {
  const rich = [{ userId: 'a', percent: 10, hidden: false, name: 'Aisyah' }];
  expect(patchProgress(rich, [{ user_id: 'a', percent: 40 }])[0].name).toBe('Aisyah');
});
