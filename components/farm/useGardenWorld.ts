import { useMemo } from 'react';

import { pastPercent } from '@/domain/dayLog';
import type { FarmDay, Point } from '@/domain/farm';
import * as world from '@/domain/farmWorld';
import { worldNear } from '@/domain/farmWorld';
import { isHaidDay, itemsForDay } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

export type GardenWorld = {
  today: string;
  fields: world.WorldField[];
  plots: world.WorldPlot[];
  nearFn: (p: Point) => number;
};

/**
 * Kebunku's 12 month fields from the logs, the flat plot list, and a worklet that finds the bed
 * at a position. A day with no entry is marked `recorded: false` rather than being given 0%.
 */
export function useGardenWorld(): GardenWorld {
  const { logs, plan, haid, today, todayPercent } = useLogs();
  return useMemo(() => {
    const dayOf = (key: string): FarmDay => {
      const onHaid = isHaidDay(haid, key);
      const entry = logs[key];
      const percent = key === today ? todayPercent : pastPercent(entry, itemsForDay(plan.items, onHaid));
      return { key, percent, onHaid, recorded: entry !== undefined };
    };
    const fields = world.buildWorld(today, dayOf);
    const plots: world.WorldPlot[] = [];
    for (const field of fields) plots.push(...field.plots);
    const slots = world.slotIndex(fields);
    const blockField = world.BLOCK_FIELD;
    const nearFn = (p: Point) => {
      'worklet';
      return worldNear(slots, blockField, p);
    };
    return { today, fields, plots, nearFn };
  }, [logs, plan.items, haid, today, todayPercent]);
}
