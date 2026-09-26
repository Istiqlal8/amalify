import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import type { Facing } from '@/domain/farm';
import type { MountId } from '@/domain/estate';
import type { Animal } from '@/domain/groupFarm';

import { CharacterSprite } from './CharacterSprite';
import { CHARACTERS, MOUNT_ART, MOUNT_SIZE } from './farmSprites';

const RIDER_SIZE = 0.8; // of a cell
const SADDLE = 0.5; // height of the horse's back above its hooves, as a share of the horse sprite

type Props = { animal: Animal; mount: MountId; face: SharedValue<Facing>; hop: SharedValue<number>; cell: number };

/** The character sitting on its horse, both turning together. Fills the walker's cell-sized box. */
export function Rider({ animal, mount, face, hop, cell }: Props) {
  const horse = cell * MOUNT_SIZE;
  const rider = cell * RIDER_SIZE;
  // Facing us, the horse's head is in front of the rider; otherwise the rider sits on top.
  const riderOrder = useAnimatedStyle(() => ({ zIndex: face.value === 'down' ? 0 : 2 }));
  return (
    <>
      <View style={[styles.part, styles.horse, { left: (cell - horse) / 2, top: cell - horse, width: horse, height: horse }]}>
        <CharacterSprite art={MOUNT_ART[mount]} face={face} hop={hop} cell={horse} />
      </View>
      <Animated.View style={[styles.part, { left: (cell - rider) / 2, top: cell - horse * SADDLE - rider * 0.85, width: rider, height: rider }, riderOrder]}>
        <CharacterSprite art={CHARACTERS[animal]} face={face} hop={hop} cell={rider} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  part: { position: 'absolute' },
  horse: { zIndex: 1 },
});
