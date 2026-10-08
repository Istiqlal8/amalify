import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { left: number; top: number; width: number; height: number; color: string };

/**
 * A soft ring that breathes on the bed the character is standing at. It is the whole "you are on a
 * plot" signal now that the old card is gone: motion and colour, never a panel over the world.
 * Hidden under reduced motion, and the parent still shows a steady frame in that case.
 */
export function BedActiveGlow({ left, top, width, height, color }: Props) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + t.value * 0.45,
    transform: [{ scale: 0.96 + t.value * 0.06 }],
  }));
  if (reduced) return null;
  return <Animated.View pointerEvents="none" style={[styles.glow, { left, top, width, height, borderColor: color }, style]} />;
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', borderWidth: 3, borderRadius: 10 },
});
