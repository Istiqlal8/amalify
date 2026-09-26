import { createVideoPlayer, VideoView, type VideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/providers/ThemeProvider';

import type { Scene } from './scenes';

/**
 * Full-screen backdrop: a silent looping clip, or a deep theme gradient for "Tanpa video". With
 * `tint` the theme colour washes over it, pink with the pink theme.
 */
export function SceneBackground({ scene, tint }: { scene: Scene; tint: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="deep" x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={colors.primaryDeep} />
            <Stop offset="1" stopColor="#0B0B0C" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#deep)" />
      </Svg>
      {scene.source !== null && <Clip key={scene.id} source={scene.source} />}
      {tint && (
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="tint" x1="0" y1="0" x2="0.3" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.55} />
              <Stop offset="0.6" stopColor={colors.secondary} stopOpacity={0.25} />
              <Stop offset="1" stopColor={colors.primaryDeep} stopOpacity={0.45} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#tint)" />
        </Svg>
      )}
      {/* Keeps white text legible over any clip. */}
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0.45} />
            <Stop offset="0.45" stopColor="#000000" stopOpacity={0.2} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.85} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#shade)" />
      </Svg>
    </View>
  );
}

// Long enough for the modal's closing animation to drop the view first.
const RELEASE_DELAY_MS = 1000;

/**
 * A silent looping player. It is released a moment after unmount rather than at once, as
 * `useVideoPlayer` does: closing the player modal still hands the player to the dying view,
 * which fails with "Cannot use shared object that was already released".
 */
function useLoopingPlayer(source: number): VideoPlayer {
  const [player] = useState(() => {
    const p = createVideoPlayer(source);
    p.loop = true;
    p.muted = true;
    // Without this the clip takes audio focus and the recitation, which asks not to mix, stops.
    p.audioMixingMode = 'mixWithOthers';
    return p;
  });
  useEffect(() => () => void setTimeout(() => player.release(), RELEASE_DELAY_MS), [player]);
  return player;
}

function Clip({ source }: { source: number }) {
  const video = useLoopingPlayer(source);

  // Pauses with the app, so listening with the screen off costs no extra battery.
  useEffect(() => {
    video.play();
    const sub = AppState.addEventListener('change', (state) => (state === 'active' ? video.play() : video.pause()));
    return () => sub.remove();
  }, [video]);

  return <VideoView player={video} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}
