import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah } from '@/domain/cash';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

export type BarRow = { label: string; value: number };

/** Grafik batang mendatar untuk total per kategori. */
export function CategoryChart({ rows }: { rows: BarRow[] }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const top = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);
  const max = top[0]?.value ?? 0;
  if (top.length === 0) return <Txt variant="caption">Belum ada pengeluaran bulan ini.</Txt>;

  return (
    <View style={styles.card}>
      <Txt variant="bold">Grafik per kategori</Txt>
      {top.map((r) => (
        <View key={r.label} style={styles.gap}>
          <View style={styles.row}>
            <Txt variant="bold" style={styles.flex}>
              {r.label}
            </Txt>
            <Txt variant="caption">{formatRupiah(r.value)}</Txt>
          </View>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${max > 0 ? (r.value / max) * 100 : 0}%`, backgroundColor: colors.primaryDeep }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    gap: { gap: 4 },
    row: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
    flex: { flex: 1 },
    track: { height: 10, borderRadius: 5, backgroundColor: c.muted, overflow: 'hidden' },
    bar: { height: 10, borderRadius: 5 },
  });
