import { useMemo } from 'react';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

import { JUMP_SECONDS } from '@/domain/estate';
import { type Facing, facing, land, type Point, START, step } from '@/domain/farm';

const MAX_DT = 0.05; // seconds; avoids a big jump after a dropped frame

/**
 * The player's live state, shared with the joystick (vec) and anything that syncs it (pos, face).
 * `speed` multiplies the walking speed (1 on foot, RIDE_SPEED on horseback); `jump` is the time into
 * a horse jump in seconds, -1 when not jumping, and `takeoff` where it started.
 */
export type Motion = {
  vec: SharedValue<Point>;
  pos: SharedValue<Point>;
  face: SharedValue<Facing>;
  speed: SharedValue<number>;
  jump: SharedValue<number>;
  takeoff: SharedValue<Point>;
};

export function useMotion(start: Point = START): Motion {
  const vec = useSharedValue<Point>({ x: 0, y: 0 });
  const pos = useSharedValue<Point>(start);
  const face = useSharedValue<Facing>('down');
  const speed = useSharedValue(1);
  const jump = useSharedValue(-1);
  const takeoff = useSharedValue<Point>(start);
  return useMemo(() => ({ vec, pos, face, speed, jump, takeoff }), [vec, pos, face, speed, jump, takeoff]);
}

/** Sets the speed multiplier (getting on or off the horse). */
export function setMotionSpeed(m: Motion, speed: number): void {
  m.speed.value = speed;
}

/** Moves the character straight to `to` (the overview map's teleport). */
export function placeCharacter(m: Motion, to: Point): void {
  m.pos.value = to;
}

/** Starts a horse jump unless one is already under way. */
export function startJump(m: Motion): void {
  if (m.jump.value >= 0) return;
  m.takeoff.value = m.pos.value;
  m.jump.value = 0;
}

/** One frame of movement: face the stick, step with collisions (fences passable mid-jump), land safely. */
export function tick(m: Motion, walked: SharedValue<number>, frameMs: number, grid: string[] | undefined): void {
  'worklet';
  const v = m.vec.value;
  const dt = Math.min(frameMs / 1000, MAX_DT);
  const jumping = m.jump.value >= 0;
  m.face.value = facing(v, m.face.value);
  if (jumping) m.jump.value += dt;
  if (v.x === 0 && v.y === 0 && !jumping) {
    walked.value = -1;
    return;
  }
  const s = m.speed.value;
  m.pos.value = step(m.pos.value, { x: v.x * s, y: v.y * s }, dt, grid, jumping);
  if (jumping && m.jump.value >= JUMP_SECONDS) {
    m.pos.value = land(m.pos.value, m.takeoff.value, v, grid);
    m.jump.value = -1;
  }
  walked.value = Math.max(walked.value, 0) + dt;
}
