import { cadenceKey, cadenceOf, cadenceRange, isDaily } from './cadence';
import type { CadenceLogs } from './cadenceLog';
import { countOf, dateKey, dayPercent, type Logs } from './dayLog';
import { isHaidDay, isPausedSection, type HaidLog } from './haid';
import { haidReminders } from './haidReminders';
import type { PlanItem } from './plan';
import type { NextPrayer } from './prayer';

/** Local time of day, `HH:MM`. */
export type Clock = string;

export type EveningReminder = { enabled: boolean; time: Clock };

export type ScheduledReminder = { id: string; date: Date; title: string; body: string };

export const DEFAULT_EVENING: EveningReminder = { enabled: false, time: '20:30' };

/** iOS keeps at most 64 pending notifications; stay under it on every platform. */
export const MAX_PENDING = 60;
export const DAYS_AHEAD = 7;

export function parseClock(clock: Clock): { hour: number; minute: number } {
  const [h, m] = clock.split(':').map(Number);
  return { hour: h, minute: m };
}

export function formatClock(hour: number, minute: number): Clock {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function at(day: Date, clock: Clock): Date {
  const { hour, minute } = parseClock(clock);
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function itemIsDone(logs: Logs, day: string, item: PlanItem): boolean {
  return countOf(logs[day], item.id) >= item.target;
}

/** An item with chosen weekdays stays quiet on the others; without them it rings every day. */
function ringsOn(item: PlanItem, day: Date): boolean {
  return !item.reminderDays || item.reminderDays.includes(day.getDay());
}

function remindersForDay(day: Date, items: PlanItem[], logs: Logs, evening: EveningReminder, haid: HaidLog): ScheduledReminder[] {
  const key = dateKey(day);
  const onHaid = isHaidDay(haid, key);
  const list: ScheduledReminder[] = items
    .filter((it) => it.reminder && ringsOn(it, day) && !itemIsDone(logs, key, it) && !(onHaid && isPausedSection(it.section)))
    .map((it) => ({
      id: `${key}:${it.id}`,
      date: at(day, it.reminder!),
      title: it.label,
      body: 'Yuk, siram tanamanmu hari ini.',
    }));
  if (evening.enabled && dayPercent(logs[key], items) < 100) {
    list.push({
      id: `${key}:evening`,
      date: at(day, evening.time),
      title: 'Tanamanmu belum berbunga',
      body: 'Masih ada amalan yang bisa dicatat hari ini.',
    });
  }
  return list;
}

function bucketOf(item: PlanItem, day: string): string {
  return cadenceKey(cadenceOf(item), day);
}

function bucketDone(cadence: CadenceLogs, item: PlanItem, day: string): boolean {
  return countOf(cadence[bucketOf(item, day)], item.id) >= item.target;
}

function isPaused(item: PlanItem, day: string, haid: HaidLog): boolean {
  return isHaidDay(haid, day) && isPausedSection(item.section);
}

/** A longer cadence is nagged at most once a bucket: on its last day, and only if still unfinished. */
function bucketReminders(day: Date, items: PlanItem[], cadence: CadenceLogs, haid: HaidLog): ScheduledReminder[] {
  const key = dateKey(day);
  return items
    .filter((it) => it.reminder && cadenceRange(cadenceOf(it), bucketOf(it, key)).to === key)
    .filter((it) => !bucketDone(cadence, it, key) && !isPaused(it, key, haid))
    .map((it) => ({
      id: `${key}:${it.id}`,
      date: at(day, it.reminder!),
      title: it.label,
      body: 'Hari terakhir periode ini.',
    }));
}

function adzan(prayers: NextPrayer[], items: PlanItem[], logs: Logs, city: string, haid: HaidLog): ScheduledReminder[] {
  return prayers
    .filter((p) => !isHaidDay(haid, dateKey(p.at)))
    .filter((p) => {
      // A prayer already ticked off (e.g. prayed early in a group) needs no call.
      const item = items.find((it) => it.id === p.id);
      return !item || !itemIsDone(logs, dateKey(p.at), item);
    })
    .map((p) => ({
      id: `${dateKey(p.at)}:adzan-${p.id}`,
      date: p.at,
      title: `Waktunya sholat ${p.name}`,
      body: `${formatClock(p.at.getHours(), p.at.getMinutes())} · ${city}`,
    }));
}

export type ScheduleInput = {
  items: PlanItem[];
  logs: Logs;
  /** Progress per cadence bucket, so a longer item is not nagged once its bucket is done. */
  cadence: CadenceLogs;
  evening: EveningReminder;
  /** Upcoming prayer times when adzan reminders are on, otherwise empty. */
  prayers: NextPrayer[];
  city: string;
  haid: HaidLog;
  now: Date;
};

/**
 * Reminders for the coming days, soonest first. Anything already done today is skipped, which is
 * why these are one-off dated notifications instead of daily repeats.
 */
export function buildSchedule({ items, logs, cadence, evening, prayers, city, haid, now }: ScheduleInput): ScheduledReminder[] {
  const daily = items.filter(isDaily);
  const longer = items.filter((it) => !isDaily(it));
  const all: ScheduledReminder[] = [];
  for (let i = 0; i < DAYS_AHEAD; i += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    all.push(...remindersForDay(day, daily, logs, evening, haid), ...bucketReminders(day, longer, cadence, haid));
  }
  const horizon = new Date(now);
  horizon.setDate(now.getDate() + DAYS_AHEAD);
  all.push(...adzan(prayers.filter((p) => p.at < horizon), daily, logs, city, haid));
  all.push(...haidReminders(haid, now));
  return all
    .filter((r) => r.date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_PENDING);
}
