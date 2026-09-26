import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Particles } from './farmSprites';

const COUNT = 16;

type Props = { kind: Particles; width: number; height: number };

/** Falling petals or snow, or twinkling fireflies, over the whole farm. Decorative; hidden under reduced motion. */
export function ThemeParticles({ kind, width, height }: Props) {
  const reduced = useReducedMotion();
  if (!kind || reduced || width === 0) return null;
  return (
    <View style={styles.layer}>
      {Array.from({ length: COUNT }, (_, i) =>
        kind === 'fireflies' ? (
          <Firefly key={i} index={i} width={width} height={height} />
        ) : (
          <Flake key={i} index={i} width={width} height={height} petal={kind === 'petals'} />
        ),
      )}
    </View>
  );
}

// Stable pseudo-random 0..1 per particle and salt, so particles don't jump between renders.
const rand = (i: number, salt: number) => ((i * 7919 + salt * 104729) % 1000) / 1000;

function Flake({ index, width, height, petal }: { index: number; width: number; height: number; petal: boolean }) {
  const t = useSharedValue(0);
  const duration = 7000 + rand(index, 1) * 6000;
  useEffect(() => {
    t.value = withDelay(rand(index, 2) * duration, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1));
  }, [t, index, duration]);
  const x0 = rand(index, 3) * width;
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x0 + Math.sin(t.value * Math.PI * 4 + index) * 18 },
      { translateY: -20 + t.value * (height + 40) },
      { rotate: `${t.value * 720 + index * 40}deg` },
    ],
  }));
  return <Animated.View style={[petal ? styles.petal : styles.snow, style]} />;
}

function Firefly({ index, width, height }: { index: number; width: number; height: number }) {
  const glow = useSharedValue(0.2);
  const drift = useSharedValue(0);
  useEffect(() => {
    const ms = 1200 + rand(index, 4) * 1600;
    glow.value = withDelay(rand(index, 5) * ms, withRepeat(withTiming(1, { duration: ms }), -1, true));
    drift.value = withRepeat(withTiming(1, { duration: ms * 3, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow, drift, index]);
  const x = rand(index, 6) * width;
  const y = height * (0.25 + rand(index, 7) * 0.5);
  const style = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ translateX: x + drift.value * 24 - 12 }, { translateY: y - drift.value * 16 }],
  }));
  return <Animated.View style={[styles.firefly, style]} />;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' },
  petal: { position: 'absolute', width: 9, height: 6, borderRadius: 4, backgroundColor: '#F9A8D4' },
  snow: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', opacity: 0.9 },
  firefly: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFF3A0', boxShadow: '0px 0px 6px #FDE68A' },
});
