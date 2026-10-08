import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CELL_ASPECT } from '@/domain/farm';

const COUNT = 4;

type Props = { cols: number; rows: number; cell: number };

/**
 * Ambient critters drifting over the village — butterflies by day, nothing at night. They give the
 * walk a reason to look around: idle motion in the corners of the map. Purely decorative, hidden
 * under reduced motion, and they never catch taps.
 */
export function Wildlife({ cols, rows, cell }: Props) {
  const reduced = useReducedMotion();
  if (reduced || cell === 0) return null;
  const width = cols * cell;
  const height = rows * cell * CELL_ASPECT;
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <Butterfly key={i} index={i} width={width} height={height} />
      ))}
    </>
  );
}

function Butterfly({ index, width, height }: { index: number; width: number; height: number }) {
  const t = useSharedValue(0);
  const flap = useSharedValue(0);
  const duration = 9000 + rand(index, 1) * 7000;
  const cx = rand(index, 2) * width;
  const cy = height * (0.2 + rand(index, 3) * 0.55);
  useEffect(() => {
    t.value = withDelay(rand(index, 4) * duration, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
    flap.value = withRepeat(withTiming(1, { duration: 260, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, flap, index, duration]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx + Math.sin(t.value * Math.PI * 2 + index) * 60 },
      { translateY: cy + Math.cos(t.value * Math.PI * 3 + index) * 28 },
    ],
  }));
  const wing = useAnimatedStyle(() => ({ transform: [{ scaleX: 0.35 + flap.value * 0.65 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.fly, style]}>
      <Animated.View style={[styles.wingLeft, { borderRightColor: WING[index % WING.length] }, wing]} />
      <Animated.View style={[styles.wingRight, { borderLeftColor: WING[index % WING.length] }, wing]} />
      <Animated.View style={styles.body} />
    </Animated.View>
  );
}

const WING = ['#FDE047', '#F472B6', '#93C5FD', '#FCA5A5'];

// Stable pseudo-random 0..1 per critter and salt, so they don't jump between renders.
const rand = (i: number, salt: number) => ((i * 7919 + salt * 104729) % 1000) / 1000;

const styles = StyleSheet.create({
  fly: { position: 'absolute', width: 26, height: 16, alignItems: 'center', justifyContent: 'center' },
  wingLeft: { position: 'absolute', left: 1, width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 10, borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  wingRight: { position: 'absolute', right: 1, width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10, borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  body: { width: 3, height: 10, borderRadius: 2, backgroundColor: '#3F3F46' },
});
