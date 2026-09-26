import { dateKey, hasProgress, type Logs, pastPercent } from './dayLog';
import { type HaidLog, isHaidDay, itemsForDay } from './haid';
import type { PlanItem } from './plan';

export const STREAK_EVERY = 7;
export const STREAK_BONUS = 10;
export const PERFECT_BONUS = 5;

/** 1 point per full 10% (max 10), +5 for a perfect day. */
export function dayPoints(percent: number): number {
  const base = Math.min(10, Math.floor(Math.max(0, percent) / 10));
  return base + (percent === 100 ? PERFECT_BONUS : 0);
}

function nextDay(key: string): string {
  const d = new Date(`${key}T00:00`);
  d.setDate(d.getDate() + 1);
  return dateKey(d);
}

/** +10 each time a run of consecutive days with progress reaches 7, 14, 21, … days. */
export function streakBonus(logs: Logs, today: string): number {
  let bonus = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of Object.keys(logs).filter((k) => k <= today).sort()) {
    if (!hasProgress(logs[key])) {
      run = 0;
    } else {
      run = prev !== null && nextDay(prev) === key ? run + 1 : 1;
      if (run % STREAK_EVERY === 0) bonus += STREAK_BONUS;
    }
    prev = hasProgress(logs[key]) ? key : null;
  }
  return bonus;
}

/**
 * Every point ever earned, recomputed from the synced logs (so sync can never count a day twice):
 * past days use their stored percentage, today the live one.
 */
export function earnedPoints(logs: Logs, items: PlanItem[], haid: HaidLog, today: string, todayPercent: number): number {
  let total = dayPoints(todayPercent);
  for (const key of Object.keys(logs)) {
    if (key >= today) continue;
    total += dayPoints(pastPercent(logs[key], itemsForDay(items, isHaidDay(haid, key))));
  }
  return total + streakBonus(logs, today);
}
