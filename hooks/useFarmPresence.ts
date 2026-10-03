import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import type { Motion } from '@/components/farm/Walker';
import { applyPos, mergePresence, parsePresence, type Players, type PosMessage, type PresenceMeta } from '@/domain/groupFarm';
import { supabase } from '@/services/supabase';

const TICK_MS = 125; // how often motion is sampled; starting, stopping and mounting send at once
const SEND_MS = 250; // the gap between position messages of a walk, which receivers glide over
const MAX_SEND_MS = 1000; // however big the crowd, a walking player is never quieter than this
/** Players a farm sends at the full rate for; past this every player sends proportionally less. */
const CROWD = 6;
/** Cells moved since the last send below which a position is not worth a message. */
const DEAD_BAND = 0.2;

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
  // Every send fans out to everyone present, so the cost of the farm grows with the square of the
  // players. The send rate falls with the crowd to hold that back; the interval reads it live.
  const crowd = useRef(1);
  useEffect(() => {
    crowd.current = Object.keys(players).length + 1;
  }, [players]);
  useEffect(() => {
    if (!supabase || !groupId || !me || !active) return;
    const { userId } = me;
    const db = supabase;
    const channel = db.channel(`group-farm:${groupId}`, { config: { presence: { key: userId } } });
    let sent = { x: motion.pos.value.x, y: motion.pos.value.y };
    let sentAt = 0;
    const send = () => {
      sent = { x: motion.pos.value.x, y: motion.pos.value.y };
      sentAt = Date.now();
      return channel.send({ type: 'broadcast', event: 'pos', payload: posOf(userId, motion) });
    };
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
      const gap = Math.min(SEND_MS * Math.ceil(crowd.current / CROWD), MAX_SEND_MS);
      const far = Math.hypot(motion.pos.value.x - sent.x, motion.pos.value.y - sent.y) >= DEAD_BAND;
      // Always report mounting, dismounting, jumping, starting and stopping; report a walk only
      // once it has covered ground, which skips the ticks spent pushing against a fence.
      if (now !== stance || moving !== wasMoving || (far && Date.now() - sentAt >= gap)) send();
      wasMoving = moving;
      stance = now;
    }, TICK_MS);
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
