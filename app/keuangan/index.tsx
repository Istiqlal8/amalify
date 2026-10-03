import { useMonth } from '@/components/keuangan/month';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { formatRupiah } from '@/domain/cash';
import { entriesInMonth, monthlySummary } from '@/domain/personalFinance';
import { usePersonalFinance } from '@/hooks/usePersonalFinance';
import { useLogs } from '@/providers/LogsProvider';

/** Hub keuangan pribadi: saldo + pintu ke tiap menu. */
export default function KeuanganHub() {
  const { today } = useLogs();
  const { entries, budgets, loaded } = usePersonalFinance();
  const { month, nav } = useMonth(today.slice(0, 7));
  const summary = monthlySummary(entries, budgets, month);
  const count = entriesInMonth(entries, month).length;

  return (
    <StackScreen title="Keuangan pribadi">
      <Txt variant="caption">Tersimpan di Drive masing-masing, ikut sync amal.</Txt>
      {nav}
      {loaded && (
        <Txt variant="title">
          {formatRupiah(summary.saldo)}
        </Txt>
      )}
      <SettingsRow number={1} title="Ringkasan" summary={loaded ? `Masuk ${formatRupiah(summary.masuk)} · keluar ${formatRupiah(summary.keluar)}` : 'Memuat…'} href="/keuangan/ringkasan" />
      <SettingsRow number={2} title="Transaksi" summary={loaded ? `${count} transaksi bulan ini` : 'Memuat…'} href="/keuangan/transaksi" />
      <SettingsRow number={3} title="Grafik" summary="Per kategori dan harian" href="/keuangan/grafik" />
      <SettingsRow number={4} title="Budget" summary={loaded && summary.overBudget.length > 0 ? `${summary.overBudget.length} kategori over` : 'Batas bulanan per kategori'} href="/keuangan/budget" />
      <SettingsRow number={5} title="Ekspor" summary="Bagikan laporan CSV" href="/keuangan/ekspor" />
    </StackScreen>
  );
}
