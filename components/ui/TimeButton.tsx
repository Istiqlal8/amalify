import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { formatClock, parseClock, type Clock } from '@/domain/reminders';

import { Txt } from './Txt';

type Props = { label: string; value: Clock; onChange: (value: Clock) => void };

/** Shows the time; tapping opens the platform's own 24-hour picker. */
export function TimeButton({ label, value, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const { hour, minute } = parseClock(value);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  // Android's dialog closes itself on either button; the iOS spinner stays inline until toggled.
  const close = () => Platform.OS === 'android' && setOpen(false);

  function picked(_: unknown, next: Date) {
    close();
    onChange(formatClock(next.getHours(), next.getMinutes()));
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        onPress={() => setOpen((o) => !o)}
        style={styles.button}>
        <Txt variant="heading" style={{ color: colors.primaryDeep }}>
          {value}
        </Txt>
      </Pressable>
      {open && <DateTimePicker value={date} mode="time" is24Hour display={Platform.OS === 'ios' ? 'spinner' : 'clock'} onValueChange={picked} onDismiss={close} />}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      minHeight: 44,
      minWidth: 88,
      paddingHorizontal: space.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.muted,
    },
  });
