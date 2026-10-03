import { Pressable, StyleSheet, View } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './ui/Txt';

/** Indexed by `Date.getDay()`, so Sunday leads. */
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

/** `undefined` means every day; the picker shows that as all seven chosen. */
type Props = { value: number[] | undefined; onChange: (days: number[] | undefined) => void };

export function WeekdayPicker({ value, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const chosen = value ?? EVERY_DAY;

  function toggle(day: number) {
    const next = chosen.includes(day) ? chosen.filter((d) => d !== day) : [...chosen, day].sort();
    // Dropping the last day would silence the reminder without saying so; keep at least one.
    if (next.length === 0) return;
    onChange(next.length === 7 ? undefined : next);
  }

  return (
    <View style={styles.row} accessibilityLabel="Hari pengingat">
      {DAYS.map((label, day) => {
        const active = chosen.includes(day);
        return (
          <Pressable
            key={label}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            accessibilityLabel={label}
            onPress={() => toggle(day)}
            style={[styles.chip, active && styles.active]}>
            <Txt variant="caption" style={active ? { color: colors.onPrimary } : undefined}>
              {label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
    chip: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    active: { backgroundColor: c.primaryDeep, borderColor: c.primary },
  });
