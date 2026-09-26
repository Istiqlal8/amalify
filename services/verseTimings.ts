import type { AyahTiming } from '@/domain/murottal';
import { cached } from '@/storage/fileCache';

// quran.com's audio API; the timings belong to its own whole-surah files.
const API = 'https://api.qurancdn.com/api/qdc/audio/reciters';

type Raw = { audio_files: { verse_timings: { verse_key: string; timestamp_from: number; timestamp_to: number }[] }[] };

/** Start and end of every ayah in recitation `qdc`'s file for `surah`, cached after the first fetch. */
export function getVerseTimings(qdc: number, surah: number): Promise<AyahTiming[]> {
  return cached(`timings-${qdc}-${surah}`, async () => {
    const res = await fetch(`${API}/${qdc}/audio_files?chapter=${surah}&segments=true`);
    if (!res.ok) throw new Error(`Timings ${res.status}`);
    const raw = (await res.json()) as Raw;
    return raw.audio_files[0].verse_timings.map((t) => ({
      ayah: Number(t.verse_key.split(':')[1]),
      from: t.timestamp_from,
      to: t.timestamp_to,
    }));
  });
}
