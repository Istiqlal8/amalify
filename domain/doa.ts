// Texts from fitrahive/dua-dhikr (MIT), bundled so they work offline.
import harian from '@/data/doa/harian.json';
import pagi from '@/data/doa/pagi.json';
import petang from '@/data/doa/petang.json';
import pilihan from '@/data/doa/pilihan.json';
import sholat from '@/data/doa/sholat.json';

export type Doa = {
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  /** e.g. "Dibaca 3x"; absent for most doa. */
  notes?: string;
  fawaid?: string;
  source?: string;
};

export type DoaCategoryId = 'pagi' | 'petang' | 'sholat' | 'harian' | 'pilihan';

export const DOA_CATEGORIES: { id: DoaCategoryId; title: string; items: Doa[] }[] = [
  { id: 'pagi', title: 'Dzikir pagi', items: pagi },
  { id: 'petang', title: 'Dzikir petang', items: petang },
  { id: 'sholat', title: 'Setelah sholat', items: sholat },
  { id: 'harian', title: 'Doa harian', items: harian },
  { id: 'pilihan', title: 'Doa pilihan', items: pilihan },
];

export function doaCategory(id: string | undefined) {
  return DOA_CATEGORIES.find((c) => c.id === id);
}

/** The first "Nx" in the notes; 1 when none, so single readings get no counter. */
export function repeatCount(notes: string | undefined): number {
  const match = notes?.match(/(\d+)x/);
  return match ? Number(match[1]) : 1;
}
