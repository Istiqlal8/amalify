import { cached } from '@/storage/fileCache';

// equran.id v2; no key needed.
const API = 'https://equran.id/api/v2';

export type Surah = { nomor: number; nama: string; namaLatin: string; arti: string; jumlahAyat: number; tempatTurun: string };

export type Ayah = { nomor: number; arab: string; latin: string; arti: string };

export type SurahDetail = Surah & { ayat: Ayah[] };

type RawAyah = { nomorAyat: number | string; teksArab: string; teksLatin: string; teksIndonesia: string };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Quran ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

function pickSurah(s: Surah): Surah {
  const { nomor, nama, namaLatin, arti, jumlahAyat, tempatTurun } = s;
  return { nomor, nama, namaLatin, arti, jumlahAyat, tempatTurun };
}

export function listSurahs(): Promise<Surah[]> {
  return cached('quran-surat', async () => (await get<Surah[]>('/surat')).map(pickSurah));
}

/** Stores only the text fields; audio links and long descriptions are dropped to keep the cache small. */
export function getSurah(nomor: number): Promise<SurahDetail> {
  return cached(`quran-${nomor}`, async () => {
    const raw = await get<Surah & { ayat: RawAyah[] }>(`/surat/${nomor}`);
    const ayat = raw.ayat.map((a) => ({
      nomor: Number(a.nomorAyat),
      arab: a.teksArab,
      latin: a.teksLatin.trim(),
      arti: a.teksIndonesia,
    }));
    return { ...pickSurah(raw), ayat };
  });
}
