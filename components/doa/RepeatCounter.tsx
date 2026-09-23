import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

/** Tap per reading, long-press to start over. Resets when the screen closes. */
export function RepeatCounter({ target }: { target: number }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [count, setCount] = useState(0);
  const done = count >= target;

  function tap() {
    if (done) return;
    const next = count + 1;
    setCount(next);
    if (next === target) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.selectionAsync();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Hitung, ${count} dari ${target}`}
      accessibilityHint="Tahan untuk mengulang"
      onPress={tap}
      onLongPress={() => setCount(0)}
      style={({ pressed }) => [styles.button, done && styles.done, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <Txt variant="bold" style={{ color: done ? colors.onPrimary : colors.primaryDeep }}>
        {`${count} / ${target}`}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.muted,
      paddingHorizontal: space.lg,
    },
    done: { backgroundColor: c.primaryDeep, borderColor: c.primary },
  });
