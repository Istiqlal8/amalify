import { StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle, useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { CELL_ASPECT, type Facing, type Point } from '@/domain/farm';
import { approach, followTarget, type PetId, type PetState, pushTrail } from '@/domain/pets';

import { CharacterSprite } from './CharacterSprite';
import { PET_ART, PET_SIZE } from './farmSprites';

const PET_SPEED = 7; // cells per second at most; enough to keep up with the owner
const MAX_DT = 0.05;
const HOPS_PER_SEC = 4;

type Props = { owner: SharedValue<Point>; pet: PetId; cell: number };

/** A pet trailing its owner along the owner's recent path, about a cell behind. Purely visual. */
export function PetFollower({ owner, pet, cell }: Props) {
  const trail = useSharedValue<Point[]>([]);
  const state = useSharedValue<PetState>({ x: NaN, y: NaN, facing: 'down', moving: false }); // placed on the first frame
  const walked = useSharedValue(0);
  useFrameCallback(({ timeSincePreviousFrame }) => follow(owner, trail, state, walked, timeSincePreviousFrame ?? 16));
  const face = useDerivedValue<Facing>(() => state.value.facing);
  const hop = useDerivedValue(() => (state.value.moving ? Math.abs(Math.sin(walked.value * HOPS_PER_SEC * Math.PI)) : 0));
  const size = cell * PET_SIZE;
  const move = useAnimatedStyle(() => ({
    transform: [
      { translateX: state.value.x * cell + (cell - size) / 2 },
      { translateY: (state.value.y + 1) * cell * CELL_ASPECT - size },
    ],
  }));
  return (
    <Animated.View style={[styles.pet, { width: size, height: size }, move]}>
      <CharacterSprite art={PET_ART[pet]} face={face} hop={hop} cell={size} />
    </Animated.View>
  );
}

function follow(
  owner: SharedValue<Point>,
  trail: SharedValue<Point[]>,
  state: SharedValue<PetState>,
  walked: SharedValue<number>,
  frameMs: number,
): void {
  'worklet';
  const dt = Math.min(frameMs / 1000, MAX_DT);
  if (Number.isNaN(state.value.x)) state.value = { ...state.value, x: owner.value.x, y: owner.value.y };
  trail.value = pushTrail(trail.value, owner.value);
  state.value = approach(state.value, followTarget(trail.value), PET_SPEED * dt);
  walked.value = state.value.moving ? walked.value + dt : 0;
}

const styles = StyleSheet.create({
  pet: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
});
