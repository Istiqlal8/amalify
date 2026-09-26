import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { qadhaPuasa, setQadhaPaid } from '@/domain/ramadan';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Ramadan fasts missed to haid, per year, with a counter for the ones made up. */
export function QadhaCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, editHaid } = useLogs();
  const rows = qadhaPuasa(haid, today);
  if (rows.length === 0) return null;
  const setPaid = (year: string, paid: number) => editHaid((h, now) => setQadhaPaid(h, year, paid, now));

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading">Utang puasa Ramadan</Txt>
      {rows.map((r) => (
        <View key={r.year} style={styles.row}>
          <View style={styles.flex}>
            <Txt variant="bold">{r.year} H</Txt>
            <Txt variant="caption">
              {r.left === 0 ? `Lunas, ${r.owed} hari` : `Sisa ${r.left} dari ${r.owed} hari`}
            </Txt>
          </View>
          <Step label="−" onPress={() => setPaid(r.year, r.paid - 1)} disabled={r.paid === 0} />
          <Txt variant="bold">{r.paid}</Txt>
          <Step label="+" onPress={() => setPaid(r.year, r.paid + 1)} disabled={r.left === 0} />
        </View>
      ))}
      <Txt variant="caption">Tanggal Ramadan mengikuti kalender Kemenag. Tekan + setiap selesai puasa qadha.</Txt>
    </View>
  );
}

function Step({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Tambah qadha' : 'Kurangi qadha'}
      onPress={onPress}
      disabled={disabled}
      style={[styles.step, disabled && styles.off]}
    >
      <Txt variant="bold">{label}</Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    flex: { flex: 1 },
    step: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border, backgroundColor: c.card },
    off: { opacity: 0.4 },
  });
