import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { upcomingPrayers } from '@/domain/prayer';
import { buildSchedule, DEFAULT_EVENING, type EveningReminder } from '@/domain/reminders';
import { useLogs } from '@/providers/LogsProvider';
import { usePrayer } from '@/providers/PrayerProvider';
import { configureNotifications, ensurePermission, hasPermission, replaceScheduled } from '@/services/notifications';

const KEY = 'amalify.evening.v1';
const RESCHEDULE_DELAY_MS = 1500;

type ReminderState = {
  evening: EveningReminder;
  /** Saves the evening setting; returns false when notification permission was refused. */
  setEvening: (next: EveningReminder) => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
};

const ReminderContext = createContext<ReminderState | null>(null);

/**
 * Keeps the device's pending notifications in step with the plan, today's progress and the
 * evening setting. Evening settings stay on this device; per-item times travel with the plan.
 */
export function ReminderProvider({ children }: { children: ReactNode }) {
  const { plan, logs, loaded, haid } = useLogs();
  const { days, adzan, city } = usePrayer();
  const [evening, setEveningState] = useState<EveningReminder>(DEFAULT_EVENING);
  const [foregrounds, setForegrounds] = useState(0);

  useEffect(() => {
    configureNotifications();
    AsyncStorage.getItem(KEY).then((raw) => raw && setEveningState(JSON.parse(raw) as EveningReminder));
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setForegrounds((n) => n + 1));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(async () => {
      if (!(await hasPermission())) return;
      const now = new Date();
      const prayers = adzan ? upcomingPrayers(days, now) : [];
      await replaceScheduled(buildSchedule({ items: plan.items, logs, evening, prayers, city: city?.name ?? '', haid, now }));
    }, RESCHEDULE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [plan, logs, evening, loaded, foregrounds, days, adzan, city, haid]);

  const setEvening = useCallback(async (next: EveningReminder) => {
    if (next.enabled && !(await ensurePermission())) return false;
    setEveningState(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return true;
  }, []);

  const value = useMemo(() => ({ evening, setEvening, requestPermission: ensurePermission }), [evening, setEvening]);
  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminders(): ReminderState {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminders must be used inside ReminderProvider');
  return ctx;
}
