import { type Facing, PLOT_COLS, PLOT_ROWS, type Point, SCENE_COLS, SCENE_ROWS, START } from './farm';
import { type FlowerId, FLOWERS } from './flowers';
import { type PlantStage, stageFromPercent } from './plantStage';

export const ANIMALS = ['rabbit', 'chick', 'cat', 'pig', 'fox', 'mouse'] as const;
export type Animal = (typeof ANIMALS)[number];
/** The fenced field holds 4 rows of 7 beds. */
export const MAX_BEDS = PLOT_COLS * PLOT_ROWS;

export type MemberBed = { userId: string; name: string; percent: number; stage: PlantStage; row: number; col: number };
export type PresenceMeta = { userId: string; name: string; animal: Animal };
export type Player = PresenceMeta & Point & { facing: Facing; moving: boolean };
export type Players = Record<string, Player>;
export type PosMessage = Point & { userId: string; facing: Facing; moving: boolean };

/** One bed per member, 7 per row, rows added as the group grows; ordered by name so beds don't swap places. */
export function buildGroupFarm(members: { userId: string; name: string; percent: number }[]): MemberBed[] {
  return [...members]
    .sort((a, b) => a.name.localeCompare(b.name) || a.userId.localeCompare(b.userId))
    .slice(0, MAX_BEDS)
    .map((m, i) => ({ ...m, stage: stageFromPercent(m.percent), row: Math.floor(i / PLOT_COLS), col: i % PLOT_COLS }));
}

/** First word of a display name, cut to fit under a bed. */
export function firstName(name: string, max = 9): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

/** FNV-1a hash of a user id: stable across devices and app versions. */
function hashId(userId: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < userId.length; i++) {
    h = Math.imul(h ^ userId.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

/** Same animal for the same user on every device. */
export function animalFor(userId: string): Animal {
  return ANIMALS[hashId(userId) % ANIMALS.length];
}

/** A member's flower on the group farm; we can't see other members' choice, so it's derived from their id. */
export function flowerFor(userId: string): FlowerId {
  return FLOWERS[hashId(userId) % FLOWERS.length].id;
}

const FACINGS: Facing[] = ['down', 'left', 'up', 'right'];
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

/** Reads Supabase presence state (untrusted: any client can track anything) into one meta per user. */
export function parsePresence(state: Record<string, unknown[]>): PresenceMeta[] {
  return Object.values(state).flatMap((entries) => {
    const meta = entries[0];
    if (!isRecord(meta) || typeof meta.userId !== 'string') return [];
    const name = typeof meta.name === 'string' ? meta.name.slice(0, 40) : 'Teman';
    const animal = ANIMALS.includes(meta.animal as Animal) ? (meta.animal as Animal) : animalFor(meta.userId);
    return [{ userId: meta.userId, name, animal }];
  });
}

/** Players present now: keeps known positions, adds newcomers at the start, drops who left. Skips `me`. */
export function mergePresence(players: Players, metas: PresenceMeta[], me: string): Players {
  const next: Players = {};
  for (const meta of metas) {
    if (meta.userId === me) continue;
    const known = players[meta.userId];
    next[meta.userId] = known ? { ...known, ...meta } : { ...meta, ...START, facing: 'down', moving: false };
  }
  return next;
}

/** Applies a 'pos' broadcast (untrusted) to a present player; ignores anything malformed. */
export function applyPos(players: Players, msg: unknown): Players {
  if (!isRecord(msg) || typeof msg.userId !== 'string' || !players[msg.userId]) return players;
  const { x, y, facing, moving } = msg;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) return players;
  const face = FACINGS.includes(facing as Facing) ? (facing as Facing) : 'down';
  const pos = { x: clamp(x, SCENE_COLS - 1), y: clamp(y, SCENE_ROWS - 1) };
  return { ...players, [msg.userId]: { ...players[msg.userId], ...pos, facing: face, moving: moving === true } };
}
