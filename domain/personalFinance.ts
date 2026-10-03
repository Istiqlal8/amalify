import { monthOf } from './cash';

/** Pemasukan atau pengeluaran pribadi. Nominal selalu positif; arah ada di `kind`. */
export type FinanceKind = 'masuk' | 'keluar';

export type FinanceCategory =
  | 'gaji'
  | 'usaha'
  | 'makan'
  | 'transport'
  | 'belanja'
  | 'tagihan'
  | 'kesehatan'
  | 'pendidikan'
  | 'sedekah'
  | 'tabungan'
  | 'lainnya';

export const FINANCE_CATEGORIES: { id: FinanceCategory; label: string }[] = [
  { id: 'gaji', label: 'Gaji' },
  { id: 'usaha', label: 'Usaha' },
  { id: 'makan', label: 'Makan' },
  { id: 'transport', label: 'Transport' },
  { id: 'belanja', label: 'Belanja' },
  { id: 'tagihan', label: 'Tagihan' },
  { id: 'kesehatan', label: 'Kesehatan' },
  { id: 'pendidikan', label: 'Pendidikan' },
  { id: 'sedekah', label: 'Sedekah' },
  { id: 'tabungan', label: 'Tabungan' },
  { id: 'lainnya', label: 'Lainnya' },
];

/** Kategori yang wajar untuk pemasukan; sisanya untuk pengeluaran. */
export const INCOME_CATEGORIES: FinanceCategory[] = ['gaji', 'usaha', 'lainnya'];
export const EXPENSE_CATEGORIES: FinanceCategory[] = [
  'makan',
  'transport',
  'belanja',
  'tagihan',
  'kesehatan',
  'pendidikan',
  'sedekah',
  'tabungan',
  'lainnya',
];

export type PersonalEntry = {
  id: string;
  kind: FinanceKind;
  /** Rupiah, bilangan bulat positif. */
  amount: number;
  /** Id kategori bawaan atau id kategori bebas. */
  category: string;
  note: string;
  /** `YYYY-MM-DD`. */
  day: string;
};

export type FinanceDraft = Omit<PersonalEntry, 'id'>;

/** Kategori bebas buatan user; `kind` menentukan masuk atau keluar. */
export type CustomCategory = { id: string; label: string; kind: FinanceKind };

export type MonthlyBudget = {
  /** Id kategori bawaan atau bebas. */
  category: string;
  /** Batas belanja sebulan, rupiah positif. */
  limit: number;
};

export type BudgetStatus = MonthlyBudget & {
  spent: number;
  remaining: number;
  over: boolean;
  /** 0..1+, spent / limit; 0 saat limit 0. */
  progress: number;
};

export type MonthlySummary = {
  /** `YYYY-MM`. */
  month: string;
  masuk: number;
  keluar: number;
  saldo: number;
  byCategory: Record<string, number>;
  budgets: BudgetStatus[];
  overBudget: string[];
};

export function categoryLabel(id: string, customs: CustomCategory[] = []): string {
  return FINANCE_CATEGORIES.find((c) => c.id === id)?.label ?? customs.find((c) => c.id === id)?.label ?? id;
}

/** Id unik kategori bebas, pola sama seperti id amalan. */
export function newCategoryId(now: number, random: number = Math.random()): string {
  return `c${now.toString(36)}${Math.floor(random * 1e6).toString(36)}`;
}

/** `null` saat nama valid; pesan singkat saat tidak. */
export function validateCategoryLabel(label: string, existing: Pick<CustomCategory, 'label'>[]): string | null {
  const name = label.trim();
  if (name === '') return 'Nama kategori wajib diisi.';
  if (name.length > 20) return 'Maksimal 20 huruf.';
  if (existing.some((c) => c.label.toLowerCase() === name.toLowerCase())) return 'Kategori sudah ada.';
  return null;
}

/** `null` saat valid; pesan error singkat saat tidak. */
export function validateDraft(draft: FinanceDraft): string | null {
  if (!Number.isFinite(draft.amount) || Math.round(draft.amount) <= 0) return 'Nominal harus lebih dari Rp 0.';
  if (draft.note.trim() === '') return 'Keterangan wajib diisi.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.day)) return 'Tanggal tidak valid.';
  return null;
}

/** Bulan `YYYY-MM` dari hari `YYYY-MM-DD`. */
export function monthKeyOf(day: string): string {
  return day.slice(0, 7);
}

export function entriesInMonth(entries: PersonalEntry[], month: string): PersonalEntry[] {
  return entries.filter((e) => monthKeyOf(e.day) === month);
}

export function totalMasuk(entries: PersonalEntry[]): number {
  return entries.reduce((sum, e) => (e.kind === 'masuk' ? sum + e.amount : sum), 0);
}

