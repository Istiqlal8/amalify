import AsyncStorage from '@react-native-async-storage/async-storage';

import { migrateLogs, type Logs } from '@/domain/dayLog';
import { EMPTY_HAID, type HaidLog } from '@/domain/haid';
import { DEFAULT_PLAN, type Plan } from '@/domain/plan';
import { EMPTY_TILAWAH, type TilawahLog } from '@/domain/tilawah';

const LOGS_KEY = 'amalify.logs.v1';
const PLAN_KEY = 'amalify.plan.v1';
const HAID_KEY = 'amalify.haid.v1';
const TILAWAH_KEY = 'amalify.tilawah.v1';

export async function loadLogs(): Promise<Logs> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  return raw ? migrateLogs(JSON.parse(raw)) : {};
}

export async function saveLogs(logs: Logs): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function loadPlan(): Promise<Plan> {
  const raw = await AsyncStorage.getItem(PLAN_KEY);
  return raw ? (JSON.parse(raw) as Plan) : DEFAULT_PLAN;
}

export async function savePlan(plan: Plan): Promise<void> {
  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export async function loadHaid(): Promise<HaidLog> {
  const raw = await AsyncStorage.getItem(HAID_KEY);
  return raw ? (JSON.parse(raw) as HaidLog) : EMPTY_HAID;
}

export async function saveHaid(haid: HaidLog): Promise<void> {
  await AsyncStorage.setItem(HAID_KEY, JSON.stringify(haid));
}

export async function loadTilawah(): Promise<TilawahLog> {
  const raw = await AsyncStorage.getItem(TILAWAH_KEY);
  return raw ? (JSON.parse(raw) as TilawahLog) : EMPTY_TILAWAH;
}

export async function saveTilawah(tilawah: TilawahLog): Promise<void> {
  await AsyncStorage.setItem(TILAWAH_KEY, JSON.stringify(tilawah));
}
