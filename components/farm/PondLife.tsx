import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
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
  const len = cell * 0.62;
  const style = useAnimatedStyle(() => {
    const p = koiAt(phase.value, index);
    return { transform: [{ translateX: p.x * width - len / 2 }, { translateY: p.y * height - len / 4 }, { rotate: `${p.angle}deg` }] };
  });
  const spotted = index % 2 === 0;
  return (
    <Animated.View style={[styles.koi, { width: len, height: len / 2 }, style]}>
      <Animated.View style={[styles.wake, { width: len * 1.1, height: len * 0.5, borderRadius: len / 2 }]} />
      <SvgKoi len={len} spotted={spotted} />
    </Animated.View>
  );
}

/** A koi seen from above: teardrop body, flowing tail, side fins and a soft colour patch. */
function SvgKoi({ len, spotted }: { len: number; spotted: boolean }) {
  const h = len / 2;
  const patch = spotted ? '#FFF7EE' : '#D9481F';
  return (
    <Svg width={len} height={h} viewBox="0 0 100 50">
      {/* tail fin */}
      <Path d="M14 25 Q2 10 6 25 Q2 40 14 25 Z" fill="#F08A2E" opacity={0.95} />
      {/* side fins */}
      <Path d="M40 25 Q34 6 52 20 Z" fill="#F6A44E" />
      <Path d="M40 25 Q34 44 52 30 Z" fill="#F6A44E" />
      {/* body */}
      <Path d="M18 25 Q34 4 62 12 Q86 18 90 25 Q86 32 62 38 Q34 46 18 25 Z" fill="#F28C38" />
      {/* colour patch */}
      <Ellipse cx={spotted ? 52 : 60} cy={25} rx={11} ry={8} fill={patch} />
      {/* dorsal shading + eye */}
      <Path d="M24 22 Q50 12 84 23" stroke="#D9701F" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
      <Circle cx={80} cy={22} r={2.4} fill="#3B2412" />
    </Svg>
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
  koi: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  wake: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)' },
  ripple: { position: 'absolute', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
});
