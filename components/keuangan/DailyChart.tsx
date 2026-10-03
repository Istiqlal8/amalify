import { ScrollView, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah } from '@/domain/cash';
import type { DayTotal } from '@/domain/personalFinance';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const MAX_BAR = 96;

/** Grafik batang tegak: pengeluaran tiap tanggal dalam sebulan. */
export function DailyChart({ days }: { days: DayTotal[] }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const max = days.reduce((m, d) => Math.max(m, d.keluar), 0);
  if (max === 0) return <Txt variant="caption">Belum ada pengeluaran harian bulan ini.</Txt>;
  const asc = [...days].sort((a, b) => (a.day < b.day ? -1 : 1));

  return (
    <View style={styles.card}>
      <Txt variant="bold">Grafik harian</Txt>
      <Txt variant="caption">Pengeluaran per tanggal · terbesar {formatRupiah(max)}</Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bars}>
        {asc.map((d) => (
          <View key={d.day} style={styles.col} accessibilityLabel={`${d.day}: ${formatRupiah(d.keluar)}`}>
            <View style={[styles.bar, { height: Math.max(4, (d.keluar / max) * MAX_BAR), backgroundColor: colors.primaryDeep }]} />
            <Txt variant="caption">{Number(d.day.slice(8))}</Txt>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, paddingTop: space.sm },
    col: { alignItems: 'center', gap: 4, minWidth: 28 },
    bar: { width: 20, borderRadius: 6, backgroundColor: c.primary },
  });
