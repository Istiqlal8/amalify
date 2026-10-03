import { formatDay } from './cycle';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

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

/** The period after the one starting on `start`: the 1st of next month, or the next Monday. */
export function nextPeriodStart(start: string, period: DuesPeriod): string {
  const [y, m, d] = start.split('-').map(Number);
  return dateKey(period === 'week' ? new Date(y, m - 1, d + 7) : new Date(y, m, 1));
}

/** Period starts this member has already paid for. */
function paidStarts(entries: CashEntry[], member: string): Set<string> {
  return new Set(entries.filter((e) => e.duesFor === member && e.duesMonth).map((e) => e.duesMonth as string));
}

/** The `count` earliest periods from `from` onward that `member` has not paid, skipping paid ones. */
export function unpaidPeriodStarts(entries: CashEntry[], member: string, from: string, period: DuesPeriod, count: number): string[] {
  const paid = paidStarts(entries, member);
  const starts: string[] = [];
  let cursor = from;
  while (starts.length < count) {
    if (!paid.has(cursor)) starts.push(cursor);
    cursor = nextPeriodStart(cursor, period);
  }
  return starts;
}

/** Last period `member` is paid up to, counting on from `from`; null while `from` itself is unpaid. */
export function paidThrough(entries: CashEntry[], member: string, from: string, period: DuesPeriod): string | null {
  const paid = paidStarts(entries, member);
  if (!paid.has(from)) return null;
  let cursor = from;
  for (let next = nextPeriodStart(cursor, period); paid.has(next); next = nextPeriodStart(cursor, period)) cursor = next;
  return cursor;
}

/** `Des 2026` for monthly dues, `28 Sep 2026` for weekly ones. */
export function formatPeriodStart(start: string, period: DuesPeriod): string {
  const [y, m] = start.split('-').map(Number);
  return period === 'week' ? `${formatDay(start)} ${y}` : `${MONTHS[m - 1]} ${y}`;
}
