import { useCallback, type Dispatch, type SetStateAction } from 'react';

import * as tilawahs from '@/domain/tilawah';
import { usePersisted } from '@/hooks/usePersisted';
import * as store from '@/storage/localStore';

export type TilawahState = {
  tilawah: tilawahs.TilawahLog;
  tilawahLoaded: boolean;
  setTilawah: Dispatch<SetStateAction<tilawahs.TilawahLog>>;
  /** Records a sitting; false when the range is invalid. */
  addTilawah: (from: tilawahs.AyahRef, to: tilawahs.AyahRef) => boolean;
  /** Changes a sitting's range; false when invalid. */
  editTilawah: (id: string, from: tilawahs.AyahRef, to: tilawahs.AyahRef) => boolean;
  removeTilawah: (id: string) => void;
};

/**
 * The reading journal. It stands apart from the amalan checklist: recording a sitting never ticks
 * the tilawah amalan, which the user checks off on their own.
 */
export function useTilawahLog(today: string): TilawahState {
  const [tilawah, setTilawah, tilawahLoaded] = usePersisted(tilawahs.EMPTY_TILAWAH, store.loadTilawah, store.saveTilawah);

  const addTilawah = useCallback((from: tilawahs.AyahRef, to: tilawahs.AyahRef) => {
    const pages = tilawahs.pagesBetween(from, to);
    if (pages === null) return false;
    const now = Date.now();
    const session = { id: `t${now.toString(36)}`, day: today, from, to, pages, at: now };
    setTilawah((t) => tilawahs.addSession(t, session, now));
    return true;
  }, [today, setTilawah]);

  const editTilawah = useCallback((id: string, from: tilawahs.AyahRef, to: tilawahs.AyahRef) => {
    const session = tilawah.sessions.find((s) => s.id === id);
    const pages = tilawahs.pagesBetween(from, to);
    if (!session || pages === null) return false;
    setTilawah((t) => tilawahs.updateSession(t, id, from, to, pages, Date.now()));
    return true;
  }, [tilawah, setTilawah]);

  const removeTilawah = useCallback((id: string) => {
    if (!tilawah.sessions.some((s) => s.id === id)) return;
    setTilawah((t) => tilawahs.removeSession(t, id, Date.now()));
  }, [tilawah, setTilawah]);

  return { tilawah, tilawahLoaded, setTilawah, addTilawah, editTilawah, removeTilawah };
}
