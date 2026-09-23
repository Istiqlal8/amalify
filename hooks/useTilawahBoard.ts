import { useEffect, useState } from 'react';

import { periodRange, type Period } from '@/domain/period';
import { tilawahBoard, type BoardRow } from '@/services/leaderboardService';
import { supabase } from '@/services/supabase';

type BoardState = { rows: BoardRow[]; loading: boolean; error: string | null };

/** `groupId` null = global board. */
export function useTilawahBoard(ready: boolean, period: Period, today: string, groupId: string | null): BoardState {
  const [state, setState] = useState<BoardState>({ rows: [], loading: false, error: null });

  useEffect(() => {
    if (!ready || !supabase) return;
    const { from, to } = periodRange(period, today);
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    tilawahBoard(supabase, from, to, groupId)
      .then((rows) => live && setState({ rows, loading: false, error: null }))
      .catch((e: unknown) => live && setState({ rows: [], loading: false, error: e instanceof Error ? e.message : String(e) }));
    return () => {
      live = false;
    };
  }, [ready, period, today, groupId]);

  return state;
}
