import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * True for `durationMs` after the percentage crosses into 100 while the user is here.
 * The render where `armed` first turns true (storage finished loading) only sets the baseline,
 * so opening the app on an already-complete day does not replay it.
 */
export function useBloomCelebration(percent: number, armed: boolean, durationMs: number): boolean {
  const reduced = useReducedMotion();
  const previous = useRef(percent);
  const wasArmed = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const bloomed = wasArmed.current && percent >= 100 && previous.current < 100;
    previous.current = percent;
    wasArmed.current = armed;
    if (!bloomed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!reduced) setPlaying(true);
  }, [percent, armed, reduced]);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPlaying(false), durationMs);
    return () => clearTimeout(timer);
  }, [playing, durationMs]);

  return playing;
}
