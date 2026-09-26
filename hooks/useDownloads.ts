import { useCallback, useMemo, useState } from 'react';

import type { Reciter } from '@/domain/murottal';
import { deleteSurah, downloadedSurahs, downloadSurah } from '@/services/audioDownloads';

type Downloads = {
  done: Set<number>;
  /** Surah number → fraction downloaded so far, for surahs still in progress. */
  progress: Map<number, number>;
  error: string | null;
  download: (surah: number) => void;
  remove: (surah: number) => void;
};

/** Which of this reciter's surahs are on the device, and the ones downloading now. */
export function useDownloads(reciter: Reciter): Downloads {
  // Bumped after each download or delete, so the folder is read again.
  const [version, setVersion] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` is the re-read trigger
  const done = useMemo(() => downloadedSurahs(reciter), [reciter, version]);
  const [progress, setProgress] = useState(new Map<number, number>());
  const [error, setError] = useState<string | null>(null);

  const setRatio = useCallback((surah: number, ratio: number | null) => {
    setProgress((prev) => {
      const next = new Map(prev);
      if (ratio === null) next.delete(surah);
      else next.set(surah, ratio);
      return next;
    });
  }, []);

  const download = useCallback(
    (surah: number) => {
      setError(null);
      setRatio(surah, 0);
      downloadSurah(reciter, surah, (r) => setRatio(surah, r))
        .then(() => setVersion((v) => v + 1))
        .catch(() => setError('Gagal mengunduh. Periksa koneksi internet.'))
        .finally(() => setRatio(surah, null));
    },
    [reciter, setRatio],
  );

  const remove = useCallback(
    (surah: number) => {
      deleteSurah(reciter, surah);
      setVersion((v) => v + 1);
    },
    [reciter],
  );

  return { done, progress, error, download, remove };
}
