import { expect, test } from '@jest/globals';

import { compassPoint, isAligned, normalize, qiblaBearing, turnTo } from '../qibla';

test('test_qiblaBearing_bandung_matchesAladhanApi', () => {
  // api.aladhan.com/v1/qibla/-6.9175/107.6191 → 295.1672751348155
  expect(qiblaBearing(-6.9175, 107.6191)).toBeCloseTo(295.167, 2);
});

test('test_qiblaBearing_london_isSouthEast', () => {
  expect(qiblaBearing(51.5074, -0.1278)).toBeCloseTo(118.99, 0);
});

test('test_normalize_negative_wrapsIntoRange', () => {
  expect(normalize(-30)).toBe(330);
});

test('test_turnTo_targetLeftAcrossNorth_isNegative', () => {
  expect(turnTo(350, 10)).toBe(-20);
});

test('test_turnTo_targetRight_isPositive', () => {
  expect(turnTo(295, 250)).toBe(45);
});

test('test_isAligned_withinTolerance_isTrue', () => {
  expect(isAligned(295, 291)).toBe(true);
});

test('test_isAligned_outsideTolerance_isFalse', () => {
  expect(isAligned(295, 285)).toBe(false);
});

test('test_compassPoint_westNorthWest_roundsToBaratLaut', () => {
  expect(compassPoint(295)).toBe('BL');
});
