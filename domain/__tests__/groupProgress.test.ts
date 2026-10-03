import { describe, expect, it } from '@jest/globals';

import {
  bucketOf,
  bucketsFor,
  countsFor,
  finishedBy,
  hasLabel,
  importItems,
  parseLogs,
  recap,
  upsertLog,
  type GroupLog,
} from '@/domain/groupProgress';
import { MAX_TEMPLATE_FIELDS, type TemplateField } from '@/domain/groupTemplate';
import type { PlanItem } from '@/domain/plan';

const DAY = '2026-10-02';

const subuh: TemplateField = { id: 'g-subuh', label: 'Subuh', section: 'sholat', kind: 'check', target: 1, unit: '', cadence: 'harian' };
const tilawah: TemplateField = { id: 'g-tilawah', label: 'Tilawah', section: 'quran', kind: 'count', target: 5, unit: 'halaman', cadence: 'harian' };
const infaq: TemplateField = { id: 'g-infaq', label: 'Infaq', section: 'kebaikan', kind: 'check', target: 1, unit: '', cadence: 'mingguan' };
const FIELDS = [subuh, tilawah, infaq];

const log = (userId: string, field: TemplateField, count: number, day = DAY): GroupLog => ({
  userId,
  bucket: bucketOf(field, day),
  fieldId: field.id,
  count,
});

describe('buckets', () => {
  it('puts a daily field on the day and a weekly one on the week', () => {
    expect(bucketOf(subuh, DAY)).toBe('harian:2026-10-02');
    expect(bucketOf(infaq, DAY)).toMatch(/^mingguan:2026-W\d\d$/);
  });

  it('lists each bucket once', () => {
    expect(bucketsFor(FIELDS, DAY)).toHaveLength(2);
  });
});

describe('recap', () => {
  const logs = [log('a', subuh, 1), log('a', tilawah, 2), log('b', subuh, 1), log('b', tilawah, 9), log('b', infaq, 1)];

  it('averages partial progress and counts only finished items as done', () => {
    expect(recap(logs, 'a', FIELDS, DAY)).toMatchObject({ done: 1, total: 3, percent: 47 });
  });

  it('caps an overshoot at the target', () => {
    expect(recap(logs, 'b', FIELDS, DAY)).toMatchObject({ done: 3, percent: 100 });
  });

  it('ignores ticks from another day', () => {
    expect(countsFor([log('a', subuh, 1, '2026-10-01')], 'a', [subuh], DAY)).toEqual({});
  });

  it('keeps a weekly tick for every day of that week', () => {
    expect(countsFor([log('a', infaq, 1, '2026-09-28')], 'a', [infaq], DAY)).toEqual({ 'g-infaq': 1 });
  });

  it('counts how many members finished a field', () => {
    expect(finishedBy(logs, ['a', 'b', 'c'], tilawah, DAY)).toBe(1);
  });
});

describe('upsertLog', () => {
  it('replaces the same row and appends a new one', () => {
    const one = upsertLog([], log('a', subuh, 1));
    expect(upsertLog(one, log('a', subuh, 0))).toEqual([log('a', subuh, 0)]);
    expect(upsertLog(one, log('b', subuh, 1))).toHaveLength(2);
  });
});

describe('importItems', () => {
  const item = (id: string, label: string, extra: Partial<PlanItem> = {}): PlanItem => ({
    id,
    label,
    section: 'kebaikan',
    kind: 'check',
    target: 1,
    unit: '',
    reminder: '05:00',
    ...extra,
  });

  it('copies a personal amalan without its reminder and with a group id', () => {
    const [f] = importItems([], [item('i1', 'Dzikir Pagi', { kind: 'count', target: 33, unit: 'kali', cadence: 'harian' })]);
    expect(f).toEqual({ id: 'g-dzikir-pagi', label: 'Dzikir Pagi', section: 'kebaikan', kind: 'count', target: 33, unit: 'kali', cadence: 'harian' });
  });

  it('treats an item without a cadence as daily', () => {
    expect(importItems([], [item('i1', 'Sedekah')])[0].cadence).toBe('harian');
  });

  it('skips labels already on the list, ignoring case', () => {
    expect(importItems([subuh], [item('i1', ' subuh ')])).toEqual([subuh]);
    expect(hasLabel([subuh], 'SUBUH')).toBe(true);
  });

  it('stops at the list cap', () => {
    const many = Array.from({ length: MAX_TEMPLATE_FIELDS + 5 }, (_, i) => item(`i${i}`, `Amal ${i}`));
    expect(importItems([], many)).toHaveLength(MAX_TEMPLATE_FIELDS);
  });
});

describe('parseLogs', () => {
  it('maps server rows and drops malformed ones', () => {
    expect(parseLogs([{ user_id: 'a', bucket: 'harian:2026-10-02', field_id: 'g-subuh', count: 1 }, { user_id: 'a' }, null])).toEqual([
      { userId: 'a', bucket: 'harian:2026-10-02', fieldId: 'g-subuh', count: 1 },
    ]);
    expect(parseLogs(null)).toEqual([]);
  });
});
