import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { JUMP_HEIGHT, jumpArc, type MountId } from '@/domain/estate';
import { CELL_ASPECT, nearPlot, type Point } from '@/domain/farm';
import type { Animal } from '@/domain/groupFarm';

import { CharacterSprite } from './CharacterSprite';
import { CHARACTERS } from './farmSprites';
import { type Motion, tick } from './motion';
import { Rider } from './Rider';

const HOPS_PER_SEC = 3;

export { type Motion, placeCharacter, setMotionSpeed, startJump, useMotion } from './motion';

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
  /** Called on the JS thread when a horse jump touches down. */
  onLand?: () => void;
};

/** The joystick-driven character; purely visual, never catches taps. */
export function Walker({ cell, motion, animal, mount, grid, near, onNearPlot, onStep, onLand }: Props) {
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
  useAnimatedReaction(
    () => motion.jump.value >= 0,
    (jumping, was) => {
      if (was && !jumping && onLand) scheduleOnRN(onLand);
    },
    [onLand],
  );
  const reduced = useReducedMotion();
  const move = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value.x * cell }, { translateY: (pos.value.y + 1) * cell * CELL_ASPECT - cell }],
  }));
  // The jump arc lifts the sprite; the ground shadow stays put and shrinks. No arc under reduced motion.
  const lift = useAnimatedStyle(() => {
    const arc = reduced ? 0 : jumpArc(motion.jump.value);
    return { transform: [{ translateY: -arc * JUMP_HEIGHT * cell }, { scale: 1 + 0.06 * arc }] };
  });
  const shadow = useAnimatedStyle(() => {
    const arc = reduced ? 0 : jumpArc(motion.jump.value);
    return { opacity: arc > 0 ? 0.28 : 0, transform: [{ scale: 1 - 0.4 * arc }] };
  });
  const hop = useDerivedValue(() => (walked.value < 0 ? 0 : Math.abs(Math.sin(walked.value * HOPS_PER_SEC * Math.PI))));
  return (
    <Animated.View style={[styles.walker, { width: cell, height: cell }, move]}>
      <Animated.View style={[styles.shadow, { left: cell * 0.1, top: cell * 0.86, width: cell * 0.8, height: cell * 0.14, borderRadius: cell * 0.07 }, shadow]} />
      <Animated.View style={[styles.fill, lift]}>
        {mount ? <Rider animal={animal} mount={mount} face={face} hop={hop} cell={cell} /> : <CharacterSprite art={CHARACTERS[animal]} face={face} hop={hop} cell={cell} />}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  walker: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  shadow: { position: 'absolute', backgroundColor: '#000000' },
});
