import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { AmbienceId } from '@/components/murottal/ambiences';

const KEY = 'amalify.murottal.prefs.v1';

export type PlayerPrefs = { tint: boolean; ambience: AmbienceId; ayahText: boolean };

type Toggle = 'tint' | 'ayahText';

const DEFAULTS: PlayerPrefs = { tint: true, ambience: 'mati', ayahText: true };

// One shared copy, so the player screen and the sound that keeps going behind the mini player agree.
let prefs = DEFAULTS;
const listeners = new Set<() => void>();

function set(next: PlayerPrefs): void {
  prefs = next;
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, JSON.stringify(prefs));
}

AsyncStorage.getItem(KEY).then((raw) => {
  if (!raw) return;
  // Earlier versions had a plain rain switch.
  const saved = JSON.parse(raw) as Partial<PlayerPrefs> & { rain?: boolean };
  prefs = { ...DEFAULTS, ...(saved.rain ? { ambience: 'hujan' } : {}), ...saved };
  listeners.forEach((l) => l());
});

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function togglePlayerPref(key: Toggle): void {
  set({ ...prefs, [key]: !prefs[key] });
}

export function setAmbience(ambience: AmbienceId): void {
  set({ ...prefs, ambience });
}

/** Murottal player options, remembered on the device. */
export function usePlayerPrefs(): PlayerPrefs {
  return useSyncExternalStore(subscribe, () => prefs);
}
