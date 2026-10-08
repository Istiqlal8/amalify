import { useEffect } from 'react';
import { Platform } from 'react-native';

import { usePrayer } from '@/providers/PrayerProvider';
import { locateCity } from '@/services/cityLocator';

/** Picks the prayer city from the device's location while none is saved; a manual choice always wins. */
export function useAutoCity(): void {
  const { city, loaded, setCity } = usePrayer();

  useEffect(() => {
    // Reverse geocoding exists on Android and iOS only.
    if (!loaded || city || Platform.OS === 'web') return;
    let live = true;
    locateCity(true)
      .then((found) => live && found && setCity(found))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [loaded, city, setCity]);
}
