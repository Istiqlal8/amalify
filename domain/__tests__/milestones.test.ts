import { describe, expect, it } from '@jest/globals';

import type { DayEntry, Logs } from '../dayLog';
import { earnedRare, milestoneContext, milestoneProgress } from '../milestones';

const day = (): DayEntry => ({ counts: { amal: 1 }, at: 0 });

/** A run of `n` consecutive days ending on `today`. */
function run(today: string, n: number): Logs {
  const logs: Logs = {};
  for (let i = 0; i < n; i++) {
    const d = new Date(`${today}T00:00`);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    logs[key] = day();
  }
  return logs;
}

describe('milestones', () => {
  it('earns the streak lotus only at 30 consecutive days', () => {
    const today = '2026-03-30';
    const at29 = milestoneContext(run(today, 29), [], today, 0);
    const at30 = milestoneContext(run(today, 30), [], today, 0);
    expect(earnedRare(at29)).not.toContain('teratai');
    expect(earnedRare(at30)).toContain('teratai');
  });

  it('earns the orchid at 500 points regardless of streak', () => {
    const ctx = milestoneContext({}, [], '2026-03-30', 500);
    expect(earnedRare(ctx)).toContain('anggrek');
  });

  it('earns the hibiscus at 30 recorded days, even non-consecutive', () => {
    const logs: Logs = { '2026-03-01': day(), '2026-03-02': day(), '2026-03-10': day() };
    const fewer = milestoneContext(logs, [], '2026-03-30', 0);
    expect(earnedRare(fewer)).not.toContain('sepatu');
    const many: Logs = {};
    for (let i = 0; i < 30; i++) many[`2026-02-${String(i + 1).padStart(2, '0')}`] = day();
    expect(earnedRare(milestoneContext(many, [], '2026-03-30', 0))).toContain('sepatu');
  });

  it('reports progress ratio capped at one', () => {
    const ctx = milestoneContext(run('2026-03-30', 40), [], '2026-03-30', 0);
    const lotus = milestoneProgress(ctx).find((m) => m.id === 'teratai');
    expect(lotus?.ratio).toBe(1);
    expect(lotus?.earned).toBe(true);
  });

  it('stops the streak at the first gap', () => {
    const logs: Logs = { '2026-03-30': day(), '2026-03-29': day(), '2026-03-27': day() };
    expect(milestoneContext(logs, [], '2026-03-30', 0).streak).toBe(2);
  });
});
