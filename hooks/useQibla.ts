import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { fetchQibla, type QiblaResult } from '@/services/qiblaApi';

type Status = 'locating' | 'ready' | 'denied' | 'error';

type QiblaState = { status: Status; qibla: QiblaResult | null; retry: () => void };

/** Asks for location once, then resolves the qibla bearing for where the user stands. */
export function useQibla(): QiblaState {
  const [status, setStatus] = useState<Status>('locating');
  const [qibla, setQibla] = useState<QiblaResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      setStatus('locating');
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return live && setStatus('denied');
      // A last known fix is instant and plenty accurate for a bearing; ask for a fresh one only without it.
      const pos = (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      const result = await fetchQibla(pos.coords.latitude, pos.coords.longitude);
      if (!live) return;
      setQibla(result);
      setStatus('ready');
    })().catch(() => live && setStatus('error'));
    return () => {
      live = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { status, qibla, retry };
}
