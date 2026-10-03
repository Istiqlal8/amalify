import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { cadenceKey, cadenceOf, type Cadence } from '@/domain/cadence';
import { setCadenceCount, type CadenceLogs } from '@/domain/cadenceLog';
import type { PlanItem } from '@/domain/plan';
import { usePersisted } from '@/hooks/usePersisted';
import * as store from '@/storage/localStore';

export type CadenceState = {
  cadenceLogs: CadenceLogs;
  cadenceLoaded: boolean;
  setCadenceLogs: Dispatch<SetStateAction<CadenceLogs>>;
  /** Records progress for an item in the bucket its cadence is in today. */
  setCadence: (cadence: Cadence, id: string, value: number) => void;
};

/** Buckets longer than a day, kept apart from the day counts so daily percentages never move. */
export function useCadenceLog(today: string, items: PlanItem[]): CadenceState {
  const [cadenceLogs, setCadenceLogs, cadenceLoaded] = usePersisted<CadenceLogs>({}, store.loadCadence, store.saveCadence);

  const setCadence = useCallback((cadence: Cadence, id: string, value: number) => {
    const bucket = items.filter((it) => cadenceOf(it) === cadence);
    setCadenceLogs((l) => setCadenceCount(l, cadenceKey(cadence, today), id, value, Date.now(), bucket));
  }, [today, items, setCadenceLogs]);

  return { cadenceLogs, cadenceLoaded, setCadenceLogs, setCadence };
}
