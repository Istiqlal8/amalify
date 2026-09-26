import { BLOCK_COLS, BLOCK_FIELD, BLOCK_ROWS, GRID } from './farmWorld';
import type { ThemeId } from './shop';

/** Nature only: no music anywhere on the farm. */
export type Ambience = 'birds' | 'waves' | 'wind' | 'crickets';
export type Sfx = 'step' | 'bed' | 'grab' | 'buy' | 'equip' | 'gate' | 'teleport';

const AMBIENCE: Record<ThemeId, Ambience> = { 'musim-semi': 'birds', sakura: 'birds', pantai: 'waves', salju: 'wind', malam: 'crickets' };

export function ambienceFor(theme: ThemeId): Ambience {
  return AMBIENCE[theme];
}

export const AMBIENCE_VOLUME = 0.3;
/** Quiet effects; footsteps quietest. */
export const SFX_VOLUME: Record<Sfx, number> = { step: 0.15, bed: 0.35, grab: 0.2, buy: 0.5, equip: 0.35, gate: 0.3, teleport: 0.4 };
export const STEP_EVERY_MS = 300;

/** Farm sounds play only when switched on, the screen is in front, and no Quran recitation is playing. */
export function soundAllowed(on: boolean, murottalPlaying: boolean, active: boolean): boolean {
  return on && active && !murottalPlaying;
}

/** Footsteps at most every STEP_EVERY_MS while walking. */
export function stepDue(lastStepAt: number, now: number): boolean {
  return now - lastStepAt >= STEP_EVERY_MS;
}

/** True when a map cell is a field gate (fence row 1 or 15, middle column) on the Kebun map. */
export function isGateCell(x: number, y: number): boolean {
  const bx = Math.floor(x / BLOCK_COLS);
  const by = Math.floor(y / BLOCK_ROWS);
  if (bx < 0 || by < 0 || bx >= GRID || by >= GRID || BLOCK_FIELD[by * GRID + bx] < 0) return false;
  const local = y - by * BLOCK_ROWS;
  return x - bx * BLOCK_COLS === 5 && (local === 1 || local === 15);
}
