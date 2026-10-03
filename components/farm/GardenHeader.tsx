import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { farm } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { streak } from '@/domain/dayLog';
import { useRewards } from '@/hooks/useRewards';
import { useLogs } from '@/providers/LogsProvider';

import { PaperChip } from './ui/Paper';

/** Bar height below the safe area, so the scene can start under it. */
export const HEADER_SPACE = 52;

type Props = { title: string; top: number; trailing?: ReactNode };

/** The garden's top bar: a name on the left, the points and streak chips on the right. */
export function GardenHeader({ title, top, trailing }: Props) {
  return (
    <View style={[styles.bar, { paddingTop: top + space.xs }]}>
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      {trailing ?? (
        <View style={styles.chips}>
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
  if (days === 0) return null;
  return (
    <PaperChip>
      <SymbolView name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }} tintColor={farm.sun} size={16} />
      <Text style={styles.points}>{days}</Text>
      <Text style={styles.unit}>hari</Text>
    </PaperChip>
  );
}

function PointsChip() {
  const { balance } = useRewards();
  return (
    <PaperChip onPress={() => router.push('/shop')} accessibilityLabel={`${balance} poin, buka toko`}>
      <Text style={styles.points}>{balance}</Text>
      <Text style={styles.unit}>poin</Text>
    </PaperChip>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    backgroundColor: farm.paper,
    borderBottomWidth: 1,
    borderBottomColor: farm.paperEdge,
  },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: farm.ink },
  chips: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  points: { fontFamily: fonts.bodyBold, fontSize: 15, color: farm.ink },
  unit: { fontFamily: fonts.body, fontSize: 12, color: farm.muted },
});
