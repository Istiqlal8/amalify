// Tajwid rules as tagged by quran.com (`<tajweed class=…>`), grouped into the families a reader
// learns first. Colours follow the common colour-coded mushaf convention.

export type TajweedRule = 'mad' | 'ghunnah' | 'ikhfa' | 'idgham' | 'iqlab' | 'qalqalah' | 'silent';

export type Segment = { text: string; rule: TajweedRule | null };

const CLASS_TO_RULE: Record<string, TajweedRule> = {
  madda_normal: 'mad',
  madda_permissible: 'mad',
  madda_obligatory: 'mad',
  madda_necessary: 'mad',
  ghunnah: 'ghunnah',
  ikhafa: 'ikhfa',
  ikhafa_shafawi: 'ikhfa',
  idgham_ghunnah: 'idgham',
  idgham_wo_ghunnah: 'idgham',
  idgham_shafawi: 'idgham',
  idgham_mutajanisayn: 'idgham',
  idgham_mutaqaribayn: 'idgham',
  iqlab: 'iqlab',
  qalaqah: 'qalqalah',
  ham_wasl: 'silent',
  laam_shamsiyah: 'silent',
  slnt: 'silent',
};

export const TAJWEED_RULES: { rule: TajweedRule; label: string; color: string }[] = [
  { rule: 'mad', label: 'Mad', color: '#D0342C' },
  { rule: 'ghunnah', label: 'Ghunnah', color: '#E8871E' },
  { rule: 'ikhfa', label: 'Ikhfa', color: '#9B51E0' },
  { rule: 'idgham', label: 'Idgham', color: '#2E9E4F' },
  { rule: 'iqlab', label: 'Iqlab', color: '#1E88E5' },
  { rule: 'qalqalah', label: 'Qalqalah', color: '#00897B' },
  { rule: 'silent', label: 'Tidak dibaca', color: '#9E9E9E' },
];

export const RULE_COLOR = Object.fromEntries(TAJWEED_RULES.map((r) => [r.rule, r.color])) as Record<TajweedRule, string>;

// Tags may nest (a madda around a small alef) and class names may contain hyphens.
// Any other tag is dropped; the ayah-number span is dropped with its content.
const TOKEN = /<span class=end>.*?<\/span>|<(\/?)(?:tajweed|rule)(?: class=([^>]+))?>|<[^>]*>/g;

/** The innermost class on the stack that maps to a known rule. */
function ruleOf(stack: string[]): TajweedRule | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    const rule = CLASS_TO_RULE[stack[i]] ?? (stack[i].startsWith('madda_') ? 'mad' : undefined);
    if (rule) return rule;
  }
  return null;
}

/** Splits quran.com tajwid markup into coloured runs. */
export function parseTajweed(markup: string): Segment[] {
  const out: Segment[] = [];
  const stack: string[] = [];
  let last = 0;
  const push = (raw: string): void => {
    // The source has the odd stray bracket (e.g. As-Sajdah 3); it is never part of the Arabic.
    const text = raw.replace(/[<>]/g, '');
    if (!text) return;
    const rule = ruleOf(stack);
    const prev = out[out.length - 1];
    if (prev && prev.rule === rule) prev.text += text;
    else out.push({ text, rule });
  };
  for (const m of markup.matchAll(TOKEN)) {
    push(markup.slice(last, m.index));
    if (m[1] === '/') stack.pop();
    else if (m[2]) stack.push(m[2]);
    last = m.index + m[0].length;
  }
  push(markup.slice(last));
  return out;
}

const ZWJ = '\u200D';
const joins = (a: string, b: string): boolean => /\S$/.test(a) && /^\S/.test(b);

/**
 * Android shapes each styled span on its own, so a letter cut off by a colour change loses its
 * joined form. A zero-width joiner on both sides of every mid-word boundary keeps the word cursive.
 */
export function joinSegments(segments: Segment[]): Segment[] {
  return segments.map((s, i) => {
    const before = i > 0 && joins(segments[i - 1].text, s.text) ? ZWJ : '';
    const after = i < segments.length - 1 && joins(s.text, segments[i + 1].text) ? ZWJ : '';
    return { ...s, text: before + s.text + after };
  });
}
