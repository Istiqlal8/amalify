import { dateKey } from './dayLog';
import type { FarmDay, Point } from './farm';
import { type PlantStage, stageFromPercent } from './plantStage';

/**
 * Kebunku as a village map: a 4×4 grid of blocks. The middle 2×2 is the yard with the houses,
 * ponds and paths (CENTER_MAP); the 12 blocks around it are one fenced field per calendar month.
 * This month sits right above the house; older months follow the ring clockwise. Every block row
 * starts with a dirt path, and each field has a gate top and bottom on its middle column.
 * scripts/build-farm-assets.py reads CENTER_MAP from this file to draw the yard.
 */
export const BLOCK_COLS = 11;
export const BLOCK_ROWS = 16;
export const GRID = 4;
export const WORLD_COLS = GRID * BLOCK_COLS;
export const WORLD_ROWS = GRID * BLOCK_ROWS;
export const MONTHS = 12;
export const WEEKS = 6;
export const DAYS_PER_WEEK = 7;
const GATE_COL = 5;
const FIRST_BED_COL = 2;
const FIRST_BED_ROW = 3;
const BED_ROW_STEP = 2;

/** Field blocks clockwise from the one above the house: [blockX, blockY]. */
export const RING: [number, number][] = [
  [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [2, 3], [1, 3], [0, 3], [0, 2], [0, 1], [0, 0],
];

// Yard legend: '=' path, '.' grass, 'f' flowers (walkable); 'H' house, 'B' barn, 'W' pond,
// 'T' tree, 'b' bush, 'r' rose hedge (solid). 22 × 32 cells = the middle 2×2 blocks.
// CENTER_MAP_START
export const CENTER_MAP = [
  '======================',
  'T....=....T.T...=.....',
  '.....=......f.T.=.....',
  '.HHHH=..........=.WWWW',
  '.HHHH=BBBB......=.WWWW',
  '.HHHH=BBBB......=.WWWW',
  '.HHHH=BBBB......=.WWWW',
  '.HHHH=BBBB..b...=.WWWW',
  '.HHHH=BBBB......=.....',
  '======================',
  '======================',
  '...b.=..........=.....',
  '.T...=f..f....b.=...T.',
  '...T.=..T.......=.f...',
  '.....=......T...=..b..',
  '..f..=..........=.....',
  '======================',
  '.....=..........=.....',
  '...f.=..b.......=.....',
  '.....=......f...=..T..',
  '..T..=.....b....=.....',
  '.....=.......T..=.....',
  '.f...=.WWWW.....=.....',
  '.....=.WWWW.....=...b.',
  '.....=.WWWW....f=..T..',
  '.....=.WWWW...T.=.....',
  '.....=.WWWW.f...=.....',
  '..b..=..........=..f..',
  '.....=..T.......=...T.',
  '.T...=.....f....=.....',
  '.....=..........=.....',
  'rrrrr=rrrrrrrrrr=rrrrr',
];
// CENTER_MAP_END

/** A field block: path on row 0, fence with a 3-cell gate on rows 1 and 15, hedges/trees on the outer columns. */
const FIELD_BLOCK = ['...........', '####...####', ...Array<string>(13).fill('##.......##'), '####...####'];

/** Sprites rise this far above their footprint (keep in sync with scripts/farm_world.py). */
export const HOUSE_EXTRA_ROWS = 0.6;

/**
 * Where a house sprite goes on the map, in cells: the footprint of 'H' (main house) or 'B' (second
 * building) in CENTER_MAP, extended HOUSE_EXTRA_ROWS upwards. The footprint stays solid whatever tier.
 */
export function buildingSprite(mark: 'H' | 'B'): { x: number; y: number; w: number; h: number } {
  const cells = CENTER_MAP.flatMap((line, r) => [...line].flatMap((c, col) => (c === mark ? [{ r, col }] : [])));
  const c0 = Math.min(...cells.map((p) => p.col));
  const c1 = Math.max(...cells.map((p) => p.col));
  const r0 = Math.min(...cells.map((p) => p.r));
  const r1 = Math.max(...cells.map((p) => p.r));
  return { x: BLOCK_COLS + c0, y: BLOCK_ROWS + r0 - HOUSE_EXTRA_ROWS, w: c1 - c0 + 1, h: r1 - r0 + 1 + HOUSE_EXTRA_ROWS };
}

/** Lantern glow for the night theme: in front of the house and the barn doors. */
export const WORLD_LANTERNS: Point[] = [
  { x: BLOCK_COLS + 2.5, y: BLOCK_ROWS + 8.4 },
  { x: BLOCK_COLS + 8, y: BLOCK_ROWS + 8.4 },
];

/** Where the character starts: on the yard's cross path, just below the houses. */
export const WORLD_START: Point = { x: BLOCK_COLS + GATE_COL, y: BLOCK_ROWS + 10 };

export type WorldPlot = FarmDay & { x: number; y: number; stage: PlantStage };
/** `short` is the overview map's tile label. */
export type WorldField = { index: number; year: number; month: number; label: string; short: string; left: number; top: number; plots: WorldPlot[] };

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function monthLabel(year: number, month: number): string {
  return `${BULAN[month]} ${year}`;
}

/** This month and the ones before it, newest first; `month` is 0-based. */
export function monthList(today: string, count: number = MONTHS): { year: number; month: number }[] {
  const [y, m] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(y, m - 1 - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

/** Every day of the month with its calendar slot: week row and weekday column (Monday = 0). */
export function calendarSlots(year: number, month: number): { key: string; week: number; weekday: number }[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const slot = offset + i;
    return { key: dateKey(new Date(year, month, i + 1)), week: Math.floor(slot / 7), weekday: slot % 7 };
  });
}

/** Lays out the 12 month fields around the yard. `dayOf` gives each day's percentage (days after today count as 0). */
export function buildWorld(today: string, dayOf: (key: string) => FarmDay): WorldField[] {
  return monthList(today).map(({ year, month }, index) => {
    const label = monthLabel(year, month);
    return buildField({ index, year, month, label, short: `${label.slice(0, 3)} ${String(year).slice(2)}` }, today, dayOf);
  });
}

type FieldInfo = Pick<WorldField, 'index' | 'year' | 'month' | 'label' | 'short'>;

/** One field on ring slot `info.index`: a bed per day of the month, in calendar order. */
export function buildField(info: FieldInfo, today: string, dayOf: (key: string) => FarmDay, ring = RING): WorldField {
  const [bx, by] = ring[info.index];
  const left = bx * BLOCK_COLS;
  const top = by * BLOCK_ROWS;
  const plots = calendarSlots(info.year, info.month).map(({ key, week, weekday }) => {
    const day = key > today ? { key, percent: 0, onHaid: false } : dayOf(key);
    const at = { x: left + FIRST_BED_COL + weekday, y: top + FIRST_BED_ROW + week * BED_ROW_STEP };
    return { ...day, ...at, stage: stageFromPercent(day.percent) };
  });
  return { ...info, left, top, plots };
}

/** Average percentage of a field's days up to today (0 when none). */
export function monthAverage(field: WorldField, today: string): number {
  const past = field.plots.filter((p) => p.key <= today);
  return past.length ? Math.round(past.reduce((sum, p) => sum + p.percent, 0) / past.length) : 0;
}

/** The spot on the path just outside a field's top gate: where the overview map drops the character. */
export function gateOf(index: number, ring = RING): Point {
  const [bx, by] = ring[index];
  return { x: bx * BLOCK_COLS + GATE_COL, y: by * BLOCK_ROWS };
}

const SOLID_YARD = new Set(['H', 'B', 'W', 'T', 'b', 'r']);

/** Collision grid for the whole map (blockRows × BLOCK_ROWS strings of WORLD_COLS). */
export function worldCollision(blockRows = GRID): string[] {
  return Array.from({ length: blockRows * BLOCK_ROWS }, (_, y) => {
    let row = '';
    for (let bx = 0; bx < GRID; bx++) row += blockRow(bx, Math.floor(y / BLOCK_ROWS), y % BLOCK_ROWS);
    return row;
  });
}

function blockRow(bx: number, by: number, local: number): string {
  const inYard = bx >= 1 && bx <= 2 && by >= 1 && by <= 2;
  if (!inYard) return FIELD_BLOCK[local];
  const yard = CENTER_MAP[(by - 1) * BLOCK_ROWS + local].slice((bx - 1) * BLOCK_COLS, bx * BLOCK_COLS);
  return [...yard].map((c) => (SOLID_YARD.has(c) ? '#' : '.')).join('');
}

/** Which block each field sits on, and how many block rows the map has. */
export type Layout = { ring: [number, number][]; blockRows: number };

/** The group map: the Kebunku ring, then rows of GRID field blocks below it for every field past the 12th. */
export function groupLayout(fields: number): Layout {
  const extra = Math.ceil(Math.max(0, fields - RING.length) / GRID);
  const below = Array.from({ length: extra * GRID }, (_, i): [number, number] => [i % GRID, GRID + Math.floor(i / GRID)]);
  return { ring: [...RING, ...below], blockRows: GRID + extra };
}

/** Field index per block (row-major, GRID wide), -1 for the yard and empty blocks. */
export function blockFields({ ring, blockRows }: Layout): number[] {
  return Array.from({ length: GRID * blockRows }, (_, i) => ring.findIndex(([bx, by]) => by * GRID + bx === i));
}

export const BLOCK_FIELD: number[] = blockFields({ ring: RING, blockRows: GRID });

/** The block a scene position is in, clamped to a map `blockRows` blocks tall. */
export function blockAt(pos: Point, blockRows = GRID): { bx: number; by: number } {
  'worklet';
  const bx = Math.min(Math.max(Math.floor((pos.x + 0.5) / BLOCK_COLS), 0), GRID - 1);
  const by = Math.min(Math.max(Math.floor((pos.y + 0.55) / BLOCK_ROWS), 0), blockRows - 1);
  return { bx, by };
}

/** Flat lookup from (month, week, weekday) to an index in `fields.flatMap(f => f.plots)`, or -1. */
export function slotIndex(fields: WorldField[]): number[] {
  const count = Math.max(MONTHS, ...fields.map((f) => f.index + 1));
  const slots = new Array<number>(count * WEEKS * DAYS_PER_WEEK).fill(-1);
  let n = 0;
  for (const field of fields) {
    for (const plot of field.plots) {
      const week = (plot.y - field.top - FIRST_BED_ROW) / BED_ROW_STEP;
      slots[(field.index * WEEKS + week) * DAYS_PER_WEEK + plot.x - field.left - FIRST_BED_COL] = n++;
    }
  }
  return slots;
}

/** The bed the character stands on or right next to (index into the flat plot list), or -1. */
export function worldNear(slots: number[], blockField: number[], pos: Point): number {
  'worklet';
  const { bx, by } = blockAt(pos, blockField.length / GRID);
  const month = blockField[by * GRID + bx];
  if (month < 0) return -1;
  const fx = pos.x + 0.5 - bx * BLOCK_COLS - FIRST_BED_COL;
  const fy = pos.y + 0.55 - by * BLOCK_ROWS - FIRST_BED_ROW;
  const week = Math.min(Math.max(Math.round((fy - 0.5) / BED_ROW_STEP), 0), WEEKS - 1);
  const col = Math.min(Math.max(Math.floor(fx), 0), DAYS_PER_WEEK - 1);
  if (Math.abs(fx - (col + 0.5)) > 0.75 || Math.abs(fy - (week * BED_ROW_STEP + 0.5)) > 1) return -1;
  return slots[(month * WEEKS + week) * DAYS_PER_WEEK + col];
}