export function totalKeluar(entries: PersonalEntry[]): number {
  return entries.reduce((sum, e) => (e.kind === 'keluar' ? sum + e.amount : sum), 0);
}

export function saldo(entries: PersonalEntry[]): number {
  return totalMasuk(entries) - totalKeluar(entries);
}

/** Total pengeluaran per kategori (pemasukan tidak ikut). */
export function spendByCategory(entries: PersonalEntry[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of entries) {
    if (e.kind !== 'keluar') continue;
    out[e.category] = (out[e.category] ?? 0) + e.amount;
  }
  return out;
}

export function budgetStatus(budgets: MonthlyBudget[], entries: PersonalEntry[]): BudgetStatus[] {
  const spent = spendByCategory(entries);
  return budgets.map((b) => {
    const used = spent[b.category] ?? 0;
    return {
      ...b,
      spent: used,
      remaining: b.limit - used,
      over: used > b.limit,
      progress: b.limit > 0 ? used / b.limit : 0,
    };
  });
}

/** Ringkasan satu bulan: total, per kategori, dan status tiap budget. */
export function monthlySummary(entries: PersonalEntry[], budgets: MonthlyBudget[], month: string): MonthlySummary {
  const inMonth = entriesInMonth(entries, month);
  const masuk = totalMasuk(inMonth);
  const keluar = totalKeluar(inMonth);
  const statuses = budgetStatus(budgets, inMonth);
  return {
    month,
    masuk,
    keluar,
    saldo: masuk - keluar,
    byCategory: spendByCategory(inMonth),
    budgets: statuses,
    overBudget: statuses.filter((s) => s.over).map((s) => s.category),
  };
}

/** Awal bulan (`YYYY-MM-01`) dari hari mana pun; dipakai untuk navigasi bulan. */
export function monthStartOf(day: string): string {
  return monthOf(day);
}

/** Gabungan dua sumber (lokal + Drive): id sama dimenangkan remote, urut hari terbaru dulu. */
export function mergeFinance(local: PersonalEntry[], remote: PersonalEntry[] | undefined): PersonalEntry[] {  if (!remote) return local;
  const byId = new Map(local.map((e) => [e.id, e]));
  for (const e of remote) byId.set(e.id, e);
  return [...byId.values()].sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
}

/** Gabungan budget dua sumber: kategori sama dimenangkan remote. */
export function mergeBudgets(local: MonthlyBudget[], remote: MonthlyBudget[] | undefined): MonthlyBudget[] {
  if (!remote) return local;
  const byCat = new Map(local.map((b) => [b.category, b]));
  for (const b of remote) byCat.set(b.category, b);
  return [...byCat.values()];
}

/** Gabungan kategori bebas dua sumber: id sama dimenangkan remote. */
export function mergeCats(local: CustomCategory[], remote: CustomCategory[] | undefined): CustomCategory[] {
  if (!remote) return local;
  const byId = new Map(local.map((c) => [c.id, c]));
  for (const c of remote) byId.set(c.id, c);
  return [...byId.values()];
}

export type DayTotal = { day: string; masuk: number; keluar: number; count: number };

/** Total per hari, hari terbaru dulu. */
export function totalsByDay(entries: PersonalEntry[]): DayTotal[] {
  const byDay = new Map<string, DayTotal>();
  for (const e of entries) {
    const t = byDay.get(e.day) ?? { day: e.day, masuk: 0, keluar: 0, count: 0 };
    if (e.kind === 'masuk') t.masuk += e.amount;
    else t.keluar += e.amount;
    t.count += 1;
    byDay.set(e.day, t);
  }
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

/** Cari di keterangan dan label kategori; query kosong = semua. */
export function searchEntries(entries: PersonalEntry[], query: string, customs: CustomCategory[] = []): PersonalEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) => e.note.toLowerCase().includes(q) || categoryLabel(e.category, customs).toLowerCase().includes(q),
  );
}

function csvCell(text: string): string {
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Laporan CSV sebulan: ringkasan di atas, rincian transaksi di bawah. */
export function financeReportCsv(entries: PersonalEntry[], summary: MonthlySummary, customs: CustomCategory[] = []): string {
  const lines = [
    `Laporan keuangan ${summary.month}`,
    `Pemasukan,${summary.masuk}`,
    `Pengeluaran,${summary.keluar}`,
    `Saldo,${summary.saldo}`,
    '',
    'tanggal,jenis,kategori,keterangan,nominal',
  ];
  const sorted = [...entries].sort((a, b) => (a.day < b.day ? -1 : 1));
  for (const e of sorted) {
    lines.push([e.day, e.kind, categoryLabel(e.category, customs), csvCell(e.note), String(e.amount)].join(','));
  }
  return lines.join('\n');
}
