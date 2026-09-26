
/**
 * Collision grid in scene cells ('#' solid, '.' walkable; the village map also uses '-' for low
 * obstacles a horse can jump: fences and hedges). Top: hedge, trees and
 * the two houses; then the dirt path, the fenced field (gate at column 4) with
 * the garden beds, and open grass with a pond below. Keep in sync with
 * scripts/build-farm-assets.py.
 */
export const COLLISION: string[] = [
  '#########', // 0 hedge
  '#########',
  '#########',
  '#########', // 3 trees, bush between the houses
  '####.####', // 4-8 houses
  '####.####',
  '####.####',
  '####.####',
  '####.####',
  '.........', // 9-10 path
  '.........',
  '.........',
  '####.####', // 12 fence + gate
  '#.......#', // 13-21 field; beds on 14, 16, 18, 20
  '#.......#',
  '#.......#',
  '#.......#',
  '#.......#',
  '#.......#',
  '#.......#',
  '#.......#',
  '#.......#',
  '#########', // 22 fence
  '.........',
  '.#.......', // 24 bush
  '......###', // 25-28 pond
  '......###',
  '......###',
  '......###',
  '.........',
  '...#.....', // 30 bush
  '.........',
  '.........',
  '.........',
  '.........',
  '#########', // 35 trees
];

export const SCENE_COLS = COLLISION[0].length;
export const SCENE_ROWS = COLLISION.length;
/** Cell height / cell width: the art is 3/4 view, so a cell is twice as wide as it is deep. */
export const CELL_ASPECT = 0.5;
export const PLOT_LEFT = 1;
export const PLOT_TOP = 14;
export const PLOT_ROW_STEP = 2;
export const PLOT_COLS = 7;
export const PLOT_ROWS = 4;
/** Full-tilt speed, in cell widths per second (vertical speed matches on screen). */
export const WALK_CELLS_PER_SEC = 3;

export type FarmDay = { key: string; percent: number; onHaid: boolean };
export type Point = { x: number; y: number };
export type Facing = 'down' | 'left' | 'up' | 'right';

/** Scene cell a plot's bed stands on. */
export function plotTile(plot: { row: number; col: number }): Point {
  return { x: PLOT_LEFT + plot.col, y: PLOT_TOP + plot.row * PLOT_ROW_STEP };
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "Senin, 21 Sep · 80%" for a YYYY-MM-DD key. */
export function plotCaption(key: string, percent: number): string {
  const d = new Date(`${key}T00:00`);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} · ${percent}%`;
}

/** Where the character starts: on the path, just above the gate. */
export const START: Point = { x: 4, y: 10 };

/** Open ground, or also a low obstacle ('-') while `jumping`. Outside the grid is never walkable. */
export function isWalkable(cellX: number, cellY: number, grid?: string[], jumping?: boolean): boolean {
  'worklet';
  const row = (grid ?? COLLISION)[cellY];
  const c = row === undefined ? undefined : row[cellX];
  return c === '.' || (jumping === true && c === '-');
}

// Feet hitbox inside the character's cell (position = the cell's top-left corner, in cells).
const FEET = { left: 0.25, right: 0.75, top: 0.2, bottom: 0.9 };

export function feetFit(x: number, y: number, grid?: string[], jumping?: boolean): boolean {
  'worklet';
  const x0 = Math.floor(x + FEET.left);
  const x1 = Math.floor(x + FEET.right);
  const y0 = Math.floor(y + FEET.top);
  const y1 = Math.floor(y + FEET.bottom);
  const ok = (cx: number, cy: number) => isWalkable(cx, cy, grid, jumping);
  return ok(x0, y0) && ok(x1, y0) && ok(x0, y1) && ok(x1, y1);
}

/**
 * Moves `pos` by joystick `vec` (each axis -1..1) for `dt` seconds on `grid` (default: the single-field farm), resolving
 * collisions per axis so the character slides along walls instead of sticking.
 */
export function step(pos: Point, vec: Point, dt: number, grid?: string[], jumping?: boolean): Point {
  'worklet';
  const nx = pos.x + vec.x * WALK_CELLS_PER_SEC * dt;
  const x = feetFit(nx, pos.y, grid, jumping) ? nx : pos.x;
  const ny = pos.y + (vec.y * WALK_CELLS_PER_SEC * dt) / CELL_ASPECT;
  const y = feetFit(x, ny, grid, jumping) ? ny : pos.y;
  return { x, y };
}

const LAND_REACH = 1.5; // cells a jump may stretch to clear a fence
const LAND_STEP = 0.1;

/**
 * Where a jump that ends at `pos` touches down: right there if it's open ground, else a little
 * further along `vec` (still clear of tall obstacles) — or back at `takeoff` if nowhere fits.
 * Never inside a fence, hedge or wall.
 */
export function land(pos: Point, takeoff: Point, vec: Point, grid?: string[]): Point {
  'worklet';
  if (feetFit(pos.x, pos.y, grid)) return pos;
  const len = Math.hypot(vec.x, vec.y / CELL_ASPECT);
  if (len === 0) return takeoff;
  const ux = vec.x / len;
  const uy = vec.y / CELL_ASPECT / len;
  for (let d = LAND_STEP; d <= LAND_REACH; d += LAND_STEP) {
    const x = pos.x + ux * d;
    const y = pos.y + uy * d;
    if (!feetFit(x, y, grid, true)) break;
    if (feetFit(x, y, grid)) return { x, y };
  }
  return takeoff;
}

/** Which way to face for a joystick vector: its dominant axis; `prev` when centred. */
export function facing(vec: Point, prev: Facing): Facing {
  'worklet';
  if (vec.x === 0 && vec.y === 0) return prev;
  if (Math.abs(vec.x) > Math.abs(vec.y)) return vec.x < 0 ? 'left' : 'right';
  return vec.y < 0 ? 'up' : 'down';
}

/** Index of the plot the character stands on or right in front of, or -1 when none is in reach. */
export function nearPlot(pos: Point): number {
  'worklet';
  const fx = pos.x + 0.5;
  const fy = pos.y + (FEET.top + FEET.bottom) / 2;
  const col = Math.min(Math.max(Math.floor(fx) - PLOT_LEFT, 0), PLOT_COLS - 1);
  const row = Math.min(Math.max(Math.round((fy - PLOT_TOP - 0.5) / PLOT_ROW_STEP), 0), PLOT_ROWS - 1);
  const dx = Math.abs(fx - (PLOT_LEFT + col + 0.5));
  const dy = Math.abs(fy - (PLOT_TOP + row * PLOT_ROW_STEP + 0.5));
  return dx <= 0.75 && dy <= 1 ? row * PLOT_COLS + col : -1;
}
