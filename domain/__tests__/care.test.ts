import { expect, test } from '@jest/globals';

import { EMPTY_CARE, isNaturalCycle, kbExpiry, packStart, pillDay, togglePill } from '../care';

const reg = { start: '2026-09-01', active: 21, placebo: 7, time: '20:00' };

test('test_pillDay_day22_isPlacebo', () => {
  expect(pillDay(reg, '2026-09-22')).toEqual({ index: 21, placebo: true });
});

test('test_pillDay_secondPack_wrapsAround', () => {
  expect(pillDay(reg, '2026-09-29')).toEqual({ index: 0, placebo: false });
});

test('test_packStart_midPack_returnsFirstDay', () => {
  expect(packStart(reg, '2026-10-05')).toBe('2026-09-29');
});

test('test_togglePill_twice_untakes', () => {
  expect(togglePill(togglePill(EMPTY_CARE, '2026-09-23'), '2026-09-23').pillTaken).toEqual([]);
});

test('test_kbExpiry_injection3_addsNinetyDays', () => {
  expect(kbExpiry({ type: 'suntik-3', start: '2026-09-01' })).toBe('2026-11-30');
});

test('test_isNaturalCycle_copperIud_isTrue', () => {
  expect(isNaturalCycle({ ...EMPTY_CARE, kb: { type: 'iud-tembaga', start: '2026-01-01' } })).toBe(true);
});
