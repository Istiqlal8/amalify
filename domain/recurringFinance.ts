import type { FinanceDraft, FinanceKind, PersonalEntry } from './personalFinance';

/** Transaksi yang terulang tiap bulan di tanggal yang sama (kos, listrik, cicilan). */
export type RecurringRule = {
  id: string;
  kind: FinanceKind;
  amount: number;
  category: string;
  note: string;
  /** 1..31; bulan yang lebih pendek memakai hari terakhirnya. */
  dayOfMonth: number;
  /** `YYYY-MM` terakhir yang sudah dicatat; bulan sesudahnya masih menunggu. */
  doneThrough: string;
};

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Tanggal jatuh tempo di `month`: 31 di bulan Februari menjadi 28 atau 29. */
export function dueDay(month: string, dayOfMonth: number): string {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${month}-${String(Math.min(dayOfMonth, last)).padStart(2, '0')}`;
}

/** Aturan baru dari form transaksi: tanggalnya menjadi kejadian pertama. */
export function ruleFromDraft(draft: FinanceDraft, id: string): RecurringRule {
  const { day, ...rest } = draft;
  return { ...rest, id, dayOfMonth: Number(day.slice(8)), doneThrough: shiftMonth(day.slice(0, 7), -1) };
}

function postRule(rule: RecurringRule, today: string): { entries: PersonalEntry[]; rule: RecurringRule } {
  const entries: PersonalEntry[] = [];
  let done = rule.doneThrough;
  for (let month = shiftMonth(done, 1); dueDay(month, rule.dayOfMonth) <= today; month = shiftMonth(month, 1)) {
    const { id, dayOfMonth, doneThrough: _through, ...fields } = rule;
    // Id dari aturan + bulan: dua HP yang mencatat bulan yang sama menghasilkan satu transaksi, bukan dua.
    entries.push({ ...fields, id: `r${id}-${month}`, day: dueDay(month, dayOfMonth) });
    done = month;
  }
  return { entries, rule: done === rule.doneThrough ? rule : { ...rule, doneThrough: done } };
}

/** Transaksi yang jatuh tempo sampai `today`, dan aturan yang sudah maju melewatinya. */
export function postDue(rules: RecurringRule[], today: string): { entries: PersonalEntry[]; rules: RecurringRule[] } {
  const posted = rules.map((r) => postRule(r, today));
  return { entries: posted.flatMap((p) => p.entries), rules: posted.map((p) => p.rule) };
}

/** Menambah hanya transaksi yang id-nya belum ada. */
export function addMissing(entries: PersonalEntry[], fresh: PersonalEntry[]): PersonalEntry[] {
  const known = new Set(entries.map((e) => e.id));
  const added = fresh.filter((e) => !known.has(e.id));
  return added.length === 0 ? entries : [...added, ...entries];
}

/** Gabungan lokal + Drive: id sama dimenangkan yang sudah mencatat lebih jauh. */
export function mergeRules(local: RecurringRule[], remote: RecurringRule[] | undefined): RecurringRule[] {
  if (!remote) return local;
  const byId = new Map(local.map((r) => [r.id, r]));
  for (const r of remote) {
    const mine = byId.get(r.id);
    if (!mine || r.doneThrough > mine.doneThrough) byId.set(r.id, r);
  }
  return [...byId.values()];
}
