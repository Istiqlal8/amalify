import { expect, test } from '@jest/globals';

import { alive, bury, mergeTombstones } from '../tombstones';

const items = [{ id: 'a' }, { id: 'b' }];

test('test_alive_buriedId_isDropped', () => {
  expect(alive(items, bury({}, 'finance', 'a', 1), 'finance')).toEqual([{ id: 'b' }]);
});

test('test_alive_sameIdOtherKind_isKept', () => {
  expect(alive(items, bury({}, 'cat', 'a', 1), 'finance')).toBe(items);
});

test('test_alive_nothingBuried_returnsSameArray', () => {
  expect(alive(items, {}, 'finance')).toBe(items);
});

test('test_mergeTombstones_keepsBothSides', () => {
  const merged = mergeTombstones(bury({}, 'finance', 'a', 1), bury({}, 'rule', 'x', 2));
  expect(Object.keys(merged).sort()).toEqual(['finance:a', 'rule:x']);
});

test('test_mergeTombstones_nothingNew_returnsLocal', () => {
  const local = bury({}, 'finance', 'a', 1);
  expect(mergeTombstones(local, { 'finance:a': 9 })).toBe(local);
});

test('test_mergeTombstones_noRemote_returnsLocal', () => {
  const local = bury({}, 'finance', 'a', 1);
  expect(mergeTombstones(local, undefined)).toBe(local);
});
