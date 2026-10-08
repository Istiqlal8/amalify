import { expect, test } from '@jest/globals';

import { isLinked, isInviteCode, myRole, partnerStatus, type CouplePair } from '../couple';
import type { HaidLog } from '../haid';

const base: HaidLog = { periods: [], at: 1 };

function pair(over: Partial<CouplePair> = {}): CouplePair {
  return { id: 'p', invite_code: 'AB12CD', wife_id: 'w', husband_id: null, joined_at: null, ...over };
}

test('myRole mengenali istri dan suami', () => {
  const p = pair({ husband_id: 'h' });
  expect(myRole(p, 'w')).toBe('wife');
  expect(myRole(p, 'h')).toBe('husband');
  expect(myRole(p, 'x')).toBeNull();
});

test('isLinked hanya bila slot suami terisi', () => {
  expect(isLinked(pair())).toBe(false);
  expect(isLinked(pair({ husband_id: 'h' }))).toBe(true);
});

test('partnerStatus: hamil, haid hari ke-n, suci', () => {
  expect(partnerStatus({ ...base, pregnant: '2026-09-01' }, '2026-10-03')).toEqual({ state: 'hamil' });
  expect(partnerStatus({ ...base, periods: [{ start: '2026-10-01' }] }, '2026-10-03')).toEqual({ state: 'haid', day: 3 });
  expect(partnerStatus(base, '2026-10-03')).toEqual({ state: 'suci' });
});

test('partnerStatus: nifas', () => {
  expect(partnerStatus({ ...base, periods: [{ start: '2026-09-20', nifas: true }] }, '2026-09-22')).toEqual({
    state: 'nifas',
    day: 3,
  });
});

test('isInviteCode menerima 6 huruf/angka', () => {
  expect(isInviteCode('AB12CD')).toBe(true);
  expect(isInviteCode('ab12cd')).toBe(true);
  expect(isInviteCode('ABC')).toBe(false);
  expect(isInviteCode('AB12CD!')).toBe(false);
});
