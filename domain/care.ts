import { addDays, daysBetween } from './cycle';
import type { HaidLog } from './haid';

export type PadProduct = 'pembalut' | 'tampon' | 'cup' | 'celana';

export const PAD_PRODUCTS: { id: PadProduct; label: string; hours: number }[] = [
  { id: 'pembalut', label: 'Pembalut', hours: 4 },
  { id: 'tampon', label: 'Tampon', hours: 8 },
  { id: 'cup', label: 'Menstrual cup', hours: 12 },
  { id: 'celana', label: 'Celana haid', hours: 12 },
];

export type PadChange = { product: PadProduct; at: number };

/** `time` is the daily reminder, `HH:MM`. */
export type PillRegimen = { start: string; active: number; placebo: number; time: string };

export type KbType = 'iud-hormonal' | 'iud-tembaga' | 'implan' | 'suntik-1' | 'suntik-3' | 'cincin' | 'koyo';

export const KB_TYPES: { id: KbType; label: string; days: number; hormonal: boolean }[] = [
  { id: 'iud-hormonal', label: 'IUD hormonal', days: 1825, hormonal: true },
  { id: 'iud-tembaga', label: 'IUD tembaga', days: 3650, hormonal: false },
  { id: 'implan', label: 'Implan', days: 1095, hormonal: true },
  { id: 'suntik-1', label: 'Suntik 1 bulan', days: 30, hormonal: true },
  { id: 'suntik-3', label: 'Suntik 3 bulan', days: 90, hormonal: true },
  { id: 'cincin', label: 'Cincin', days: 21, hormonal: true },
  { id: 'koyo', label: 'Koyo', days: 7, hormonal: true },
];

export type KbMethod = { type: KbType; start: string };

export type Care = { pads: PadChange[]; pill?: PillRegimen; pillTaken: string[]; kb?: KbMethod };

export const EMPTY_CARE: Care = { pads: [], pillTaken: [] };

const PAD_HISTORY = 60;
const PILL_HISTORY = 120;

export function careOf(log: HaidLog): Care {
  return { ...EMPTY_CARE, ...log.care };
}

export function withCare(log: HaidLog, care: Care, now: number): HaidLog {
  return { ...log, care, at: now };
}

export function padHours(product: PadProduct): number {
  return PAD_PRODUCTS.find((p) => p.id === product)!.hours;
}

export function logPad(care: Care, product: PadProduct, now: number): Care {
  return { ...care, pads: [...care.pads, { product, at: now }].slice(-PAD_HISTORY) };
}

export function lastPad(care: Care): PadChange | undefined {
  return care.pads[care.pads.length - 1];
}

/** 0-based position in the pack, and whether that pill is a placebo; null before the start. */
export function pillDay(reg: PillRegimen, day: string): { index: number; placebo: boolean } | null {
  const offset = daysBetween(reg.start, day);
  if (offset < 0) return null;
  const index = offset % (reg.active + reg.placebo);
  return { index, placebo: index >= reg.active };
}

/** The first day of the pack `day` falls in. */
export function packStart(reg: PillRegimen, day: string): string {
  const pos = pillDay(reg, day);
  return pos ? addDays(day, -pos.index) : reg.start;
}

export function togglePill(care: Care, day: string): Care {
  const taken = care.pillTaken.includes(day)
    ? care.pillTaken.filter((d) => d !== day)
    : [...care.pillTaken, day].sort().slice(-PILL_HISTORY);
  return { ...care, pillTaken: taken };
}

export function kbInfo(type: KbType) {
  return KB_TYPES.find((k) => k.id === type)!;
}

export function kbExpiry(kb: KbMethod): string {
  return addDays(kb.start, kbInfo(kb.type).days);
}

/** Fertile-window predictions mean nothing while hormones hold ovulation back. */
export function isNaturalCycle(care: Care): boolean {
  return !care.pill && !(care.kb && kbInfo(care.kb.type).hormonal);
}
