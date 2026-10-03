import { isFlowerId, type FlowerId } from './flowers';

/** Pilihan bunga per hari: dateKey (YYYY-MM-DD) -> FlowerId. Hari tanpa entri ikut bunga default. */
export type DayFlowers = Record<string, FlowerId>;

/** Bunga untuk tanggal itu: override hari itu kalau ada, kalau tidak bunga default. */
export function flowerForDate(map: DayFlowers, date: string, fallback: FlowerId): FlowerId {
  const id = map[date];
  return typeof id === 'string' && isFlowerId(id) ? id : fallback;
}

/** Catat pilihan bunga untuk satu hari. */
export function setDayFlower(map: DayFlowers, date: string, flower: FlowerId): DayFlowers {
  if (map[date] === flower) return map;
  return { ...map, [date]: flower };
}

/** Hapus pilihan hari itu supaya ikut bunga default lagi. */
export function clearDayFlower(map: DayFlowers, date: string): DayFlowers {
  if (!(date in map)) return map;
  const next = { ...map };
  delete next[date];
  return next;
}

/** Bersihkan data mentah dari storage: hanya entri string valid yang dipertahankan. */
export function sanitizeDayFlowers(value: unknown): DayFlowers {
  if (typeof value !== 'object' || value === null) return {};
  const out: DayFlowers = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'string' && isFlowerId(v)) out[k] = v;
  }
  return out;
}

/** Gabung dua map (mis. lokal + remote): remote menang per tanggal. */
export function mergeDayFlowers(a: DayFlowers, b: unknown): DayFlowers {
  return { ...a, ...sanitizeDayFlowers(b) };
}
