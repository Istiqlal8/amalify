import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah } from '@/domain/cash';
import { formatDay } from '@/domain/cycle';
import type { DayTotal } from '@/domain/personalFinance';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

/** Rincian harian: total masuk dan keluar tiap tanggal. */
export function DailyBreakdown({ days }: { days: DayTotal[] }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  if (days.length === 0) return <Txt variant="caption">Belum ada transaksi bulan ini.</Txt>;

  return (
    <View style={styles.card}>
      <Txt variant="bold">Rincian harian</Txt>
      {days.map((d) => (
        <View key={d.day} style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold">{formatDay(d.day)}</Txt>
            <Txt variant="caption">{d.count} transaksi</Txt>
          </View>
          <View style={styles.nums}>
            {d.masuk > 0 && <Txt variant="bold" style={{ color: colors.leafDeep }}>+{formatRupiah(d.masuk)}</Txt>}
            {d.keluar > 0 && <Txt variant="bold" style={{ color: colors.destructive }}>-{formatRupiah(d.keluar)}</Txt>}
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
    flex: { flex: 1 },
    nums: { alignItems: 'flex-end' },
  });
