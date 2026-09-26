import { expect, test } from '@jest/globals';

import { approach, FORBIDDEN_ANIMALS, followTarget, isPetId, PET_PRICES, PETS, pushTrail } from '../pets';
import { choosePet, EMPTY_UNLOCKS, mergeUnlocks, owns } from '../shop';

const line = (n: number) => Array.from({ length: n }, (_, i) => ({ x: i * 0.2, y: 0 }));

test('test_PETS_catalog_hasNoForbiddenAnimal', () => {
  expect(PETS.some((p) => FORBIDDEN_ANIMALS.some((f) => p.includes(f)))).toBe(false);
});

test('test_PET_PRICES_catIsFreeOthersInRange', () => {
  expect(PET_PRICES.kucing).toBe(0);
  expect(PETS.filter((p) => p !== 'kucing').every((p) => PET_PRICES[p] >= 80 && PET_PRICES[p] <= 350)).toBe(true);
});

test('test_isPetId_forbidden_isRejected', () => {
  expect(isPetId('anjing')).toBe(false);
  expect(isPetId('kucing')).toBe(true);
});

test('test_pushTrail_tinyMove_isNotRecorded', () => {
  const trail = [{ x: 0, y: 0 }];
  expect(pushTrail(trail, { x: 0.05, y: 0 })).toBe(trail);
});

test('test_pushTrail_long_isCapped', () => {
  let trail = line(1);
  for (let i = 1; i < 60; i++) trail = pushTrail(trail, { x: i * 0.2, y: 0 });
  expect(trail.length).toBe(24);
});

test('test_followTarget_longTrail_isAboutOneCellBehind', () => {
  expect(followTarget(line(20), 1)?.x).toBeCloseTo(2.8);
});

test('test_followTarget_shortTrail_isOldestPoint', () => {
  expect(followTarget(line(3), 1)).toEqual({ x: 0, y: 0 });
});

test('test_approach_farTarget_movesAtMostMaxStepAndFacesIt', () => {
  const next = approach({ x: 0, y: 0, facing: 'down', moving: false }, { x: -2, y: 0 }, 0.5);
  expect(next).toMatchObject({ x: -0.5, y: 0, facing: 'left', moving: true });
});

test('test_approach_atTarget_stops', () => {
  expect(approach({ x: 1, y: 1, facing: 'up', moving: true }, { x: 1, y: 1 }, 0.5).moving).toBe(false);
});

test('test_owns_starterCat_isFree', () => {
  expect(owns(EMPTY_UNLOCKS, { kind: 'pet', id: 'kucing' })).toBe(true);
});

test('test_choosePet_noneOrOwned_switchesLockedIgnored', () => {
  expect(choosePet(EMPTY_UNLOCKS, null, 3).pet).toBeNull();
  expect(choosePet(EMPTY_UNLOCKS, 'kelinci', 3).pet).toBe('kucing');
});

test('test_mergeUnlocks_pets_unionAndNewerChoiceWins', () => {
  const merged = mergeUnlocks(EMPTY_UNLOCKS, { ...EMPTY_UNLOCKS, pets: ['kelinci', 'anjing'], pet: 'kelinci', at: 5 });
  expect(merged.pets).toEqual(['kelinci']);
  expect(merged.pet).toBe('kelinci');
});
