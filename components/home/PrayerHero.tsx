import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { PrayerBuddy } from '@/components/home/PrayerBuddy';
import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import type { Palette } from '@/constants/theme';
import { cityLabel, countdown, upcomingPrayers } from '@/domain/prayer';
import { formatClock } from '@/domain/reminders';
import { useNow } from '@/hooks/useNow';
import { useStyles } from '@/hooks/useStyles';
import { usePrayer } from '@/providers/PrayerProvider';

/** The next prayer beside the user's farm character: its name large, then the countdown and the city. */
export function PrayerHero() {
  const styles = useStyles(makeStyles);
  const { city, days, error } = usePrayer();
  const now = useNow();
  const next = upcomingPrayers(days, now)[0];

  return (
    <View style={styles.row}>
      <PrayerBuddy />
      <View style={styles.text}>
        <Txt style={styles.kicker}>{next ? 'Berikutnya' : 'Jadwal sholat'}</Txt>
        <Txt style={styles.name} numberOfLines={1} adjustsFontSizeToFit>{next ? next.name : '–'}</Txt>
        {next && (
          <Txt style={styles.when}>
            {'dalam '}
            <Txt style={styles.strong}>{countdown(now, next.at)}</Txt>
            {` · ${formatClock(next.at.getHours(), next.at.getMinutes())}`}
          </Txt>
        )}
        {error && <Txt style={styles.kicker}>{error}</Txt>}
        <Link href="/city" style={styles.city} accessibilityLabel={city ? `Kota: ${cityLabel(city.name)}. Ganti kota` : 'Pilih kota'}>
          {city ? `${cityLabel(city.name)} ›` : 'Pilih kota ›'}
        </Link>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    text: { flex: 1, gap: 2, paddingBottom: 4 },
    kicker: { fontFamily: mihrabFonts.body, fontSize: 13, lineHeight: 18, color: k.inkSoft },
    name: { fontFamily: mihrabFonts.display, fontSize: 44, lineHeight: 50, color: k.ink },
    when: { fontFamily: mihrabFonts.body, fontSize: 15, lineHeight: 21, color: k.ink },
    strong: { fontFamily: mihrabFonts.bodyBold, fontSize: 15, lineHeight: 21, color: k.ink },
    city: { fontFamily: mihrabFonts.bodyBold, fontSize: 13, lineHeight: 18, marginTop: 6, minHeight: 44, textAlignVertical: 'center', color: k.accent },
  });
};
