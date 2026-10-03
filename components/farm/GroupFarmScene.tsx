import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/constants/theme';
import type { Point } from '@/domain/farm';
import { dayView } from '@/domain/farmDay';
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
import { BedContextCard } from './BedContextCard';
import { DayDetailSheet } from './DayDetailSheet';
import { FarmStage, type StageMode } from './FarmStage';
import { CONTROL_SPACE, GardenControls } from './GardenControls';
import { GroupPresenceBar } from './GroupPresenceBar';
import { MonthCalendarSheet } from './MonthCalendarSheet';
import { MonthField } from './MonthField';
import { PlotTapLayer } from './PlotTapLayer';
import { RemotePlayer } from './RemotePlayer';
import { RideButton } from './RideButton';
import { useCurrentBlock } from './useCurrentBlock';
import { useGardenPanels } from './useGardenPanels';
import { useRiding } from './useRiding';
import { placeCharacter, useMotion } from './Walker';

type Props = { groupId: string; members: MemberToday[]; userId: string; name: string };

type Bed = world.WorldPlot & { owner: string; ownerId: string };

/** Kebun grup: every member's field for this month, read as a map first and walked second. */
export function GroupFarmScene({ groupId, members, userId, name }: Props) {
  const [mode, setMode] = useState<StageMode>('overview');
  const [near, setNear] = useState(-1);
  const motion = useMotion(world.WORLD_START);
  const { flowerFor: myFlowerFor, colors } = useTheme();
  const { animal, theme, pet, house, mount, } = useLogs().unlocks;
  const { today: myToday } = useLogs();
  const myTodayFlower = myFlowerFor(myToday);
  const me = useMemo(() => ({ userId, name, animal, flower: myTodayFlower, pet }), [userId, name, animal, myTodayFlower, pet]);
  const players = useFarmPresence(groupId, me, motion);
  const insets = useSafeAreaInsets();
  const bottom = insets.bottom + space.md;
  const { today, layout, grid, fields, beds, nearFn } = useGroupWorld(groupId, members, userId);
  const block = useCurrentBlock(motion.pos, layout.blockRows);
  const current = beds[near];
  const audio = useFarmAudio(theme);
  const ride = useRiding(motion, mount);
  const panels = useGardenPanels();
  const { onStep, onGrab, onBed } = useFarmSfx(audio.sfx, false, ride.riding !== null);
  const flowerOf = (id: string) => (id === userId ? myTodayFlower : (players[id]?.flower ?? flowerFor(id)));
  const mine = fields.findIndex((f) => f.userId === userId);

  const onNearPlot = useCallback(
    (index: number) => {
      setNear(index);
      onBed(index);
    },
    [onBed],
  );
  const walkTo = (index: number) => {
    placeCharacter(motion, world.gateOf(index, layout.ring));
    panels.closeMonth();
    setMode('jelajah');
    audio.sfx('teleport');
  };
  const month = panels.month === null ? null : fields.find((f) => f.index === panels.month) ?? null;

  return (
    <>
      <FarmStage
        theme={theme}
        mode={mode}
        rows={layout.blockRows * world.BLOCK_ROWS}
        cols={world.WORLD_COLS}
        background={(cell, art) => <WorldBackground cell={cell} art={art} ring={layout.ring} house={house} />}
        grid={grid}
        near={nearFn}
        lanterns={world.WORLD_LANTERNS}
        top={insets.top}
        bottom={bottom}
        caption={
          <BedContextCard
            view={current ? dayView(current, today) : null}
            owner={current?.owner}
            bottom={bottom + CONTROL_SPACE}
            onOpen={panels.openDay}
          />
        }
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
            {mode === 'jelajah' && mount && (
              <RideButton bottom={bottom} riding={ride.riding !== null} onToggle={ride.toggle} onJump={ride.jump} />
            )}
            <GardenControls
              mode={mode}
              top={insets.top}
              bottom={bottom}
              soundOn={audio.on}
              onMode={setMode}
              onCalendar={() => panels.openMonth(mine >= 0 ? mine : 0)}
              onSound={audio.toggle}
            />
          </>
        }>
        {(cell) => (
          <>
            {fields.map((f) => {
              const at = layout.ring[f.index];
              const nearby = at !== undefined && Math.abs(at[0] - block.bx) <= 1 && Math.abs(at[1] - block.by) <= 1;
              const active = current?.ownerId === f.userId ? current.key : null;
              return (
                <MonthField
                  key={f.userId}
                  field={f}
                  cell={cell}
                  flowerFor={f.userId === userId ? myFlowerFor : () => flowerOf(f.userId)}
                  today={today}
                  active={active}
                  showBeds={mode === 'jelajah' && nearby}
                  showSign={mode === 'jelajah'}
                />
              );
            })}
            {mode === 'jelajah' && Object.values(players).map((p) => <RemotePlayer key={p.userId} player={p} cell={cell} />)}
            {mode === 'overview' && (
              <PlotTapLayer
                fields={fields}
                ring={layout.ring}
                cell={cell}
                today={today}
                accent={colors.primary}
                mine={mine}
                onPick={panels.openMonth}
              />
            )}
          </>
        )}
      </FarmStage>
      <View style={[styles.presence, { top: insets.top + space.sm }]} pointerEvents="none">
        <GroupPresenceBar players={players} connected />
      </View>
      {month && (
        <MonthCalendarSheet
          field={month}
          today={today}
          onClose={panels.closeMonth}
          onPickDay={panels.openDay}
          onPrev={null}
          onNext={null}
          onWalk={() => walkTo(month.index)}
        />
      )}
      {panels.day && <DayDetailSheet view={panels.day} today={today} onClose={panels.closeDay} />}
    </>
  );
}

const styles = StyleSheet.create({
  presence: { position: 'absolute', right: space.md, maxWidth: '62%' },
});

type GroupWorld = {
  today: string;
  layout: world.Layout;
  grid: string[];
  fields: MemberField[];
  beds: Bed[];
  nearFn: (p: Point) => number;
};

/** The map sized to the group, members' fields for this month, and the bed lookup worklet. */
function useGroupWorld(groupId: string, members: MemberToday[], userId: string): GroupWorld {
  const { today } = useLogs();
  const months = useGroupMonth(groupId, members, today);
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
