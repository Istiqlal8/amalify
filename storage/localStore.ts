import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CadenceLogs } from '@/domain/cadenceLog';
import { migrateLogs, type Logs } from '@/domain/dayLog';
import { EMPTY_HAID, type HaidLog } from '@/domain/haid';
import type { CustomCategory, MonthlyBudget, PersonalEntry } from '@/domain/personalFinance';
import { DEFAULT_PLAN, type Plan } from '@/domain/plan';
import { EMPTY_TILAWAH, type TilawahLog } from '@/domain/tilawah';

const LOGS_KEY = 'amalify.logs.v1';
const PLAN_KEY = 'amalify.plan.v1';
const HAID_KEY = 'amalify.haid.v1';
const TILAWAH_KEY = 'amalify.tilawah.v1';
const CADENCE_KEY = 'amalify.cadence.v1';
const FINANCE_KEY = 'amalify.finance.v1';
const BUDGET_KEY = 'amalify.budgets.v1';
const FINANCE_CATS_KEY = 'amalify.financeCats.v1';

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

export async function loadCadence(): Promise<CadenceLogs> {
  const raw = await AsyncStorage.getItem(CADENCE_KEY);
  return raw ? (JSON.parse(raw) as CadenceLogs) : {};
}

export async function saveCadence(cadence: CadenceLogs): Promise<void> {
  await AsyncStorage.setItem(CADENCE_KEY, JSON.stringify(cadence));
}

export async function loadFinance(): Promise<PersonalEntry[]> {
  const raw = await AsyncStorage.getItem(FINANCE_KEY);
  return raw ? (JSON.parse(raw) as PersonalEntry[]) : [];
}

export async function saveFinance(entries: PersonalEntry[]): Promise<void> {
  await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(entries));
}

export async function loadBudgets(): Promise<MonthlyBudget[]> {
  const raw = await AsyncStorage.getItem(BUDGET_KEY);
  return raw ? (JSON.parse(raw) as MonthlyBudget[]) : [];
}

export async function saveBudgets(budgets: MonthlyBudget[]): Promise<void> {
  await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

export async function loadFinanceCats(): Promise<CustomCategory[]> {
  const raw = await AsyncStorage.getItem(FINANCE_CATS_KEY);
  return raw ? (JSON.parse(raw) as CustomCategory[]) : [];
}

export async function saveFinanceCats(cats: CustomCategory[]): Promise<void> {
  await AsyncStorage.setItem(FINANCE_CATS_KEY, JSON.stringify(cats));
}
