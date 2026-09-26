import type { AyahRef } from '@/domain/tilawah';

export type MoodId = 'senang' | 'sedih' | 'cemas' | 'marah' | 'lelah';

export type Mood = { id: MoodId; label: string; ayat: AyahRef[] };

/** Each mood with the ayat that answer it; a different one comes up on different days. */
export const MOODS: Mood[] = [
  {
    id: 'senang',
    label: 'Senang',
    ayat: [
      { surah: 14, ayah: 7 },
      { surah: 10, ayah: 58 },
      { surah: 93, ayah: 11 },
      { surah: 55, ayah: 13 },
    ],
  },
  {
    id: 'sedih',
    label: 'Sedih',
    ayat: [
      { surah: 94, ayah: 5 },
      { surah: 9, ayah: 40 },
      { surah: 3, ayah: 139 },
      { surah: 12, ayah: 86 },
      { surah: 39, ayah: 53 },
    ],
  },
  {
    id: 'cemas',
    label: 'Cemas',
    ayat: [
      { surah: 13, ayah: 28 },
      { surah: 65, ayah: 3 },
      { surah: 3, ayah: 173 },
      { surah: 2, ayah: 286 },
    ],
  },
  {
    id: 'marah',
    label: 'Marah',
    ayat: [
      { surah: 3, ayah: 134 },
      { surah: 41, ayah: 34 },
      { surah: 7, ayah: 199 },
    ],
  },
  {
    id: 'lelah',
    label: 'Lelah',
    ayat: [
      { surah: 94, ayah: 7 },
      { surah: 2, ayah: 45 },
      { surah: 29, ayah: 69 },
    ],
  },
];

/** The ayah for a mood on a given day, so picking the same mood tomorrow brings a new one. */
export function ayahFor(mood: Mood, day: Date): AyahRef {
  const dayNumber = Math.floor(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86_400_000);
  return mood.ayat[dayNumber % mood.ayat.length];
}
