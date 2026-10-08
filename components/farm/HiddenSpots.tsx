import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
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

import { CELL_ASPECT, type Point } from '@/domain/farm';
import { BLOCK_COLS, BLOCK_ROWS } from '@/domain/farmWorld';

/** Spots in scene cells, tucked into the yard's quiet corners: by the ponds, behind the house, under trees. */
export const SPOTS: Point[] = [
  { x: BLOCK_COLS + 19.5, y: BLOCK_ROWS + 3.5 }, // behind the right pond
  { x: BLOCK_COLS + 2.0, y: BLOCK_ROWS + 6.5 }, // along the house's left wall
  { x: BLOCK_COLS + 12.0, y: BLOCK_ROWS + 22.5 }, // lower field corner
  { x: BLOCK_COLS + 18.5, y: BLOCK_ROWS + 14.5 }, // under the lower-right tree
];

/** How close (in cells) the character must stand for a spot to react. */
const NEAR = 1.6;

type Props = { pos: SharedValue<Point>; cell: number };

/**
 * Small hidden sparkles around the village that light up as you draw near and flare once when you
 * reach them. Pure ambience — no score, no stored state; it just rewards wandering into corners.
 * Hidden under reduced motion, and it never catches taps.
 */
export function HiddenSpots({ pos, cell }: Props) {
  const reduced = useReducedMotion();
  if (reduced || cell === 0) return null;
  return (
    <>
      {SPOTS.map((p, i) => (
        <Spot key={`${p.x},${p.y}`} pos={pos} cell={cell} at={p} index={i} />
      ))}
    </>
  );
}

function Spot({ pos, cell, at, index }: { pos: SharedValue<Point>; cell: number; at: Point; index: number }) {
  const twinkle = useSharedValue(0);
  useEffect(() => {
    twinkle.value = withDelay(index * 600, withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [twinkle, index]);

  const size = cell * 0.55;
  // Brightness is driven by distance on the UI thread: dim across the map, close when you are near.
  const glow = useAnimatedStyle(() => {
    const dx = pos.value.x + 0.5 - at.x;
    const dy = pos.value.y + 0.5 - at.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const near = Math.max(0, 1 - d / NEAR);
    const base = 0.18 + near * 0.72;
    return { opacity: base * (0.75 + twinkle.value * 0.25), transform: [{ scale: 0.85 + near * 0.4 }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.spot, { left: at.x * cell - size / 2, top: at.y * cell * CELL_ASPECT - size / 2, width: size, height: size }, glow]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`spot${index}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF6C9" stopOpacity={0.9} />
            <Stop offset="1" stopColor="#FFE38A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#spot${index})`} />
        <Circle cx={size / 2} cy={size / 2} r={size * 0.14} fill="#FFFFFF" opacity={0.85} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spot: { position: 'absolute' },
});
