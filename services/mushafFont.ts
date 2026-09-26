import { File, Paths } from 'expo-file-system';
import * as Font from 'expo-font';

// King Fahd Complex (QCF) page fonts, as served for quran.com: each word of a page is one glyph,
// so lines come out exactly as printed. v1 is plain; v4 carries tajwid colours (COLRv1, Android 13+).
const BASE = 'https://verses.quran.foundation/fonts/quran/hafs';

export type MushafFont = 'v1' | 'v4';

const url = (v: MushafFont, page: number): string =>
  v === 'v1' ? `${BASE}/v1/ttf/p${page}.ttf` : `${BASE}/v4/colrv1/ttf/p${page}.ttf`;

export const fontName = (v: MushafFont, page: number): string => `qcf-${v}-p${page}`;

const pending = new Map<string, Promise<void>>();

/** Downloads a page font once (kept for offline use) and registers it. */
export function loadPageFont(v: MushafFont, page: number): Promise<void> {
  const name = fontName(v, page);
  if (Font.isLoaded(name)) return Promise.resolve();
  const inFlight = pending.get(name);
  if (inFlight) return inFlight;
  const task = (async () => {
    const file = new File(Paths.document, `${name}.ttf`);
    if (!file.exists) await File.downloadFileAsync(url(v, page), file);
    await Font.loadAsync(name, file.uri);
  })().finally(() => pending.delete(name));
  pending.set(name, task);
  return task;
}
