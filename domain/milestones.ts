import type { FlowerId } from './flowers';
import { hasProgress, streak, type Logs } from './dayLog';
import type { PlanItem } from './plan';

/**
 * Rare flowers that are not bought but *earned*: each opens when the garden reaches a milestone.
 * They are derived from the amal history every render, so nothing new is stored and sync can
 * never lose or double-count them.
 */
export type Milestone = {
  id: FlowerId;
  /** Short name shown in the shop and the reveal. */
  name: string;
  /** What has to happen, in the player's words. */
  requirement: string;
  /** The target the progress bar counts towards. */
  target: number;
  /** Current value toward `target`, from the logs. */
  value: (ctx: MilestoneContext) => number;
};

export type MilestoneContext = { logs: Logs; totalPoints: number; streak: number; recordedDays: number };

/** The flowers that can only be earned, never bought. */
export const RARE_FLOWERS: FlowerId[] = ['anggrek', 'teratai', 'sepatu'];

export const MILESTONES: Milestone[] = [
  {
    id: 'sepatu',
    name: 'Kembang sepatu',
    requirement: 'Catat 30 hari amal',
    target: 30,
    value: (c) => c.recordedDays,
  },
  {
    id: 'anggrek',
    name: 'Anggrek',
    requirement: 'Kumpulkan 500 poin amal',
    target: 500,
    value: (c) => c.totalPoints,
  },
  {
    id: 'teratai',
    name: 'Teratai',
    requirement: 'Raih 30 hari beruntun',
    target: 30,
    value: (c) => c.streak,
  },
];

/** Consecutive days up to (and including) `today` with any progress. */
export function currentStreak(logs: Logs, today: string): number {
  return streak(logs, new Date(`${today}T00:00`));
}

/** Days that carry any amal, up to today. */
export function recordedDays(logs: Logs, today: string): number {
  return Object.keys(logs).filter((k) => k <= today && hasProgress(logs[k])).length;
}

export type MilestoneProgress = Milestone & { current: number; earned: boolean; ratio: number };

/** Every milestone with live progress, newest-earned last. */
export function milestoneProgress(ctx: MilestoneContext): MilestoneProgress[] {
  return MILESTONES.map((m) => {
    const current = Math.max(0, Math.floor(m.value(ctx)));
    return { ...m, current, earned: current >= m.target, ratio: Math.min(1, current / m.target) };
  });
}

/** The rare flowers the player has earned, given their history. */
export function earnedRare(ctx: MilestoneContext): FlowerId[] {
  return milestoneProgress(ctx).filter((m) => m.earned).map((m) => m.id);
}

/** Are any rare flowers still locked? Drives whether the shop shows the "langka" section. */
export function hasLockedRare(ctx: MilestoneContext): boolean {
  return milestoneProgress(ctx).some((m) => !m.earned);
}

/** Builds the context from the raw pieces the provider already has. */
export function milestoneContext(logs: Logs, items: PlanItem[], today: string, totalPoints: number): MilestoneContext {
  void items;
  return { logs, totalPoints, streak: currentStreak(logs, today), recordedDays: recordedDays(logs, today) };
}
