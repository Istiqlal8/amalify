import { dateKey } from './dayLog';
import { COLLISION, type FarmDay, type Point } from './farm';
import { type PlantStage, stageFromPercent } from './plantStage';

/**
 * Kebunku as one tall map: the houses and path on top (HEADER_ROWS), then one fenced field per
 * calendar month — this month first, nearest the house, older months further down — and a row of
 * trees to close it. Each field is a real calendar: 7 columns Monday–Sunday, up to 6 week rows.
 * Keep the row counts in sync with scripts/build-farm-assets.py.
 */
export const HEADER_ROWS = 11;
export const BLOCK_ROWS = 16;
export const TAIL_ROWS = 3;
export const MONTHS = 12;
export const WEEKS = 6;
export const DAYS_PER_WEEK = 7;
// Inside a block: path + sign on row 0, fence on 1, beds on rows 3, 5, … 13, fence on 15.
const FIRST_BED_ROW = 3;
const BED_ROW_STEP = 2;
const FIRST_BED_COL = 1;

export type WorldPlot = FarmDay & { x: number; y: number; stage: PlantStage };
export type WorldField = { index: number; year: number; month: number; label: string; top: number; plots: WorldPlot[] };

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function worldRows(months: number = MONTHS): number {
  return HEADER_ROWS + months * BLOCK_ROWS + TAIL_ROWS;
}

export function fieldTop(index: number): number {
  return HEADER_ROWS + index * BLOCK_ROWS;
}

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

/** Lays out 12 months of beds. `dayOf` gives each day's percentage (days after today count as 0). */
export function buildWorld(today: string, dayOf: (key: string) => FarmDay, months: number = MONTHS): WorldField[] {
  return monthList(today, months).map(({ year, month }, index) => {
    const top = fieldTop(index);
    const plots = calendarSlots(year, month).map(({ key, week, weekday }) => {
      const day = key > today ? { key, percent: 0, onHaid: false } : dayOf(key);
      const y = top + FIRST_BED_ROW + week * BED_ROW_STEP;
      return { ...day, x: FIRST_BED_COL + weekday, y, stage: stageFromPercent(day.percent) };
    });
    return { index, year, month, label: monthLabel(year, month), top, plots };
  });
}

const BLOCK = ['.........', '####.####', ...Array<string>(13).fill('#.......#'), '####.####'];
const TAIL = ['.........', '.........', '#########'];

/** Collision grid for the whole map: the single-field header, then a fenced block per month. */
export function worldCollision(months: number = MONTHS): string[] {
  return [...COLLISION.slice(0, HEADER_ROWS), ...Array.from({ length: months }, () => BLOCK).flat(), ...TAIL];
}

/** Flat lookup from (field, week, weekday) to an index in `fields.flatMap(f => f.plots)`, or -1. */
export function slotIndex(fields: WorldField[]): number[] {
  const slots = new Array<number>(fields.length * WEEKS * DAYS_PER_WEEK).fill(-1);
  let n = 0;
  for (const field of fields) {
    for (const plot of field.plots) {
      const week = (plot.y - field.top - FIRST_BED_ROW) / BED_ROW_STEP;
      slots[(field.index * WEEKS + week) * DAYS_PER_WEEK + plot.x - FIRST_BED_COL] = n++;
    }
  }
  return slots;
}

/** Which field (month index) a scene row falls in, clamped to the map. */
export function fieldAtRow(row: number, months?: number): number {
  'worklet';
  // No default parameter: worklets don't capture constants used in defaults.
  return Math.min(Math.max(Math.floor((row - HEADER_ROWS) / BLOCK_ROWS), 0), (months ?? MONTHS) - 1);
}

/** The bed the character stands on or right next to (index into the flat plot list), or -1. */
export function worldNear(slots: number[], pos: Point): number {
  'worklet';
  const fx = pos.x + 0.5;
  const fy = pos.y + 0.55;
  const field = Math.floor((fy - HEADER_ROWS) / BLOCK_ROWS);
  if (field < 0 || field * WEEKS * DAYS_PER_WEEK >= slots.length) return -1;
  const local = fy - (HEADER_ROWS + field * BLOCK_ROWS) - FIRST_BED_ROW;
  const week = Math.min(Math.max(Math.round((local - 0.5) / BED_ROW_STEP), 0), WEEKS - 1);
  const col = Math.min(Math.max(Math.floor(fx) - FIRST_BED_COL, 0), DAYS_PER_WEEK - 1);
  const dx = Math.abs(fx - (FIRST_BED_COL + col + 0.5));
  const dy = Math.abs(local - (week * BED_ROW_STEP + 0.5));
  if (dx > 0.75 || dy > 1) return -1;
  return slots[(field * WEEKS + week) * DAYS_PER_WEEK + col];
}
