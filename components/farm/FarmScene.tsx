import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pastPercent } from '@/domain/dayLog';
import { RIDE_SPEED } from '@/domain/estate';
import { type FarmDay, plotCaption, type Point } from '@/domain/farm';
import * as world from '@/domain/farmWorld';
import { worldNear } from '@/domain/farmWorld';
import { isHaidDay, itemsForDay } from '@/domain/haid';
import { useFarmAudio } from '@/hooks/useFarmAudio';
import { useFarmSfx } from '@/hooks/useFarmSfx';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { WorldBackground } from './Backgrounds';
import { FarmStage } from './FarmStage';
import { MonthField } from './MonthField';
import { useCurrentBlock } from './useCurrentBlock';
import { RideButton } from './RideButton';
import { placeCharacter, setMotionSpeed, useMotion } from './Walker';
import { MapControls, WorldMap } from './WorldMap';

const GRID = world.worldCollision();

const captionOf = (plot: world.WorldPlot, today: string) => `${plotCaption(plot.key, plot.percent)}${plot.key === today ? ' · hari ini' : ''}`;

/** Kebunku: a village map with the yard in the middle and a field per month around it; the camera follows the character. */
export function FarmScene() {
  const [near, setNear] = useState(-1);
  const [mapOpen, setMapOpen] = useState(false);
  const motion = useMotion(world.WORLD_START);
  const { flower } = useTheme();
  const { animal, theme, pet, house, mount } = useLogs().unlocks;
  const [ridingWanted, setRiding] = useState(false);
  const riding = ridingWanted && mount !== null;
  const top = useSafeAreaInsets().top;
  const bottom = useTabBarSpace();
  const { today, fields, plots, nearFn } = useWorld();
  const block = useCurrentBlock(motion.pos);
  const current = plots[near];
  const audio = useFarmAudio(theme);
  const { onStep, onGrab, onBed } = useFarmSfx(audio.sfx, true, riding);
  const toggleRide = () => {
    setMotionSpeed(motion, riding ? 1 : RIDE_SPEED);
    setRiding(!riding);
  };
  const goTo = (index: number) => {
    placeCharacter(motion, world.gateOf(index));
    setMapOpen(false);
    audio.sfx('teleport');
  };
  const onNearPlot = useCallback(
    (index: number) => {
      setNear(index);
      onBed(index);
    },
    [onBed],
  );

  return (
    <FarmStage
      theme={theme}
      rows={world.WORLD_ROWS}
      cols={world.WORLD_COLS}
      background={(cell, art) => <WorldBackground cell={cell} art={art} house={house} />}
      grid={GRID}
      near={nearFn}
      camera
      lanterns={world.WORLD_LANTERNS}
      top={top}
      bottom={bottom}
      caption={current ? captionOf(current, today) : null}
      motion={motion}
      animal={animal}
      pet={pet}
      riding={riding ? mount : null}
      onNearPlot={onNearPlot}
      onStep={onStep}
      onGrab={onGrab}
      overlay={
        <>
          {mount && <RideButton bottom={bottom} riding={riding} onPress={toggleRide} />}
          <MapControls top={top + 64} onMap={() => setMapOpen(true)} soundOn={audio.on} onSound={audio.toggle} />
          {mapOpen && <WorldMap fields={fields} today={today} pos={motion.pos} onPick={goTo} onClose={() => setMapOpen(false)} />}
        </>
      }>
      {(cell) =>
        fields.map((f) => {
          const [bx, by] = world.RING[f.index];
          const nearby = Math.abs(bx - block.bx) <= 1 && Math.abs(by - block.by) <= 1;
          return <MonthField key={f.label} field={f} cell={cell} flower={flower} today={today} active={current?.key ?? null} showBeds={nearby} />;
        })
      }
    </FarmStage>
  );
}

type World = { today: string; fields: world.WorldField[]; plots: world.WorldPlot[]; nearFn: (p: Point) => number };

/** The 12 fields from the logs, the flat plot list and a worklet that finds the bed at a position. */
function useWorld(): World {
  const { logs, plan, haid, today, todayPercent } = useLogs();
  return useMemo(() => {
    const dayOf = (key: string): FarmDay => {
      const onHaid = isHaidDay(haid, key);
      const percent = key === today ? todayPercent : pastPercent(logs[key], itemsForDay(plan.items, onHaid));
      return { key, percent, onHaid };
    };
    const fields = world.buildWorld(today, dayOf);
    const plots: world.WorldPlot[] = [];
    for (const f of fields) plots.push(...f.plots);
    const slots = world.slotIndex(fields);
    const blockField = world.BLOCK_FIELD;
    const nearFn = (p: Point) => {
      'worklet';
      return worldNear(slots, blockField, p);
    };
    return { today, fields, plots, nearFn };
  }, [logs, plan.items, haid, today, todayPercent]);
}
