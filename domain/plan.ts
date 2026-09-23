import type { SectionId } from './amalan';

export type PlanItem = {
  id: string;
  label: string;
  section: SectionId;
  kind: 'check' | 'count';
  /** 1 for a checklist item. */
  target: number;
  /** Empty for a checklist item, e.g. "halaman" or "kali" for a counted one. */
  unit: string;
  /** Daily reminder time, `HH:MM`; absent when the item has no reminder. */
  reminder?: string;
};

export type Plan = { items: PlanItem[]; at: number };

export type ItemDraft = Omit<PlanItem, 'id'>;

const check = (id: string, label: string, section: SectionId): PlanItem => ({
  id, label, section, kind: 'check', target: 1, unit: '',
});

const count = (id: string, label: string, section: SectionId, target: number, unit: string): PlanItem => ({
  id, label, section, kind: 'count', target, unit,
});

/** Seed for a fresh install; `at: 0` lets any edited plan (local or Drive) win over it. */
export const DEFAULT_PLAN: Plan = {
  at: 0,
  items: [
    check('subuh', 'Subuh', 'sholat'),
    check('dzuhur', 'Dzuhur', 'sholat'),
    check('ashar', 'Ashar', 'sholat'),
    check('maghrib', 'Maghrib', 'sholat'),
    check('isya', 'Isya', 'sholat'),
    check('rawatib', 'Rawatib', 'sholat'),
    check('dhuha', 'Dhuha', 'sholat'),
    check('tahajud', 'Tahajud', 'sholat'),
    count('tilawah', 'Tilawah', 'quran', 5, 'halaman'),
    check('dzikir-pagi', 'Dzikir pagi', 'quran'),
    check('dzikir-petang', 'Dzikir petang', 'quran'),
    count('istighfar', 'Istighfar', 'quran', 100, 'kali'),
    check('sedekah', 'Sedekah', 'kebaikan'),
    check('kajian', 'Kajian / baca buku', 'kebaikan'),
    check('birrul-walidain', 'Bakti orang tua', 'kebaikan'),
  ],
};

export function normalizeDraft(draft: ItemDraft): ItemDraft {
  const counted = draft.kind === 'count';
  return {
    ...draft,
    label: draft.label.trim(),
    target: counted ? Math.max(1, Math.round(draft.target)) : 1,
    unit: counted ? draft.unit.trim() : '',
  };
}

export function addItem(plan: Plan, draft: ItemDraft, id: string, now: number): Plan {
  return { items: [...plan.items, { ...normalizeDraft(draft), id }], at: now };
}

export function updateItem(plan: Plan, id: string, draft: ItemDraft, now: number): Plan {
  const items = plan.items.map((it) => (it.id === id ? { ...normalizeDraft(draft), id } : it));
  return { items, at: now };
}

export function removeItem(plan: Plan, id: string, now: number): Plan {
  return { items: plan.items.filter((it) => it.id !== id), at: now };
}

export function newItemId(now: number, random: number = Math.random()): string {
  return `i${now.toString(36)}${Math.floor(random * 1e6).toString(36)}`;
}

export function newerPlan(a: Plan, b: Plan | undefined): Plan {
  return b && b.at > a.at ? b : a;
}
