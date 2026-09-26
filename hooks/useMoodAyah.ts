import { useEffect, useState } from 'react';

import type { AyahRef } from '@/domain/tilawah';
import { type Ayah, getSurah } from '@/services/quranApi';

export type MoodAyah = { ayah: Ayah; surahName: string };

type Result = { ref: AyahRef; data: MoodAyah | null };

/**
 * Loads one ayah's text; the surah is cached after the first fetch, so it works offline later.
 * Results are tagged with their ref, so a previous mood's ayah never shows while the next one loads.
 */
export function useMoodAyah(ref: AyahRef | null): { data: MoodAyah | null; error: boolean } {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!ref) return;
    let live = true;
    getSurah(ref.surah)
      .then((s) => {
        const ayah = s.ayat.find((a) => a.nomor === ref.ayah);
        if (live) setResult({ ref, data: ayah ? { ayah, surahName: s.namaLatin } : null });
      })
      .catch(() => live && setResult({ ref, data: null }));
    return () => {
      live = false;
    };
  }, [ref]);

  const current = result && result.ref === ref ? result : null;
  return { data: current?.data ?? null, error: current !== null && current.data === null };
}
