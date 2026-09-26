import { useMemo } from 'react';
import { type GestureResponderEvent, PanResponder, type PanResponderGestureState, StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { type Palette } from '@/constants/theme';
import type { Point } from '@/domain/farm';
import { useStyles } from '@/hooks/useStyles';

const BASE = 120;
export const JOYSTICK_SIZE = BASE;
const THUMB = 52;
const REACH = (BASE - THUMB) / 2;

type Props = { vec: SharedValue<Point> };

/** On-screen analog stick; writes a -1..1 vector (magnitude ≤ 1) into `vec`, zero when released. */
export function Joystick({ vec }: Props) {
  const styles = useStyles(makeStyles);
  const thumb = useSharedValue<Point>({ x: 0, y: 0 });
  const responder = useMemo(() => makeResponder(vec, thumb), [vec, thumb]);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumb.value.x }, { translateY: thumb.value.y }],
  }));
  return (
    <View
      {...responder.panHandlers}
      style={styles.base}
      accessibilityRole="adjustable"
      accessibilityLabel="Joystick petani">
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </View>
  );
}

/** Clamp a finger offset from the centre to the stick's reach. */
function clampToReach(dx: number, dy: number): Point {
  const dist = Math.hypot(dx, dy);
  const k = dist > REACH ? REACH / dist : 1;
  return { x: dx * k, y: dy * k };
}

function makeResponder(vec: SharedValue<Point>, thumb: SharedValue<Point>) {
  let start: Point = { x: 0, y: 0 };
  const move = (g: PanResponderGestureState) => {
    const p = clampToReach(start.x + g.dx, start.y + g.dy);
    thumb.value = p;
    vec.value = { x: p.x / REACH, y: p.y / REACH };
  };
  const release = () => {
    vec.value = { x: 0, y: 0 };
    thumb.value = withSpring({ x: 0, y: 0 });
  };
  return PanResponder.create({
    // Capture so the screen's ScrollView never steals the drag.
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e: GestureResponderEvent, g) => {
      start = { x: e.nativeEvent.locationX - BASE / 2, y: e.nativeEvent.locationY - BASE / 2 };
      move(g);
    },
    onPanResponderMove: (_e, g) => move(g),
    onPanResponderRelease: release,
    onPanResponderTerminate: release,
  });
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
    thumb: { width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: c.primary, borderWidth: 3, borderColor: '#FFFFFF', pointerEvents: 'none' },
  });
