import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space, frostOf } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import type { Surah } from '@/services/quranApi';

import { NumberBadge } from './NumberBadge';

export function SurahRow({ surah }: { surah: Surah }) {
  const styles = useStyles(makeStyles);
  return (
    <Link href={{ pathname: '/quran/[nomor]', params: { nomor: surah.nomor } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${surah.nomor}. ${surah.namaLatin}, ${surah.arti}, ${surah.jumlahAyat} ayat`}
        style={styles.row}>
        <NumberBadge value={surah.nomor} />
        <View style={styles.flex}>
          <Txt variant="bold">{surah.namaLatin}</Txt>
          <Txt variant="caption">
            {surah.arti} · {surah.jumlahAyat} ayat
          </Txt>
        </View>
        <Txt style={styles.arab}>{surah.nama}</Txt>
      </Pressable>
    </Link>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      minHeight: 64,
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      ...frostOf(c),
    },
    flex: { flex: 1 },
    arab: { fontFamily: fonts.arabic, fontSize: 22, lineHeight: 40, color: c.primaryDeep },
  });
