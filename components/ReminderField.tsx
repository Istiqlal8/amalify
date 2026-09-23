import { StyleSheet, Switch, View } from 'react-native';

import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { Clock } from '@/domain/reminders';

import { TimeButton } from './ui/TimeButton';
import { Txt } from './ui/Txt';

type Props = {
  label: string;
  /** `null` when off. */
  value: Clock | null;
  defaultTime: Clock;
  onChange: (value: Clock | null) => void;
};

export function ReminderField({ label, value, defaultTime, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Txt variant="bold">{label}</Txt>
      </View>
      {value !== null && <TimeButton label={label} value={value} onChange={onChange} />}
      <Switch
        accessibilityLabel={label}
        value={value !== null}
        onValueChange={(on) => onChange(on ? defaultTime : null)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.card}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48 },
    flex: { flex: 1 },
  });
