import { type AudioPlayer, createAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';

import { usePlayerPrefs } from '@/hooks/usePlayerPrefs';
import { useMurottalStatus } from '@/providers/MurottalProvider';

import { AMBIENCES } from './ambiences';

// The files are levelled to about -20 dB, so this keeps them under the recitation.
const VOLUME = 0.6;

/** The chosen background sound, looping under the recitation; it plays and pauses with the recitation. */
export function AmbiencePlayer() {
  const { ambience } = usePlayerPrefs();
  const { playing } = useMurottalStatus();
  const source = AMBIENCES.find((a) => a.id === ambience)?.source ?? null;
  const player = useRef<AudioPlayer | null>(null);

  // Created and released in the same effect, so a re-run (StrictMode, fast refresh) never touches a
  // released player.
  useEffect(() => {
    if (source === null) return;
    const p = createAudioPlayer(source);
    p.loop = true;
    p.volume = VOLUME;
    player.current = p;
    return () => {
      player.current = null;
      p.release();
    };
  }, [source]);

  useEffect(() => {
    if (playing) player.current?.play();
    else player.current?.pause();
  }, [playing, source]);

  return null;
}
