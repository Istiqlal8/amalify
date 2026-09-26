import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fonts } from '@/constants/theme';
import { JUMP_HEIGHT, JUMP_SECONDS, jumpArc, MOUNTS } from '@/domain/estate';
import { CELL_ASPECT, type Facing } from '@/domain/farm';
import { firstName, type Player } from '@/domain/groupFarm';

import { CharacterSprite } from './CharacterSprite';
import { PetFollower } from './PetFollower';
import { Rider } from './Rider';
import { CHARACTERS } from './farmSprites';

const GLIDE_MS = 150; // a little longer than the ~125ms between updates, so motion stays smooth
const HOP_MS = 160;

/** Another group member's animal, gliding to each position they broadcast, with their name above. */
export function RemotePlayer({ player, cell }: { player: Player; cell: number }) {
  const x = useSharedValue(player.x);
  const y = useSharedValue(player.y);
  const face = useSharedValue<Facing>(player.facing);
  const hop = useSharedValue(0);
  useEffect(() => {
    const glide = { duration: GLIDE_MS, easing: Easing.linear };
    x.value = withTiming(player.x, glide);
    y.value = withTiming(player.y, glide);
    face.value = player.facing;
  }, [player.x, player.y, player.facing, x, y, face]);
  useEffect(() => {
    cancelAnimation(hop);
    hop.value = player.moving ? withRepeat(withSequence(withTiming(1, { duration: HOP_MS }), withTiming(0, { duration: HOP_MS })), -1) : withTiming(0);
  }, [player.moving, hop]);
  const fontSize = Math.max(9, cell * 0.22);
  const move = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * cell }, { translateY: (y.value + 1) * cell * CELL_ASPECT - cell }],
  }));
  const owner = useDerivedValue(() => ({ x: x.value, y: y.value }));
  const lift = useJumpLift(player.jumping, cell);
  return (
    <>
      {player.pet && <PetFollower key={player.pet} owner={owner} pet={player.pet} cell={cell} />}
      <Animated.View style={[styles.player, { width: cell, height: cell }, move]}>
        <Animated.View style={[styles.fill, lift]}>
          {player.riding ? (
            <Rider animal={player.animal} mount={MOUNTS[0]} face={face} hop={hop} cell={cell} />
          ) : (
            <CharacterSprite art={CHARACTERS[player.animal]} face={face} hop={hop} cell={cell} />
          )}
        </Animated.View>
        <Text numberOfLines={1} style={[styles.name, { width: cell + 24, fontSize, top: -fontSize - 2 }]}>
          {firstName(player.name)}
        </Text>
      </Animated.View>
    </>
  );
}

/** Plays a jump arc locally whenever the remote player's `jumping` flag turns on. */
function useJumpLift(jumping: boolean, cell: number) {
  const reduced = useReducedMotion();
  const t = useSharedValue(-1);
  useEffect(() => {
    if (!jumping || reduced) return;
    t.value = 0;
    t.value = withTiming(JUMP_SECONDS, { duration: JUMP_SECONDS * 1000, easing: Easing.linear });
  }, [jumping, reduced, t]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -jumpArc(t.value) * JUMP_HEIGHT * cell }] }));
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  player: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
  name: {
    position: 'absolute',
    left: -12,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
  },
});
