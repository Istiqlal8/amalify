import type { City } from './prayer';

/** How the schedule API prefixes its names: "KOTA BANDUNG", "KAB. BANDUNG". */
export type CityKind = 'KOTA' | 'KAB.';

export type CityQuery = { kind: CityKind | null; keywords: string[] };

const PREFIX = /^(kota|kabupaten|kab\.?)(\s+(administrasi|adm\.?))?\s+(.+)$/i;
const MIN_CHARS = 3;

/**
 * Turns a geocoder's place name into search keywords, longest first, because the API knows
 * "Jakarta" but not "Jakarta Selatan": "Kota Jakarta Selatan" → KOTA + ["jakarta selatan", "jakarta"].
 */
export function cityQuery(place: string): CityQuery {
  const m = PREFIX.exec(place.trim());
  const kind = !m ? null : m[1].toLowerCase() === 'kota' ? 'KOTA' : 'KAB.';
  const words = (m ? m[4] : place).trim().toLowerCase().split(/\s+/).filter(Boolean);
  const keywords = words
    .map((_w, i) => words.slice(0, words.length - i).join(' '))
    .filter((k) => k.length >= MIN_CHARS);
  return { kind, keywords };
}

function bareName(city: City): string {
  return city.name.replace(/^(KOTA|KAB\.)\s+/, '').toLowerCase();
}

/** The row named exactly `keyword`; of a kota and a kabupaten sharing it, the asked kind, else the kota. */
export function pickCity(rows: City[], kind: CityKind | null, keyword: string): City | undefined {
  const exact = rows.filter((c) => bareName(c) === keyword);
  return (
    exact.find((c) => kind !== null && c.name.startsWith(kind)) ??
    exact.find((c) => c.name.startsWith('KOTA')) ??
    exact[0]
  );
}
