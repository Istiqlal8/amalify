import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { GradientFill } from '@/components/ui/GradientFill';
import { Txt } from '@/components/ui/Txt';
import { pastels } from '@/constants/pastel';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { formatRef, khatamCount, lastRead, nextStart, pageOf, TOTAL_PAGES } from '@/domain/tilawah';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Last position in the mushaf, progress toward khatam, and a jump back into reading. */
export function KhatamCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { tilawah } = useLogs();
  const last = lastRead(tilawah);
  const page = last ? pageOf(last) : 0;
  const khatam = khatamCount(tilawah);
  const next = nextStart(tilawah);

  return (
    <View style={styles.card}>
      {colors.dark ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
      ) : (
        <GradientFill from={pastels.sky.tint} to={pastels.lavender.tint} />
      )}
      <Txt variant="caption" style={styles.soft}>Terakhir dibaca</Txt>
      <Txt variant="heading" style={styles.onPink}>{last ? formatRef(last) : 'Belum ada'}</Txt>
      <View style={styles.bar}>
        <View style={styles.track} />
        <View style={[styles.fill, { width: `${(page / TOTAL_PAGES) * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Txt style={[styles.soft, styles.flex]}>{`Halaman ${page} / ${TOTAL_PAGES}`}</Txt>
        {khatam > 0 && <Txt variant="bold" style={styles.onPink}>{`Khatam ${khatam}x`}</Txt>}
      </View>
      <ClayButton
        label="Lanjut baca"
        tone="soft"
        onPress={() => router.push({ pathname: '/quran/[nomor]', params: { nomor: String(next.surah), ayat: String(next.ayah) } })}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { gap: space.sm, padding: space.lg, borderRadius: c.dark ? 10 : radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.dark ? c.border : 'rgba(255,255,255,0.95)' },
    onPink: { color: c.foreground },
    soft: { color: c.foreground },
    bar: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
    // Faded on its own layer so the fill above keeps full strength.
    track: { ...StyleSheet.absoluteFill, backgroundColor: c.card, opacity: 0.7 },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.dark ? c.primary : pastels.sky.ink },
    row: { flexDirection: 'row', alignItems: 'center' },
    flex: { flex: 1 },
  });
