import { expect, test } from '@jest/globals';

import { balance, formatRupiah, monthOf, paidFor, parseRupiah, type CashEntry } from '../cash';

const entry = (over: Partial<CashEntry>): CashEntry => ({
  id: 'c', amount: 0, note: 'x', day: '2026-09-23', duesFor: null, duesMonth: null, createdBy: 'u', ...over,
});

test('test_balance_inAndOut_sums', () => {
  expect(balance([entry({ amount: 50000 }), entry({ amount: -20000 })])).toBe(30000);
});

test('test_monthOf_day_firstOfMonth', () => {
  expect(monthOf('2026-09-23')).toBe('2026-09-01');
});

test('test_paidFor_otherMonthIgnored', () => {
  const list = [entry({ duesFor: 'a', duesMonth: '2026-09-01' }), entry({ duesFor: 'b', duesMonth: '2026-08-01' })];
  expect([...paidFor(list, '2026-09-01')]).toEqual(['a']);
});

test('test_formatRupiah_negative_groupsThousands', () => {
  expect(formatRupiah(-1250000)).toBe('-Rp 1.250.000');
});

test('test_parseRupiah_withPrefixAndDots_wholeNumber', () => {
  expect(parseRupiah('Rp 50.000')).toBe(50000);
});

test('test_parseRupiah_noDigits_zero', () => {
  expect(parseRupiah('abc')).toBe(0);
});
