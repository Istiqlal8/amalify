import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { upcomingPrayers } from '@/domain/prayer';
import { DEFAULT_REMINDER_SOUND, isValidReminderSound, type ReminderSoundId } from '@/domain/reminderSound';
import { buildSchedule, DEFAULT_EVENING, type EveningReminder } from '@/domain/reminders';
import { EMPTY_HAID } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';
import { useProfile } from '@/providers/ProfileProvider';
import { usePrayer } from '@/providers/PrayerProvider';
import { configureNotifications, ensurePermission, hasPermission, replaceScheduled } from '@/services/notifications';

const KEY = 'amalify.evening.v1';
const SOUND_KEY = 'amalify.reminder-sound.v1';
const RESCHEDULE_DELAY_MS = 1500;

type ReminderState = {
  evening: EveningReminder;
  /** Saves the evening setting; returns false when notification permission was refused. */
  setEvening: (next: EveningReminder) => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  sound: ReminderSoundId;
  setSound: (next: ReminderSoundId) => Promise<void>;
};

const ReminderContext = createContext<ReminderState | null>(null);

/**
 * Keeps the device's pending notifications in step with the plan, today's progress and the
 * evening setting. Evening settings stay on this device; per-item times travel with the plan.
 */
export function ReminderProvider({ children }: { children: ReactNode }) {
  const { plan, logs, cadenceLogs, loaded, haid } = useLogs();
  const { isMale } = useProfile();
  const { days, adzan, city } = usePrayer();
  const [evening, setEveningState] = useState<EveningReminder>(DEFAULT_EVENING);
  const [sound, setSoundState] = useState<ReminderSoundId>(DEFAULT_REMINDER_SOUND);
  const [foregrounds, setForegrounds] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_KEY).then((raw) => {
      if (raw && isValidReminderSound(raw)) {
        setSoundState(raw);
        configureNotifications(raw);
      } else {
        configureNotifications(DEFAULT_REMINDER_SOUND);
      }
    });
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
      await replaceScheduled(
        buildSchedule({ items: plan.items, logs, cadence: cadenceLogs, evening, prayers, city: city?.name ?? '', haid: isMale ? EMPTY_HAID : haid, now }),
        sound,
      );
    }, RESCHEDULE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [plan, logs, cadenceLogs, evening, sound, loaded, foregrounds, days, adzan, city, haid, isMale]);

  const setEvening = useCallback(async (next: EveningReminder) => {
    if (next.enabled && !(await ensurePermission())) return false;
    setEveningState(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return true;
  }, []);

  const setSound = useCallback(async (next: ReminderSoundId) => {
    setSoundState(next);
    configureNotifications(next);
    await AsyncStorage.setItem(SOUND_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ evening, setEvening, requestPermission: ensurePermission, sound, setSound }),
    [evening, setEvening, sound, setSound],
  );
  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminders(): ReminderState {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminders must be used inside ReminderProvider');
  return ctx;
}
