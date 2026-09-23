import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { monthsToLoad, type City, type PrayerDay } from '@/domain/prayer';
import { monthSchedule } from '@/services/prayerApi';

const KEY = 'amalify.prayer.v1';

type Settings = { city: City | null; adzan: boolean };

type PrayerState = Settings & {
  days: PrayerDay[];
  error: string | null;
  setCity: (city: City) => void;
  setAdzan: (on: boolean) => void;
};

const PrayerContext = createContext<PrayerState | null>(null);

/** City choice and adzan toggle stay on this device; the schedule comes from Kemenag via myQuran. */
export function PrayerProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ city: null, adzan: false });
  const [days, setDays] = useState<PrayerDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => raw && setSettings(JSON.parse(raw) as Settings));
  }, []);

  useEffect(() => {
    const city = settings.city;
    if (!city) return setDays([]);
    setError(null);
    Promise.all(monthsToLoad(new Date()).map((m) => monthSchedule(city.id, m.year, m.month)))
      .then((months) => setDays(months.flat()))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [settings.city]);

  const save = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setCity = useCallback((city: City) => save({ city }), [save]);
  const setAdzan = useCallback((adzan: boolean) => save({ adzan }), [save]);

  const value = useMemo(
    () => ({ ...settings, days, error, setCity, setAdzan }),
    [settings, days, error, setCity, setAdzan],
  );
  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

export function usePrayer(): PrayerState {
  const ctx = useContext(PrayerContext);
  if (!ctx) throw new Error('usePrayer must be used inside PrayerProvider');
  return ctx;
}
