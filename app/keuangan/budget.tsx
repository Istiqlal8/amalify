import { BudgetCard } from '@/components/keuangan/BudgetCard';
import { useMonth } from '@/components/keuangan/month';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { monthlySummary } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useLogs } from '@/providers/LogsProvider';
import { useMemo } from 'react';

export default function BudgetScreen() {
  const { today } = useLogs();
  const { entries, budgets, cats, loaded, saveBudget, removeCategory } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const summary = useMemo(() => monthlySummary(entries, budgets, month), [entries, budgets, month]);

  return (
    <StackScreen title="Budget">
      {nav}
      {loaded ? <BudgetCard budgets={summary.budgets} cats={cats} onSave={saveBudget} onRemoveCategory={removeCategory} /> : <Txt variant="caption">Memuat…</Txt>}
    </StackScreen>
  );
}
