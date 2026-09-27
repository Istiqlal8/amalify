import { dateKey } from './dayLog';

export type CashEntry = {
  id: string;
  /** Rupiah; positive = masuk, negative = keluar. */
  amount: number;
  note: string;
  /** `YYYY-MM-DD`. */
  day: string;
  /** Member whose dues this pays; null for other entries. */
  duesFor: string | null;
  /** Start of the dues period paid for: the 1st of a month, or a Monday for weekly dues. */
  duesMonth: string | null;
  createdBy: string;
};

export function balance(entries: CashEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function monthOf(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

export type DuesPeriod = 'week' | 'month';

/** Monday of the week containing `day`. */
export function weekOf(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const monday = new Date(y, m - 1, d - ((new Date(y, m - 1, d).getDay() + 6) % 7));
  return dateKey(monday);
}

export function duesPeriodStart(day: string, period: DuesPeriod): string {
  return period === 'week' ? weekOf(day) : monthOf(day);
}

/** Members who paid dues for the period starting on `start`. */
export function paidFor(entries: CashEntry[], start: string): Set<string> {
  return new Set(entries.filter((e) => e.duesMonth === start && e.duesFor).map((e) => e.duesFor as string));
}

export function formatRupiah(amount: number): string {
  const digits = String(Math.abs(Math.round(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}Rp ${digits}`;
}

/** Reads "50.000", "50000" or "Rp 50.000" as whole rupiah; 0 when there are no digits. */
export function parseRupiah(text: string): number {
  return Number(text.replace(/\D/g, '')) || 0;
}
