const MONTHS = [
  'Muharram', 'Safar', "Rabi'ul Awal", "Rabi'ul Akhir", 'Jumadil Awal', 'Jumadil Akhir',
  'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah',
];

export type HijriDate = { day: number; month: number; year: number };

/**
 * Tabular (arithmetic) Hijri calendar from the local calendar day.
 * It can differ by a day from Kemenag's rukyat-based dates.
 */
export function toHijri(date: Date): HijriDate {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  let l = Math.floor(utc / 86400000) + 2440588 - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l) / 709);
  return { day: l - Math.floor((709 * month) / 24), month, year: 30 * n + j - 30 };
}

export function formatHijri(h: HijriDate): string {
  return `${h.day} ${MONTHS[h.month - 1]} ${h.year} H`;
}
