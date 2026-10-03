import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { farm, farmRadius, paperOf, touch } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

type PanelProps = { children: ReactNode; tone?: 'panel' | 'sunk'; style?: StyleProp<ViewStyle> };

/** Solid warm-paper surface: the garden's only container. No blur, no rim, 1dp edge, 2dp shadow. */
export function PaperPanel({ children, tone = 'panel', style }: PanelProps) {
  return <View style={[styles.panel, paperOf(tone), style]}>{children}</View>;
}

type TextProps = { children: ReactNode; style?: StyleProp<ViewStyle> };

/** Panel title: Nunito 20/24 at weight 800, per the garden's type scale. */
export function PaperTitle({ children }: TextProps) {
  return <Text style={styles.title}>{children}</Text>;
}

export function PaperLabel({ children }: TextProps) {
  return <Text style={styles.label}>{children}</Text>;
}

export function PaperBody({ children }: TextProps) {
  return <Text style={styles.body}>{children}</Text>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  tone?: 'accent' | 'paper';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Richer contents than a label, e.g. the month tiles; `label` is then left empty. */
  children?: ReactNode;
};

/** Garden control: a small-radius rectangle, not a big pill. Accent tone uses the app's accent. */
export function PaperButton({ label, onPress, tone = 'paper', icon, style, accessibilityLabel, children }: ButtonProps) {
  const { colors } = useTheme();
  const accent = tone === 'accent';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        accent ? { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep } : paperOf(),
        pressed && styles.pressed,
        style,
      ]}>
      {icon}
      {children ?? (label !== '' && <Text style={[styles.buttonText, accent && { color: colors.onPrimary }]}>{label}</Text>)}
    </Pressable>
  );
}

type ChipProps = { children: ReactNode; onPress?: () => void; accessibilityLabel?: string };

/** Small paper chip for counts and badges; pressable only when it leads somewhere. */
export function PaperChip({ children, onPress, accessibilityLabel }: ChipProps) {
  const content = <View style={[styles.chip, paperOf()]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={8}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: farmRadius.panel },
  title: { fontFamily: fonts.bodyBold, fontSize: 20, lineHeight: 24, color: farm.ink },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18, color: farm.muted },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: farm.ink },
  button: {
    minHeight: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: farmRadius.control,
  },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 15, color: farm.ink },
  pressed: { opacity: 0.82 },
  chip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: farmRadius.chip,
  },
});
