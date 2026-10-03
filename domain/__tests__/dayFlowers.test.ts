import { expect, test } from '@jest/globals';

import { clearDayFlower, flowerForDate, mergeDayFlowers, sanitizeDayFlowers, setDayFlower } from '../dayFlowers';
import { DEFAULT_FLOWER } from '../flowers';

test('test_flowerForDate_fallbackWhenEmpty', () => {
  expect(flowerForDate({}, '2026-10-03', DEFAULT_FLOWER)).toBe(DEFAULT_FLOWER);
});

test('test_setDayFlower_onlyThatDay', () => {
  const next = setDayFlower({}, '2026-10-03', 'mawar');
  expect(flowerForDate(next, '2026-10-03', DEFAULT_FLOWER)).toBe('mawar');
  expect(flowerForDate(next, '2026-10-04', DEFAULT_FLOWER)).toBe(DEFAULT_FLOWER);
});

test('test_clearDayFlower_fallsBackToDefault', () => {
  const map = setDayFlower({}, '2026-10-03', 'mawar');
  expect(flowerForDate(clearDayFlower(map, '2026-10-03'), '2026-10-03', DEFAULT_FLOWER)).toBe(DEFAULT_FLOWER);
});

test('test_sanitizeDayFlowers_dropsInvalid', () => {
  expect(sanitizeDayFlowers({ '2026-10-03': 'mawar', nope: 'mawar', '2026-10-04': 'naga' })).toEqual({ '2026-10-03': 'mawar' });
});

test('test_mergeDayFlowers_remoteWinsPerDate', () => {
  expect(mergeDayFlowers({ '2026-10-03': 'mawar' }, { '2026-10-03': 'tulip', '2026-10-04': 'naga' })).toEqual({
    '2026-10-03': 'tulip',
  });
});
