import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah } from '@/domain/cash';
import type { MonthlySummary } from '@/domain/personalFinance';
import { useStyles } from '@/hooks/useStyles';

export function FinanceSummary({ summary }: { summary: MonthlySummary }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Txt variant="caption">Masuk</Txt>
        <Txt variant="bold">+{formatRupiah(summary.masuk)}</Txt>
      </View>
      <View style={styles.row}>
        <Txt variant="caption">Keluar</Txt>
        <Txt variant="bold">-{formatRupiah(summary.keluar)}</Txt>
      </View>
      <View style={styles.row}>
        <Txt variant="caption">Saldo bulan ini</Txt>
        <Txt variant="title">{formatRupiah(summary.saldo)}</Txt>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({ card: { ...clayOf(c), padding: space.md, gap: space.xs }, row: { gap: 2 } });
