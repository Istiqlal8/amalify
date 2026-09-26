import { expect, test } from '@jest/globals';

import { step } from '../farm';
import {
  buildWorld,
  calendarSlots,
  fieldAtRow,
  fieldTop,
  monthLabel,
  monthList,
  slotIndex,
  worldCollision,
  worldNear,
  worldRows,
} from '../farmWorld';

const day = (key: string) => ({ key, percent: 50, onHaid: false });

test('test_monthList_twelve_newestFirstAcrossYear', () => {
  const months = monthList('2026-02-10');
  expect(months[0]).toEqual({ year: 2026, month: 1 });
  expect(months[2]).toEqual({ year: 2025, month: 11 });
  expect(months).toHaveLength(12);
});

test('test_monthLabel_september_isIndonesian', () => {
  expect(monthLabel(2026, 8)).toBe('September 2026');
});

test('test_calendarSlots_sept2026_startsTuesdayAndHas30Days', () => {
  const slots = calendarSlots(2026, 8);
  expect(slots[0]).toMatchObject({ key: '2026-09-01', week: 0, weekday: 1 });
  expect(slots).toHaveLength(30);
});

test('test_calendarSlots_sundayFirst_goesToLastColumn', () => {
  expect(calendarSlots(2026, 1)[0]).toMatchObject({ week: 0, weekday: 6 }); // 1 Feb 2026 is a Sunday
});

test('test_buildWorld_currentMonth_isFirstFieldNearHouse', () => {
  const fields = buildWorld('2026-09-26', day);
  expect(fields[0]).toMatchObject({ label: 'September 2026', top: 11 });
  expect(fields[1].label).toBe('Agustus 2026');
});

test('test_buildWorld_futureDays_areBareBeds', () => {
  const plot = buildWorld('2026-09-26', day)[0].plots.find((p) => p.key === '2026-09-27');
  expect(plot?.stage).toBe(0);
});

test('test_buildWorld_plotPosition_followsCalendar', () => {
  const plot = buildWorld('2026-09-26', day)[0].plots[0]; // Tue 1 Sep: column 2, first bed row
  expect(plot).toMatchObject({ x: 2, y: 14 });
});

test('test_worldCollision_size_matchesRows', () => {
  expect(worldCollision()).toHaveLength(worldRows());
  expect(worldRows()).toBe(11 + 12 * 16 + 3);
});

test('test_worldCollision_gates_areOpenFencesSolid', () => {
  const grid = worldCollision();
  expect(grid[fieldTop(3) + 1]).toBe('####.####');
  expect(grid[fieldTop(3) + 15][4]).toBe('.');
});

test('test_step_worldGrid_walksDownThroughGatesIntoOlderMonth', () => {
  const grid = worldCollision();
  let pos = { x: 4, y: fieldTop(0) + 12 };
  for (let i = 0; i < 20; i++) pos = step(pos, { x: 0, y: 1 }, 0.1, grid);
  expect(fieldAtRow(pos.y + 0.55)).toBe(1);
});

test('test_worldNear_onFirstSeptBed_returnsItsIndex', () => {
  const fields = buildWorld('2026-09-26', day);
  expect(worldNear(slotIndex(fields), { x: 2, y: 14 })).toBe(0);
});

test('test_worldNear_emptyCalendarSlot_isNone', () => {
  const fields = buildWorld('2026-09-26', day);
  expect(worldNear(slotIndex(fields), { x: 1, y: 14 })).toBe(-1); // Monday before 1 Sep
});

test('test_worldNear_onPath_isNone', () => {
  const fields = buildWorld('2026-09-26', day);
  expect(worldNear(slotIndex(fields), { x: 4, y: 10 })).toBe(-1);
});
