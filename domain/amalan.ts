export type SectionId = 'sholat' | 'quran' | 'kebaikan';

export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: 'sholat', title: 'Sholat' },
  { id: 'quran', title: 'Quran & Dzikir' },
  { id: 'kebaikan', title: 'Kebaikan' },
];
