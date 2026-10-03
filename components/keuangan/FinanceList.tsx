import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah } from '@/domain/cash';
import { formatDay } from '@/domain/cycle';
import { categoryLabel, type CustomCategory, type PersonalEntry } from '@/domain/personalFinance';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { entries: PersonalEntry[]; cats: CustomCategory[]; onEdit: (entry: PersonalEntry) => void; onRemove: (id: string) => void };

export function FinanceList({ entries, cats, onEdit, onRemove }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  if (entries.length === 0) return <Txt variant="caption">Belum ada catatan bulan ini.</Txt>;

  function confirmRemove(e: PersonalEntry) {
    Alert.alert(`Hapus "${e.note}"?`, formatRupiah(e.amount), [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onRemove(e.id) },
    ]);
  }

  function actions(e: PersonalEntry) {
    Alert.alert(e.note, `${e.kind === 'masuk' ? '+' : '-'}${formatRupiah(e.amount)}`, [
      { text: 'Ubah', onPress: () => onEdit(e) },
      { text: 'Hapus', style: 'destructive', onPress: () => confirmRemove(e) },
      { text: 'Batal', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.card}>
      {entries.map((e) => (
        <Pressable key={e.id} onPress={() => actions(e)} accessibilityRole="button" style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold" numberOfLines={1}>
              {e.note}
            </Txt>
            <Txt variant="caption">
              {formatDay(e.day)} · {categoryLabel(e.category, cats)}
            </Txt>
          </View>
          <Txt variant="bold" style={{ color: e.kind === 'keluar' ? colors.destructive : colors.leafDeep }}>
            {e.kind === 'masuk' ? '+' : '-'}
            {formatRupiah(e.amount)}
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
