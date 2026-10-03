import { describe, expect, it } from '@jest/globals';

import type { Plan } from '@/domain/plan';
import {
  addField,
  applyMerge,
  applyReplace,
  parseTemplateFields,
  removeField,
  takenFields,
  templateFieldId,
  toDraft,
  updateField,
  type TemplateField,
} from '@/domain/groupTemplate';

const field = (id: string, label: string): TemplateField => ({
  id,
  label,
  section: 'kebaikan',
  kind: 'check',
  target: 1,
  unit: '',
  cadence: 'harian',
});

const planOf = (...items: Partial<{ id: string; label: string; section: 'kebaikan'; kind: 'check'; target: number; unit: string; cadence: 'harian' }>[]): Plan => ({
  at: 0,
  items: items.map((i) => ({ id: 'x', label: 'x', section: 'kebaikan' as const, kind: 'check' as const, target: 1, unit: '', cadence: 'harian' as const, ...i })),
});

describe('templateFieldId', () => {
  it('slugs the label so the same amalan keeps one id across edits', () => {
    expect(templateFieldId('Dzikir Pagi', [])).toBe('g-dzikir-pagi');
  });

  it('numbers a second label that slugs the same', () => {
    expect(templateFieldId('Dzikir Pagi', ['g-dzikir-pagi'])).toBe('g-dzikir-pagi-2');
  });

  it('falls back to a usable id for a label with nothing sluggable in it', () => {
    expect(templateFieldId('!!!', [])).toBe('g-amal');
  });
});

describe('parseTemplateFields', () => {
  it('reads a stored payload', () => {
    expect(parseTemplateFields([field('g-a', 'A')])).toHaveLength(1);
  });

  it('drops rows the admin never wrote', () => {
    expect(parseTemplateFields([field('g-a', 'A'), { id: 1 }, null, { label: 'no section' }])).toHaveLength(1);
  });

  it('treats a missing column as an empty list', () => {
    expect(parseTemplateFields(null)).toEqual([]);
  });
});

describe('addField / updateField / removeField', () => {
  it('numbers the id against the fields already there', () => {
    const once = addField([], { label: 'Subuh', section: 'sholat', kind: 'check', target: 1, unit: '', cadence: 'harian' });
    const twice = addField(once, { label: 'Subuh', section: 'sholat', kind: 'check', target: 1, unit: '', cadence: 'harian' });
    expect(twice.map((f) => f.id)).toEqual(['g-subuh', 'g-subuh-2']);
  });

  it('keeps the id when the label is corrected, so a taken item stays matched', () => {
    const [edited] = updateField([field('g-subuh', 'Subuh')], 'g-subuh', { ...field('g-subuh', 'Sholat Subuh') });
    expect(edited.id).toBe('g-subuh');
    expect(edited.label).toBe('Sholat Subuh');
  });

  it('removes by id', () => {
    expect(removeField([field('g-a', 'A'), field('g-b', 'B')], 'g-a')).toHaveLength(1);
  });
});

describe('takenFields', () => {
  it('reports what the member already has on their list', () => {
    const fields = [field('g-a', 'A'), field('g-b', 'B')];
    expect(takenFields(fields, planOf({ id: 'g-b' }).items).map((f) => f.id)).toEqual(['g-b']);
  });
});

describe('applyReplace', () => {
  it("swaps the member's list for the group's", () => {
    const next = applyReplace(planOf({ id: 'mine' }), [field('g-a', 'A')], 7);
    expect(next.items.map((i) => i.id)).toEqual(['g-a']);
    expect(next.at).toBe(7);
  });

  it('carries the target and unit of a counted amalan', () => {
    const counted = { ...field('g-tilawah', 'Tilawah'), kind: 'count' as const, target: 5, unit: 'halaman', section: 'quran' as const };
    expect(applyReplace(planOf(), [counted], 1).items[0].target).toBe(5);
  });
});

describe('applyMerge', () => {
  it('adds only what the member lacks', () => {
    const next = applyMerge(planOf({ id: 'g-a' }, { id: 'mine' }), [field('g-a', 'A'), field('g-b', 'B')], 3);
    expect(next.items.map((i) => i.id)).toEqual(['g-a', 'mine', 'g-b']);
  });

  it('returns the same plan when there is nothing new', () => {
    const plan = planOf({ id: 'g-a' });
    expect(applyMerge(plan, [field('g-a', 'A')], 3)).toBe(plan);
  });
});

describe('toDraft', () => {
  it('leaves the member to set their own reminder', () => {
    expect(toDraft(field('g-a', 'A'))).not.toHaveProperty('reminder');
  });
});
