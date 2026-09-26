import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Txt } from '@/components/ui/Txt';
import { pastels } from '@/constants/pastel';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { cityLabel, countdown, upcomingPrayers } from '@/domain/prayer';
import { formatClock } from '@/domain/reminders';
import { useNow } from '@/hooks/useNow';
import { useStyles } from '@/hooks/useStyles';
import { usePrayer } from '@/providers/PrayerProvider';
import { useTheme } from '@/providers/ThemeProvider';

const SIZE = 340;

/** The next prayer in large serif figures inside a soft gradient orb. */
export function PrayerHero() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { city, days, error } = usePrayer();
  const now = useNow();
  const next = upcomingPrayers(days, now)[0];

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="orb" cx="50%" cy="30%" r="70%">
            <Stop offset="0" stopColor={colors.card} />
            <Stop offset="0.55" stopColor={pastels.rose.tint} />
            <Stop offset="1" stopColor={colors.secondary} />
          </RadialGradient>
        </Defs>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 1} fill="url(#orb)" stroke={colors.card} strokeWidth={1.5} />
      </Svg>
      <Txt style={styles.label}>{next ? `${next.name} dalam` : 'Jadwal sholat'}</Txt>
      <Txt style={styles.big}>{next ? countdown(now, next.at) : '–'}</Txt>
      {next && <Txt style={styles.label}>{`pukul ${formatClock(next.at.getHours(), next.at.getMinutes())}`}</Txt>}
      {error && <Txt variant="caption">{error}</Txt>}
      <Link href="/city" style={styles.pill} accessibilityLabel={city ? `Kota: ${cityLabel(city.name)}. Ganti kota` : 'Pilih kota'}>
        {city ? cityLabel(city.name) : 'Pilih kota'}
      </Link>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { width: SIZE, height: SIZE, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: space.xs },
    label: { fontFamily: fonts.body, fontSize: 17, color: c.foreground },
    big: { fontFamily: fonts.display, fontSize: 56, lineHeight: 62, letterSpacing: -1, color: c.foreground, textAlign: 'center', paddingHorizontal: space.lg },
    pill: {
      marginTop: space.md,
      paddingHorizontal: space.lg,
      paddingVertical: 12,
      borderRadius: radius.pill,
      backgroundColor: c.card,
      overflow: 'hidden',
      fontFamily: fonts.bodyBold,
      fontSize: 15,
      color: c.foreground,
    },
  });
