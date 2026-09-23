import { useCallback, useEffect, useState } from 'react';

import { getSurah, listSurahs, type Surah, type SurahDetail } from '@/services/quranApi';

type Loadable<T> = { data: T | null; error: string | null; retry: () => void };

function useLoad<T>(load: () => Promise<T>): Loadable<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setError(null);
    load()
      .then((d) => live && setData(d))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, error, retry };
}

export function useSurahList(): Loadable<Surah[]> {
  return useLoad(listSurahs);
}

export function useSurah(nomor: number): Loadable<SurahDetail> {
  const load = useCallback(() => getSurah(nomor), [nomor]);
  return useLoad(load);
}
