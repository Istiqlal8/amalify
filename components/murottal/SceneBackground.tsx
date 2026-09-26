import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/providers/ThemeProvider';

import type { Scene } from './scenes';

/** Full-screen backdrop: a silent looping clip, or a deep theme gradient for "Tanpa video". */
export function SceneBackground({ scene }: { scene: Scene }) {
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

function Clip({ source }: { source: number }) {
  const video = useVideoPlayer(source, (player) => {
    player.loop = true;
    player.muted = true;
    // Without this the clip takes audio focus and the recitation, which asks not to mix, stops.
    player.audioMixingMode = 'mixWithOthers';
    player.play();
  });

  // Pauses with the app, so listening with the screen off costs no extra battery.
  useEffect(() => {
    video.play();
    const sub = AppState.addEventListener('change', (state) => (state === 'active' ? video.play() : video.pause()));
    return () => sub.remove();
  }, [video]);

  return <VideoView player={video} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}
