import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { type Palette } from '@/constants/theme';
import type { Point } from '@/domain/farm';
import { useStyles } from '@/hooks/useStyles';

import { PanPad } from './gesture';

const BASE = 120;
export const JOYSTICK_SIZE = BASE;
const THUMB = 52;
const REACH = (BASE - THUMB) / 2;

type Props = { vec: SharedValue<Point>; onGrab?: () => void };

/** On-screen analog stick; writes a -1..1 vector (magnitude ≤ 1) into `vec`, zero when released. */
export function Joystick({ vec, onGrab }: Props) {
  const styles = useStyles(makeStyles);
  const thumb = useSharedValue<Point>({ x: 0, y: 0 });
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumb.value.x }, { translateY: thumb.value.y }],
  }));
  return (
    <PanPad
      style={styles.base}
      accessibilityLabel="Joystick petani"
      onGrab={onGrab}
      onPoint={(x, y) => moveStick(x, y, vec, thumb)}
      onRelease={() => releaseStick(vec, thumb)}>
      <View style={styles.inner}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </PanPad>
  );
}

/** Turn a touch inside the pad into a clamped stick vector. */
function moveStick(x: number, y: number, vec: SharedValue<Point>, thumb: SharedValue<Point>): void {
  const p = clampToReach(x - BASE / 2, y - BASE / 2);
  thumb.value = p;
  vec.value = { x: p.x / REACH, y: p.y / REACH };
}

/** Let the stick spring back and stop the walk. */
function releaseStick(vec: SharedValue<Point>, thumb: SharedValue<Point>): void {
  vec.value = { x: 0, y: 0 };
  thumb.value = withSpring({ x: 0, y: 0 });
}

/** Clamp a finger offset from the centre to the stick's reach. */
function clampToReach(dx: number, dy: number): Point {
  const dist = Math.hypot(dx, dy);
  const k = dist > REACH ? REACH / dist : 1;
  return { x: dx * k, y: dy * k };
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    base: {
      width: BASE,
      height: BASE,
      borderRadius: BASE / 2,
      backgroundColor: 'rgba(255,255,255,0.35)',
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inner: { alignItems: 'center', justifyContent: 'center' },
    thumb: { width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: c.primary, borderWidth: 3, borderColor: '#FFFFFF', pointerEvents: 'none' },
  });
