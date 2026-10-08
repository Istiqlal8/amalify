import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { City } from '@/domain/prayer';
import { usePrayer } from '@/providers/PrayerProvider';
import { locateCity } from '@/services/cityLocator';

type CityDrift = { here: City; accept: () => void; dismiss: () => void };

/**
 * The city the user is in when it differs from the one their schedule follows (travel, moving).
 * Never asks for location: it only looks when permission was already given. A declined city is
 * remembered, so someone who prefers the neighbouring city's schedule is asked once.
 */
export function useCityDrift(): CityDrift | null {
  const { city, ignoredCity, setCity, ignoreCity } = usePrayer();
  const [here, setHere] = useState<City | null>(null);
  const cityId = city?.id;

  useEffect(() => {
    if (!cityId || Platform.OS === 'web') return;
    let live = true;
    locateCity(false)
      .then((found) => live && setHere(found))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [cityId]);

  if (!here || !cityId || here.id === cityId || here.id === ignoredCity) return null;
  return { here, accept: () => setCity(here), dismiss: () => ignoreCity(here.id) };
}
