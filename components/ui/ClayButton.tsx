import { Pressable, StyleSheet } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './Txt';

type Props = { label: string; onPress: () => void; tone?: 'primary' | 'soft'; disabled?: boolean };

export function ClayButton({ label, onPress, tone = 'primary', disabled = false }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const primary = tone === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.soft,
        { opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}>
      <Txt variant="bold" style={{ color: primary ? colors.onPrimary : colors.primaryDeep }}>
        {label}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    base: {
      minHeight: 48,
      paddingHorizontal: space.lg,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    primary: { backgroundColor: c.primaryDeep, borderColor: c.primary },
    soft: { backgroundColor: c.muted, borderColor: c.border },
  });
