import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { type Palette, radius, space, frostOf } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './ui/Txt';

type Props = { label: string; done: boolean; onToggle: () => void };

export function AmalItem({ label, done, onToggle }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!done || reduced) return;
    scale.value = withSequence(withTiming(1.25, { duration: 120 }), withSpring(1, { damping: 7 }));
  }, [done, reduced, scale]);

  const boxStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function press() {
    Haptics.impactAsync(done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      aria-checked={done}
      accessibilityLabel={label}
      onPress={press}
      style={({ pressed }) => [styles.row, done && styles.rowDone, pressed && { opacity: 0.85 }]}>
      <Animated.View style={[styles.box, done && styles.boxDone, boxStyle]}>
        {done && (
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M5 12.5 L10 17 L19 7" stroke={colors.onPrimary} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </Animated.View>
      <View style={styles.text}>
        <Txt variant={done ? 'bold' : 'body'}>{label}</Txt>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      minHeight: 56,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      ...frostOf(c),
    },
    rowDone: { backgroundColor: c.muted, borderColor: c.secondary },
    box: {
      width: 28,
      height: 28,
      borderRadius: 10,
      borderWidth: 2.5,
      borderColor: c.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
    },
    boxDone: { backgroundColor: c.primary, borderColor: c.primaryDeep },
    text: { flex: 1 },
  });
