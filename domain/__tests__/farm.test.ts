import { expect, test } from '@jest/globals';

import { buildFarm, type FarmDay, facing, isWalkable, nearPlot, plotCaption, plotTile, START, step } from '../farm';

const days = (percents: number[]): FarmDay[] =>
  percents.map((percent, i) => ({ key: `2026-09-${String(i + 1).padStart(2, '0')}`, percent, onHaid: false }));

test('test_buildFarm_28days_fillsFourRowsOfSeven', () => {
  const plots = buildFarm(days(Array(28).fill(50)));
  expect(plots).toHaveLength(28);
  expect(plots[27]).toMatchObject({ row: 3, col: 6 });
});

test('test_buildFarm_oldestDay_isTopLeft', () => {
  const plots = buildFarm(days(Array(28).fill(0)));
  expect(plots[0]).toMatchObject({ key: '2026-09-01', row: 0, col: 0 });
});

test('test_buildFarm_percent_mapsToPlantStage', () => {
  const plots = buildFarm(days([0, 10, 40, 70, 100]));
  expect(plots.map((p) => p.stage)).toEqual([0, 1, 2, 3, 4]);
});

test('test_plotTile_secondRow_skipsAWalkway', () => {
  expect(plotTile({ row: 1, col: 0 })).toEqual({ x: 1, y: 16 });
});

test('test_plotCaption_monday_usesIndonesianNames', () => {
  expect(plotCaption('2026-09-21', 80)).toBe('Senin, 21 Sep · 80%');
});

test('test_isWalkable_pathAndField_areOpen', () => {
  expect(isWalkable(0, 9)).toBe(true);
  expect(isWalkable(7, 21)).toBe(true);
});

test('test_isWalkable_houseFenceAndOutside_areSolid', () => {
  expect(isWalkable(2, 6)).toBe(false);
  expect(isWalkable(0, 12)).toBe(false);
  expect(isWalkable(-1, 9)).toBe(false);
});

test('test_isWalkable_fenceGate_isOpen', () => {
  expect(isWalkable(4, 12)).toBe(true);
});

test('test_step_fullTiltRight_movesThreeCellsPerSecond', () => {
  expect(step({ x: 1, y: 9 }, { x: 1, y: 0 }, 1)).toEqual({ x: 4, y: 9 });
});

test('test_step_down_coversSameScreenDistanceInShortCells', () => {
  expect(step({ x: 4, y: 9 }, { x: 0, y: 1 }, 0.25).y).toBeCloseTo(10.5);
});

test('test_step_intoFence_staysPut', () => {
  expect(step({ x: 1, y: 10 }, { x: 0, y: 1 }, 0.2)).toEqual({ x: 1, y: 10 });
});

test('test_step_diagonalIntoWall_slidesAlongIt', () => {
  const next = step({ x: 1, y: 10 }, { x: 1, y: 1 }, 0.2);
  expect(next.y).toBe(10);
  expect(next.x).toBeCloseTo(1.6);
});

test('test_step_pastSceneEdge_isBlocked', () => {
  expect(step({ x: 0, y: 9 }, { x: -1, y: 0 }, 0.2).x).toBe(0);
});

test('test_facing_mostlyUp_facesUp', () => {
  expect(facing({ x: 0.2, y: -0.9 }, 'down')).toBe('up');
});

test('test_facing_mostlyLeft_facesLeft', () => {
  expect(facing({ x: -1, y: 0.3 }, 'down')).toBe('left');
});

test('test_facing_centred_keepsPrevious', () => {
  expect(facing({ x: 0, y: 0 }, 'right')).toBe('right');
});

test('test_nearPlot_onPath_isNone', () => {
  expect(nearPlot(START)).toBe(-1);
});

test('test_nearPlot_standingOnLastBed_returnsToday', () => {
  expect(nearPlot({ x: 7, y: 20 })).toBe(27);
});

test('test_nearPlot_walkwayAboveFirstBeds_returnsBedBelow', () => {
  expect(nearPlot({ x: 4, y: 13 })).toBe(3);
});

test('test_nearPlot_walkwayBetweenRows_returnsBedBelow', () => {
  expect(nearPlot({ x: 1, y: 15 })).toBe(7);
});
