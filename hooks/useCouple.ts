import { useCallback, useEffect, useState } from 'react';

import { myRole, type CouplePair } from '@/domain/couple';
import type { HaidLog } from '@/domain/haid';
import * as couple from '@/services/coupleService';
import { supabase } from '@/services/supabase';

export type CoupleState = {
  pair: CouplePair | null;
  myId: string | null;
  /** 'wife' bila saya pemilik data, 'husband' bila saya suami yang membaca. */
  role: 'wife' | 'husband' | null;
  linked: boolean;
  /** Snapshot haid istri dari server (untuk suami; istri memakai data lokalnya sendiri). */
  partnerHaid: HaidLog | null;
  partnerName: string | null;
  loading: boolean;
  error: string | null;
  create: () => Promise<void>;
  regen: () => Promise<void>;
  join: (code: string) => Promise<void>;
  leave: () => Promise<void>;
  refresh: () => Promise<void>;
};

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Status koneksi pasangan + data Haid pasangannya dari server. */
export function useCouple(ready: boolean): CoupleState {
  const [pair, setPair] = useState<CouplePair | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [partnerHaid, setPartnerHaid] = useState<HaidLog | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !ready) return;
    setLoading(true);
    setError(null);
    try {
      const { pair: p, myId: id } = await couple.myPair(supabase);
      setPair(p);
      setMyId(id);
      if (!p || !id) {
        setPartnerHaid(null);
        setPartnerName(null);
        return;
      }
      if (myRole(p, id) === 'husband') {
        const [log, name] = await Promise.all([
          couple.fetchPartnerHaid(supabase, p.wife_id),
          couple.fetchPartnerName(supabase, p.wife_id),
        ]);
        setPartnerHaid(log);
        setPartnerName(name);
      } else {
        // Istri: hanya nama suami bila sudah terhubung; datanya pakai lokal.
        setPartnerHaid(null);
        setPartnerName(
          p.husband_id ? await couple.fetchPartnerName(supabase, p.husband_id).catch(() => null) : null,
        );
      }
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  const run = useCallback(
    async (task: () => Promise<unknown>) => {
      if (!supabase) return;
      setLoading(true);
      setError(null);
      try {
        await task();
        await refresh();
      } catch (e) {
        setError(message(e));
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  const create = useCallback(() => run(() => couple.createInvite(supabase!)), [run]);
  const regen = useCallback(() => run(() => couple.regenCode(supabase!)), [run]);
  const join = useCallback((code: string) => run(() => couple.joinCouple(supabase!, code)), [run]);
  const leave = useCallback(() => run(() => couple.leaveCouple(supabase!)), [run]);

  const role = pair && myId ? myRole(pair, myId) : null;
  return {
    pair,
    myId,
    role,
    linked: !!pair && pair.husband_id !== null,
    partnerHaid,
    partnerName,
    loading,
    error,
    create,
    regen,
    join,
    leave,
    refresh,
  };
}

/** Mendorong HaidLog istri ke server; dipanggil saat datanya berubah dan sudah terhubung. */
export async function pushPartnerHaid(log: HaidLog): Promise<void> {
  if (!supabase) return;
  await couple.pushHaid(supabase, log);
}
