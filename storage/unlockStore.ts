import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_FLOWER, isFlowerId } from '@/domain/flowers';
import { EMPTY_UNLOCKS, mergeUnlocks, type Unlocks } from '@/domain/shop';

const UNLOCKS_KEY = 'amalify.unlocks.v1';
// Written by ThemeProvider; read once here so users from before the shop keep the flower they had.
const FLOWER_KEY = 'amalify.flower.v1';

export async function loadUnlocks(): Promise<Unlocks> {
  const raw = await AsyncStorage.getItem(UNLOCKS_KEY);
  if (raw) return mergeUnlocks(EMPTY_UNLOCKS, JSON.parse(raw));
  const flower = await AsyncStorage.getItem(FLOWER_KEY);
  const gift = flower && isFlowerId(flower) && flower !== DEFAULT_FLOWER ? flower : null;
  return { ...EMPTY_UNLOCKS, gift };
}

export async function saveUnlocks(unlocks: Unlocks): Promise<void> {
  await AsyncStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
}
