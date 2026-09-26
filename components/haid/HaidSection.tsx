import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ClayButton } from '@/components/ui/ClayButton';
import { DateButton } from '@/components/ui/DateButton';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { dayOfPeriod, earliestStart, openPeriod } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

/** Section header for Sholat, with the haid switch beside it. */
export function SholatHeader({ title }: { title: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { todayHaid, startHaid } = useLogs();
  return (
    <View style={styles.header}>
      <Txt variant="heading" accessibilityRole="header" style={styles.flex}>
        {title}
      </Txt>
      {!todayHaid && (
        <Pressable accessibilityRole="button" onPress={startHaid} style={styles.mark}>
          <Drop />
          <Txt variant="bold" style={{ color: colors.primaryDeep }}>Tandai haid</Txt>
        </Pressable>
      )}
    </View>
  );
}

/** Stands in for the prayer list while haid is marked. */
export function HaidCard() {
  const styles = useStyles(makeStyles);
  const { haid, today, endHaid, setHaidStart } = useLogs();
  const period = openPeriod(haid);

  function confirmEnd() {
    Alert.alert('Sudah suci?', 'Sholat dihitung lagi mulai hari ini.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Sudah suci', onPress: endHaid },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Drop size={28} />
        <View style={styles.flex}>
          <Txt variant="bold">Sedang haid</Txt>
          {period && <Txt variant="caption">Hari ke-{dayOfPeriod(period, today)} sejak</Txt>}
        </View>
        {period && (
          <DateButton
            label="Mulai"
            value={period.start}
            min={earliestStart(haid) ?? undefined}
            max={today}
            onChange={setHaidStart}
          />
        )}
      </View>
      <ClayButton label="Sudah suci" tone="soft" onPress={confirmEnd} />
    </View>
  );
}

function Drop({ size = 18 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill={colors.primary} />
      <Path d="M9 15 A3 3 0 0 0 12 18" stroke={colors.card} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
    mark: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      minHeight: 44,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      backgroundColor: c.muted,
      borderWidth: 1,
      borderColor: c.border,
    },
    card: {
      gap: space.md,
      padding: space.md,
      borderRadius: radius.md,
      backgroundColor: c.muted,
      borderWidth: 2,
      borderColor: c.secondary,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  });
