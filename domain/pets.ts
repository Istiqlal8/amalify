import { facing, type Facing, type Point } from './farm';

/**
 * Pets that follow the player. The app is for Muslim women, so only animals that are halal and
 * not disliked are offered; the art comes from the CoMiGo pack (cat, chick, rabbit and recolours).
 */
export const PETS = ['kucing', 'anak-ayam', 'kelinci', 'kucing-oranye', 'kucing-putih'] as const;
export type PetId = (typeof PETS)[number];

/** Never offered, whatever art turns up: najis, fawāsiq or otherwise disliked. */
export const FORBIDDEN_ANIMALS = ['pig', 'babi', 'dog', 'anjing', 'mouse', 'rat', 'tikus', 'snake', 'ular', 'scorpion', 'kalajengking', 'crow', 'gagak'];

export const PET_NAMES: Record<PetId, string> = {
  kucing: 'Kucing',
  'anak-ayam': 'Anak ayam',
  kelinci: 'Kelinci',
  'kucing-oranye': 'Kucing oranye',
  'kucing-putih': 'Kucing putih',
};

/** Cats are beloved in Islamic tradition: the first one is free. */
export const PET_PRICES: Record<PetId, number> = { kucing: 0, 'anak-ayam': 80, kelinci: 150, 'kucing-oranye': 250, 'kucing-putih': 350 };
export const FREE_PET: PetId = 'kucing';

export function isPetId(value: unknown): value is PetId {
  return typeof value === 'string' && (PETS as readonly string[]).includes(value);
}

// --- Following -------------------------------------------------------------------------------

const TRAIL_STEP = 0.15; // cells between remembered points
const TRAIL_MAX = 24;
export const PET_GAP = 1; // how far behind the owner the pet walks, in cells

function dist(a: Point, b: Point): number {
  'worklet';
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Remembers where the owner walked; only adds a point once they've moved a little. */
export function pushTrail(trail: Point[], pos: Point): Point[] {
  'worklet';
  const last = trail[trail.length - 1];
  if (last && dist(last, pos) < TRAIL_STEP) return trail;
  const next = [...trail, { x: pos.x, y: pos.y }];
  return next.length > TRAIL_MAX ? next.slice(next.length - TRAIL_MAX) : next;
}

/** The spot on the owner's recent path `gap` cells behind them (or the oldest spot known). */
export function followTarget(trail: Point[], gapCells?: number): Point | null {
  'worklet';
  const gap = gapCells ?? PET_GAP;
  let walked = 0;
  for (let i = trail.length - 1; i > 0; i--) {
    walked += dist(trail[i], trail[i - 1]);
    if (walked >= gap) return trail[i - 1];
  }
  return trail[0] ?? null;
}

export type PetState = Point & { facing: Facing; moving: boolean };

/** Moves the pet up to `maxStep` cells toward `target`, facing the way it goes. */
export function approach(pet: PetState, target: Point | null, maxStep: number): PetState {
  'worklet';
  if (!target) return { ...pet, moving: false };
  const d = dist(pet, target);
  if (d < 0.02) return { ...pet, moving: false };
  const k = Math.min(1, maxStep / d);
  const v = { x: target.x - pet.x, y: target.y - pet.y };
  return { x: pet.x + v.x * k, y: pet.y + v.y * k, facing: facing(v, pet.facing), moving: true };
}
