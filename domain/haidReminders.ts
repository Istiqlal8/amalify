import { careOf, kbExpiry, kbInfo, lastPad, padHours, pillDay, type Care } from './care';
import { addDays } from './cycle';
import { dateKey } from './dayLog';
import { isHaidDay, type HaidLog } from './haid';
import { forecast } from './cyclePhase';
import type { ScheduledReminder } from './reminders';

const MORNING = 9;
const PILL_DAYS = 7;
const HOUR_MS = 3600000;

function atDay(day: string, hour: number, minute = 0): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute);
}

function periodDue(log: HaidLog, today: string): ScheduledReminder[] {
  const f = forecast(log);
  if (!f || isHaidDay(log, today)) return [];
  const day = addDays(f.nextStart, -1);
  return [{ id: `haid:due:${f.nextStart}`, date: atDay(day, MORNING), title: 'Haid diperkirakan besok', body: 'Siapkan pembalut, ya.' }];
}

function padChange(care: Care): ScheduledReminder[] {
  const last = lastPad(care);
  if (!last) return [];
  const date = new Date(last.at + padHours(last.product) * HOUR_MS);
  return [{ id: `haid:pad:${last.at}`, date, title: 'Waktunya ganti', body: 'Sudah waktunya ganti pembalut.' }];
}

function pills(care: Care, today: string): ScheduledReminder[] {
  const reg = care.pill;
  if (!reg) return [];
  const [hour, minute] = reg.time.split(':').map(Number);
  const list: ScheduledReminder[] = [];
  for (let i = 0; i < PILL_DAYS; i += 1) {
    const day = addDays(today, i);
    const pos = pillDay(reg, day);
    if (!pos || pos.placebo || care.pillTaken.includes(day)) continue;
    list.push({ id: `haid:pill:${day}`, date: atDay(day, hour, minute), title: 'Minum pil KB', body: `Pil ke-${pos.index + 1}` });
  }
  return list;
}

/** A week ahead for long methods, the day before for short ones like koyo. */
function kbRenewal(care: Care): ScheduledReminder[] {
  if (!care.kb) return [];
  const info = kbInfo(care.kb.type);
  const expiry = kbExpiry(care.kb);
  const day = addDays(expiry, info.days >= 30 ? -7 : -1);
  return [{ id: `haid:kb:${expiry}`, date: atDay(day, MORNING), title: `${info.label} segera habis`, body: 'Jadwalkan penggantian KB.' }];
}

export function haidReminders(log: HaidLog, now: Date): ScheduledReminder[] {
  const today = dateKey(now);
  const care = careOf(log);
  return [...periodDue(log, today), ...padChange(care), ...pills(care, today), ...kbRenewal(care)];
}
