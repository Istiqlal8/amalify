import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { countOf, setCount, type Logs } from '@/domain/dayLog';
import { isHaidDay, itemsForDay, type HaidLog } from '@/domain/haid';
import { TILAWAH_ID, type PlanItem } from '@/domain/plan';
import * as tilawahs from '@/domain/tilawah';
import { usePersisted } from '@/hooks/usePersisted';
import * as store from '@/storage/localStore';

export type TilawahState = {
  tilawah: tilawahs.TilawahLog;
  tilawahLoaded: boolean;
  setTilawah: Dispatch<SetStateAction<tilawahs.TilawahLog>>;
  /** Records a sitting and adds its pages to today's tilawah count; false when the range is invalid. */
  addTilawah: (from: tilawahs.AyahRef, to: tilawahs.AyahRef) => boolean;
  /** Deletes a sitting and takes its pages back off the day it was read. */
  removeTilawah: (id: string) => void;
};

/** Sittings live apart from the day counts, which stay the source of truth for percentages. */
export function useTilawahLog(today: string, items: PlanItem[], haid: HaidLog, setLogs: Dispatch<SetStateAction<Logs>>): TilawahState {
  const [tilawah, setTilawah, tilawahLoaded] = usePersisted(tilawahs.EMPTY_TILAWAH, store.loadTilawah, store.saveTilawah);

  const shiftPages = useCallback((day: string, delta: number) => {
    const dayItems = itemsForDay(items, isHaidDay(haid, day));
    setLogs((l) => setCount(l, day, TILAWAH_ID, countOf(l[day], TILAWAH_ID) + delta, Date.now(), dayItems));
  }, [items, haid, setLogs]);

  const addTilawah = useCallback((from: tilawahs.AyahRef, to: tilawahs.AyahRef) => {
    const pages = tilawahs.pagesBetween(from, to);
    if (pages === null) return false;
    const now = Date.now();
    const session = { id: `t${now.toString(36)}`, day: today, from, to, pages, at: now };
    setTilawah((t) => tilawahs.addSession(t, session, now));
    shiftPages(today, pages);
    return true;
  }, [today, setTilawah, shiftPages]);

  const removeTilawah = useCallback((id: string) => {
    const session = tilawah.sessions.find((s) => s.id === id);
    if (!session) return;
    setTilawah((t) => tilawahs.removeSession(t, id, Date.now()));
    shiftPages(session.day, -session.pages);
  }, [tilawah, setTilawah, shiftPages]);

  return { tilawah, tilawahLoaded, setTilawah, addTilawah, removeTilawah };
}
