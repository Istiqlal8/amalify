import { expect, test } from '@jest/globals';

import { stageFromPercent } from '../plantStage';

test('test_stageFromPercent_zero_isSeed', () => {
  expect(stageFromPercent(0)).toBe(0);
});

test('test_stageFromPercent_anyProgress_isSprout', () => {
  expect(stageFromPercent(1)).toBe(1);
});

test('test_stageFromPercent_thresholds_growInOrder', () => {
  expect([34, 35, 64, 65, 99].map(stageFromPercent)).toEqual([1, 2, 2, 3, 3]);
});

test('test_stageFromPercent_complete_isFlowering', () => {
  expect(stageFromPercent(100)).toBe(4);
});
