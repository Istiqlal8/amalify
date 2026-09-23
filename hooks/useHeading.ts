import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Heading = { degrees: number; accuracy: number };

/**
 * Live compass heading while mounted. True north when the platform can give it (needs location
 * permission), magnetic north otherwise. `null` until the first reading or without a sensor.
 */
export function useHeading(enabled: boolean): Heading | null {
  const [heading, setHeading] = useState<Heading | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let sub: Location.LocationSubscription | null = null;
    let live = true;
    Location.watchHeadingAsync((h) => {
      const degrees = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
      setHeading({ degrees, accuracy: h.accuracy });
    })
      .then((s) => (live ? (sub = s) : s.remove()))
      .catch(() => setHeading(null));
    return () => {
      live = false;
      sub?.remove();
    };
  }, [enabled]);

  return heading;
}
