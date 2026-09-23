import { addDays, cycleStats, daysBetween, sortedPeriods } from './cycle';
import type { HaidLog } from './haid';

export type Phase = 'haid' | 'folikular' | 'subur' | 'ovulasi' | 'luteal' | 'telat';

export const PHASE_LABEL: Record<Phase, string> = {
  haid: 'Sedang haid',
  folikular: 'Fase folikular',
  subur: 'Masa subur',
  ovulasi: 'Perkiraan ovulasi',
  luteal: 'Fase luteal',
  telat: 'Haid terlambat',
};

export type Forecast = { lastStart: string; avgCycle: number; avgLength: number; nextStart: string };

export type DayMark = 'predicted' | 'fertile' | 'ovulation';

/** The luteal phase is close to 14 days for most cycles, so ovulation is counted back from the next start. */
const LUTEAL = 14;
const FERTILE_BEFORE = 5;
const DEFAULT_LENGTH = 5;
const CYCLES_AHEAD = 3;

export function forecast(log: HaidLog): Forecast | null {
  const stats = cycleStats(log);
  if (!stats) return null;
  const periods = sortedPeriods(log);
  return {
    lastStart: periods[periods.length - 1].start,
    avgCycle: stats.avgCycle,
    avgLength: stats.avgLength ?? DEFAULT_LENGTH,
    nextStart: stats.nextStart,
  };
}

/** Where `day` sits in the cycle that began at `start`, ignoring any bleeding. */
function markInCycle(f: Forecast, start: string, day: string): DayMark | null {
  const offset = daysBetween(start, day);
  const ovulation = f.avgCycle - LUTEAL;
  if (offset === ovulation) return 'ovulation';
  if (offset >= ovulation - FERTILE_BEFORE && offset <= ovulation + 1) return 'fertile';
  return null;
}

/** Predicted marks for the calendar; logged periods are drawn separately and win over these. */
export function dayMark(f: Forecast, day: string, fertility: boolean): DayMark | null {
  const k = Math.floor(daysBetween(f.lastStart, day) / f.avgCycle);
  if (k < 0 || k > CYCLES_AHEAD) return null;
  const start = addDays(f.lastStart, k * f.avgCycle);
  if (k >= 1 && daysBetween(start, day) < f.avgLength) return 'predicted';
  return fertility ? markInCycle(f, start, day) : null;
}

export function phaseOn(f: Forecast, day: string, onHaid: boolean): Phase {
  if (onHaid) return 'haid';
  if (day >= f.nextStart) return 'telat';
  const mark = markInCycle(f, f.lastStart, day);
  if (mark === 'ovulation') return 'ovulasi';
  if (mark === 'fertile') return 'subur';
  return daysBetween(f.lastStart, day) < f.avgCycle - LUTEAL ? 'folikular' : 'luteal';
}
