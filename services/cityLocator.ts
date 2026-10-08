import * as Location from 'expo-location';

import { cityQuery, pickCity } from '@/domain/cityMatch';
import type { City } from '@/domain/prayer';
import { searchCities } from '@/services/prayerApi';

async function findByName(place: string): Promise<City | null> {
  const { kind, keywords } = cityQuery(place);
  for (const keyword of keywords) {
    // The API answers "not found" as an error; that only means the next, shorter keyword gets a turn.
    const rows = await searchCities(keyword).catch(() => []);
    const hit = pickCity(rows, kind, keyword);
    if (hit) return hit;
  }
  return null;
}

/**
 * The schedule city the user is standing in, or null when location is refused or the place is
 * unknown. With `ask` false the permission dialog never opens: only an earlier grant is used.
 */
export async function locateCity(ask: boolean): Promise<City | null> {
  const perm = ask ? await Location.requestForegroundPermissionsAsync() : await Location.getForegroundPermissionsAsync();
  if (!perm.granted) return null;
  const pos =
    (await Location.getLastKnownPositionAsync()) ??
    (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  const [place] = await Location.reverseGeocodeAsync(pos.coords);
  for (const name of [place?.subregion, place?.city]) {
    const hit = name ? await findByName(name) : null;
    if (hit) return hit;
  }
  return null;
}
