import { useAudioPlayer } from 'expo-audio';
import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { AMBIENCE_SOURCES, playSfx } from '@/components/farm/farmSounds';
import { AMBIENCE_VOLUME, ambienceFor, type Sfx, soundAllowed } from '@/domain/farmSound';
import type { ThemeId } from '@/domain/shop';
import { useFarmSoundPref } from '@/hooks/useFarmSoundPref';
import { useMurottal, useMurottalStatus } from '@/providers/MurottalProvider';

const FADE_MS = 800;
const FADE_STEPS = 8;

type FarmAudio = { on: boolean; toggle: () => void; sfx: (name: Sfx) => void };

/**
 * Nature ambience for the farm's theme, faded in while the screen is in front and faded out on
 * blur, background or when switched off; plus guarded effects. Silent whenever Murottal plays.
 */
export function useFarmAudio(theme: ThemeId | null): FarmAudio {
  const { on, toggle } = useFarmSoundPref();
  const { player: murottal } = useMurottal();
  const murottalPlaying = useMurottalStatus().playing;
  const focused = useIsFocused();
  const active = useAppActive() && focused;
  const allowed = soundAllowed(on, murottalPlaying, active);
  const ambience = useAudioPlayer(theme ? AMBIENCE_SOURCES[ambienceFor(theme)] : null);
  useEffect(() => {
    if (!theme) return;
    ambience.loop = true;
    return fade(ambience, allowed ? AMBIENCE_VOLUME : 0);
  }, [ambience, allowed, theme]);
  const sfx = useCallback(
    (name: Sfx) => {
      if (soundAllowed(on, murottal.playing, AppState.currentState === 'active')) playSfx(name);
    },
    [on, murottal],
  );
  return { on, toggle, sfx };
}

/** Steps the volume to `target`, starting playback first and pausing once silent. Returns a cancel. */
function fade(player: ReturnType<typeof useAudioPlayer>, target: number): () => void {
  if (target > 0 && !player.playing) {
    player.volume = 0;
    player.play();
  }
  const from = player.volume;
  let step = 0;
  const timer = setInterval(() => {
    step += 1;
    player.volume = from + ((target - from) * step) / FADE_STEPS;
    if (step < FADE_STEPS) return;
    clearInterval(timer);
    if (target === 0) player.pause();
  }, FADE_MS / FADE_STEPS);
  return () => clearInterval(timer);
}

function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}
