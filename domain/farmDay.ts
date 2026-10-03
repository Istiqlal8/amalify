import { bandOf, type DayBand } from '@/constants/farm';

import type { FarmDay } from './farm';

/**
 * What a garden bed is showing. A day with no entry is `belum` — not 0%: the old code drew both
 * as an empty bed, which read as "you did nothing" on days the user never opened the app.
 * `khusus` is a haid day, which follows its own amal rules and is never described as a miss.
 */
export type DayStatus = 'nanti' | 'belum' | 'khusus' | 'tercatat';

export type DayView = FarmDay & { status: DayStatus; band: DayBand };

export function dayStatus(day: FarmDay, today: string): DayStatus {
  if (day.key > today) return 'nanti';
  if (day.onHaid) return 'khusus';
  return day.recorded ? 'tercatat' : 'belum';
}

export function dayView(day: FarmDay, today: string): DayView {
  const status = dayStatus(day, today);
  return { ...day, status, band: status === 'tercatat' ? bandOf(day.percent) : 'kosong' };
}

/** Short, neutral wording for a status. Never "gagal" or "bolong". */
export const STATUS_LABEL: Record<DayStatus, string> = {
  nanti: 'Belum tiba',
  belum: 'Belum dicatat',
  khusus: 'Hari khusus',
  tercatat: 'Tercatat',
};

/** A glyph so status survives without colour (colour blindness, monochrome, reduced contrast). */
export const STATUS_GLYPH: Record<DayStatus, string> = {
  nanti: '·',
  belum: '–',
  khusus: '○',
  tercatat: '●',
};

/** The headline a day's detail panel shows: a percentage only when one was actually recorded. */
export function dayHeadline(view: DayView): string {
  return view.status === 'tercatat' ? `${view.percent}%` : STATUS_LABEL[view.status];
}

/** Days of a month that carry a recorded percentage; the denominator for an honest average. */
export function recordedDays(days: FarmDay[], today: string): FarmDay[] {
  return days.filter((d) => d.key <= today && d.recorded && !d.onHaid);
}

/**
 * Average over recorded days only, and how many there were. A month the user never logged reads
 * as "0 hari tercatat" rather than 0%.
 */
export function monthSummary(days: FarmDay[], today: string): { average: number; counted: number } {
  const counted = recordedDays(days, today);
  if (counted.length === 0) return { average: 0, counted: 0 };
  const sum = counted.reduce((total, d) => total + d.percent, 0);
  return { average: Math.round(sum / counted.length), counted: counted.length };
}
