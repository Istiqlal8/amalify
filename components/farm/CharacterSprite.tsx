import { type ImageSourcePropType, StyleSheet } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import type { Facing } from '@/domain/farm';
import { CHARACTER_HOP } from './farmSprites';

const FACINGS: Facing[] = ['down', 'left', 'up', 'right'];

type Props = { art: Record<Facing, ImageSourcePropType>; face: SharedValue<Facing>; hop: SharedValue<number>; cell: number };

/** An animal drawn in its current facing, hopping by `hop` (0..1). `cell` is the sprite's square size. */
export function CharacterSprite({ art, face, hop, cell }: Props) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -hop.value * CHARACTER_HOP * cell }, { scaleY: 1 - 0.04 * hop.value }],
  }));
  return (
    <Animated.View style={[styles.fill, { width: cell, height: cell }, style]}>
      {FACINGS.map((f) => (
        <FacingImage key={f} source={art[f]} visible={f} face={face} cell={cell} />
      ))}
    </Animated.View>
  );
}

type FacingProps = { source: ImageSourcePropType; visible: Facing; face: SharedValue<Facing>; cell: number };

function FacingImage({ source, visible, face, cell }: FacingProps) {
  const style = useAnimatedStyle(() => ({ opacity: face.value === visible ? 1 : 0 }));
  return <Animated.Image source={source} style={[styles.fill, { width: cell, height: cell }, style]} />;
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0 },
});
