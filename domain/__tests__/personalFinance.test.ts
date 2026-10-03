import { expect, test } from '@jest/globals';

import {
  budgetStatus,
  categoryLabel,
  entriesInMonth,
  financeReportCsv,
  mergeBudgets,
  mergeCats,
  mergeFinance,
  monthlySummary,
  searchEntries,
  totalsByDay,
  validateCategoryLabel,
  saldo,
  spendByCategory,
  totalKeluar,
  totalMasuk,
  validateDraft,
  type FinanceDraft,
  type MonthlyBudget,
  type PersonalEntry,
} from '../personalFinance';

const entry = (over: Partial<PersonalEntry>): PersonalEntry => ({
  id: 'f',
  kind: 'keluar',
  amount: 10000,
  category: 'makan',
  note: 'x',
  day: '2026-09-23',
  ...over,
});

const draft = (over: Partial<FinanceDraft>): FinanceDraft => ({
  kind: 'keluar',
  amount: 10000,
  category: 'makan',
  note: 'Nasi',
  day: '2026-09-23',
  ...over,
});

test('test_totals_kindSeparated_sums', () => {
  const list = [entry({ kind: 'masuk', amount: 50000, category: 'gaji' }), entry({ kind: 'keluar', amount: 20000 })];
  expect(totalMasuk(list)).toBe(50000);
  expect(totalKeluar(list)).toBe(20000);
  expect(saldo(list)).toBe(30000);
});

test('test_entriesInMonth_otherMonthIgnored', () => {
  const list = [entry({ day: '2026-09-01' }), entry({ day: '2026-08-31' })];
  expect(entriesInMonth(list, '2026-09')).toHaveLength(1);
});

test('test_spendByCategory_incomeSkipped', () => {
  const list = [entry({ kind: 'masuk', amount: 99999, category: 'gaji' }), entry({ kind: 'keluar', amount: 15000, category: 'makan' })];
  expect(spendByCategory(list)).toEqual({ makan: 15000 });
});

test('test_budgetStatus_overFlag_progress', () => {
  const budgets: MonthlyBudget[] = [{ category: 'makan', limit: 10000 }];
  const [s] = budgetStatus(budgets, [entry({ amount: 15000, category: 'makan' })]);
  expect(s.spent).toBe(15000);
  expect(s.remaining).toBe(-5000);
  expect(s.over).toBe(true);
  expect(s.progress).toBeCloseTo(1.5);
});

test('test_monthlySummary_overBudgetListed', () => {
  const budgets: MonthlyBudget[] = [
    { category: 'makan', limit: 10000 },
    { category: 'transport', limit: 50000 },
  ];
  const list = [
    entry({ kind: 'masuk', amount: 200000, category: 'gaji', day: '2026-09-02' }),
    entry({ kind: 'keluar', amount: 15000, category: 'makan', day: '2026-09-03' }),
    entry({ kind: 'keluar', amount: 20000, category: 'transport', day: '2026-08-03' }),
  ];
  const s = monthlySummary(list, budgets, '2026-09');
  expect(s.masuk).toBe(200000);
  expect(s.keluar).toBe(15000);
  expect(s.saldo).toBe(185000);
  expect(s.overBudget).toEqual(['makan']);
});

test('test_validateDraft_zeroAmount_error', () => {
  expect(validateDraft(draft({ amount: 0 }))).not.toBeNull();
});

test('test_validateDraft_emptyNote_error', () => {
  expect(validateDraft(draft({ note: '  ' }))).not.toBeNull();
});

test('test_validateDraft_valid_null', () => {
  expect(validateDraft(draft({}))).toBeNull();
});

test('test_mergeFinance_remoteWins_unionSorted', () => {
  const local = [entry({ id: 'a', day: '2026-09-01' })];
  const remote = [entry({ id: 'a', day: '2026-09-02', note: 'r' }), entry({ id: 'b', day: '2026-09-03' })];
  const merged = mergeFinance(local, remote);
  expect(merged.map((e) => e.id)).toEqual(['b', 'a']);
  expect(merged.find((e) => e.id === 'a')?.note).toBe('r');
});

test('test_categoryLabel_customAndUnknown', () => {
  const customs = [{ id: 'c1', label: 'Jajan', kind: 'keluar' as const }];
  expect(categoryLabel('makan')).toBe('Makan');
  expect(categoryLabel('c1', customs)).toBe('Jajan');
  expect(categoryLabel('c9', customs)).toBe('c9');
});

test('test_validateCategoryLabel_duplicateAndLong', () => {
  const existing = [{ label: 'Jajan' }];
  expect(validateCategoryLabel('  ', existing)).not.toBeNull();
  expect(validateCategoryLabel('jajan', existing)).not.toBeNull();
  expect(validateCategoryLabel('x'.repeat(21), existing)).not.toBeNull();
  expect(validateCategoryLabel('Parkir', existing)).toBeNull();
});

test('test_mergeCats_remoteWins', () => {
  const merged = mergeCats(
    [{ id: 'c1', label: 'A', kind: 'keluar' as const }],
    [{ id: 'c1', label: 'B', kind: 'keluar' as const }],
  );
  expect(merged).toEqual([{ id: 'c1', label: 'B', kind: 'keluar' }]);
});
test('test_mergeBudgets_remoteWinsPerCategory', () => {
  const merged = mergeBudgets(
    [{ category: 'makan', limit: 100 }],
    [{ category: 'makan', limit: 200 }],
  );
  expect(merged).toEqual([{ category: 'makan', limit: 200 }]);
});

test('test_totalsByDay_groupsAndSortsDesc', () => {
  const list = [
    entry({ day: '2026-09-01', kind: 'keluar', amount: 10000 }),
    entry({ day: '2026-09-02', kind: 'masuk', amount: 50000, category: 'gaji' }),
    entry({ day: '2026-09-01', kind: 'keluar', amount: 5000, category: 'transport' }),
  ];
  const days = totalsByDay(list);
  expect(days).toHaveLength(2);
  expect(days[0].day).toBe('2026-09-02');
  expect(days[1]).toEqual({ day: '2026-09-01', masuk: 0, keluar: 15000, count: 2 });
});

test('test_searchEntries_matchesNoteAndCategory', () => {
  const list = [entry({ note: 'Nasi padang' }), entry({ note: 'Bensin', category: 'transport' })];
  expect(searchEntries(list, 'nasi')).toHaveLength(1);
  expect(searchEntries(list, 'transport')).toHaveLength(1);
  expect(searchEntries(list, '  ')).toHaveLength(2);
});

test('test_financeReportCsv_summaryAndRows', () => {
  const list = [entry({ day: '2026-09-01', kind: 'keluar', amount: 10000, note: 'Nasi' })];
  const summary = monthlySummary(list, [], '2026-09');
  const csv = financeReportCsv(list, summary);
  expect(csv).toContain('Laporan keuangan 2026-09');
  expect(csv).toContain('tanggal,jenis,kategori,keterangan,nominal');
  expect(csv).toContain('2026-09-01,keluar,Makan,Nasi,10000');
});
