import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { formatDay } from '@/domain/cycle';
import { formatRef, type TilawahSession } from '@/domain/tilawah';
import { useLogs } from '@/providers/LogsProvider';

const SHOWN = 10;

export function SessionHistory() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { tilawah, removeTilawah } = useLogs();
  const sessions = [...tilawah.sessions].sort((a, b) => b.at - a.at).slice(0, SHOWN);
  if (sessions.length === 0) return null;

  function confirmRemove(s: TilawahSession) {
    Alert.alert('Hapus catatan ini?', `${s.pages} halaman dikurangi dari ${formatDay(s.day)}.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeTilawah(s.id) },
    ]);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">Riwayat</Txt>
      {sessions.map((s) => (
        <View key={s.id} style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold">{`${formatRef(s.from)} – ${s.to.surah === s.from.surah ? s.to.ayah : formatRef(s.to)}`}</Txt>
            <Txt variant="caption">{`${formatDay(s.day)} · ${s.pages} halaman`}</Txt>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Hapus catatan" onPress={() => confirmRemove(s)} style={styles.remove}>
            <Txt variant="bold" style={{ color: colors.destructive }}>Hapus</Txt>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
    remove: { minHeight: 44, minWidth: 56, alignItems: 'center', justifyContent: 'center' },
  });
