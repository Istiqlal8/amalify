import { qiblaBearing } from '@/domain/qibla';
import { cached } from '@/storage/fileCache';

// Aladhan's qibla endpoint; no key needed.
const API = 'https://api.aladhan.com/v1/qibla';

export type QiblaResult = { bearing: number; source: 'api' | 'offline' };

/**
 * Qibla bearing for a place. Coordinates are rounded to ~1 km before caching, which moves the
 * bearing by far less than a compass can show. Falls back to the same formula offline.
 */
export async function fetchQibla(lat: number, lng: number): Promise<QiblaResult> {
  const la = lat.toFixed(2);
  const ln = lng.toFixed(2);
  try {
    const bearing = await cached(`qibla-${la}-${ln}`, async () => {
      const res = await fetch(`${API}/${la}/${ln}`);
      if (!res.ok) throw new Error(`Kiblat ${res.status}`);
      return ((await res.json()) as { data: { direction: number } }).data.direction;
    });
    return { bearing, source: 'api' };
  } catch {
    return { bearing: qiblaBearing(lat, lng), source: 'offline' };
  }
}
