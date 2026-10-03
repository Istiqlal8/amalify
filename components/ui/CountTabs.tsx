import { Pressable, StyleSheet, View } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './Txt';

export type CountTab<T extends string> = { id: T; label: string; count: number };

type Props<T extends string> = { options: CountTab<T>[]; value: T; onChange: (id: T) => void };

/**
 * Like PillTabs, but each tab carries a count that PillTabs' plain string labels cannot hold.
 * The tabs wrap onto a second row rather than scrolling: a scroller would clip the last one off
 * the edge with nothing to show it is there.
 */
export function CountTabs<T extends string>({ options, value, onChange }: Props<T>) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {options.map((o) => {
        const active = o.id === value;
        const tint = active ? { color: colors.onPrimary } : undefined;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${o.label}, ${o.count} amalan`}
            onPress={() => onChange(o.id)}
            style={[styles.pill, active && styles.pillActive]}>
            <Txt variant="bold" numberOfLines={1} adjustsFontSizeToFit style={[styles.label, tint]}>
              {o.label}
            </Txt>
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Txt variant="caption" style={tint}>
                {o.count}
              </Txt>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
    label: { flexShrink: 1 },
    pill: {
      flexGrow: 1,
      flexBasis: '30%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.xs,
      minHeight: 44,
      paddingHorizontal: space.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    pillActive: { backgroundColor: c.primaryDeep, borderColor: c.primary },
    badge: {
      minWidth: 22,
      paddingHorizontal: space.xs,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: c.muted,
    },
    badgeActive: { backgroundColor: c.primary },
  });
