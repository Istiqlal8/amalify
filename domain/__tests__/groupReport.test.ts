import { expect, test } from '@jest/globals';

import { entriesFor, entryText, reportDate, reportShareText, sortReports, type GroupReport, type ReportField } from '../groupReport';

const fields: ReportField[] = [
  { id: 'a', label: 'Tilawah', kind: 'number', unit: 'halaman' },
  { id: 'b', label: 'Progres kelas', kind: 'text', unit: '' },
];

test('test_entriesFor_newFormat_keepsAnswersWithSameLabel', () => {
  const previous = [{ label: 'Tilawah', kind: 'number' as const, unit: 'halaman', value: '12' }];
  expect(entriesFor(fields, previous).map((e) => e.value)).toEqual(['12', '']);
});

test('test_entryText_numberWithUnit_appendsUnit', () => {
  expect(entryText({ label: 'Tilawah', kind: 'number', unit: 'halaman', value: '12' })).toBe('12 halaman');
});

test('test_reportDate_saturday_namesTheDay', () => {
  expect(reportDate('2026-09-26')).toBe('Sabtu, 26 Sep 2026');
});

test('test_sortReports_newestMeetingFirst', () => {
  const r = (id: string, day: string, time: string): GroupReport => ({ id, day, time, location: '', entries: [], createdBy: null });
  expect(sortReports([r('a', '2026-09-19', '08:00'), r('b', '2026-09-26', '07:00')]).map((x) => x.id)).toEqual(['b', 'a']);
});

test('test_reportShareText_skipsEmptyEntries', () => {
  const text = reportShareText(
    { day: '2026-09-26', time: '08:00', location: 'Masjid', entries: [
      { label: 'Tilawah', kind: 'number', unit: 'halaman', value: '12' },
      { label: 'Catatan', kind: 'long', unit: '', value: '' },
    ] },
    'Halaqoh',
  );
  expect(text).toBe('*Laporan pekanan Halaqoh*\nSabtu, 26 Sep 2026 · 08:00\nLokasi: Masjid\n\nTilawah: 12 halaman');
});

test('test_entriesFor_removedFieldWithAnswer_isKept', () => {
  const previous = [{ label: 'Hafalan', kind: 'text' as const, unit: '', value: 'An-Naba 1-10' }];
  expect(entriesFor(fields, previous).map((e) => e.label)).toEqual(['Tilawah', 'Progres kelas', 'Hafalan']);
});
