/** Things bought for the farm beyond looks: a horse to ride and bigger houses on the yard. */
export const MOUNTS = ['kuda'] as const;
export type MountId = (typeof MOUNTS)[number];
export const MOUNT_NAMES: Record<MountId, string> = { kuda: 'Kuda' };
export const MOUNT_PRICES: Record<MountId, number> = { kuda: 500 };
/** Riding is this much faster than walking. */
export const RIDE_SPEED = 1.8;

export const HOUSES = ['kayu', 'bata', 'mewah'] as const;
export type HouseId = (typeof HOUSES)[number];
export const HOUSE_NAMES: Record<HouseId, string> = { kayu: 'Rumah kayu', bata: 'Rumah bata', mewah: 'Rumah mewah' };
/** The wooden house is what every farm starts with. */
export const HOUSE_PRICES: Record<HouseId, number> = { kayu: 0, bata: 900, mewah: 1500 };
export const DEFAULT_HOUSE: HouseId = 'kayu';

export function isMountId(value: unknown): value is MountId {
  return typeof value === 'string' && (MOUNTS as readonly string[]).includes(value);
}

export function isHouseId(value: unknown): value is HouseId {
  return typeof value === 'string' && (HOUSES as readonly string[]).includes(value);
}

/** A horse jump: how long it lasts and how high the arc goes (in cells). */
export const JUMP_SECONDS = 0.5;
export const JUMP_HEIGHT = 0.9;

/** 0..1 height of the jump arc at `elapsed` seconds into a jump (0 when not jumping). */
export function jumpArc(elapsed: number): number {
  'worklet';
  if (elapsed < 0 || elapsed >= JUMP_SECONDS) return 0;
  return Math.sin((elapsed / JUMP_SECONDS) * Math.PI);
}
