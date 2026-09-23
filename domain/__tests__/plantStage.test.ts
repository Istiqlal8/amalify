import { expect, test } from '@jest/globals';

import { stageFromPercent, stageName } from '../plantStage';

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

test('test_stageName_tree_keepsTreeNames', () => {
  expect(stageName(4, true)).toBe('Pohon berbunga');
});

test('test_stageName_flower_budsThenBlooms', () => {
  expect([stageName(3, false), stageName(4, false)]).toEqual(['Kuncup', 'Mekar']);
});

test('test_stageName_seedling_sameForAll', () => {
  expect(stageName(1, false)).toBe('Tunas');
});
