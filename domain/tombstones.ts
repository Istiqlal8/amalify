/**
 * Deletions that must survive a merge. Drive sync unions two copies by id, so an item removed on
 * one device would come straight back from the other; a tombstone records that the id is gone.
 * Ids are never reused, so a tombstone is permanent. Keyed `kind:id`, valued by when it was buried.
 */
export type Tombstones = Record<string, number>;

export type TombKind = 'finance' | 'cat' | 'rule';

export function bury(stones: Tombstones, kind: TombKind, id: string, now: number): Tombstones {
  return { ...stones, [`${kind}:${id}`]: now };
}

/** Union of both sides; nothing is ever un-deleted. */
export function mergeTombstones(local: Tombstones, remote: Tombstones | undefined): Tombstones {
  if (!remote) return local;
  const fresh = Object.keys(remote).filter((key) => !(key in local));
  return fresh.length === 0 ? local : { ...remote, ...local };
}

/** `items` without the buried ones; the same array when none is buried, so callers can skip a re-render. */
export function alive<T extends { id: string }>(items: T[], stones: Tombstones, kind: TombKind): T[] {
  const kept = items.filter((it) => !(`${kind}:${it.id}` in stones));
  return kept.length === items.length ? items : kept;
}
