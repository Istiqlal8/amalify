import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah } from '@/domain/cash';
import { categoryLabel, type CustomCategory } from '@/domain/personalFinance';
import type { RecurringRule } from '@/domain/recurringFinance';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { rules: RecurringRule[]; cats: CustomCategory[]; onRemove: (id: string) => void };

export function RecurringList({ rules, cats, onRemove }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  if (rules.length === 0) return <Txt variant="caption">Belum ada transaksi berulang.</Txt>;

  function confirmRemove(r: RecurringRule) {
    Alert.alert(`Hentikan "${r.note}"?`, 'Transaksi yang sudah tercatat tetap ada.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hentikan', style: 'destructive', onPress: () => onRemove(r.id) },
    ]);
  }

  return (
    <View style={styles.card}>
      {rules.map((r) => (
        <Pressable key={r.id} onPress={() => confirmRemove(r)} accessibilityRole="button" accessibilityHint="Ketuk untuk menghentikan" style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold" numberOfLines={1}>{r.note}</Txt>
            <Txt variant="caption">{`Tiap tanggal ${r.dayOfMonth} · ${categoryLabel(r.category, cats)}`}</Txt>
          </View>
          <Txt variant="bold" style={{ color: r.kind === 'keluar' ? colors.destructive : colors.leafDeep }}>
            {`${r.kind === 'masuk' ? '+' : '-'}${formatRupiah(r.amount)}`}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
    flex: { flex: 1 },
  });
