import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { countdown, PRAYERS, todayOf, upcomingPrayers } from '@/domain/prayer';
import { formatClock } from '@/domain/reminders';
import { useNow } from '@/hooks/useNow';
import { usePrayer } from '@/providers/PrayerProvider';

export function PrayerCard() {
  const styles = useStyles(makeStyles);
  const { city, days, error } = usePrayer();
  const now = useNow();

  if (!city) {
    return (
      <Link href="/city" asChild>
        <Pressable accessibilityRole="button" style={styles.card}>
          <Txt variant="heading" style={styles.onPink}>Jadwal sholat</Txt>
          <Txt style={styles.onPinkSoft}>Pilih kota</Txt>
        </Pressable>
      </Link>
    );
  }

  const next = upcomingPrayers(days, now)[0];
  const today = todayOf(days, now);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.flex}>
          <Txt variant="caption" style={styles.onPinkSoft}>
            {next ? 'Sholat berikutnya' : 'Jadwal sholat'}
          </Txt>
          <Txt variant="title" style={styles.onPink}>
            {next ? `${next.name} ${formatClock(next.at.getHours(), next.at.getMinutes())}` : '–'}
          </Txt>
          {next && <Txt style={styles.onPinkSoft}>dalam {countdown(now, next.at)}</Txt>}
          {error && <Txt style={styles.onPinkSoft}>{error}</Txt>}
        </View>
        <Link href="/city" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel={`Kota: ${city.name}. Ganti kota`} style={styles.city}>
            <Txt variant="caption" style={styles.onPink} numberOfLines={2}>{city.name}</Txt>
          </Pressable>
        </Link>
      </View>
      {today && (
        <View style={styles.row}>
          {PRAYERS.map((p) => {
            const active = next?.id === p.id && next.at.getDate() === now.getDate();
            return (
              <View key={p.id} style={[styles.slot, active && styles.slotActive]}>
                <Txt variant="caption" style={active ? styles.activeText : styles.onPinkSoft}>{p.name}</Txt>
                <Txt variant="bold" style={active ? styles.activeText : styles.onPink}>{today[p.id]}</Txt>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.primaryDeep,
      borderRadius: radius.lg,
      padding: space.md,
      gap: space.md,
      boxShadow: `0px 6px 14px ${c.shadow.replace(/[\d.]+\)$/, '0.3)')}`,
  },
  head: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  flex: { flex: 1 },
  city: {
    minHeight: 44,
    maxWidth: 130,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  row: { flexDirection: 'row', gap: space.xs },
  slot: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.sm },
  slotActive: { backgroundColor: c.card },
  onPink: { color: c.onPrimary },
  onPinkSoft: { color: c.onPrimarySoft },
  activeText: { color: c.primaryDeep },
});
