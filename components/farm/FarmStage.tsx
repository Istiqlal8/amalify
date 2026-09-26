import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, PixelRatio, StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { CELL_ASPECT, type Point, SCENE_COLS } from '@/domain/farm';
import type { Animal } from '@/domain/groupFarm';
import type { PetId } from '@/domain/pets';
import type { ThemeId } from '@/domain/shop';
import { useStyles } from '@/hooks/useStyles';

import { THEME_ART, type ThemeArt } from './farmSprites';
import { Joystick, JOYSTICK_SIZE } from './Joystick';
import { NightOverlay } from './NightOverlay';
import { PetFollower } from './PetFollower';
import { ThemeParticles } from './ThemeParticles';
import { type Motion, Walker } from './Walker';

type Props = {
  theme: ThemeId;
  rows: number; // scene height in cells
  /** Static art for the scene, in scene coordinates. */
  background: (cell: number, art: ThemeArt) => ReactNode;
  grid?: string[]; // collision grid when not the single-field farm
  near?: (pos: Point) => number; // worklet: bed index at a position
  camera?: boolean; // follow the character when the scene is taller than the screen
  top: number; // scene offset from the top of the screen
  bottom: number; // space to keep clear at the bottom (tab bar, home indicator)
  caption: string | null;
  motion: Motion;
  animal: Animal;
  pet: PetId | null;
  onNearPlot: (index: number) => void;
  /** Beds and other characters, placed in scene coordinates with the given cell width. */
  children: (cell: number) => ReactNode;
};

/** Full-screen farm game view: scene across the width, the player's character, joystick and caption floating above `bottom`. */
export function FarmStage(props: Props) {
  const { theme, rows, top, bottom, caption, motion, children } = props;
  const styles = useStyles(makeStyles);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const art = THEME_ART[theme];
  // Snap the cell to whole device pixels so sprites line up with the baked scene.
  const cell = Math.floor((area.width / SCENE_COLS) * PixelRatio.get()) / PixelRatio.get();
  const size = { width: cell * SCENE_COLS, height: cell * CELL_ASPECT * rows };
  const follow = useCamera(motion.pos, cell, size.height, area.height - top, props.camera === true);
  const onLayout = (e: LayoutChangeEvent) => setArea(e.nativeEvent.layout);

  return (
    <View onLayout={onLayout} style={[styles.root, { backgroundColor: art.fill }]}>
      {area.width > 0 && (
        <Animated.View style={[styles.scene, size, { top }, follow]}>
          {props.background(cell, art)}
          {children(cell)}
          {props.pet && <PetFollower key={props.pet} owner={motion.pos} pet={props.pet} cell={cell} />}
          <Walker cell={cell} motion={motion} animal={props.animal} grid={props.grid} near={props.near} onNearPlot={props.onNearPlot} />
          {art.night && <NightOverlay cell={cell} width={size.width} height={size.height} />}
        </Animated.View>
      )}
      <ThemeParticles kind={art.particles} width={area.width} height={area.height} />
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

/** Scrolls the scene so the character stays near the middle of the view, clamped to the scene. */
function useCamera(pos: SharedValue<Point>, cell: number, sceneHeight: number, viewHeight: number, on: boolean) {
  return useAnimatedStyle(() => {
    if (!on) return { transform: [{ translateY: 0 }] };
    const wanted = (pos.value.y + 0.5) * cell * CELL_ASPECT - viewHeight / 2;
    const y = Math.min(Math.max(wanted, 0), Math.max(0, sceneHeight - viewHeight));
    return { transform: [{ translateY: -y }] };
  });
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, overflow: 'hidden' },
    scene: { position: 'absolute', left: 0 },
    caption: { ...frostOf(c), position: 'absolute', left: space.md, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
    joystick: { position: 'absolute', left: space.md },
  });
