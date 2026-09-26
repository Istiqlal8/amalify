import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/constants/theme';
import { plotCaption, type Point } from '@/domain/farm';
import * as world from '@/domain/farmWorld';
import { buildGroupWorld, flowerFor, MAX_FIELDS, type MemberField } from '@/domain/groupFarm';
import { useFarmAudio } from '@/hooks/useFarmAudio';
import { useFarmPresence } from '@/hooks/useFarmPresence';
import { useFarmSfx } from '@/hooks/useFarmSfx';
import { useGroupMonth } from '@/hooks/useGroupMonth';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';
import type { MemberToday } from '@/services/groupService';

import { WorldBackground } from './Backgrounds';
import { FarmStage } from './FarmStage';
import { MonthField } from './MonthField';
import { RemotePlayer } from './RemotePlayer';
import { useCurrentBlock } from './useCurrentBlock';
import { RideButton } from './RideButton';
import { useRiding } from './useRiding';
import { placeCharacter, useMotion } from './Walker';
import { MapControls, WorldMap } from './WorldMap';

type Props = { groupId: string; members: MemberToday[]; userId: string; name: string };

type Bed = world.WorldPlot & { owner: string; ownerId: string };

/** Shared farm: every member's field for this month around the yard, and everyone on the farm right now walking around. */
export function GroupFarmScene({ groupId, members, userId, name }: Props) {
  const [near, setNear] = useState(-1);
  const [mapOpen, setMapOpen] = useState(false);
  const motion = useMotion(world.WORLD_START);
  const { flower } = useTheme();
  const { animal, theme, pet, house, mount } = useLogs().unlocks;
  const me = useMemo(() => ({ userId, name, animal, flower, pet }), [userId, name, animal, flower, pet]);
  const players = useFarmPresence(groupId, me, motion);
  const bottom = useSafeAreaInsets().bottom + space.md;
  const { today, layout, grid, fields, beds, nearFn } = useGroupWorld(members, userId);
  const block = useCurrentBlock(motion.pos, layout.blockRows);
  const current = beds[near];
  const audio = useFarmAudio(theme);
  const ride = useRiding(motion, mount);
  const { onStep, onGrab, onBed } = useFarmSfx(audio.sfx, false, ride.riding !== null);
  const flowerOf = (id: string) => (id === userId ? flower : (players[id]?.flower ?? flowerFor(id)));
  const goTo = (index: number) => {
    placeCharacter(motion, world.gateOf(index, layout.ring));
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
      rows={layout.blockRows * world.BLOCK_ROWS}
      cols={world.WORLD_COLS}
      background={(cell, art) => <WorldBackground cell={cell} art={art} ring={layout.ring} house={house} />}
      grid={grid}
      near={nearFn}
      camera
      lanterns={world.WORLD_LANTERNS}
      top={0}
      bottom={bottom}
      caption={current ? `${current.owner} · ${plotCaption(current.key, current.percent)}` : null}
      motion={motion}
      animal={animal}
      pet={pet}
      riding={ride.riding}
      onNearPlot={onNearPlot}
      onStep={onStep}
      onGrab={onGrab}
      onLand={() => audio.sfx('land')}
      overlay={
        <>
          {mount && <RideButton bottom={bottom} riding={ride.riding !== null} onToggle={ride.toggle} onJump={ride.jump} />}
          <MapControls top={space.md} onMap={() => setMapOpen(true)} soundOn={audio.on} onSound={audio.toggle} />
          {mapOpen && <WorldMap fields={fields} today={today} pos={motion.pos} layout={layout} onPick={goTo} onClose={() => setMapOpen(false)} />}
        </>
      }>
      {(cell) => (
        <>
          {fields.map((f) => {
            const [bx, by] = layout.ring[f.index];
            const nearby = Math.abs(bx - block.bx) <= 1 && Math.abs(by - block.by) <= 1;
            const active = current?.ownerId === f.userId ? current.key : null;
            return <MonthField key={f.userId} field={f} cell={cell} flower={flowerOf(f.userId)} today={today} active={active} showBeds={nearby} />;
          })}
          {Object.values(players).map((p) => (
            <RemotePlayer key={p.userId} player={p} cell={cell} />
          ))}
        </>
      )}
    </FarmStage>
  );
}

type GroupWorld = {
  today: string;
  layout: world.Layout;
  grid: string[];
  fields: MemberField[];
  beds: Bed[];
  nearFn: (p: Point) => number;
};

/** The map sized to the group, members' fields for this month, the flat bed list and a worklet that finds the bed at a position. */
function useGroupWorld(members: MemberToday[], userId: string): GroupWorld {
  const { today } = useLogs();
  const months = useGroupMonth(members, today);
  const count = Math.min(members.length, MAX_FIELDS);
  const layout = useMemo(() => world.groupLayout(count), [count]);
  const grid = useMemo(() => world.worldCollision(layout.blockRows), [layout]);
  return useMemo(() => {
    const fields = buildGroupWorld(today, months, userId);
    const beds = fields.flatMap((f) => f.plots.map((p) => ({ ...p, owner: f.label, ownerId: f.userId })));
    const slots = world.slotIndex(fields);
    const blockField = world.blockFields(layout);
    const nearFn = (p: Point) => {
      'worklet';
      return world.worldNear(slots, blockField, p);
    };
    return { today, layout, grid, fields, beds, nearFn };
  }, [months, today, userId, layout, grid]);
}
