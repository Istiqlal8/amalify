import { useMemo } from 'react';

import { newCategoryId, validateCategoryLabel, type FinanceDraft, type FinanceKind } from '@/domain/personalFinance';
import { useLogs } from '@/providers/LogsProvider';

/** Keuangan pribadi dari Drive masing-masing via LogsProvider. Offline-first, sync ikut amal. */
export function usePersonalFinance() {
  const { finance: entries, setFinance, budgets, setBudgets, financeCats: cats, setFinanceCats, bury, loaded } = useLogs();

  return useMemo(
    () => ({
      entries,
      budgets,
      cats,
      loaded,
      addEntry: (draft: FinanceDraft) =>
        setFinance((prev) => [{ ...draft, id: `f${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}` }, ...prev]),
      editEntry: (id: string, draft: FinanceDraft) =>
        setFinance((prev) => prev.map((e) => (e.id === id ? { ...e, ...draft } : e))),
      deleteEntry: (id: string) => bury('finance', id),
      saveBudget: (category: string, limit: number | null) =>
        setBudgets((prev) =>
          limit == null
            ? prev.filter((b) => b.category !== category)
            : [...prev.filter((b) => b.category !== category), { category, limit }],
        ),
      /** Tambah kategori bebas; kembalikan id baru atau null saat nama tidak valid. */
      addCategory: (kind: FinanceKind, label: string): string | null => {
        if (validateCategoryLabel(label, cats) !== null) return null;
        const id = newCategoryId(Date.now());
        setFinanceCats((prev) => [...prev, { id, label: label.trim(), kind }]);
        return id;
      },
      removeCategory: (id: string) => {
        bury('cat', id);
        setBudgets((prev) => prev.filter((b) => b.category !== id));
      },
    }),
    [entries, budgets, cats, loaded, setFinance, setBudgets, setFinanceCats, bury],
  );
}
