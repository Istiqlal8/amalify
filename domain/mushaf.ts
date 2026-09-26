import type { MushafWord } from '@/services/quranComApi';

/** A printed line, preceded by a surah title (and basmalah) when a surah starts on it. */
export type MushafLine = { line: number; surahStart: number | null; words: MushafWord[] };

/** Groups a page's words into its lines, in order, marking lines that open a surah. */
export function groupLines(words: { line: number; word: MushafWord }[]): MushafLine[] {
  const lines: MushafLine[] = [];
  for (const { line, word } of words) {
    let current = lines[lines.length - 1];
    if (!current || current.line !== line) {
      current = { line, surahStart: null, words: [] };
      lines.push(current);
    }
    if (current.words.length === 0 && word.ayah === 1 && !word.end) current.surahStart = word.surah;
    current.words.push(word);
  }
  // Only the first word of an ayah 1 opens its surah; later lines of that ayah do not.
  const seen = new Set<number>();
  return lines.map((l) => {
    if (l.surahStart === null || seen.has(l.surahStart)) return { ...l, surahStart: null };
    seen.add(l.surahStart);
    return l;
  });
}

// Lines the printed Madani mushaf centres instead of justifying: the first two pages whole, and
// short closing lines of some surahs. Taken from quran.com-frontend-next (pageUtils.ts).
const CENTERED_PAGES = new Set([1, 2]);
const CENTERED_LINES: Record<number, number[]> = {
  255: [2],
  528: [9],
  534: [6],
  545: [6],
  586: [1],
  593: [2],
  594: [5],
  600: [10],
  602: [5, 15],
  603: [10, 15],
  604: [4, 9, 14, 15],
};

export function isCenteredLine(page: number, line: number): boolean {
  return CENTERED_PAGES.has(page) || (CENTERED_LINES[page]?.includes(line) ?? false);
}
