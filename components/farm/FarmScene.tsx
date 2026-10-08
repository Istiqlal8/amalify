import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as world from '@/domain/farmWorld';
import { useFarmAudio } from '@/hooks/useFarmAudio';
import { useFarmSfx } from '@/hooks/useFarmSfx';
import { useLandscape } from '@/hooks/useLandscape';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import { space } from '@/constants/theme';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { HouseGlow, WorldBackground } from './Backgrounds';
import { DayDetailSheet } from './DayDetailSheet';
import { THEME_ART } from './farmSprites';
import { GardenControls } from './GardenControls';
import { FarmStage, type StageMode } from './FarmStage';
import { GardenHeader, HEADER_SPACE } from './GardenHeader';
import { MonthCalendarSheet } from './MonthCalendarSheet';
import { MonthField } from './MonthField';
import { MonthOverviewGrid } from './MonthOverviewGrid';
import { MiniMap } from './MiniMap';
import { PlotTapLayer } from './PlotTapLayer';
import { PondLife } from './PondLife';
import { RideButton } from './RideButton';
import { useCurrentBlock } from './useCurrentBlock';
import { useGardenPanels } from './useGardenPanels';
import { useGardenWorld } from './useGardenWorld';
import { useRiding } from './useRiding';
import { placeCharacter, useMotion } from './Walker';

const GRID = world.worldCollision();
const PONDS = world.pondRects();

/** Ponds animate only while the camera is in or next to their block. */
const isNear = (p: { x: number; y: number }, block: { bx: number; by: number }) =>
  Math.abs(Math.floor(p.x / world.BLOCK_COLS) - block.bx) <= 1 && Math.abs(Math.floor(p.y / world.BLOCK_ROWS) - block.by) <= 1;

/**
 * Direct play: begin beside today's plot, roam the village with the joystick. The beds stay silent
 * to look at — no card or panel interrupts the walk; day detail lives behind the calendar.
 */
export function FarmScene() {
  useLandscape();
  const [mode, setMode] = useState<StageMode>('jelajah');
  const [near, setNear] = useState(-1);
  const { today, fields, plots, nearFn } = useGardenWorld();
  const todayPlot = plots.find((plot) => plot.key === today);
  const motion = useMotion(todayPlot ?? world.WORLD_START);
  const { flowerFor, colors } = useTheme();
  const { animal, theme, pet, house, mount } = useLogs().unlocks;
  const ride = useRiding(motion, mount);
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const top = insets.top + HEADER_SPACE;
  const bottom = tabBarSpace;
  const panels = useGardenPanels();
  const block = useCurrentBlock(motion.pos);
  const current = plots[near];
  const audio = useFarmAudio(theme);
  const { onStep, onGrab, onBed } = useFarmSfx(audio.sfx, true, ride.riding !== null);

  const onNearPlot = useCallback(
    (index: number) => {
      setNear(index);
      onBed(index);
    },
    [onBed],
  );
  const openMonth = (index: number) => {
    panels.openMonth(index);
    audio.sfx('bed');
  };
  /** Walking to a month from the calendar also switches into Jelajah, so the move is visible. */
  const walkTo = (index: number) => {
    placeCharacter(motion, world.gateOf(index));
    panels.closeMonth();
    setMode('jelajah');
    audio.sfx('teleport');
  };
  const month = panels.month === null ? null : fields.find((f) => f.index === panels.month) ?? null;

  return (
    <View style={styles.root}>
      <View pointerEvents="box-none" style={styles.hud}>
        <GardenHeader title="Kebun pribadi" top={insets.top} />
      </View>
      <FarmStage
        theme={theme}
        mode={mode}
        rows={world.WORLD_ROWS}
        cols={world.WORLD_COLS}
        background={(cell, art) => <WorldBackground cell={cell} art={art} house={house} />}
        nightLights={(cell) => <HouseGlow cell={cell} house={house} />}
        grid={GRID}
        near={nearFn}
        lanterns={world.WORLD_LANTERNS}
        top={top}
        bottom={bottom}
        motion={motion}
        animal={animal}
        pet={pet}
        riding={ride.riding}
        onNearPlot={onNearPlot}
        onStep={onStep}
        onLand={() => audio.sfx('land')}
        onGrab={onGrab}
        overlay={
          <>
            {mode === 'jelajah' && mount && (
              <RideButton bottom={bottom} riding={ride.riding !== null} onToggle={ride.toggle} onJump={ride.jump} />
            )}
            <GardenControls
              mode={mode}
              top={top}
              bottom={bottom}
              soundOn={audio.on}
              onMode={setMode}
              onCalendar={panels.openMonths}
              onSound={audio.toggle}
            />
          </>
        }>
        {(cell) => (
          <>
            {PONDS.filter((p) => isNear(p, block)).map((p) => (
              <PondLife key={`${p.x},${p.y}`} rect={p} cell={cell} frozen={THEME_ART[theme].frozen} />
            ))}
            {fields.map((f) => {
              const [bx, by] = world.RING[f.index];
              const nearby = Math.abs(bx - block.bx) <= 1 && Math.abs(by - block.by) <= 1;
              return (
                <MonthField
                  key={f.label}
                  field={f}
                  cell={cell}
                  flowerFor={flowerFor}
                  today={today}
                  active={current?.key ?? null}
                  showBeds={mode === 'jelajah' && nearby}
                  showSign={mode === 'jelajah'}
                />
              );
            })}
            {mode === 'overview' && (
              <PlotTapLayer fields={fields} ring={world.RING} cell={cell} today={today} accent={colors.primary} onPick={openMonth} />
            )}
          </>
        )}
      </FarmStage>
      {mode === 'jelajah' && <MiniMap fields={fields} today={today} block={block} top={top + space.xs} right={insets.right + space.md} />}
      {panels.months && <MonthOverviewGrid fields={fields} today={today} onPick={openMonth} onClose={panels.closeMonths} />}
      {month && (
        <MonthCalendarSheet
          field={month}
          today={today}
          onClose={panels.closeMonth}
          onPickDay={panels.openDay}
          onPrev={month.index + 1 < fields.length ? () => panels.openMonth(month.index + 1) : null}
          onNext={month.index > 0 ? () => panels.openMonth(month.index - 1) : null}
          onWalk={() => walkTo(month.index)}
        />
      )}
      {panels.day && <DayDetailSheet view={panels.day} today={today} onClose={panels.closeDay} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', overflow: 'hidden' },
  hud: { position: 'absolute', zIndex: 2, top: 0, left: 0, right: 0 },
});
