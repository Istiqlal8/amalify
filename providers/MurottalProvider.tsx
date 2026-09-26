import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import {
  cycleRepeat,
  DEFAULT_RECITER,
  nextSurah,
  previousSurah,
  reciterById,
  SURAH_NAMES,
  type Reciter,
  type Repeat,
} from '@/domain/murottal';
import { audioSource } from '@/services/audioDownloads';

const KEY = 'amalify.murottal.v1';

const trackKey = (reciter: Reciter, surah: number): string => `${reciter.id}:${surah}`;

type Track = { reciter: Reciter; surah: number | null; repeat: Repeat };

type MurottalState = Track & {
  player: AudioPlayer;
  play: (surah: number, reciter?: Reciter) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  cycleRepeat: () => void;
  /** Stops playback and hides the mini player. */
  close: () => void;
};

const MurottalContext = createContext<MurottalState | null>(null);

/** One app-wide player, so a surah keeps playing across screens and in the background. */
export function MurottalProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const [track, setTrack] = useState<Track>({ reciter: DEFAULT_RECITER, surah: null, repeat: 'off' });
  const trackRef = useRef(track);
  const loadedKey = useRef<string | null>(null);
  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  usePersistedTrack(track, setTrack);

  const play = useCallback(
    (surah: number, reciter: Reciter = trackRef.current.reciter) => {
      loadedKey.current = trackKey(reciter, surah);
      player.replace(audioSource(reciter, surah));
      player.play();
      showOnLockScreen(player, surah, reciter);
      setTrack((t) => ({ ...t, reciter, surah }));
    },
    [player],
  );

  useAutoAdvance(player, trackRef, play);

  const toggle = useCallback(() => {
    const { surah, reciter } = trackRef.current;
    if (surah === null) return play(1);
    if (loadedKey.current !== trackKey(reciter, surah)) return play(surah);
    if (player.playing) player.pause();
    else player.play();
  }, [play, player]);

  const value = useMemo<MurottalState>(
    () => ({
      ...track,
      player,
      play,
      toggle,
      next: () => play(track.surah === null ? 1 : (nextSurah(track.surah, 'all') ?? 1)),
      previous: () => (player.currentTime > 3 ? player.seekTo(0) : play(previousSurah(track.surah ?? 1))),
      cycleRepeat: () => setTrack((t) => ({ ...t, repeat: cycleRepeat(t.repeat) })),
      close: () => {
        player.pause();
        player.setActiveForLockScreen(false);
        loadedKey.current = null;
        setTrack((t) => ({ ...t, surah: null }));
      },
    }),
    [track, player, play, toggle],
  );

  return <MurottalContext.Provider value={value}>{children}</MurottalContext.Provider>;
}

/** Restores the last reciter, surah and repeat mode on launch (without playing) and saves every change. */
function usePersistedTrack(track: Track, setTrack: Dispatch<SetStateAction<Track>>): void {
  // Saving waits for the restore, or the empty starting track would overwrite the saved one.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (!restored) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ reciter: track.reciter.id, surah: track.surah, repeat: track.repeat }));
  }, [track, restored]);
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' });
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        const saved = JSON.parse(raw) as { reciter: string; surah: number | null; repeat: Repeat };
        // A surah picked while storage was still loading wins over the saved one.
        setTrack((t) => (t.surah !== null ? t : { reciter: reciterById(saved.reciter), surah: saved.surah, repeat: saved.repeat }));
      }
      setRestored(true);
    });
  }, [setTrack]);
}

/** When a surah ends by itself, moves on according to the repeat mode. */
function useAutoAdvance(player: AudioPlayer, trackRef: { current: Track }, play: (surah: number) => void): void {
  useEffect(() => {
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish) return;
      const { surah, repeat } = trackRef.current;
      const next = surah === null ? null : nextSurah(surah, repeat);
      if (next !== null) play(next);
    });
    return () => sub.remove();
  }, [player, trackRef, play]);
}

function showOnLockScreen(player: AudioPlayer, surah: number, reciter: Reciter): void {
  player.setActiveForLockScreen(
    true,
    { title: SURAH_NAMES[surah - 1].name, artist: reciter.name, albumTitle: 'Murottal' },
    { showSeekForward: true, showSeekBackward: true },
  );
}

export function useMurottal(): MurottalState {
  const ctx = useContext(MurottalContext);
  if (!ctx) throw new Error('useMurottal outside MurottalProvider');
  return ctx;
}

/** Live position and play state; only components that call this re-render on every tick. */
export function useMurottalStatus(): AudioStatus {
  return useAudioPlayerStatus(useMurottal().player);
}
