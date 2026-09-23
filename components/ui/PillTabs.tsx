import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './Txt';

type Props<T extends string> = { options: { id: T; label: string }[]; value: T; onChange: (id: T) => void };

/** Horizontal row of pills; the selected one is filled. */
export function PillTabs<T extends string>({ options, value, onChange }: Props<T>) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.id)}
            style={[styles.pill, active && styles.active]}>
            <Txt variant="bold" style={active ? { color: colors.onPrimary } : undefined}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { gap: space.sm },
    pill: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    active: { backgroundColor: c.primaryDeep, borderColor: c.primary },
  });
