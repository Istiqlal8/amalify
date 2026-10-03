import { FinanceSummary } from '@/components/keuangan/FinanceSummary';
import { DailyBreakdown } from '@/components/keuangan/DailyBreakdown';
import { useMonth } from '@/components/keuangan/month';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { entriesInMonth, monthlySummary, totalsByDay } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useLogs } from '@/providers/LogsProvider';
import { useMemo } from 'react';

export default function RingkasanScreen() {
  const { today } = useLogs();
  const { entries, budgets, loaded } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const summary = useMemo(() => monthlySummary(entries, budgets, month), [entries, budgets, month]);
  const days = useMemo(() => totalsByDay(entriesInMonth(entries, month)), [entries, month]);

  return (
    <StackScreen title="Ringkasan">
      {nav}
      {loaded ? (
        <>
          <FinanceSummary summary={summary} />
          <DailyBreakdown days={days} />
        </>
      ) : (
        <Txt variant="caption">Memuat…</Txt>
      )}
    </StackScreen>
  );
}
