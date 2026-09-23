import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { type Palette } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const PETALS = 14;
const FALL_MS = 2200;
export const BURST_MS = FALL_MS + 600;

type Props = { width: number; height: number };

/** A one-shot shower of petals over its parent; mount it to play, unmount after BURST_MS. */
export function PetalBurst({ width, height }: Props) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants">
      {Array.from({ length: PETALS }, (_, i) => (
        <Petal key={i} index={i} width={width} height={height} />
      ))}
    </View>
  );
}

function Petal({ index, width, height }: { index: number; width: number; height: number }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  // Drawn once per petal so a re-render mid-fall does not make it jump.
  const [{ startX, drift, spin, size, delay }] = useState(() => ({
    // Spread evenly across the width with a little jitter, so the shower never clumps.
    startX: ((index + 0.5) / PETALS) * width + (Math.random() - 0.5) * 24,
    drift: (Math.random() - 0.5) * 60,
    spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
    size: 12 + Math.random() * 8,
    delay: Math.random() * 500,
  }));
  const pink = index % 3 === 0 ? colors.primary : colors.petal;

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: FALL_MS, easing: Easing.in(Easing.quad) }));
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.8 ? 1 : (1 - progress.value) * 5,
    transform: [
      { translateX: startX + drift * progress.value },
      { translateY: -size + (height + size) * progress.value },
      { rotate: `${spin * progress.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.petal, style]}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M10 1 C16 5 16 14 10 19 C4 14 4 5 10 1 Z" fill={pink} />
      </Svg>
    </Animated.View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    petal: { position: 'absolute', left: 0, top: 0 },
  });
