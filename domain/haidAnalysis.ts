import { cycleStats, daysBetween, addDays, sortedPeriods } from './cycle';
import { openPeriod, type HaidLog } from './haid';

// Clinical rules of thumb (FIGO / ACOG) for when a cycle is worth a check-up.
const SHORT_CYCLE = 21;
const LONG_CYCLE = 35;
const LONG_PERIOD = 7;
const LATE_DAYS = 7;
/** Cycle lengths varying by more than this are counted as irregular. */
const REGULAR_SPREAD = 7;
const SEVERE_PAIN = 3;
const PMS_WINDOW = 5;
const RECENT = 6;

/** Start-to-start gaps of the recent cycles, leaving out obvious entry mistakes. */
export function recentCycles(log: HaidLog): number[] {
  const periods = sortedPeriods(log).slice(-(RECENT + 1));
  return periods
    .slice(1)
    .map((p, i) => daysBetween(periods[i].start, p.start))
    .filter((n) => n >= 15 && n <= 60);
}

/** null until three cycles are known. */
export function regularity(log: HaidLog): { regular: boolean; spread: number } | null {
  const cycles = recentCycles(log);
  if (cycles.length < 3) return null;
  const spread = Math.max(...cycles) - Math.min(...cycles);
  return { regular: spread <= REGULAR_SPREAD, spread };
}

/** Plain-language signs worth raising with a doctor or midwife. */
export function healthFlags(log: HaidLog, today: string, natural: boolean): string[] {
  const flags: string[] = [];
  const stats = cycleStats(log);
  if (stats && stats.avgCycle < SHORT_CYCLE) flags.push(`Siklus rata-rata ${stats.avgCycle} hari, lebih pendek dari ${SHORT_CYCLE} hari.`);
  if (stats && stats.avgCycle > LONG_CYCLE) flags.push(`Siklus rata-rata ${stats.avgCycle} hari, lebih panjang dari ${LONG_CYCLE} hari.`);
  if (stats?.avgLength && stats.avgLength > LONG_PERIOD) flags.push(`Haid rata-rata ${stats.avgLength} hari, lebih dari ${LONG_PERIOD} hari.`);
  const late = stats && !openPeriod(log) && natural ? daysBetween(stats.nextStart, today) : 0;
  if (late > LATE_DAYS) flags.push(`Haid telat ${late} hari dari perkiraan.`);
  if (severePainCycles(log) >= 2) flags.push('Nyeri berat tercatat di beberapa haid terakhir.');
  return flags;
}

/** How many of the last three finished periods had a day of pain at "berat" or worse. */
function severePainCycles(log: HaidLog): number {
  const finished = sortedPeriods(log).filter((p) => p.end !== undefined).slice(-3);
  return finished.filter((p) => {
    for (let d = p.start; d <= p.end!; d = addDays(d, 1)) {
      if ((log.days?.[d]?.pain ?? 0) >= SEVERE_PAIN) return true;
    }
    return false;
  }).length;
}

/** Symptoms noted in the 5 days before a period, with how many cycles each showed up in. */
export function pmsSymptoms(log: HaidLog, limit: number): { symptom: string; cycles: number }[] {
  const counts = new Map<string, number>();
  for (const p of sortedPeriods(log).slice(1)) {
    const seen = new Set<string>();
    for (let i = PMS_WINDOW; i >= 1; i--) {
      for (const s of log.days?.[addDays(p.start, -i)]?.symptoms ?? []) seen.add(s);
    }
    seen.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .map(([symptom, cycles]) => ({ symptom, cycles }))
    .sort((a, b) => b.cycles - a.cycles)
    .slice(0, limit);
}
