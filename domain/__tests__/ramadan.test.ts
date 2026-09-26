import { expect, test } from '@jest/globals';

import { EMPTY_HAID, type HaidLog } from '../haid';
import { qadhaPuasa, setQadhaPaid } from '../ramadan';

const log = (start: string, end: string): HaidLog => ({ ...EMPTY_HAID, periods: [{ start, end }] });

test('test_qadhaPuasa_haidInsideRamadan_countsMissedDays', () => {
  expect(qadhaPuasa(log('2025-03-10', '2025-03-15'), '2025-06-01')).toEqual([{ year: '1446', owed: 6, paid: 0, left: 6 }]);
});

test('test_qadhaPuasa_haidOutsideRamadan_owesNothing', () => {
  expect(qadhaPuasa(log('2025-05-01', '2025-05-06'), '2025-06-01')).toEqual([]);
});

test('test_qadhaPuasa_paidDays_reduceWhatIsLeft', () => {
  const paid = setQadhaPaid(log('2025-03-10', '2025-03-15'), '1446', 4, 1);
  expect(qadhaPuasa(paid, '2025-06-01')[0].left).toBe(2);
});
