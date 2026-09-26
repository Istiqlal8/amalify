// Page starts from Tanzil Quran metadata (tanzil.net, CC BY 3.0), Madani mushaf of 604 pages.
import meta from '@/data/quran/meta.json';

export type AyahRef = { surah: number; ayah: number };

/** One sitting, `from`..`to` inclusive; `pages` is added to that day's tilawah count. */
export type TilawahSession = { id: string; day: string; from: AyahRef; to: AyahRef; pages: number; at: number };

export type TilawahLog = { sessions: TilawahSession[]; at: number };

export const EMPTY_TILAWAH: TilawahLog = { sessions: [], at: 0 };

export const TOTAL_PAGES = meta.pageStarts.length;

export const SURAHS: { name: string; ayat: number }[] = meta.surahs;

const LAST: AyahRef = { surah: 114, ayah: 6 };

export function compareRef(a: AyahRef, b: AyahRef): number {
  return a.surah - b.surah || a.ayah - b.ayah;
}

export function isValidRef(ref: AyahRef): boolean {
  const surah = SURAHS[ref.surah - 1];
  return surah !== undefined && Number.isInteger(ref.ayah) && ref.ayah >= 1 && ref.ayah <= surah.ayat;
}

/** Mushaf page holding `ref`: the last page that starts at or before it. */
export function pageOf(ref: AyahRef): number {
  let lo = 0;
  let hi = meta.pageStarts.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const [surah, ayah] = meta.pageStarts[mid];
    if (compareRef({ surah, ayah }, ref) <= 0) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

/** Pages touched from `from` to `to`; null when the range runs backwards or is out of bounds. */
export function pagesBetween(from: AyahRef, to: AyahRef): number | null {
  if (!isValidRef(from) || !isValidRef(to) || compareRef(from, to) > 0) return null;
  return pageOf(to) - pageOf(from) + 1;
}

export function formatRef(ref: AyahRef): string {
  return `${SURAHS[ref.surah - 1].name} ${ref.surah}:${ref.ayah}`;
}

function newest(log: TilawahLog): TilawahSession | undefined {
  return [...log.sessions].sort((a, b) => a.at - b.at).pop();
}

export function lastRead(log: TilawahLog): AyahRef | undefined {
  return newest(log)?.to;
}

/** The following ayah, back to Al-Fatihah after An-Nas. */
export function ayahAfter(ref: AyahRef): AyahRef {
  if (compareRef(ref, LAST) === 0) return { surah: 1, ayah: 1 };
  if (ref.ayah < SURAHS[ref.surah - 1].ayat) return { surah: ref.surah, ayah: ref.ayah + 1 };
  return { surah: ref.surah + 1, ayah: 1 };
}

/** Where the next sitting should begin. */
export function nextStart(log: TilawahLog): AyahRef {
  const last = lastRead(log);
  return last ? ayahAfter(last) : { surah: 1, ayah: 1 };
}

export function khatamCount(log: TilawahLog): number {
  return log.sessions.filter((s) => compareRef(s.to, LAST) === 0).length;
}

export function addSession(log: TilawahLog, session: TilawahSession, now: number): TilawahLog {
  return { sessions: [...log.sessions, session], at: now };
}

export function removeSession(log: TilawahLog, id: string, now: number): TilawahLog {
  return { sessions: log.sessions.filter((s) => s.id !== id), at: now };
}

export function newerTilawah(a: TilawahLog, b: TilawahLog | undefined): TilawahLog {
  return b && b.at > a.at ? b : a;
}
