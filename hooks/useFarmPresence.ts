import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { Motion } from '@/components/farm/Walker';
import { applyPos, mergePresence, parsePresence, type Players, type PosMessage, type PresenceMeta } from '@/domain/groupFarm';
import { supabase } from '@/services/supabase';

const SEND_EVERY_MS = 125; // ~8 position updates per second while moving

const posOf = (userId: string, m: Motion): PosMessage => ({
  userId,
  x: m.pos.value.x,
  y: m.pos.value.y,
  facing: m.face.value,
  moving: m.vec.value.x !== 0 || m.vec.value.y !== 0,
  riding: m.speed.value > 1,
  jumping: m.jump.value >= 0,
});

/** What others need to redraw us: changes in this trigger a send even when standing still. */
const stanceOf = (m: Motion) => `${m.speed.value > 1}|${m.jump.value >= 0}`;

/**
 * Joins the realtime channel `group-farm:<groupId>`: tracks who is on the farm (presence) and
 * shares positions (broadcast 'pos'). Leaves when unmounted or when the app goes to the background.
 */
export function useFarmPresence(groupId: string | null, me: PresenceMeta | null, motion: Motion): Players {
  const [players, setPlayers] = useState<Players>({});
  const active = useAppActive();
  useEffect(() => {
    if (!supabase || !groupId || !me || !active) return;
    const { userId } = me;
    const db = supabase;
    const channel = db.channel(`group-farm:${groupId}`, { config: { presence: { key: userId } } });
    const send = () => channel.send({ type: 'broadcast', event: 'pos', payload: posOf(userId, motion) });
    channel
      .on('presence', { event: 'sync' }, () => setPlayers((p) => mergePresence(p, parsePresence(channel.presenceState()), userId)))
      .on('presence', { event: 'join' }, ({ key }) => key !== userId && send())
      .on('broadcast', { event: 'pos' }, ({ payload }) => setPlayers((p) => applyPos(p, payload)))
      .subscribe((status) => status === 'SUBSCRIBED' && channel.track(me));
    let wasMoving = false;
    let stance = stanceOf(motion);
    const timer = setInterval(() => {
      const moving = motion.vec.value.x !== 0 || motion.vec.value.y !== 0;
      const now = stanceOf(motion);
      // Keep sending while moving, once on stopping, and whenever we mount, dismount or jump.
      if (moving || wasMoving || now !== stance) send();
      wasMoving = moving;
      stance = now;
    }, SEND_EVERY_MS);
    return () => {
      clearInterval(timer);
      db.removeChannel(channel);
      setPlayers({});
    };
  }, [groupId, me, active, motion]);
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
