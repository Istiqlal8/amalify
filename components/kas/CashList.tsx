import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { formatRupiah, type CashEntry } from '@/domain/cash';
import { formatDay } from '@/domain/cycle';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { entries: CashEntry[]; me: string | null; onRemove: (id: string) => void };

export function CashList({ entries, me, onRemove }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  if (entries.length === 0) return <Txt variant="caption">Belum ada catatan kas.</Txt>;

  function confirm(e: CashEntry) {
    Alert.alert(`Hapus "${e.note}"?`, formatRupiah(e.amount), [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => onRemove(e.id) },
    ]);
  }

  return (
    <View style={styles.card}>
      {entries.map((e) => (
        <Pressable
          key={e.id}
          disabled={e.createdBy !== me}
          onLongPress={() => confirm(e)}
          accessibilityHint={e.createdBy === me ? 'Tekan lama untuk hapus' : undefined}
          style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold" numberOfLines={1}>
              {e.note}
            </Txt>
            <Txt variant="caption">{formatDay(e.day)}</Txt>
          </View>
          <Txt variant="bold" style={{ color: e.amount < 0 ? colors.destructive : colors.leafDeep }}>
            {e.amount > 0 ? '+' : ''}
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
