import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { formatDay } from '@/domain/cycle';
import { dateKey } from '@/domain/dayLog';

import { Txt } from './Txt';

type Props = { label: string; value: string; min?: string; max?: string; onChange: (day: string) => void };

function toDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Shows a `YYYY-MM-DD` day as "23 Sep"; tapping opens the platform date picker. */
export function DateButton({ label, value, min, max, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const close = () => Platform.OS === 'android' && setOpen(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${formatDay(value)}`}
        onPress={() => setOpen((o) => !o)}
        style={styles.button}>
        <Txt variant="bold" style={{ color: colors.primaryDeep }}>
          {formatDay(value)}
        </Txt>
      </Pressable>
      {open && (
        <DateTimePicker
          value={toDate(value)}
          mode="date"
          minimumDate={min ? toDate(min) : undefined}
          maximumDate={max ? toDate(max) : undefined}
          onValueChange={(_: unknown, next: Date) => {
            close();
            onChange(dateKey(next));
          }}
          onDismiss={close}
        />
      )}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      minHeight: 44,
      minWidth: 80,
      paddingHorizontal: space.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
  });
