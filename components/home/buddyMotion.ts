import { useEffect, useState } from 'react';
import {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Facing } from '@/domain/farm';

// Mostly facing the reader, now and then glancing to either side.
const GLANCES: Facing[] = ['down', 'down', 'left', 'down', 'down', 'right'];
const GLANCE_MS = 1600;
const BLINK_MS = 140;

/** Endless 0→1→0 breathing phase, offset by `delay` so two characters don't move in step. */
export function useBreath(delay: number): SharedValue<number> {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delay, withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true)));
  }, [t, delay]);
  return t;
}

/** Steps through GLANCES so the character looks around. */
export function useGlance(): Facing {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI((n) => (n + 1) % GLANCES.length), GLANCE_MS);
    return () => clearInterval(timer);
  }, []);
  return GLANCES[i];
}

/** True for a short moment every 2.5–5 s, sometimes twice in a row, like a real blink. */
export function useBlink(): boolean {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (wait: number) => {
      timer = setTimeout(() => {
        setClosed(true);
        timer = setTimeout(() => {
          setClosed(false);
          schedule(Math.random() < 0.25 ? 180 : 2500 + Math.random() * 2500);
        }, BLINK_MS);
      }, wait);
    };
    schedule(1200 + Math.random() * 2000);
    return () => clearTimeout(timer);
  }, []);
  return closed;
}

/** Bob plus squash-and-stretch from the breath, plus a jump offset. */
export function useBodyStyle(breath: SharedValue<number>, jump: SharedValue<number>, rise: number) {
  return useAnimatedStyle(() => ({
    transform: [
      { translateY: -breath.value * rise + jump.value },
      { scaleX: 1 + 0.03 * (1 - breath.value) },
      { scaleY: 1 - 0.03 * (1 - breath.value) },
    ],
  }));
}

/** A tap reaction: the character jumps, the pet follows a beat later, and a heart floats up. */
export function useCheer() {
  const jump = useSharedValue(0);
  const petJump = useSharedValue(0);
  const heart = useSharedValue(0);
  const heartStyle = useAnimatedStyle(() => ({
    opacity: heart.value === 0 ? 0 : 1 - heart.value,
    transform: [{ translateY: -heart.value * 60 }, { scale: 0.6 + heart.value * 0.6 }],
  }));
  const cheer = () => {
    jump.set(withSequence(withTiming(-34, { duration: 180, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6 })));
    petJump.set(withDelay(160, withSequence(withTiming(-20, { duration: 160 }), withSpring(0, { damping: 6 }))));
    heart.set(0.001);
    heart.set(withTiming(1, { duration: 900 }, () => heart.set(0)));
  };
  return { jump, petJump, heartStyle, cheer };
}
