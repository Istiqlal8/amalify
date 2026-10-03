import { CategoryChart } from '@/components/keuangan/CategoryChart';
import { DailyChart } from '@/components/keuangan/DailyChart';
import { useMonth } from '@/components/keuangan/month';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { categoryLabel, entriesInMonth, monthlySummary, totalsByDay } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useLogs } from '@/providers/LogsProvider';
import { useMemo } from 'react';

export default function GrafikScreen() {
  const { today } = useLogs();
  const { entries, budgets, cats, loaded } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const summary = useMemo(() => monthlySummary(entries, budgets, month), [entries, budgets, month]);
  const inMonth = useMemo(() => entriesInMonth(entries, month), [entries, month]);
  const catRows = useMemo(
    () => Object.entries(summary.byCategory).map(([cat, value]) => ({ label: categoryLabel(cat, cats), value: value ?? 0 })),
    [summary, cats],
  );

  return (
    <StackScreen title="Grafik">
      {nav}
      {loaded ? (
        <>
          <CategoryChart rows={catRows} />
          <DailyChart days={totalsByDay(inMonth)} />
        </>
      ) : (
        <Txt variant="caption">Memuat…</Txt>
      )}
    </StackScreen>
  );
}
