import { expect, test } from '@jest/globals';

import { START } from '../farm';
import { FLOWERS } from '../flowers';
import { animalFor, ANIMALS, applyPos, flowerFor, buildGroupFarm, firstName, mergePresence, parsePresence, type Players } from '../groupFarm';

const member = (name: string, percent = 0) => ({ userId: `id-${name}`, name, percent });
const player = { userId: 'b', name: 'Bila', animal: 'cat' as const, x: 4, y: 10, facing: 'down' as const, moving: false };

test('test_buildGroupFarm_eightMembers_wrapsToSecondRow', () => {
  const beds = buildGroupFarm(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((n) => member(n)));
  expect(beds[7]).toMatchObject({ name: 'H', row: 1, col: 0 });
});

test('test_buildGroupFarm_anyOrder_sortsByName', () => {
  const beds = buildGroupFarm([member('Zahra', 90), member('Aisyah', 10)]);
  expect(beds.map((b) => b.name)).toEqual(['Aisyah', 'Zahra']);
});

test('test_buildGroupFarm_percent_mapsToStage', () => {
  expect(buildGroupFarm([member('A', 100)])[0].stage).toBe(4);
});

test('test_buildGroupFarm_tooMany_capsAtFieldSize', () => {
  expect(buildGroupFarm(Array.from({ length: 40 }, (_, i) => member(`M${i}`)))).toHaveLength(28);
});

test('test_firstName_fullName_keepsFirstWord', () => {
  expect(firstName('  Siti Aisyah ')).toBe('Siti');
});

test('test_firstName_longName_isShortened', () => {
  expect(firstName('Muthmainnah')).toBe('Muthmain…');
});

test('test_animalFor_sameId_sameAnimal', () => {
  expect(animalFor('user-123')).toBe(animalFor('user-123'));
});

test('test_animalFor_manyIds_usesSeveralAnimals', () => {
  const seen = new Set(Array.from({ length: 60 }, (_, i) => animalFor(`user-${i}`)));
  expect(seen.size).toBeGreaterThan(3);
  expect([...seen].every((a) => ANIMALS.includes(a))).toBe(true);
});

test('test_flowerFor_sameId_sameFlower', () => {
  expect(flowerFor('user-123')).toBe(flowerFor('user-123'));
});

test('test_flowerFor_manyIds_usesSeveralValidSpecies', () => {
  const seen = new Set(Array.from({ length: 60 }, (_, i) => flowerFor(`user-${i}`)));
  expect(seen.size).toBeGreaterThan(5);
  expect([...seen].every((f) => FLOWERS.some((x) => x.id === f))).toBe(true);
});

test('test_parsePresence_badEntries_areSkipped', () => {
  expect(parsePresence({ a: [{ userId: 'a', name: 'Ana', animal: 'fox' }], b: [{ nope: 1 }] })).toEqual([
    { userId: 'a', name: 'Ana', animal: 'fox' },
  ]);
});

test('test_parsePresence_unknownAnimal_fallsBackToHash', () => {
  expect(parsePresence({ a: [{ userId: 'a', name: 'Ana', animal: 'dragon' }] })[0].animal).toBe(animalFor('a'));
});

test('test_mergePresence_newcomer_startsAtStart', () => {
  const next = mergePresence({}, [{ userId: 'b', name: 'Bila', animal: 'cat' }], 'me');
  expect(next.b).toMatchObject({ x: START.x, y: START.y });
});

test('test_mergePresence_me_isSkipped', () => {
  expect(mergePresence({}, [{ userId: 'me', name: 'Aku', animal: 'pig' }], 'me')).toEqual({});
});

test('test_mergePresence_leaver_isDropped_knownKeepsPosition', () => {
  const players: Players = { b: { ...player, x: 6 }, c: { ...player, userId: 'c' } };
  const next = mergePresence(players, [{ userId: 'b', name: 'Bila', animal: 'cat' }], 'me');
  expect(Object.keys(next)).toEqual(['b']);
  expect(next.b.x).toBe(6);
});

test('test_applyPos_valid_movesPlayer', () => {
  const next = applyPos({ b: player }, { userId: 'b', x: 2, y: 15, facing: 'left', moving: true });
  expect(next.b).toMatchObject({ x: 2, y: 15, facing: 'left', moving: true });
});

test('test_applyPos_unknownOrMalformed_isIgnored', () => {
  const players = { b: player };
  expect(applyPos(players, { userId: 'x', x: 1, y: 1 })).toBe(players);
  expect(applyPos(players, { userId: 'b', x: 'far', y: 1 })).toBe(players);
});

test('test_applyPos_outOfBounds_isClamped', () => {
  expect(applyPos({ b: player }, { userId: 'b', x: 999, y: -5, facing: 'up', moving: false }).b).toMatchObject({ x: 8, y: 0 });
});
