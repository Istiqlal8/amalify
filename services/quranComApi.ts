import { cached } from '@/storage/fileCache';

// quran.com v4, used only for what equran.id lacks: tajwid markup and word-by-word meanings.
const API = 'https://api.quran.com/api/v4';

export type Word = { tajweed: string; arti: string };

/** One ayah's tajwid-marked Uthmani text and its words, in reading order. */
export type TajweedAyah = { tajweed: string; words: Word[] };

type RawWord = { char_type_name: string; text_uthmani_tajweed: string; translation: { text: string | null } };
type RawVerse = { verse_number: number; text_uthmani_tajweed: string; words: RawWord[] };

/** Index 0 is ayah 1. One request covers the longest surah (286 ayat). */
export function getTajweed(nomor: number): Promise<TajweedAyah[]> {
  return cached(`tajweed-${nomor}`, async () => {
    const query = 'words=true&word_fields=text_uthmani_tajweed&fields=text_uthmani_tajweed&language=id&per_page=300';
    const res = await fetch(`${API}/verses/by_chapter/${nomor}?${query}`);
    if (!res.ok) throw new Error(`Tajwid ${res.status}`);
    const { verses } = (await res.json()) as { verses: RawVerse[] };
    return verses
      .sort((a, b) => a.verse_number - b.verse_number)
      .map((v) => ({
        tajweed: v.text_uthmani_tajweed,
        words: v.words
          .filter((w) => w.char_type_name === 'word')
          .map((w) => ({ tajweed: w.text_uthmani_tajweed, arti: w.translation.text ?? '' })),
      }));
  });
}

/** `code1`/`code2` are the word's glyph in the QCF v1 and v4 page fonts. */
export type MushafWord = { code1: string; code2: string; surah: number; ayah: number; end: boolean };

type RawPageWord = { char_type_name: string; code_v1: string; code_v2: string; line_number: number };
type RawPageVerse = { verse_key: string; words: RawPageWord[] };

/** Every word on a Madani mushaf page with its line, ayah end markers included. */
export function getMushafPage(page: number): Promise<{ line: number; word: MushafWord }[]> {
  return cached(`mushaf-qcf-${page}`, async () => {
    const query = 'words=true&word_fields=code_v1,code_v2,line_number&per_page=50';
    const res = await fetch(`${API}/verses/by_page/${page}?${query}`);
    if (!res.ok) throw new Error(`Mushaf ${res.status}`);
    const { verses } = (await res.json()) as { verses: RawPageVerse[] };
    return verses.flatMap((v) => {
      const [surah, ayah] = v.verse_key.split(':').map(Number);
      return v.words.map((w) => ({
        line: w.line_number,
        word: { code1: w.code_v1, code2: w.code_v2, surah, ayah, end: w.char_type_name === 'end' },
      }));
    });
  });
}
