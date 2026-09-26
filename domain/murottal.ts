import meta from '@/data/quran/meta.json';

const EQURAN = 'https://cdn.equran.id/audio-full';
const QURANCDN = 'https://static.qurancdn.com/images/reciters';

/**
 * `photo` is a remote URL or a bundled image (Wikimedia refuses Android's default image requests).
 * `base` + surah number (zero-padded to three digits when `padded`) + `.mp3` is one whole surah.
 * `qdc` is the quran.com recitation whose verse timings match that exact file.
 */
export type Reciter = { id: string; name: string; base: string; padded: boolean; qdc?: number; style?: string; photo?: string | number };

export const RECITERS: Reciter[] = [
  {
    id: '05',
    name: 'Misyari Rasyid Al-Afasi',
    base: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/',
    padded: false,
    qdc: 7,
    photo: `${QURANCDN}/6/mishary-rashid-alafasy-profile.jpeg`,
  },
  {
    id: '03',
    name: 'Abdurrahman As-Sudais',
    base: 'https://download.quranicaudio.com/qdc/abdurrahmaan_as_sudais/murattal/',
    padded: false,
    qdc: 3,
    photo: `${QURANCDN}/2/abdul-rahman-al-sudais-profile.jpeg`,
  },
  {
    id: '01',
    name: 'Abdullah Al-Juhany',
    base: `${EQURAN}/Abdullah-Al-Juhany/`,
    padded: true,
    photo: require('@/assets/images/reciters/juhany.jpg'),
  },
  {
    id: '02',
    name: 'Abdul Muhsin Al-Qasim',
    base: `${EQURAN}/Abdul-Muhsin-Al-Qasim/`,
    padded: true,
    photo: require('@/assets/images/reciters/qasim.jpg'),
  },
  { id: '04', name: 'Ibrahim Al-Dossari', base: `${EQURAN}/Ibrahim-Al-Dossari/`, padded: true },
  {
    id: '06',
    name: 'Yasser Al-Dosari',
    base: 'https://download.quranicaudio.com/quran/yasser_ad-dussary//',
    padded: true,
    qdc: 97,
    photo: `${QURANCDN}/20/yasser-profile.png`,
  },
  // Teaching recitation: slow, each passage left room for a child to repeat after.
  {
    id: 'husary-muallim',
    name: 'Mahmoud Khalil Al-Husary',
    style: "Mu'allim · untuk anak",
    base: 'https://download.quranicaudio.com/qdc/khalil_al_husary/muallim/',
    padded: false,
    qdc: 12,
    photo: `${QURANCDN}/5/mahmoud-khalil-al-hussary-profile.png`,
  },
  // Each passage is followed by a pause for a child to repeat it.
  {
    id: 'minshawi-kids',
    name: 'Muhammad Shiddiq Al-Minshawi',
    style: 'Ulang bersama · untuk anak',
    base: 'https://download.quranicaudio.com/qdc/siddiq_minshawi/kids_repeat/',
    padded: false,
    qdc: 168,
    photo: `${QURANCDN}/7/mohamed-siddiq-el-minshawi-profile.jpeg`,
  },
];

/** Photo and video credits live on the website; CC BY / BY-SA allow crediting through a link to them. */
export const CREDITS_URL = 'https://amalify.my.id/credits.html';

export const DEFAULT_RECITER = RECITERS[0];

export const SURAH_NAMES: { name: string; ayat: number }[] = meta.surahs;

export type Repeat = 'off' | 'all' | 'one';

export function reciterById(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? DEFAULT_RECITER;
}

export function audioUrl(reciter: Reciter, surah: number): string {
  return `${reciter.base}${reciter.padded ? String(surah).padStart(3, '0') : surah}.mp3`;
}

/** Surah that follows `surah` when it ends by itself; null means stop. */
export function nextSurah(surah: number, repeat: Repeat): number | null {
  if (repeat === 'one') return surah;
  if (surah < 114) return surah + 1;
  return repeat === 'all' ? 1 : null;
}

/** Surah before `surah`, wrapping from Al-Fatihah to An-Nas. */
export function previousSurah(surah: number): number {
  return surah > 1 ? surah - 1 : 114;
}

export function cycleRepeat(repeat: Repeat): Repeat {
  return repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
}

/** Two initials for a reciter avatar: "Misyari Rasyid Al-Afasi" → "MA". */
export function initials(name: string): string {
  const words = name.split(/[\s-]+/).filter((w) => !/^a[ls]$/i.test(w));
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return ((words[0]?.[0] ?? '') + last).toUpperCase();
}

/** m:ss, or h:mm:ss for long surahs. */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** When one ayah is heard in a whole-surah file, in milliseconds. */
export type AyahTiming = { ayah: number; from: number; to: number };

/** The ayah being recited at `ms`; before the first ayah starts, the first one. */
export function ayahAt(timings: AyahTiming[], ms: number): number | null {
  if (timings.length === 0) return null;
  let lo = 0;
  let hi = timings.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (timings[mid].from <= ms) lo = mid;
    else hi = mid - 1;
  }
  return timings[lo].ayah;
}
