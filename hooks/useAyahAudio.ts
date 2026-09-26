import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useMurottal } from '@/providers/MurottalProvider';

// Per-ayah recordings from the same CDN as the ayah text (equran.id), recited by Misyari Rasyid Al-Afasi.
const BASE = 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/';

const pad = (n: number): string => String(n).padStart(3, '0');
const ayahUrl = (surah: number, ayah: number): string => `${BASE}${pad(surah)}${pad(ayah)}.mp3`;

type AyahAudio = { playing: number | null; toggle: (ayah: number) => void; stop: () => void };

/** Plays from the tapped ayah to the end of the surah, one ayah after another. */
export function useAyahAudio(surah: number, count: number): AyahAudio {
  const player = useAudioPlayer(null);
  const murottal = useMurottal();
  const [playing, setPlaying] = useState<number | null>(null);
  const current = useRef<number | null>(null);

  const start = useCallback(
    (ayah: number | null) => {
      current.current = ayah;
      setPlaying(ayah);
      if (ayah === null) return player.pause();
      if (murottal.player.playing) murottal.player.pause();
      player.replace(ayahUrl(surah, ayah));
      player.play();
    },
    [player, murottal.player, surah],
  );

  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish || current.current === null) return;
      start(current.current < count ? current.current + 1 : null);
    });
    return () => sub.remove();
  }, [player, count, start]);

  const toggle = useCallback((ayah: number) => start(current.current === ayah ? null : ayah), [start]);
  const stop = useCallback(() => start(null), [start]);

  return { playing, toggle, stop };
}
