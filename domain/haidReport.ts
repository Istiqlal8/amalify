import { cycleStats, daysBetween, formatDay, sortedPeriods } from './cycle';
import type { HaidLog } from './haid';
import { healthFlags, pmsSymptoms, recentCycles, regularity } from './haidAnalysis';
import { qadhaPuasa } from './ramadan';

const esc = (s: string): string => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

const list = (items: string[]): string => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '<p>–</p>');

/** A one-page cycle summary to show a doctor or midwife. */
export function haidReportHtml(log: HaidLog, today: string, natural: boolean): string {
  const stats = cycleStats(log);
  const reg = regularity(log);
  const rows = sortedPeriods(log)
    .slice(-12)
    .map((p) => {
      const length = p.end ? `${daysBetween(p.start, p.end) + 1} hari` : 'berjalan';
      return `<tr><td>${formatDay(p.start)} ${p.start.slice(0, 4)}</td><td>${length}</td></tr>`;
    })
    .join('');
  const qadha = qadhaPuasa(log, today).map((q) => `${q.year} H: sisa ${q.left} dari ${q.owed} hari`);
  return `<html><head><meta charset="utf-8"><style>
body{font-family:sans-serif;padding:24px;color:#222}h1{font-size:20px}h2{font-size:15px;margin-top:20px}
table{border-collapse:collapse}td{border:1px solid #ccc;padding:4px 10px}
</style></head><body>
<h1>Ringkasan siklus haid</h1><p>Dibuat ${formatDay(today)} ${today.slice(0, 4)} dengan Amalify.</p>
<h2>Ringkasan</h2>${list([
    `Rata-rata siklus: ${stats ? `${stats.avgCycle} hari` : '–'}`,
    `Rata-rata lama haid: ${stats?.avgLength ? `${stats.avgLength} hari` : '–'}`,
    `Siklus terakhir: ${recentCycles(log).join(', ') || '–'} hari`,
    `Keteraturan: ${reg ? `${reg.regular ? 'teratur' : 'tidak teratur'} (selisih ${reg.spread} hari)` : '–'}`,
  ])}
<h2>Perlu diperhatikan</h2>${list(healthFlags(log, today, natural))}
<h2>Gejala sebelum haid</h2>${list(pmsSymptoms(log, 5).map((s) => `${s.symptom} (${s.cycles} siklus)`))}
<h2>Riwayat haid</h2><table><tr><td><b>Mulai</b></td><td><b>Lama</b></td></tr>${rows}</table>
<h2>Utang puasa Ramadan</h2>${list(qadha)}
</body></html>`;
}
