import { useMemo, useState } from 'react';
import { type SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { pastPercent } from '@/domain/dayLog';
import { type FarmDay, plotCaption, type Point } from '@/domain/farm';
import { buildWorld, fieldAtRow, slotIndex, type WorldField, type WorldPlot, worldCollision, worldNear, worldRows } from '@/domain/farmWorld';
import { isHaidDay, itemsForDay } from '@/domain/haid';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { WorldBackground } from './Backgrounds';
import { FarmStage } from './FarmStage';
import { MonthField } from './MonthField';
import { useMotion } from './Walker';

const GRID = worldCollision();
const ROWS = worldRows();

const captionOf = (plot: WorldPlot, today: string) => `${plotCaption(plot.key, plot.percent)}${plot.key === today ? ' · hari ini' : ''}`;

/** Kebunku: one fenced field per month for the last 12 months, this month by the house; the camera follows the character. */
export function FarmScene() {
  const [near, setNear] = useState(-1);
  const motion = useMotion();
  const { flower } = useTheme();
  const { animal, theme, pet } = useLogs().unlocks;
  const top = useSafeAreaInsets().top;
  const bottom = useTabBarSpace();
  const { today, fields, plots, nearFn } = useWorld();
  const field = useCameraField(motion.pos);
  const current = plots[near];

  return (
    <FarmStage
      theme={theme}
      rows={ROWS}
      background={(cell, art) => <WorldBackground cell={cell} art={art} />}
      grid={GRID}
      near={nearFn}
      camera
      top={top}
      bottom={bottom}
      caption={current ? captionOf(current, today) : null}
      motion={motion}
      animal={animal}
      pet={pet}
      onNearPlot={setNear}>
      {(cell) =>
        fields.map((f) => (
          <MonthField
            key={f.label}
            field={f}
            cell={cell}
            flower={flower}
            today={today}
            active={current?.key ?? null}
            showBeds={f.index >= field - 1 && f.index <= field + 2}
          />
        ))
      }
    </FarmStage>
  );
}

/** The 12 fields from the logs, the flat plot list and a worklet that finds the bed at a position. */
function useWorld(): { today: string; fields: WorldField[]; plots: WorldPlot[]; nearFn: (p: Point) => number } {
  const { logs, plan, haid, today, todayPercent } = useLogs();
  return useMemo(() => {
    const dayOf = (key: string): FarmDay => {
      const onHaid = isHaidDay(haid, key);
      const percent = key === today ? todayPercent : pastPercent(logs[key], itemsForDay(plan.items, onHaid));
      return { key, percent, onHaid };
    };
    const fields = buildWorld(today, dayOf);
    const slots = slotIndex(fields);
    const nearFn = (p: Point) => {
      'worklet';
      return worldNear(slots, p);
    };
    return { today, fields, plots: fields.flatMap((f) => f.plots), nearFn };
  }, [logs, plan.items, haid, today, todayPercent]);
}

/** The field the character is in, updated on the JS side only when it changes. */
function useCameraField(pos: SharedValue<Point>): number {
  const [field, setField] = useState(0);
  useAnimatedReaction(
    () => fieldAtRow(pos.value.y + 0.55),
    (f, prev) => {
      if (f !== prev) scheduleOnRN(setField, f);
    },
  );
  return field;
}
