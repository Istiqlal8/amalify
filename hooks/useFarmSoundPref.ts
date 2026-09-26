import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';

import { usePersisted } from '@/hooks/usePersisted';

const KEY = 'amalify.farmSound.v1';

async function load(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) !== 'off';
}

async function save(on: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, on ? 'on' : 'off');
}

/** Farm sound on/off, kept on this device only; on by default. */
export function useFarmSoundPref(): { on: boolean; toggle: () => void } {
  const [on, setOn] = usePersisted(true, load, save);
  const toggle = useCallback(() => setOn((v) => !v), [setOn]);
  return { on, toggle };
}
