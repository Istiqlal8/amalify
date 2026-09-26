import { expect, test } from '@jest/globals';

import { BLOCK_ROWS, GRID, WORLD_COLS, WORLD_START } from '../farmWorld';
import { FLOWERS } from '../flowers';
import { animalFor, ANIMALS, applyPos, flowerFor, buildGroupWorld, firstName, MAX_FIELDS, mergePresence, parsePresence, type Players } from '../groupFarm';

const member = (name: string, days: Record<string, number> = {}) => ({ userId: `id-${name}`, name, days });
const player = { userId: 'b', name: 'Bila', animal: 'cat' as const, flower: 'mawar' as const, pet: null, x: 4, y: 10, facing: 'down' as const, moving: false };
const TODAY = '2026-09-26';

test('test_buildGroupWorld_me_getsFirstSlotOthersByName', () => {
  const fields = buildGroupWorld(TODAY, [member('Zahra'), member('Aisyah'), member('Nur')], 'id-Zahra');
  expect(fields.map((f) => f.label)).toEqual(['Zahra', 'Aisyah', 'Nur']);
});

test('test_buildGroupWorld_field_hasEveryDayOfThisMonth', () => {
  const [field] = buildGroupWorld(TODAY, [member('A', { '2026-09-02': 100 })], 'id-A');
  expect(field.plots).toHaveLength(30);
  expect(field.plots.find((p) => p.key === '2026-09-02')).toMatchObject({ percent: 100, stage: 4 });
});

test('test_buildGroupWorld_twentyMembers_extraFieldsBelowTheMap', () => {
  const fields = buildGroupWorld(TODAY, Array.from({ length: 20 }, (_, i) => member(`M${String(i).padStart(2, '0')}`)), 'x');
  expect(fields).toHaveLength(20);
  expect(fields[12]).toMatchObject({ left: 0, top: GRID * BLOCK_ROWS });
});

test('test_buildGroupWorld_tooMany_capsAtMaxFields', () => {
  expect(buildGroupWorld(TODAY, Array.from({ length: 50 }, (_, i) => member(`M${i}`)), 'x')).toHaveLength(MAX_FIELDS);
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
  expect(parsePresence({ a: [{ userId: 'a', name: 'Ana', animal: 'fox', flower: 'tulip' }], b: [{ nope: 1 }] })).toEqual([
    { userId: 'a', name: 'Ana', animal: 'fox', flower: 'tulip', pet: null },
  ]);
});

test('test_parsePresence_unknownAnimal_fallsBackToHash', () => {
  expect(parsePresence({ a: [{ userId: 'a', name: 'Ana', animal: 'dragon' }] })[0].animal).toBe(animalFor('a'));
});

test('test_parsePresence_missingFlower_fallsBackToHash', () => {
  expect(parsePresence({ a: [{ userId: 'a', name: 'Ana', animal: 'fox' }] })[0].flower).toBe(flowerFor('a'));
});

test('test_parsePresence_removedPig_fallsBackToHash', () => {
  expect(parsePresence({ a: [{ userId: 'a', name: 'Ana', animal: 'pig' }] })[0].animal).toBe(animalFor('a'));
});

test('test_mergePresence_newcomer_startsAtStart', () => {
  const next = mergePresence({}, [{ userId: 'b', name: 'Bila', animal: 'cat', flower: 'mawar', pet: null }], 'me');
  expect(next.b).toMatchObject({ x: WORLD_START.x, y: WORLD_START.y });
});

test('test_mergePresence_me_isSkipped', () => {
  expect(mergePresence({}, [{ userId: 'me', name: 'Aku', animal: 'cat', flower: 'daisy', pet: null }], 'me')).toEqual({});
});

test('test_mergePresence_leaver_isDropped_knownKeepsPosition', () => {
  const players: Players = { b: { ...player, x: 6 }, c: { ...player, userId: 'c' } };
  const next = mergePresence(players, [{ userId: 'b', name: 'Bila', animal: 'cat', flower: 'mawar', pet: null }], 'me');
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
  expect(applyPos({ b: player }, { userId: 'b', x: 999, y: -5, facing: 'up', moving: false }).b).toMatchObject({ x: WORLD_COLS - 1, y: 0 });
});

test('test_parsePresence_pet_keptWhenAllowedElseNone', () => {
  const metas = parsePresence({ a: [{ userId: 'a', name: 'A', pet: 'kelinci' }], b: [{ userId: 'b', name: 'B', pet: 'anjing' }] });
  expect(metas.map((m) => m.pet)).toEqual(['kelinci', null]);
});
