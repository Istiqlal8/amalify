import { describe, expect, it } from '@jest/globals';

import { applyMerge, applyReplace, takenFields, type TemplateField } from '@/domain/groupTemplate';
import { DEFAULT_PLAN, type Plan } from '@/domain/plan';

const field = (id: string, label: string): TemplateField => ({
  id,
  label,
  section: 'kebaikan',
  kind: 'check',
  target: 1,
  unit: '',
  cadence: 'harian',
});

/** An admin's list, as it arrives from `group_templates`: Indonesian labels across all sections. */
const ADMIN_LIST: TemplateField[] = [
  { id: 'g-subuh', label: 'Subuh berjamaah', section: 'sholat', kind: 'check', target: 1, unit: '', cadence: 'harian' },
  { id: 'g-tilawah', label: 'Tilawah', section: 'quran', kind: 'count', target: 5, unit: 'halaman', cadence: 'harian' },
  { id: 'g-infaq', label: 'Infaq Jumat', section: 'kebaikan', kind: 'count', target: 10000, unit: 'rupiah', cadence: 'mingguan' },
];

const planWith = (...ids: string[]): Plan => ({
  at: 1,
  items: ids.map((id) => ({ id, label: id, section: 'kebaikan' as const, kind: 'check' as const, target: 1, unit: '', cadence: 'harian' as const })),
});

/**
 * The end-to-end shape of the feature: an admin saves a list, and a member who has never seen it
 * ends up with the same items — counted ones keeping their target, and each item keeping the id
 * the server stored so progress recorded against it survives an edit.
 */
describe('an admin list reaching a member', () => {
  it('replaces a default plan with the group list, in order', () => {
    const next = applyReplace(DEFAULT_PLAN, ADMIN_LIST, 42);
    expect(next.items.map((i) => i.id)).toEqual(['g-subuh', 'g-tilawah', 'g-infaq']);
    expect(next.at).toBe(42);
  });

  it('carries a counted amalan through with its target and unit', () => {
    const [tilawah] = applyReplace(DEFAULT_PLAN, ADMIN_LIST, 1).items.filter((i) => i.id === 'g-tilawah');
    expect(tilawah).toMatchObject({ kind: 'count', target: 5, unit: 'halaman', section: 'quran' });
  });

  it('carries a longer cadence through, so a weekly item stays weekly', () => {
    const [infaq] = applyReplace(DEFAULT_PLAN, ADMIN_LIST, 1).items.filter((i) => i.id === 'g-infaq');
    expect(infaq.cadence).toBe('mingguan');
  });

  it('leaves the member the ids the server stored, so their ticks stay attached', () => {
    const items = applyReplace(DEFAULT_PLAN, ADMIN_LIST, 1).items;
    expect(items.every((i) => ADMIN_LIST.some((f) => f.id === i.id))).toBe(true);
  });

  it('merges onto a personal list without dropping anything the member wrote', () => {
    const mine = planWith('my-own-amal', 'g-subuh');
    const next = applyMerge(mine, ADMIN_LIST, 7);
    expect(next.items.map((i) => i.id)).toEqual(['my-own-amal', 'g-subuh', 'g-tilawah', 'g-infaq']);
  });

  it('adds nothing twice when the member takes the list a second time', () => {
    const once = applyReplace(DEFAULT_PLAN, ADMIN_LIST, 1);
    expect(applyMerge(once, ADMIN_LIST, 2)).toBe(once);
  });

  it('knows which of the group items the member already has', () => {
    expect(takenFields(ADMIN_LIST, planWith('g-infaq').items).map((f) => f.id)).toEqual(['g-infaq']);
  });

  it('keeps working after the admin renames an item, because the id is not the label', () => {
    const renamed = ADMIN_LIST.map((f) => (f.id === 'g-tilawah' ? { ...f, label: 'Tilawah Quran' } : f));
    const mine = applyReplace(DEFAULT_PLAN, ADMIN_LIST, 1);
    expect(takenFields(renamed, mine.items).map((f) => f.id)).toEqual(['g-subuh', 'g-tilawah', 'g-infaq']);
  });
});
