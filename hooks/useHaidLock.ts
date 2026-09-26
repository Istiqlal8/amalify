import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

const KEY = 'amalify.haidLock.v1';

// `enabled` is remembered; `open` lasts until the app goes to the background.
let state = { enabled: false, open: false, loaded: false };
const listeners = new Set<() => void>();

function set(patch: Partial<typeof state>): void {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

AsyncStorage.getItem(KEY).then((raw) => set({ enabled: raw === '1', loaded: true }));
AppState.addEventListener('change', (s) => s === 'background' && set({ open: false }));

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Asks for the phone's fingerprint, face or screen lock. */
async function verify(prompt: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({ promptMessage: prompt, cancelLabel: 'Batal' });
  return result.success;
}

export async function unlockHaid(): Promise<void> {
  if (await verify('Buka menu Haid')) set({ open: true });
}

/** Turning the lock on or off both ask for the phone lock first. */
export async function toggleHaidLock(): Promise<void> {
  if (!(await LocalAuthentication.isEnrolledAsync())) throw new Error('Aktifkan dulu kunci layar atau sidik jari di HP.');
  if (!(await verify(state.enabled ? 'Matikan kunci Haid' : 'Aktifkan kunci Haid'))) return;
  const enabled = !state.enabled;
  await AsyncStorage.setItem(KEY, enabled ? '1' : '0');
  set({ enabled, open: true });
}

/** Optional lock on the haid menu, using the phone's own biometrics or screen lock. */
export function useHaidLock(): { enabled: boolean; locked: boolean; loaded: boolean } {
  const s = useSyncExternalStore(subscribe, () => state);
  return { enabled: s.enabled, loaded: s.loaded, locked: s.enabled && !s.open };
}
