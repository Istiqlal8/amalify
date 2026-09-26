import type { Facing, Point } from './farm';
import { BLOCK_ROWS, buildField, groupLayout, WORLD_COLS, WORLD_START, type WorldField } from './farmWorld';
import { type FlowerId, FLOWERS, isFlowerId } from './flowers';
import { isPetId, type PetId } from './pets';

export const ANIMALS = ['rabbit', 'chick', 'cat', 'fox'] as const;
export type Animal = (typeof ANIMALS)[number];
export type PresenceMeta = { userId: string; name: string; animal: Animal; flower: FlowerId; pet: PetId | null };
export type Player = PresenceMeta & Point & { facing: Facing; moving: boolean };
export type Players = Record<string, Player>;
export type PosMessage = Point & { userId: string; facing: Facing; moving: boolean };

/** A member and their shared percentage per day (YYYY-MM-DD). */
export type MemberMonth = { userId: string; name: string; days: Record<string, number> };
export type MemberField = WorldField & { userId: string };

/** The group map grows a row of fields per 4 members past 12; this caps how long it gets. */
export const MAX_FIELDS = 40;
/** Height of the largest group map, in cells: where remote positions are clamped. */
const MAX_ROWS = groupLayout(MAX_FIELDS).blockRows * BLOCK_ROWS;

/**
 * Kebun grup: each member's field for this month, one per block of `groupLayout` (up to MAX_FIELDS).
 * Mine sits right above the house; the rest follow by name so fields don't swap places.
 */
export function buildGroupWorld(today: string, members: MemberMonth[], me: string): MemberField[] {
  const [year, month] = today.split('-').map(Number);
  const { ring } = groupLayout(Math.min(members.length, MAX_FIELDS));
  return [...members]
    .sort((a, b) => Number(b.userId === me) - Number(a.userId === me) || a.name.localeCompare(b.name) || a.userId.localeCompare(b.userId))
    .slice(0, MAX_FIELDS)
    .map((m, index) => {
      const info = { index, year, month: month - 1, label: m.name, short: firstName(m.name, 7) };
      const field = buildField(info, today, (key) => ({ key, percent: m.days[key] ?? 0, onHaid: false }), ring);
      return { ...field, userId: m.userId };
    });
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
    const flower = typeof meta.flower === 'string' && isFlowerId(meta.flower) ? meta.flower : flowerFor(meta.userId);
    return [{ userId: meta.userId, name, animal, flower, pet: isPetId(meta.pet) ? meta.pet : null }];
  });
}

/** Players present now: keeps known positions, adds newcomers at the start, drops who left. Skips `me`. */
export function mergePresence(players: Players, metas: PresenceMeta[], me: string): Players {
  const next: Players = {};
  for (const meta of metas) {
    if (meta.userId === me) continue;
    const known = players[meta.userId];
    next[meta.userId] = known ? { ...known, ...meta } : { ...meta, ...WORLD_START, facing: 'down', moving: false };
  }
  return next;
}

/** Applies a 'pos' broadcast (untrusted) to a present player; ignores anything malformed. */
export function applyPos(players: Players, msg: unknown): Players {
  if (!isRecord(msg) || typeof msg.userId !== 'string' || !players[msg.userId]) return players;
  const { x, y, facing, moving } = msg;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) return players;
  const face = FACINGS.includes(facing as Facing) ? (facing as Facing) : 'down';
  const pos = { x: clamp(x, WORLD_COLS - 1), y: clamp(y, MAX_ROWS - 1) };
  return { ...players, [msg.userId]: { ...players[msg.userId], ...pos, facing: face, moving: moving === true } };
}
