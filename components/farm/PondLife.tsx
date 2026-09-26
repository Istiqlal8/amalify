import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CELL_ASPECT } from '@/domain/farm';
import { koiAt } from '@/domain/koi';

const KOI = 3;
const LAP_MS = 16000;

type Rect = { x: number; y: number; w: number; h: number };
type Props = { rect: Rect; cell: number; frozen: boolean };

/** Koi circling in a pond with the odd ripple, or a frozen sheen in winter. Decorative; never catches taps. */
export function PondLife({ rect, cell, frozen }: Props) {
  const box = { left: rect.x * cell, top: rect.y * cell * CELL_ASPECT, width: rect.w * cell, height: rect.h * cell * CELL_ASPECT };
  return (
    <View style={[styles.pond, box]}>
      {frozen ? (
        <>
          <View style={[StyleSheet.absoluteFill, styles.ice]} />
          <View style={[styles.glint, { width: box.width * 1.4, top: box.height * 0.3 }]} />
        </>
      ) : (
        <>
          <Ripple size={cell * 0.9} left={box.width * 0.3} top={box.height * 0.35} />
          {Array.from({ length: KOI }, (_, i) => (
            <Koi key={i} index={i} cell={cell} width={box.width} height={box.height} />
          ))}
        </>
      )}
    </View>
  );
}

function useLoop(ms: number, delay = 0): SharedValue<number> {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.linear }), -1));
  }, [reduced, t, ms, delay]);
  return t;
}

function Koi({ index, cell, width, height }: { index: number; cell: number; width: number; height: number }) {
  const phase = useLoop(LAP_MS + index * 3500);
  const len = cell * 0.5;
  const style = useAnimatedStyle(() => {
    const p = koiAt(phase.value, index);
    return { transform: [{ translateX: p.x * width - len / 2 }, { translateY: p.y * height - len / 4 }, { rotate: `${p.angle}deg` }] };
  });
  const spotted = index % 2 === 0;
  return (
    <Animated.View style={[styles.koi, { width: len, height: len / 2 }, style]}>
      <View style={[styles.tail, { borderTopWidth: len / 6, borderBottomWidth: len / 6, borderLeftWidth: len / 4, top: len / 12 }]} />
      <View style={[styles.body, { left: len / 5, width: len * 0.8, height: len / 2, borderRadius: len / 4 }]}>
        <View style={[styles.patch, spotted ? styles.patchWhite : styles.patchRed, { width: len * 0.3, height: len / 4, borderRadius: len / 8 }]} />
      </View>
    </Animated.View>
  );
}

function Ripple({ size, left, top }: { size: number; left: number; top: number }) {
  const t = useLoop(3200, 900);
  const style = useAnimatedStyle(() => ({ opacity: 0.6 * (1 - t.value), transform: [{ scale: 0.2 + t.value * 1.4 }] }));
  return <Animated.View style={[styles.ripple, { width: size, height: size, borderRadius: size / 2, left, top }, style]} />;
}

const styles = StyleSheet.create({
  pond: { position: 'absolute', overflow: 'hidden', pointerEvents: 'none' },
  ice: { backgroundColor: 'rgba(255,255,255,0.35)' },
  glint: { position: 'absolute', left: -20, height: 6, backgroundColor: 'rgba(255,255,255,0.7)', transform: [{ rotate: '-18deg' }] },
  koi: { position: 'absolute', left: 0, top: 0 },
  tail: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#F28C38',
  },
  body: { position: 'absolute', top: 0, backgroundColor: '#F28C38', alignItems: 'center', justifyContent: 'center' },
  patch: { marginLeft: 4 },
  patchWhite: { backgroundColor: '#FFF7EE' },
  patchRed: { backgroundColor: '#D9481F' },
  ripple: { position: 'absolute', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
});
