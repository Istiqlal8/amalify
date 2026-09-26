import { Directory, File, Paths } from 'expo-file-system';

import { audioUrl, type Reciter } from '@/domain/murottal';
import { getSurah } from '@/services/quranApi';
import { getVerseTimings } from '@/services/verseTimings';

// Downloaded surahs live in the app's document folder, one folder per reciter.
function folderFor(reciter: Reciter): Directory {
  return new Directory(Paths.document, 'murottal', reciter.id);
}

function fileFor(reciter: Reciter, surah: number): File {
  return new File(folderFor(reciter), `${surah}.mp3`);
}

/** The local copy when the surah was downloaded, otherwise the streaming URL. */
export function audioSource(reciter: Reciter, surah: number): string {
  const file = fileFor(reciter, surah);
  return file.exists ? file.uri : audioUrl(reciter, surah);
}

/** Surah numbers already on the device for this reciter. */
export function downloadedSurahs(reciter: Reciter): Set<number> {
  const folder = folderFor(reciter);
  if (!folder.exists) return new Set();
  const names = folder.list().filter((f) => f instanceof File && f.name.endsWith('.mp3')).map((f) => parseInt(f.name, 10));
  return new Set(names.filter((n) => n >= 1 && n <= 114));
}

/**
 * Saves one surah, plus its text and verse timings so the ayah view also works offline.
 * A half-written file is removed on failure, so it never passes for a finished download.
 */
export async function downloadSurah(reciter: Reciter, surah: number, onProgress: (ratio: number) => void): Promise<void> {
  const folder = folderFor(reciter);
  folder.create({ intermediates: true, idempotent: true });
  const part = new File(folder, `${surah}.part`);
  try {
    await File.downloadFileAsync(audioUrl(reciter, surah), part, {
      idempotent: true,
      onProgress: ({ bytesWritten, totalBytes }) => totalBytes > 0 && onProgress(bytesWritten / totalBytes),
    });
    part.move(fileFor(reciter, surah));
  } catch (e) {
    if (part.exists) part.delete();
    throw e;
  }
  await Promise.all([getSurah(surah), reciter.qdc ? getVerseTimings(reciter.qdc, surah) : null]).catch(() => undefined);
}

export function deleteSurah(reciter: Reciter, surah: number): void {
  const file = fileFor(reciter, surah);
  if (file.exists) file.delete();
}
