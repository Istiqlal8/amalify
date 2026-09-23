import { createContext, useCallback, useContext, useEffect, useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { dateKey, dayPercent, mergeLogs, resnapshot, setCount, type DayEntry, type Logs } from '@/domain/dayLog';
import * as haids from '@/domain/haid';
import * as plans from '@/domain/plan';
import { useDriveSync, type SyncStatus } from '@/hooks/useDriveSync';
import { useGroupSummary } from '@/hooks/useGroupSummary';
import { usePersisted } from '@/hooks/usePersisted';
import { useAuth } from '@/providers/AuthProvider';
import type { DriveFile } from '@/storage/driveStore';
import * as store from '@/storage/localStore';

type Actions = {
  setToday: (id: string, value: number) => void;
  addItem: (draft: plans.ItemDraft) => void;
  updateItem: (id: string, draft: plans.ItemDraft) => void;
  removeItem: (id: string) => void;
  startHaid: () => void;
  endHaid: () => void;
};

type LogsState = Actions & {
  setHaidStart: (start: string) => void;
  removeHaid: (start: string) => void;
  logs: Logs;
  plan: plans.Plan;
  haid: haids.HaidLog;
  today: string;
  todayHaid: boolean;
  loaded: boolean;
  todayEntry: DayEntry | undefined;
  todayPercent: number;
  sync: SyncStatus;
};

const LogsContext = createContext<LogsState | null>(null);

export function LogsProvider({ children }: { children: ReactNode }) {
  const { user, groupsReady } = useAuth();
  const [logs, setLogs, logsLoaded] = usePersisted<Logs>({}, store.loadLogs, store.saveLogs);
  const [plan, setPlan, planLoaded] = usePersisted(plans.DEFAULT_PLAN, store.loadPlan, store.savePlan);
  const [haid, setHaid, haidLoaded] = usePersisted(haids.EMPTY_HAID, store.loadHaid, store.saveHaid);
  const loaded = logsLoaded && planLoaded && haidLoaded;
  const today = dateKey(new Date());

  const applyRemote = useCallback((remote: DriveFile) => {
    setLogs((l) => mergeLogs(l, remote.logs));
    setPlan((p) => plans.newerPlan(p, remote.plan));
    setHaid((h) => haids.newerHaid(h, remote.haid));
  }, [setLogs, setPlan, setHaid]);
  const local = useMemo(() => ({ logs, plan, haid }), [logs, plan, haid]);
  const sync = useDriveSync(user !== null, loaded, local, applyRemote);

  const todayHaid = haids.isHaidDay(haid, today);
  const todayItems = useMemo(() => haids.itemsForDay(plan.items, todayHaid), [plan.items, todayHaid]);
  useEffect(() => {
    if (loaded) setLogs((l) => resnapshot(l, today, todayItems));
  }, [loaded, today, todayItems, setLogs]);
  const todayEntry = logs[today];
  const todayPercent = dayPercent(todayEntry, todayItems);
  useGroupSummary(groupsReady, today, todayPercent);

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
  const value = useMemo(
    () => ({ logs, plan, haid, today, todayHaid, loaded, todayEntry, todayPercent, sync, setHaidStart, removeHaid, ...actions }),
    [logs, plan, haid, today, todayHaid, loaded, todayEntry, todayPercent, sync, setHaidStart, removeHaid, actions],
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
