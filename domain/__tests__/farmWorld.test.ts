import { expect, test } from '@jest/globals';

import { step } from '../farm';
import {
  BLOCK_COLS,
  BLOCK_FIELD,
  BLOCK_ROWS,
  blockAt,
  buildWorld,
  calendarSlots,
  CENTER_MAP,
  gateOf,
  monthAverage,
  monthLabel,
  monthList,
  RING,
  slotIndex,
  WORLD_COLS,
  WORLD_ROWS,
  WORLD_START,
  worldCollision,
  worldNear,
} from '../farmWorld';

const day = (key: string) => ({ key, percent: 50, onHaid: false });
const fields = buildWorld('2026-09-26', day);
const grid = worldCollision();

function walk(from: { x: number; y: number }, vec: { x: number; y: number }, seconds: number) {
  let pos = from;
  for (let t = 0; t < seconds; t += 0.05) pos = step(pos, vec, 0.05, grid);
  return pos;
}

test('test_monthList_twelve_newestFirstAcrossYear', () => {
  const months = monthList('2026-02-10');
  expect(months[0]).toEqual({ year: 2026, month: 1 });
  expect(months[2]).toEqual({ year: 2025, month: 11 });
});

test('test_monthLabel_september_isIndonesian', () => {
  expect(monthLabel(2026, 8)).toBe('September 2026');
});

test('test_calendarSlots_sept2026_startsTuesdayAndHas30Days', () => {
  const slots = calendarSlots(2026, 8);
  expect(slots[0]).toMatchObject({ key: '2026-09-01', week: 0, weekday: 1 });
  expect(slots).toHaveLength(30);
});

test('test_CENTER_MAP_size_isTwoByTwoBlocks', () => {
  expect(CENTER_MAP).toHaveLength(2 * BLOCK_ROWS);
  expect(CENTER_MAP.every((r) => r.length === 2 * BLOCK_COLS)).toBe(true);
});

test('test_RING_currentMonth_isNextToTheYard', () => {
  expect(RING[0]).toEqual([1, 0]);
  expect(new Set(RING.map(([x, y]) => `${x},${y}`)).size).toBe(12);
});

test('test_RING_eachStep_isAnAdjacentBlock', () => {
  const adjacent = RING.every(([x, y], i) => {
    const [nx, ny] = RING[(i + 1) % RING.length];
    return Math.abs(nx - x) + Math.abs(ny - y) === 1;
  });
  expect(adjacent).toBe(true);
});

test('test_buildWorld_currentMonth_isInFirstRingBlock', () => {
  expect(fields[0]).toMatchObject({ label: 'September 2026', left: BLOCK_COLS, top: 0 });
  expect(fields[11].label).toBe('Oktober 2025');
});

test('test_buildWorld_plotPosition_followsCalendar', () => {
  expect(fields[0].plots[0]).toMatchObject({ x: BLOCK_COLS + 3, y: 3 }); // Tue 1 Sep
});

test('test_buildWorld_futureDays_areBareBeds', () => {
  expect(fields[0].plots.find((p) => p.key === '2026-09-27')?.stage).toBe(0);
});

test('test_monthAverage_countsOnlyPastDays', () => {
  expect(monthAverage(fields[0], '2026-09-26')).toBe(50);
});

test('test_worldCollision_size_isWholeMap', () => {
  expect(grid).toHaveLength(WORLD_ROWS);
  expect(grid.every((r) => r.length === WORLD_COLS)).toBe(true);
});

test('test_worldCollision_startAndGates_areOpen', () => {
  expect(grid[WORLD_START.y][WORLD_START.x]).toBe('.');
  expect(grid[1][BLOCK_COLS + 5]).toBe('.');
  expect(grid[1][BLOCK_COLS + 4]).toBe('#');
});

test('test_step_fromHouse_walksUpIntoCurrentMonthField', () => {
  const pos = walk(WORLD_START, { x: 0, y: -1 }, 3);
  expect(BLOCK_FIELD[blockAt(pos).by * 4 + blockAt(pos).bx]).toBe(0);
});

test('test_step_alongTopPath_reachesNextMonthsGate', () => {
  const pos = walk(gateOf(0), { x: 1, y: 0 }, 11 / 3);
  expect(Math.round(pos.x)).toBe(gateOf(1).x);
});

test('test_worldNear_onFirstSeptBed_returnsItsIndex', () => {
  expect(worldNear(slotIndex(fields), BLOCK_FIELD, { x: BLOCK_COLS + 3, y: 3 })).toBe(0);
});

test('test_worldNear_emptySlotOrYard_isNone', () => {
  const slots = slotIndex(fields);
  expect(worldNear(slots, BLOCK_FIELD, { x: BLOCK_COLS + 2, y: 3 })).toBe(-1); // Monday before 1 Sep
  expect(worldNear(slots, BLOCK_FIELD, WORLD_START)).toBe(-1);
});
