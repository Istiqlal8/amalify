import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { AyahCard } from '@/components/quran/AyahCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { GradientFill } from '@/components/ui/GradientFill';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { stackHeader } from '@/components/ui/stackHeader';
import { Txt } from '@/components/ui/Txt';
import { pastels } from '@/constants/pastel';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useSurah } from '@/hooks/useQuran';
import type { SurahDetail } from '@/services/quranApi';

// At-Taubah opens without the basmalah, and Al-Fatihah carries it as its first ayah.
const NO_BASMALAH = new Set([1, 9]);

function Header({ surah }: { surah: SurahDetail }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.hero}>
      <GradientFill from={pastels.lavender.tint} to={pastels.rose.tint} />
      <Txt style={styles.heroArab}>{surah.nama}</Txt>
      <Txt variant="heading" style={styles.onPink}>{surah.namaLatin}</Txt>
      <Txt style={styles.onPinkSoft}>
        {surah.arti} · {surah.tempatTurun} · {surah.jumlahAyat} ayat
      </Txt>
      {!NO_BASMALAH.has(surah.nomor) && <Txt style={styles.basmalah}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</Txt>}
    </View>
  );
}

export default function SurahScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const nomor = Number(useLocalSearchParams<{ nomor: string }>().nomor);
  const { data, error, retry } = useSurah(nomor);

  return (
    <View style={styles.screen}>
      <SoftBackdrop />
      <Stack.Screen
        options={{
          title: data?.namaLatin ?? '',
          ...stackHeader(colors),
        }}
      />
      {error && (
        <View style={styles.message}>
          <Txt style={{ color: colors.destructive }}>Gagal memuat surat. Periksa koneksi internet.</Txt>
          <ClayButton label="Coba lagi" tone="soft" onPress={retry} />
        </View>
      )}
      {!data && !error && <Txt style={styles.message}>Memuat…</Txt>}
      {data && (
        <FlatList
          data={data.ayat}
          keyExtractor={(a) => String(a.nomor)}
          renderItem={({ item }) => <AyahCard ayah={item} />}
          ListHeaderComponent={<Header surah={data} />}
          contentContainerStyle={styles.content}
          initialNumToRender={6}
          windowSize={7}
        />
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: space.md, gap: space.sm, paddingBottom: space.xl },
    message: { padding: space.md, gap: space.md },
    hero: {
      alignItems: 'center',
      gap: space.xs,
      padding: space.lg,
      marginBottom: space.sm,
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.95)',
    },
    heroArab: { fontFamily: fonts.arabic, fontSize: 34, lineHeight: 64, color: c.foreground },
    basmalah: { fontFamily: fonts.arabic, fontSize: 24, lineHeight: 52, color: c.foreground, marginTop: space.sm },
    onPink: { color: c.foreground },
    onPinkSoft: { color: c.foreground, textAlign: 'center' },
  });
