import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { Motion } from '@/components/farm/Walker';
import { animalFor, applyPos, mergePresence, parsePresence, type Players, type PosMessage } from '@/domain/groupFarm';
import { supabase } from '@/services/supabase';

const SEND_EVERY_MS = 125; // ~8 position updates per second while moving

const posOf = (userId: string, m: Motion): PosMessage => ({
  userId,
  x: m.pos.value.x,
  y: m.pos.value.y,
  facing: m.face.value,
  moving: m.vec.value.x !== 0 || m.vec.value.y !== 0,
});

/**
 * Joins the realtime channel `group-farm:<groupId>`: tracks who is on the farm (presence) and
 * shares positions (broadcast 'pos'). Leaves when unmounted or when the app goes to the background.
 */
export function useFarmPresence(groupId: string | null, userId: string | null, name: string, motion: Motion): Players {
  const [players, setPlayers] = useState<Players>({});
  const active = useAppActive();
  useEffect(() => {
    if (!supabase || !groupId || !userId || !active) return;
    const db = supabase;
    const channel = db.channel(`group-farm:${groupId}`, { config: { presence: { key: userId } } });
    const send = () => channel.send({ type: 'broadcast', event: 'pos', payload: posOf(userId, motion) });
    channel
      .on('presence', { event: 'sync' }, () => setPlayers((p) => mergePresence(p, parsePresence(channel.presenceState()), userId)))
      .on('presence', { event: 'join' }, ({ key }) => key !== userId && send())
      .on('broadcast', { event: 'pos' }, ({ payload }) => setPlayers((p) => applyPos(p, payload)))
      .subscribe((status) => status === 'SUBSCRIBED' && channel.track({ userId, name, animal: animalFor(userId) }));
    let wasMoving = false;
    const timer = setInterval(() => {
      const moving = motion.vec.value.x !== 0 || motion.vec.value.y !== 0;
      if (moving || wasMoving) send(); // keep sending while moving, plus once on stopping
      wasMoving = moving;
    }, SEND_EVERY_MS);
    return () => {
      clearInterval(timer);
      db.removeChannel(channel);
      setPlayers({});
    };
  }, [groupId, userId, name, active, motion]);
  return players;
}

/** False while the app is in the background. */
function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state !== 'background'));
    return () => sub.remove();
  }, []);
  return active;
}
