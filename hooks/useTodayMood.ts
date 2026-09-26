import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { dateKey } from '@/domain/dayLog';
import type { Mood } from '@/domain/mood';
import { loadMood, saveMood } from '@/storage/moodStore';

type Stage = 'loading' | 'ask' | 'answered' | 'done';

/**
 * Once-a-day mood check: `ask` until the user picks, `answered` while the ayah is on screen, and
 * `done` once they leave the tab or the app, or if they already picked earlier today.
 */
export function useTodayMood(): { stage: Stage; mood: Mood | null; choose: (mood: Mood) => void } {
  const [stage, setStage] = useState<Stage>('loading');
  const [mood, setMood] = useState<Mood | null>(null);

  useEffect(() => {
    loadMood()
      .then((saved) => setStage(saved?.date === dateKey(new Date()) ? 'done' : 'ask'))
      .catch(() => setStage('ask'));
  }, []);

  const finish = useCallback(() => setStage((s) => (s === 'answered' ? 'done' : s)), []);
  useFocusEffect(useCallback(() => finish, [finish]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => state === 'background' && finish());
    return () => sub.remove();
  }, [finish]);

  const choose = (m: Mood) => {
    setMood(m);
    setStage('answered');
    void saveMood({ date: dateKey(new Date()), mood: m.id });
  };

  return { stage, mood, choose };
}
