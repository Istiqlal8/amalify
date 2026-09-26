import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { CELL_ASPECT, type Facing, facing, nearPlot, type Point, START, step } from '@/domain/farm';
import type { MountId } from '@/domain/estate';
import type { Animal } from '@/domain/groupFarm';

import { CharacterSprite } from './CharacterSprite';
import { CHARACTERS } from './farmSprites';
import { Rider } from './Rider';

const HOPS_PER_SEC = 3;
const MAX_DT = 0.05; // seconds; avoids a big jump after a dropped frame

/**
 * The player's live state, shared with the joystick (vec) and anything that syncs it (pos, face).
 * `speed` multiplies the walking speed (1 on foot, RIDE_SPEED on horseback).
 */
export type Motion = { vec: SharedValue<Point>; pos: SharedValue<Point>; face: SharedValue<Facing>; speed: SharedValue<number> };

export function useMotion(start: Point = START): Motion {
  const vec = useSharedValue<Point>({ x: 0, y: 0 });
  const pos = useSharedValue<Point>(start);
  const face = useSharedValue<Facing>('down');
  const speed = useSharedValue(1);
  return useMemo(() => ({ vec, pos, face, speed }), [vec, pos, face, speed]);
}

/** Sets the speed multiplier (getting on or off the horse). */
export function setMotionSpeed(m: Motion, speed: number): void {
  m.speed.value = speed;
}

type Props = {
  cell: number;
  motion: Motion;
  animal: Animal;
  mount?: MountId | null; // drawn under the character while riding
  grid?: string[]; // collision grid; the single-field farm when absent
  near?: (pos: Point) => number; // worklet: bed index at a position
  onNearPlot: (index: number) => void;
  /** Called on the JS thread each time the feet enter a new cell (footsteps, gates). */
  onStep?: (x: number, y: number) => void;
};

/** Moves the character straight to `to` (the overview map's teleport). */
export function placeCharacter(m: Motion, to: Point): void {
  m.pos.value = to;
}

/** The joystick-driven character; purely visual, never catches taps. */
export function Walker({ cell, motion, animal, mount, grid, near, onNearPlot, onStep }: Props) {
  const { pos, face } = motion;
  const walked = useSharedValue(-1); // seconds spent walking, drives the hop; -1 = idle
  useFrameCallback(({ timeSincePreviousFrame }) => tick(motion, walked, timeSincePreviousFrame ?? 16, grid));
  useAnimatedReaction(
    () => (near ? near(pos.value) : nearPlot(pos.value)),
    (index, prev) => {
      if (index !== prev) scheduleOnRN(onNearPlot, index);
    },
    [near, onNearPlot],
  );
  useAnimatedReaction(
    () => Math.floor(pos.value.y + 0.55) * 1000 + Math.floor(pos.value.x + 0.5),
    (key, prev) => {
      if (onStep && prev !== null && key !== prev) scheduleOnRN(onStep, key % 1000, Math.floor(key / 1000));
    },
    [onStep],
  );
  const move = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value.x * cell }, { translateY: (pos.value.y + 1) * cell * CELL_ASPECT - cell }],
  }));
  const hop = useDerivedValue(() => (walked.value < 0 ? 0 : Math.abs(Math.sin(walked.value * HOPS_PER_SEC * Math.PI))));
  return (
    <Animated.View style={[styles.walker, { width: cell, height: cell }, move]}>
      {mount ? <Rider animal={animal} mount={mount} face={face} hop={hop} cell={cell} /> : <CharacterSprite art={CHARACTERS[animal]} face={face} hop={hop} cell={cell} />}
    </Animated.View>
  );
}

/** One frame of movement: face the stick, step with collisions, advance the hop clock. */
function tick(m: Motion, walked: SharedValue<number>, frameMs: number, grid: string[] | undefined): void {
  'worklet';
  const v = m.vec.value;
  m.face.value = facing(v, m.face.value);
  if (v.x === 0 && v.y === 0) {
    walked.value = -1;
    return;
  }
  const dt = Math.min(frameMs / 1000, MAX_DT);
  const s = m.speed.value;
  m.pos.value = step(m.pos.value, { x: v.x * s, y: v.y * s }, dt, grid);
  walked.value = Math.max(walked.value, 0) + dt;
}

const styles = StyleSheet.create({
  walker: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
});
