import { daysBetween, sortedPeriods } from './cycle';
import type { HaidLog } from './haid';
import { FLOWS, PAINS, type Flow } from './haidDay';

export type Bar = { label: string; value: number };

const RECENT = 6;

/** Days from each start to the next, newest last; gaps outside 15–60 days are entry mistakes, as in the forecast. */
export function cycleLengths(log: HaidLog): Bar[] {
  const periods = sortedPeriods(log).slice(-(RECENT + 1));
  return periods
    .slice(1)
    .map((p, i) => ({ label: periods[i].start, value: daysBetween(periods[i].start, p.start) }))
    .filter((b) => b.value >= 15 && b.value <= 60);
}

/** Bleeding days of each finished period, newest last. */
export function periodLengths(log: HaidLog): Bar[] {
  return sortedPeriods(log)
    .filter((p) => p.end !== undefined)
    .slice(-RECENT)
    .map((p) => ({ label: p.start, value: daysBetween(p.start, p.end!) + 1 }));
}

export function flowCounts(log: HaidLog): Bar[] {
  const notes = Object.values(log.days ?? {});
  const count = (id: Flow) => notes.filter((n) => n.flow === id).length;
  return FLOWS.map((f) => ({ label: f.label, value: count(f.id) }));
}

export function painCounts(log: HaidLog): Bar[] {
  const notes = Object.values(log.days ?? {});
  return PAINS.map((label, level) => ({ label, value: notes.filter((n) => n.pain === level).length }));
}

export function topSymptoms(log: HaidLog, limit: number): Bar[] {
  const counts = new Map<string, number>();
  for (const note of Object.values(log.days ?? {})) {
    for (const s of note.symptoms) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}
