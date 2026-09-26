import { useEffect, useState } from 'react';

import { ayahAt, type AyahTiming, type Reciter } from '@/domain/murottal';
import { useMurottalStatus } from '@/providers/MurottalProvider';
import { getSurah, type Ayah } from '@/services/quranApi';
import { getVerseTimings } from '@/services/verseTimings';

type Loaded = { key: string; timings: AyahTiming[]; ayat: Ayah[] };

/**
 * The ayah heard right now, with its text and translation. Null while loading, offline,
 * or for a reciter whose file has no published timings.
 */
export function useCurrentAyah(reciter: Reciter, surah: number | null): Ayah | null {
  const { currentTime } = useMurottalStatus();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${reciter.qdc}-${surah}`;

  useEffect(() => {
    if (!reciter.qdc || surah === null) return;
    let live = true;
    Promise.all([getVerseTimings(reciter.qdc, surah), getSurah(surah)])
      .then(([timings, detail]) => live && setLoaded({ key, timings, ayat: detail.ayat }))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [reciter.qdc, surah, key]);

  if (!loaded || loaded.key !== key) return null;
  const nomor = ayahAt(loaded.timings, currentTime * 1000);
  return loaded.ayat.find((a) => a.nomor === nomor) ?? null;
}
