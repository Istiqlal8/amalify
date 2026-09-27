import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FarmScene } from '@/components/farm/FarmScene';
import { Txt } from '@/components/ui/Txt';
import { streak } from '@/domain/dayLog';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { useRewards } from '@/hooks/useRewards';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function GardenScreen() {
  const styles = useStyles(makeStyles);
  const top = useSafeAreaInsets().top;
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <FarmScene />
      <View style={[styles.header, { top: top + space.sm }]}>
        <View style={styles.pill}>
          <Txt variant="heading" accessibilityRole="header">
            Kebunku
          </Txt>
        </View>
        <PointsChip />
        <StreakChip />
      </View>
      <Link href="/amal-yaumi" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Catat amal yaumi"
          hitSlop={8}
          style={StyleSheet.flatten([styles.fab, { top: top + space.sm, backgroundColor: colors.primary }])}
        >
          <SymbolView name={{ ios: 'checklist', android: 'checklist', web: 'checklist' }} tintColor={colors.onPrimary} size={26} />
        </Pressable>
      </Link>
    </View>
  );
}

/** Days in a row with any amal done; hidden until the first one. */
function StreakChip() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const days = streak(useLogs().logs);
  if (days === 0) return null;
  return (
    <View accessible accessibilityLabel={`${days} hari beruntun`} style={StyleSheet.flatten([styles.pill, styles.points])}>
      <SymbolView name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }} tintColor={colors.primaryDeep} size={18} />
      <Txt variant="bold">{days}</Txt>
      <Txt variant="caption">hari</Txt>
    </View>
  );
}

/** Balance in a frosted pill; opens the shop. */
function PointsChip() {
  const styles = useStyles(makeStyles);
  const { balance } = useRewards();
  return (
    <Link href="/shop" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`${balance} poin, buka toko`} style={StyleSheet.flatten([styles.pill, styles.points])}>
        <Txt variant="bold">{balance}</Txt>
        <Txt variant="caption">poin</Txt>
      </Pressable>
    </Link>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1 },
    points: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs, minHeight: 44, paddingVertical: space.sm },
    header: { position: 'absolute', left: space.md, right: space.md, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm },
    pill: { ...frostOf(c), borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
    fab: {
      position: 'absolute',
      right: space.md,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOpacity: 1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
  });
