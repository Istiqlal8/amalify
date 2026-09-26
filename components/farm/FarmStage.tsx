import { type ReactNode, useState } from 'react';
import { Image, type ImageSourcePropType, type LayoutChangeEvent, PixelRatio, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { CELL_ASPECT, SCENE_COLS, SCENE_ROWS } from '@/domain/farm';
import type { Animal } from '@/domain/groupFarm';
import { useStyles } from '@/hooks/useStyles';

import { SCENE_FILL } from './farmSprites';
import { Joystick, JOYSTICK_SIZE } from './Joystick';
import { type Motion, Walker } from './Walker';

type Props = {
  scene: ImageSourcePropType;
  top: number; // scene offset from the top of the screen
  bottom: number; // space to keep clear at the bottom (tab bar, home indicator)
  caption: string | null;
  motion: Motion;
  animal: Animal;
  onNearPlot: (index: number) => void;
  /** Beds and other characters, placed in scene coordinates with the given cell width. */
  children: (cell: number) => ReactNode;
};

/** Full-screen farm game view: scene across the width, the player's character, joystick and caption floating above `bottom`. */
export function FarmStage({ scene, top, bottom, caption, motion, animal, onNearPlot, children }: Props) {
  const styles = useStyles(makeStyles);
  const [width, setWidth] = useState(0);
  // Snap the cell to whole device pixels so sprites line up with the baked scene.
  const cell = Math.floor((width / SCENE_COLS) * PixelRatio.get()) / PixelRatio.get();
  const size = { width: cell * SCENE_COLS, height: cell * CELL_ASPECT * SCENE_ROWS };
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={styles.root}>
      {width > 0 && (
        <View style={[styles.scene, size, { top }]}>
          <Image source={scene} style={size} accessibilityIgnoresInvertColors />
          {children(cell)}
          <Walker cell={cell} motion={motion} animal={animal} onNearPlot={onNearPlot} />
        </View>
      )}
      {caption && (
        <View style={[styles.caption, { bottom: bottom + JOYSTICK_SIZE + space.sm }]} accessibilityLiveRegion="polite">
          <Txt variant="bold">{caption}</Txt>
        </View>
      )}
      <View style={[styles.joystick, { bottom }]}>
        <Joystick vec={motion.vec} />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: SCENE_FILL, overflow: 'hidden' },
    scene: { position: 'absolute', left: 0 },
    caption: { ...frostOf(c), position: 'absolute', left: space.md, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
    joystick: { position: 'absolute', left: space.md },
  });
