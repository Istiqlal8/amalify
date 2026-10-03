import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, PixelRatio, StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { space } from '@/constants/theme';
import { CELL_ASPECT, type Point, SCENE_COLS } from '@/domain/farm';
import type { MountId } from '@/domain/estate';
import type { Animal } from '@/domain/groupFarm';
import type { PetId } from '@/domain/pets';
import type { ThemeId } from '@/domain/shop';

import { THEME_ART, type ThemeArt } from './farmSprites';
import { Joystick } from './Joystick';
import { NightOverlay } from './NightOverlay';
import { PetFollower } from './PetFollower';
import { ThemeParticles } from './ThemeParticles';
import { type Motion, Walker } from './Walker';

/** Overview frames the whole village at once; Jelajah is the old follow-camera with the joystick. */
export type StageMode = 'overview' | 'jelajah';

type Props = {
  theme: ThemeId;
  mode: StageMode;
  rows: number; // scene height in cells
  cols?: number; // scene width in cells
  /** Static art for the scene, in scene coordinates. */
  background: (cell: number, art: ThemeArt) => ReactNode;
  grid?: string[];
  near?: (pos: Point) => number; // worklet: bed index at a position
  lanterns?: Point[];
  /** Extra UI above the scene (mode switch, contextual actions). */
  overlay?: ReactNode;
  nightLights?: (cell: number) => ReactNode;
  top: number;
  bottom: number;
  /** Shown only in Jelajah, and only while the character stands at a bed. */
  caption: ReactNode;
  motion: Motion;
  animal: Animal;
  pet: PetId | null;
  riding?: MountId | null;
  onNearPlot: (index: number) => void;
  onStep?: (x: number, y: number) => void;
  onLand?: () => void;
  onGrab?: () => void;
  children: (cell: number) => ReactNode;
};

/** The garden scene. In Overview it is a picture of the whole village; in Jelajah it is played. */
export function FarmStage(props: Props) {
  const { theme, mode, rows, top, bottom, caption, motion, children } = props;
  const [area, setArea] = useState({ width: 0, height: 0 });
  const art = THEME_ART[theme];
  const cols = props.cols ?? SCENE_COLS;
  const view = { width: area.width, height: Math.max(0, area.height - top - bottom) };
  const cell = sceneCell(mode, view, cols, rows);
  const size = { width: cell * cols, height: cell * CELL_ASPECT * rows };
  const follow = useCamera(motion.pos, cell, size, view, mode === 'jelajah');
  const explore = mode === 'jelajah';
  // Overview usually leaves height over once the map fits the width; centre it rather than
  // letting the village hang from the header with a gap above the summary panel.
  const offset = explore ? top : top + Math.max(0, (view.height - size.height) / 2);

  return (
    <View onLayout={(e: LayoutChangeEvent) => setArea(e.nativeEvent.layout)} style={[styles.root, { backgroundColor: art.fill }]}>
      {area.width > 0 && (
        <Animated.View style={[styles.scene, size, { top: offset }, follow]}>
          {props.background(cell, art)}
          {children(cell)}
          {props.pet && <PetFollower key={props.pet} owner={motion.pos} pet={props.pet} cell={cell} />}
          <Walker
            cell={cell}
            motion={motion}
            animal={props.animal}
            mount={props.riding}
            grid={props.grid}
            near={props.near}
            onNearPlot={props.onNearPlot}
            onStep={props.onStep}
            onLand={props.onLand}
          />
          {art.night && <NightOverlay cell={cell} width={size.width} height={size.height} lanterns={props.lanterns} />}
          {art.night && props.nightLights?.(cell)}
        </Animated.View>
      )}
      <ThemeParticles kind={art.particles} width={area.width} height={area.height} />
      {explore && caption}
      {explore && (
        <View style={[styles.joystick, { bottom }]}>
          <Joystick vec={motion.vec} onGrab={props.onGrab} />
        </View>
      )}
      {props.overlay}
    </View>
  );
}

type Size = { width: number; height: number };

/**
 * Overview sizes a cell so the whole map fits the viewport — the village reads as one place
 * instead of the corridor the follow-camera framed. Jelajah keeps SCENE_COLS across the width.
 * Either way the cell is snapped to whole device pixels so sprites line up with the baked art.
 */
function sceneCell(mode: StageMode, view: Size, cols: number, rows: number): number {
  if (view.width === 0) return 0;
  const raw =
    mode === 'overview' && view.height > 0
      ? Math.min(view.width / cols, view.height / (rows * CELL_ASPECT))
      : view.width / SCENE_COLS;
  return Math.floor(raw * PixelRatio.get()) / PixelRatio.get();
}

/** Scrolls the scene so the character stays near the middle of the view, clamped to the scene. */
function useCamera(pos: SharedValue<Point>, cell: number, scene: Size, view: Size, on: boolean) {
  return useAnimatedStyle(() => {
    if (!on) return { transform: [{ translateX: 0 }, { translateY: 0 }] };
    const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), Math.max(0, max));
    const x = clamp((pos.value.x + 0.5) * cell - view.width / 2, scene.width - view.width);
    const y = clamp((pos.value.y + 0.5) * cell * CELL_ASPECT - view.height / 2, scene.height - view.height);
    return { transform: [{ translateX: -x }, { translateY: -y }] };
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  scene: { position: 'absolute', left: 0 },
  joystick: { position: 'absolute', left: space.md },
});
