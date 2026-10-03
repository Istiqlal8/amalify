import { createContext, useCallback, useContext, useEffect, useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import type { Cadence } from '@/domain/cadence';
import { mergeCadenceLogs, type CadenceLogs } from '@/domain/cadenceLog';
import { countOf, dateKey, dayPercent, mergeLogs, resnapshot, setCount, type DayEntry, type Logs } from '@/domain/dayLog';
import * as haids from '@/domain/haid';
import { mergeBudgets, mergeCats, mergeFinance, type CustomCategory, type MonthlyBudget, type PersonalEntry } from '@/domain/personalFinance';
import * as plans from '@/domain/plan';
import { EMPTY_UNLOCKS, mergeUnlocks, type Unlocks } from '@/domain/shop';
import { newerTilawah } from '@/domain/tilawah';
import { useCadenceLog } from '@/hooks/useCadenceLog';
import { useDriveSync, type SyncNow, type SyncStatus } from '@/hooks/useDriveSync';
import { useGroupSummary } from '@/hooks/useGroupSummary';
import { usePersisted } from '@/hooks/usePersisted';
import { useTilawahLog, type TilawahState } from '@/hooks/useTilawahLog';
import { useAuth } from '@/providers/AuthProvider';
import { useProfile } from '@/providers/ProfileProvider';
import type { DriveFile } from '@/storage/driveStore';
import * as store from '@/storage/localStore';
import { loadUnlocks, saveUnlocks } from '@/storage/unlockStore';

type Actions = {
  setToday: (id: string, value: number) => void;
  addItem: (draft: plans.ItemDraft) => void;
  updateItem: (id: string, draft: plans.ItemDraft) => void;
  removeItem: (id: string) => void;
  /** Replaces the whole list, for taking the group's amal list; `at` is stamped here. */
  replacePlan: (next: plans.Plan) => void;
  startHaid: () => void;
  endHaid: () => void;
};

type LogsState = Actions & Pick<TilawahState, 'tilawah' | 'addTilawah' | 'editTilawah' | 'removeTilawah'> & {
  setHaidStart: (start: string) => void;
  removeHaid: (start: string) => void;
  addHaid: (start: string, end: string) => void;
  /** Moves a finished period; ignored when the new dates clash. */
  moveHaid: (oldStart: string, start: string, end: string) => void;
  /** Edits the running period: moves its start and closes it on `end`, or keeps it running with null. */
  saveOpenPeriod: (start: string, end: string | null) => void;
  /** Day notes and care changes; these never touch which days pause sholat. */
  editHaid: (change: (h: haids.HaidLog, now: number) => haids.HaidLog) => void;
  logs: Logs;
  /** Progress on the cadences longer than a day; the daily percentage leaves these out. */
  cadenceLogs: CadenceLogs;
  setCadence: (cadence: Cadence, id: string, value: number) => void;
  plan: plans.Plan;
  haid: haids.HaidLog;
  today: string;
  todayHaid: boolean;
  loaded: boolean;
  todayEntry: DayEntry | undefined;
  todayPercent: number;
  sync: SyncStatus;
  /** Manual sync (pull, merge, push); resolves false when offline or when it fails. */
  syncNow: SyncNow;
  /** When the last push succeeded, if ever. */
  lastSynced: number | null;
  /** Shop purchases; read and changed through useRewards. */
  unlocks: Unlocks;
  setUnlocks: Dispatch<SetStateAction<Unlocks>>;
  /** Catatan keuangan pribadi; tersimpan di Drive masing-masing, bukan Supabase. */
  finance: PersonalEntry[];
  setFinance: Dispatch<SetStateAction<PersonalEntry[]>>;
  /** Batas bulanan berulang per kategori. */
  budgets: MonthlyBudget[];
  setBudgets: Dispatch<SetStateAction<MonthlyBudget[]>>;
  /** Kategori bebas buatan user. */
  financeCats: CustomCategory[];
  setFinanceCats: Dispatch<SetStateAction<CustomCategory[]>>;
};

const LogsContext = createContext<LogsState | null>(null);

export function LogsProvider({ children }: { children: ReactNode }) {
  const { user, groupsReady } = useAuth();
  const { isMale } = useProfile();
  const [logs, setLogs, logsLoaded] = usePersisted<Logs>({}, store.loadLogs, store.saveLogs);
  const [plan, setPlan, planLoaded] = usePersisted(plans.DEFAULT_PLAN, store.loadPlan, store.savePlan);
  const [haid, setHaid, haidLoaded] = usePersisted(haids.EMPTY_HAID, store.loadHaid, store.saveHaid);
  const [unlocks, setUnlocks, unlocksLoaded] = usePersisted<Unlocks>(EMPTY_UNLOCKS, loadUnlocks, saveUnlocks);
  const [finance, setFinance, financeLoaded] = usePersisted<PersonalEntry[]>([], store.loadFinance, store.saveFinance);
  const [budgets, setBudgets, budgetsLoaded] = usePersisted<MonthlyBudget[]>([], store.loadBudgets, store.saveBudgets);
  const [financeCats, setFinanceCats, catsLoaded] = usePersisted<CustomCategory[]>([], store.loadFinanceCats, store.saveFinanceCats);
  const today = dateKey(new Date());
  const { tilawah, tilawahLoaded, setTilawah, addTilawah, editTilawah, removeTilawah } = useTilawahLog(today);
  const { cadenceLogs, cadenceLoaded, setCadenceLogs, setCadence } = useCadenceLog(today, plan.items);
  const loaded = logsLoaded && planLoaded && haidLoaded && tilawahLoaded && unlocksLoaded && cadenceLoaded && financeLoaded && budgetsLoaded && catsLoaded;

  const applyRemote = useCallback((remote: DriveFile) => {
    setLogs((l) => mergeLogs(l, remote.logs));
    setPlan((p) => plans.newerPlan(p, remote.plan));
    setHaid((h) => haids.newerHaid(h, remote.haid));
    setTilawah((t) => newerTilawah(t, remote.tilawah));
    setUnlocks((u) => mergeUnlocks(u, remote.unlocks));
    setCadenceLogs((c) => mergeCadenceLogs(c, remote.cadence ?? {}));
    setFinance((f) => mergeFinance(f, remote.finance));
    setBudgets((b) => mergeBudgets(b, remote.budgets));
    setFinanceCats((c) => mergeCats(c, remote.financeCats));
  }, [setLogs, setPlan, setHaid, setTilawah, setUnlocks, setCadenceLogs, setFinance, setBudgets, setFinanceCats]);
  const local = useMemo(
    () => ({ logs, plan, haid, tilawah, unlocks, cadence: cadenceLogs, finance, budgets, financeCats }),
    [logs, plan, haid, tilawah, unlocks, cadenceLogs, finance, budgets, financeCats],
  );
  const { status: sync, syncNow, lastSynced } = useDriveSync(user !== null, loaded, local, applyRemote);

  const todayHaid = isMale ? false : haids.isHaidDay(haid, today);
  const todayItems = useMemo(
    () => haids.itemsForDay(plan.items, isMale ? false : haids.isHaidDay(haid, today)),
    [plan.items, haid, today, isMale],
  );
  useEffect(() => {
    if (loaded) setLogs((l) => resnapshot(l, today, todayItems));
  }, [loaded, today, todayItems, setLogs]);
  const todayEntry = logs[today];
  const todayPercent = dayPercent(todayEntry, todayItems);
  useGroupSummary(groupsReady, today, countOf(todayEntry, plans.TILAWAH_ID));

  const actions = useActions(today, todayItems, setLogs, setPlan, setHaid);
  const setHaidStart = useCallback((start: string) => {
    const next = haids.setOpenStart(haid, start, today, Date.now());
    if (next === haid) return;
    setLogs((l) => haids.restampHaidChange(l, haid, next, plan.items, today));
    setHaid(next);
  }, [haid, today, plan.items, setLogs, setHaid]);
  // Deleting a mistaken period re-scores its days the same way moving a start does.
  const removeHaid = useCallback((start: string) => {
    const next = haids.removePeriod(haid, start, Date.now());
    setLogs((l) => haids.restampHaidChange(l, haid, next, plan.items, today));
    setHaid(next);
  }, [haid, today, plan.items, setLogs, setHaid]);
  const addHaid = useCallback((start: string, end: string) => {
    const next = haids.addPeriod(haid, start, end, today, Date.now());
    if (next === haid) return;
    setLogs((l) => haids.restampHaidChange(l, haid, next, plan.items, today));
    setHaid(next);
  }, [haid, today, plan.items, setLogs, setHaid]);
  const moveHaid = useCallback((oldStart: string, start: string, end: string) => {
    const next = haids.editPeriod(haid, oldStart, start, end, today, Date.now());
    if (next === haid) return;
    setLogs((l) => haids.restampHaidChange(l, haid, next, plan.items, today));
    setHaid(next);
  }, [haid, today, plan.items, setLogs, setHaid]);
  const saveOpenPeriod = useCallback((start: string, end: string | null) => {
    const next = haids.saveOpenPeriod(haid, start, end ?? undefined, today, Date.now());
    if (next === haid) return;
    setLogs((l) => haids.restampHaidChange(l, haid, next, plan.items, today));
    setHaid(next);
  }, [haid, today, plan.items, setLogs, setHaid]);
  const editHaid = useCallback(
    (change: (h: haids.HaidLog, now: number) => haids.HaidLog) => setHaid((h) => change(h, Date.now())),
    [setHaid],
  );
  const value = useMemo(
    () => ({ logs, plan, haid, today, todayHaid, loaded, todayEntry, todayPercent, sync, syncNow, lastSynced, setHaidStart, removeHaid, addHaid, moveHaid, saveOpenPeriod, editHaid, tilawah, addTilawah, editTilawah, removeTilawah, unlocks, setUnlocks, cadenceLogs, setCadence, finance, setFinance, budgets, setBudgets, financeCats, setFinanceCats, ...actions }),
    [logs, plan, haid, today, todayHaid, loaded, todayEntry, todayPercent, sync, syncNow, lastSynced, setHaidStart, removeHaid, addHaid, moveHaid, saveOpenPeriod, editHaid, tilawah, addTilawah, editTilawah, removeTilawah, unlocks, setUnlocks, cadenceLogs, setCadence, finance, setFinance, budgets, setBudgets, financeCats, setFinanceCats, actions],
  );
  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

function useActions(
  today: string,
  todayItems: plans.PlanItem[],
  setLogs: Dispatch<SetStateAction<Logs>>,
  setPlan: Dispatch<SetStateAction<plans.Plan>>,
  setHaid: Dispatch<SetStateAction<haids.HaidLog>>,
): Actions {
  return useMemo(
    () => ({
      // The percentage snapshot uses today's items, so a haid day is scored without its prayers.
      setToday: (id: string, value: number) =>
        setLogs((l) => setCount(l, today, id, value, Date.now(), todayItems)),
      addItem: (draft: plans.ItemDraft) =>
        setPlan((p) => plans.addItem(p, draft, plans.newItemId(Date.now()), Date.now())),
      updateItem: (id: string, draft: plans.ItemDraft) => setPlan((p) => plans.updateItem(p, id, draft, Date.now())),
      removeItem: (id: string) => setPlan((p) => plans.removeItem(p, id, Date.now())),
      replacePlan: (next: plans.Plan) => setPlan({ items: next.items, at: Date.now() }),
      startHaid: () => setHaid((h) => haids.startHaid(h, today, Date.now())),
      endHaid: () => setHaid((h) => haids.endHaid(h, today, Date.now())),
    }),
    [today, todayItems, setLogs, setPlan, setHaid],
  );
}

export function useLogs(): LogsState {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error('useLogs must be used inside LogsProvider');
  return ctx;
}
