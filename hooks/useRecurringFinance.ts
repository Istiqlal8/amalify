import { useCallback, useEffect } from 'react';

import { newCategoryId, type FinanceDraft } from '@/domain/personalFinance';
import { addMissing, postDue, ruleFromDraft, type RecurringRule } from '@/domain/recurringFinance';
import { useLogs } from '@/providers/LogsProvider';

type RecurringFinance = { rules: RecurringRule[]; addRule: (draft: FinanceDraft) => void; removeRule: (id: string) => void };

/** Monthly repeating transactions; whatever has come due is written into the finance log on sight. */
export function useRecurringFinance(): RecurringFinance {
  const { recurring: rules, setRecurring, setFinance, bury, today, loaded } = useLogs();

  useEffect(() => {
    if (!loaded) return;
    const due = postDue(rules, today);
    if (due.entries.length === 0) return;
    // Two screens may run this for the same rules; entries are added by id, so only once.
    setFinance((prev) => addMissing(prev, due.entries));
    setRecurring(due.rules);
  }, [loaded, rules, today, setFinance, setRecurring]);

  const addRule = useCallback(
    (draft: FinanceDraft) => setRecurring((prev) => [...prev, ruleFromDraft(draft, newCategoryId(Date.now()))]),
    [setRecurring],
  );
  const removeRule = useCallback((id: string) => bury('rule', id), [bury]);

  return { rules, addRule, removeRule };
}
