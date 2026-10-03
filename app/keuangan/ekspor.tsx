import { Alert } from 'react-native';

import { useMonth } from '@/components/keuangan/month';
import { ClayButton } from '@/components/ui/ClayButton';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { formatRupiah } from '@/domain/cash';
import { entriesInMonth, monthlySummary } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useLogs } from '@/providers/LogsProvider';
import { exportMonthCsv } from '@/services/financeReportService';
import { useMemo } from 'react';

export default function EksporScreen() {
  const { today } = useLogs();
  const { entries, budgets, cats, loaded } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const summary = useMemo(() => monthlySummary(entries, budgets, month), [entries, budgets, month]);
  const inMonth = useMemo(() => entriesInMonth(entries, month), [entries, month]);

  async function exportReport() {
    try {
      await exportMonthCsv(inMonth, summary, cats);
    } catch (e) {
      Alert.alert('Ekspor gagal', e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <StackScreen title="Ekspor">
      {nav}
      {loaded ? (
        <>
          <Txt variant="body">
            {inMonth.length} transaksi · masuk {formatRupiah(summary.masuk)} · keluar {formatRupiah(summary.keluar)}
          </Txt>
          <ClayButton label="Bagikan laporan (CSV)" onPress={exportReport} />
        </>
      ) : (
        <Txt variant="caption">Memuat…</Txt>
      )}
    </StackScreen>
  );
}
