import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { financeReportCsv, type CustomCategory, type MonthlySummary, type PersonalEntry } from '@/domain/personalFinance';

/** Tulis laporan CSV bulan ini ke cache lalu buka lembar bagikan. */
export async function exportMonthCsv(entries: PersonalEntry[], summary: MonthlySummary, customs: CustomCategory[] = []): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Berbagi tidak tersedia di perangkat ini.');
  const file = new File(Paths.cache, `keuangan-${summary.month}.csv`);
  if (file.exists) file.delete();
  file.create();
  file.write(financeReportCsv(entries, summary, customs));
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: `Laporan keuangan ${summary.month}` });
}
