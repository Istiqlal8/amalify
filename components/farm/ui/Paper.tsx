import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { farmRadius, paperOf, touch } from '@/constants/farm';
import { fonts, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type PanelProps = { children: ReactNode; tone?: 'panel' | 'sunk'; style?: StyleProp<ViewStyle> };

/** Solid paper surface: the garden's only container. No blur, no rim, 1dp edge, 2dp shadow. */
export function PaperPanel({ children, tone = 'panel', style }: PanelProps) {
  const { colors } = useTheme();
  return <View style={[styles.panel, paperOf(colors, tone), style]}>{children}</View>;
}

type TextProps = { children: ReactNode; style?: StyleProp<ViewStyle> };

/** Panel title: Nunito 20/24 at weight 800, per the garden's type scale. */
export function PaperTitle({ children }: TextProps) {
  const s = useStyles(makeStyles);
  return <Text style={s.title}>{children}</Text>;
}

export function PaperLabel({ children }: TextProps) {
  const s = useStyles(makeStyles);
  return <Text style={s.label}>{children}</Text>;
}

export function PaperBody({ children }: TextProps) {
  const s = useStyles(makeStyles);
  return <Text style={s.body}>{children}</Text>;
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
  const s = useStyles(makeStyles);
  const accent = tone === 'accent';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        s.button,
        accent ? { backgroundColor: colors.primaryDeep, borderColor: colors.primaryDeep } : paperOf(colors),
        pressed && s.pressed,
        style,
      ]}>
      {icon}
      {children ?? (label !== '' && <Text style={[s.buttonText, accent && { color: colors.onPrimary }]}>{label}</Text>)}
    </Pressable>
  );
}

type ChipProps = { children: ReactNode; onPress?: () => void; accessibilityLabel?: string };

/** Small paper chip for counts and badges; pressable only when it leads somewhere. */
export function PaperChip({ children, onPress, accessibilityLabel }: ChipProps) {
  const { colors } = useTheme();
  const s = useStyles(makeStyles);
  const content = <View style={[s.chip, paperOf(colors)]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={8}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: farmRadius.panel },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    title: { fontFamily: fonts.bodyBold, fontSize: 20, lineHeight: 24, color: c.foreground },
    label: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18, color: c.mutedForeground },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: c.foreground },
    button: {
      minHeight: touch.min,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
      paddingHorizontal: space.md,
      borderRadius: farmRadius.control,
    },
    buttonText: { fontFamily: fonts.bodyBold, fontSize: 15, color: c.foreground },
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
