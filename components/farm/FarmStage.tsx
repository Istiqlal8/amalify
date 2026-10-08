import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, PixelRatio, StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/constants/theme';
import { CELL_ASPECT, type Point, SCENE_COLS } from '@/domain/farm';
import { darknessOf, isDark, tintOf } from '@/domain/dayPhase';
import type { MountId } from '@/domain/estate';
import type { Animal } from '@/domain/groupFarm';
import type { PetId } from '@/domain/pets';
import type { ThemeId } from '@/domain/shop';
import { useDayPhase } from '@/hooks/useDayPhase';

import { DayNightOverlay } from './DayNightOverlay';
import { THEME_ART, type ThemeArt } from './farmSprites';
import { HiddenSpots } from './HiddenSpots';
import { Joystick } from './Joystick';
import { PetFollower } from './PetFollower';
import { ThemeParticles } from './ThemeParticles';
import { type Motion, Walker } from './Walker';
import { Wildlife } from './Wildlife';

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
  const { theme, mode, rows, top, bottom, motion, children } = props;
  const insets = useSafeAreaInsets();
  const phase = useDayPhase();
  const [area, setArea] = useState({ width: 0, height: 0 });
  const art = THEME_ART[theme];
  const cols = props.cols ?? SCENE_COLS;
  const view = { width: area.width, height: Math.max(0, area.height - top - bottom) };
  const cell = sceneCell(mode, view, cols, rows);
  const size = { width: cell * cols, height: cell * CELL_ASPECT * rows };
  const follow = useCamera(motion.pos, cell, size, view, mode === 'jelajah');
  const explore = mode === 'jelajah';
  // A permanently-night theme (Malam) stays dark all day; every other theme follows the clock.
  const darkness = art.night ? 1 : darknessOf(phase);
  const tint = tintOf(art.night ? 'malam' : phase);
  const dark = art.night || isDark(phase);
  // Centre the map on both axes so a wide landscape viewport gets world around the village
  // instead of the village pinned to the left with empty background to its right. Jelajah is
  // driven by the follow-camera, which already assumes the scene starts at left 0.
  const offset = {
    x: explore ? 0 : Math.max(0, (area.width - size.width) / 2),
    y: explore ? 0 : top + Math.max(0, (view.height - size.height) / 2),
  };

  return (
    <View onLayout={(e: LayoutChangeEvent) => setArea(e.nativeEvent.layout)} style={[styles.root, { backgroundColor: art.fill }]}>
      {area.width > 0 && (
        <Animated.View style={[styles.scene, size, { top: offset.y, left: offset.x }, follow]}>
          {props.background(cell, art)}
          {children(cell)}
          {props.pet && <PetFollower key={props.pet} owner={motion.pos} pet={props.pet} cell={cell} />}
          {!dark && <Wildlife cols={cols} rows={rows} cell={cell} />}
          {explore && <HiddenSpots pos={motion.pos} cell={cell} />}
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
          <DayNightOverlay cell={cell} width={size.width} height={size.height} lanterns={props.lanterns} phaseDarkness={darkness} tint={tint} />
          {dark && props.nightLights?.(cell)}
        </Animated.View>
      )}
      <ThemeParticles kind={art.particles} width={area.width} height={area.height} />
      {explore && (
        <View style={[styles.joystick, { left: insets.left + space.md, bottom }]}>
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
 * instead of the corridor the follow-camera framed. Jelajah fits as many columns as the short
 * edge allows, so rotating to landscape shows more of the village at the same zoom rather than
 * magnifying the same nine columns. Either way the cell is snapped to whole device pixels so
 * sprites line up with the baked art.
 */
function sceneCell(mode: StageMode, view: Size, cols: number, rows: number): number {
  if (view.width === 0) return 0;
  const raw =
    mode === 'overview' && view.height > 0
      ? Math.min(view.width / cols, view.height / (rows * CELL_ASPECT))
      : Math.min(view.width, view.height) / SCENE_COLS;
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
  // Left 0: the follow-camera computes its own translation, overview sets `left` inline.
  scene: { position: 'absolute', left: 0 },
  joystick: { position: 'absolute' },
});
