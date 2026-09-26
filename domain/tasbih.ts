export type Phrase = { arabic: string; latin: string; arti: string; target: number };

export type TasbihPreset = { id: string; label: string; phrases: Phrase[] };

const SUBHANALLAH: Omit<Phrase, 'target'> = { arabic: 'سُبْحَانَ اللّٰهِ', latin: 'Subhānallāh', arti: 'Maha Suci Allah' };
const ALHAMDULILLAH: Omit<Phrase, 'target'> = { arabic: 'اَلْحَمْدُ لِلّٰهِ', latin: 'Alhamdulillāh', arti: 'Segala puji bagi Allah' };
const ALLAHU_AKBAR: Omit<Phrase, 'target'> = { arabic: 'اَللّٰهُ أَكْبَرُ', latin: 'Allāhu akbar', arti: 'Allah Maha Besar' };
const TAHLIL: Omit<Phrase, 'target'> = { arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', latin: 'Lā ilāha illallāh', arti: 'Tiada tuhan selain Allah' };
const ISTIGHFAR: Omit<Phrase, 'target'> = { arabic: 'أَسْتَغْفِرُ اللّٰهَ', latin: 'Astaghfirullāh', arti: 'Aku memohon ampun kepada Allah' };
const SHALAWAT: Omit<Phrase, 'target'> = {
  arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ',
  latin: 'Allāhumma ṣalli ʿalā Muḥammad',
  arti: 'Ya Allah, limpahkan shalawat kepada Muhammad',
};

/** 0 means no target: counts on forever. */
export const TASBIH_PRESETS: TasbihPreset[] = [
  // 33 + 33 + 33, then one tahlil to make 100 (HR. Muslim 597).
  {
    id: 'sholat',
    label: 'Setelah sholat',
    phrases: [
      { ...SUBHANALLAH, target: 33 },
      { ...ALHAMDULILLAH, target: 33 },
      { ...ALLAHU_AKBAR, target: 33 },
      { ...TAHLIL, target: 1 },
    ],
  },
  { id: 'istighfar', label: 'Istighfar', phrases: [{ ...ISTIGHFAR, target: 100 }] },
  { id: 'shalawat', label: 'Shalawat', phrases: [{ ...SHALAWAT, target: 100 }] },
  { id: 'tahlil', label: 'Tahlil', phrases: [{ ...TAHLIL, target: 100 }] },
  { id: 'bebas', label: 'Bebas', phrases: [{ ...SUBHANALLAH, target: 0 }] },
];

export type TasbihState = { phrase: number; count: number; finished: boolean };

export const START: TasbihState = { phrase: 0, count: 0, finished: false };

export type TapResult = { state: TasbihState; event: 'count' | 'phraseDone' | 'finished' };

/** One tap: counts up, moves to the next phrase at its target, and stops after the last one. */
export function tap(preset: TasbihPreset, s: TasbihState): TapResult {
  if (s.finished) return { state: s, event: 'finished' };
  const { target } = preset.phrases[s.phrase];
  const count = s.count + 1;
  if (target === 0 || count < target) return { state: { ...s, count }, event: 'count' };
  const last = s.phrase === preset.phrases.length - 1;
  if (last) return { state: { phrase: s.phrase, count, finished: true }, event: 'finished' };
  return { state: { phrase: s.phrase + 1, count: 0, finished: false }, event: 'phraseDone' };
}

/** Taps made so far across all phrases of the preset. */
export function totalDone(preset: TasbihPreset, s: TasbihState): number {
  return preset.phrases.slice(0, s.phrase).reduce((sum, p) => sum + p.target, 0) + s.count;
}
