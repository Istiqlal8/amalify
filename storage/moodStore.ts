import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MoodId } from '@/domain/mood';

const KEY = 'amalify.mood.v1';

export type SavedMood = { date: string; mood: MoodId };

export async function loadMood(): Promise<SavedMood | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as SavedMood) : null;
}

export async function saveMood(saved: SavedMood): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(saved));
}
