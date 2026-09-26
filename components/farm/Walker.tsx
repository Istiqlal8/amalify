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
import type { Animal } from '@/domain/groupFarm';

import { CharacterSprite } from './CharacterSprite';

const HOPS_PER_SEC = 3;
const MAX_DT = 0.05; // seconds; avoids a big jump after a dropped frame

/** The player's live state, shared with the joystick (vec) and anything that syncs it (pos, face). */
export type Motion = { vec: SharedValue<Point>; pos: SharedValue<Point>; face: SharedValue<Facing> };

export function useMotion(): Motion {
  const vec = useSharedValue<Point>({ x: 0, y: 0 });
  const pos = useSharedValue<Point>(START);
  const face = useSharedValue<Facing>('down');
  return useMemo(() => ({ vec, pos, face }), [vec, pos, face]);
}

type Props = { cell: number; motion: Motion; animal: Animal; onNearPlot: (index: number) => void };

/** The joystick-driven character; purely visual, never catches taps. */
export function Walker({ cell, motion, animal, onNearPlot }: Props) {
  const { pos, face } = motion;
  const walked = useSharedValue(-1); // seconds spent walking, drives the hop; -1 = idle
  useFrameCallback(({ timeSincePreviousFrame }) => tick(motion, walked, timeSincePreviousFrame ?? 16));
  useAnimatedReaction(
    () => nearPlot(pos.value),
    (index, prev) => {
      if (index !== prev) scheduleOnRN(onNearPlot, index);
    },
  );
  const move = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value.x * cell }, { translateY: (pos.value.y + 1) * cell * CELL_ASPECT - cell }],
  }));
  const hop = useDerivedValue(() => (walked.value < 0 ? 0 : Math.abs(Math.sin(walked.value * HOPS_PER_SEC * Math.PI))));
  return (
    <Animated.View style={[styles.walker, { width: cell, height: cell }, move]}>
      <CharacterSprite animal={animal} face={face} hop={hop} cell={cell} />
    </Animated.View>
  );
}

/** One frame of movement: face the stick, step with collisions, advance the hop clock. */
function tick(m: Motion, walked: SharedValue<number>, frameMs: number): void {
  'worklet';
  const v = m.vec.value;
  m.face.value = facing(v, m.face.value);
  if (v.x === 0 && v.y === 0) {
    walked.value = -1;
    return;
  }
  const dt = Math.min(frameMs / 1000, MAX_DT);
  m.pos.value = step(m.pos.value, v, dt);
  walked.value = Math.max(walked.value, 0) + dt;
}

const styles = StyleSheet.create({
  walker: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
});
