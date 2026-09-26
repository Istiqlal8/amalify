import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const KEY = 'amalify.reader.v1';

export type ReaderPrefs = { mushaf: boolean; tajweed: boolean; perKata: boolean; latin: boolean; terjemah: boolean };

const DEFAULTS: ReaderPrefs = { mushaf: false, tajweed: false, perKata: false, latin: true, terjemah: true };

// One shared copy, so the settings screen and an open surah stay in step.
let prefs = DEFAULTS;
const listeners = new Set<() => void>();

function set(next: ReaderPrefs): void {
  prefs = next;
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(KEY).then((raw) => raw && set({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReaderPrefs>) }));

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleReaderPref(key: keyof ReaderPrefs): void {
  set({ ...prefs, [key]: !prefs[key] });
  AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}

/** Quran reader display options, remembered on the device. */
export function useReaderPrefs(): ReaderPrefs {
  return useSyncExternalStore(subscribe, () => prefs);
}
