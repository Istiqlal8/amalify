import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Palette, fonts, space } from '@/constants/theme';
import { streak } from '@/domain/dayLog';
import { useStyles } from '@/hooks/useStyles';
import { useRewards } from '@/hooks/useRewards';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { PaperChip } from './ui/Paper';

/** Bar height below the safe area, so the scene can start under it. */
export const HEADER_SPACE = 52;

type Props = { title: string; top: number; trailing?: ReactNode };

/** The garden's top bar: a name on the left, the points and streak chips on the right. */
export function GardenHeader({ title, top, trailing }: Props) {
  const insets = useSafeAreaInsets();
  const s = useStyles(makeStyles);
  return (
    <View style={[s.bar, { paddingTop: top + space.xs, paddingLeft: insets.left + space.md, paddingRight: insets.right + space.md }]}>
      <Text style={s.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      {trailing ?? (
        <View style={s.chips}>
          <StreakChip />
          <PointsChip />
        </View>
      )}
    </View>
  );
}

/** Days in a row with any amal done; hidden until the first one. */
function StreakChip() {
  const days = streak(useLogs().logs);
  const { colors } = useTheme();
  const s = useStyles(makeStyles);
  if (days === 0) return null;
  return (
    <PaperChip>
      <SymbolView name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }} tintColor={colors.primary} size={16} />
      <Text style={s.points}>{days}</Text>
      <Text style={s.unit}>hari</Text>
    </PaperChip>
  );
}

function PointsChip() {
  const { balance } = useRewards();
  const s = useStyles(makeStyles);
  return (
    <PaperChip onPress={() => router.push('/shop')} accessibilityLabel={`${balance} poin, buka toko`}>
      <Text style={s.points}>{balance}</Text>
      <Text style={s.unit}>poin</Text>
    </PaperChip>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.sm,
      paddingBottom: space.sm,
      // Same top wash as every other screen's header, not the white card.
      backgroundColor: c.dark ? c.background : c.wash,
      borderBottomWidth: 1,
      borderBottomColor: c.dark ? c.border : 'transparent',
    },
    title: { flex: 1, fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: c.foreground },
    chips: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
    points: { fontFamily: fonts.bodyBold, fontSize: 15, color: c.foreground },
    unit: { fontFamily: fonts.body, fontSize: 12, color: c.mutedForeground },
  });
