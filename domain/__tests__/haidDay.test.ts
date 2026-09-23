import { expect, test } from '@jest/globals';

import type { HaidLog } from '../haid';
import { customSymptoms, noteOf, setDayNote, toggleSymptom } from '../haidDay';

const base: HaidLog = { periods: [], at: 1 };

test('test_setDayNote_storesNote', () => {
  const log = setDayNote(base, '2026-09-23', { flow: 'sedang', symptoms: [] }, 5);
  expect(noteOf(log, '2026-09-23').flow).toBe('sedang');
});

test('test_setDayNote_emptyNote_removesDay', () => {
  const log = setDayNote({ ...base, days: { '2026-09-23': { pain: 2, symptoms: [] } } }, '2026-09-23', { symptoms: [] }, 5);
  expect(log.days).toEqual({});
});

test('test_toggleSymptom_twice_removesIt', () => {
  expect(toggleSymptom(toggleSymptom({ symptoms: [] }, 'Kram'), 'Kram').symptoms).toEqual([]);
});

test('test_customSymptoms_excludesBuiltIn', () => {
  const log: HaidLog = { ...base, days: { a: { symptoms: ['Kram', 'Ngidam'] }, b: { symptoms: ['Ngidam'] } } };
  expect(customSymptoms(log)).toEqual(['Ngidam']);
});
