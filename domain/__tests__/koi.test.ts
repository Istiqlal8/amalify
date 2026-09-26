import { expect, test } from '@jest/globals';

import { koiAt } from '../koi';

test('test_koiAt_wholeLap_staysInsideThePond', () => {
  const points = Array.from({ length: 200 }, (_, i) => koiAt(i / 200, 1));
  expect(points.every((p) => p.x > 0.1 && p.x < 0.9)).toBe(true);
  expect(points.every((p) => p.y > 0.1 && p.y < 0.9)).toBe(true);
});

test('test_koiAt_phaseOne_returnsToStart', () => {
  expect(koiAt(1, 0).x).toBeCloseTo(koiAt(0, 0).x);
  expect(koiAt(1, 0).y).toBeCloseTo(koiAt(0, 0).y);
});

test('test_koiAt_start_headsRightAndDown', () => {
  expect(koiAt(0, 0).angle).toBeGreaterThan(0);
  expect(koiAt(0, 0).angle).toBeLessThan(90);
});
