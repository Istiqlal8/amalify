import { expect, test } from '@jest/globals';

import { matchesFilter } from '../liveFilter';

test('test_matchesFilter_noFilter_matches', () => {
  expect(matchesFilter(undefined, { day: '2026-09-27' })).toBe(true);
});

test('test_matchesFilter_eqSameValue_matches', () => {
  expect(matchesFilter('day=eq.2026-09-27', { day: '2026-09-27' })).toBe(true);
});

test('test_matchesFilter_eqOtherValue_doesNotMatch', () => {
  expect(matchesFilter('day=eq.2026-09-27', { day: '2026-09-26' })).toBe(false);
});

test('test_matchesFilter_gteEarlierDay_doesNotMatch', () => {
  expect(matchesFilter('day=gte.2026-09-01', { day: '2026-08-31' })).toBe(false);
});

test('test_matchesFilter_gteSameDay_matches', () => {
  expect(matchesFilter('day=gte.2026-09-01', { day: '2026-09-01' })).toBe(true);
});

test('test_matchesFilter_uuidColumn_comparesAsText', () => {
  expect(matchesFilter('group_id=eq.abc', { group_id: 'abc' })).toBe(true);
});

test('test_matchesFilter_missingColumn_matches', () => {
  expect(matchesFilter('day=eq.2026-09-27', { percent: 40 })).toBe(true);
});

test('test_matchesFilter_unknownOperator_matches', () => {
  expect(matchesFilter('day=neq.2026-09-27', { day: '2026-09-27' })).toBe(true);
});
