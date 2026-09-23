export type CashEntry = {
  id: string;
  /** Rupiah; positive = masuk, negative = keluar. */
  amount: number;
  note: string;
  /** `YYYY-MM-DD`. */
  day: string;
  /** Member whose dues this pays; null for other entries. */
  duesFor: string | null;
  /** First day of the month the dues cover, `YYYY-MM-01`. */
  duesMonth: string | null;
  createdBy: string;
};

export function balance(entries: CashEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function monthOf(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

/** Members who paid dues for `month` (`YYYY-MM-01`). */
export function paidFor(entries: CashEntry[], month: string): Set<string> {
  return new Set(entries.filter((e) => e.duesMonth === month && e.duesFor).map((e) => e.duesFor as string));
}

export function formatRupiah(amount: number): string {
  const digits = String(Math.abs(Math.round(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}Rp ${digits}`;
}

/** Reads "50.000", "50000" or "Rp 50.000" as whole rupiah; 0 when there are no digits. */
export function parseRupiah(text: string): number {
  return Number(text.replace(/\D/g, '')) || 0;
}
