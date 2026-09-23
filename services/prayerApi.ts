import type { City, PrayerDay } from '@/domain/prayer';
import { cached } from '@/storage/fileCache';

// Kemenag schedules via myQuran; no key needed.
const API = 'https://api.myquran.com/v2/sholat';

type Envelope<T> = { status: boolean; data: T; message?: string };
type RawDay = PrayerDay & { tanggal: string };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Jadwal sholat ${res.status}`);
  const body = (await res.json()) as Envelope<T>;
  if (!body.status) throw new Error(body.message ?? 'Kota tidak ditemukan');
  return body.data;
}

export async function searchCities(keyword: string): Promise<City[]> {
  const rows = await get<{ id: string; lokasi: string }[]>(`/kota/cari/${encodeURIComponent(keyword)}`);
  return rows.map((r) => ({ id: r.id, name: r.lokasi }));
}

/** A month never changes once published, so it is cached for good. */
export async function monthSchedule(cityId: string, year: number, month: number): Promise<PrayerDay[]> {
  const mm = String(month).padStart(2, '0');
  return cached(`sholat-${cityId}-${year}-${mm}`, async () => {
    const data = await get<{ jadwal: RawDay[] }>(`/jadwal/${cityId}/${year}/${mm}`);
    return data.jadwal.map(({ date, subuh, dzuhur, ashar, maghrib, isya }) => ({ date, subuh, dzuhur, ashar, maghrib, isya }));
  });
}
