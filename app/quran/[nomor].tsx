import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AyahRow } from '@/components/quran/AyahRow';
import { MushafScreen } from '@/components/quran/MushafScreen';
import { ReaderSettingsButton } from '@/components/quran/ReaderSettingsButton';
import { TajweedLegend } from '@/components/quran/TajweedLegend';
import { ClayButton } from '@/components/ui/ClayButton';
import { GradientFill } from '@/components/ui/GradientFill';
import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useAyahAudio } from '@/hooks/useAyahAudio';
import { useSurah, useTajweed } from '@/hooks/useQuran';
import { useReaderPrefs } from '@/hooks/useReaderPrefs';
import type { Ayah, SurahDetail } from '@/services/quranApi';
import { stackHeader } from '@/components/ui/stackHeader';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';

/** Mushaf mode is hidden until its layout is ready; its option is off the settings list too. */
const MUSHAF_ENABLED = false;

// At-Taubah opens without the basmalah, and Al-Fatihah carries it as its first ayah.
const NO_BASMALAH = new Set([1, 9]);

function Header({ surah }: { surah: SurahDetail }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.hero}>
      <GradientFill from={colors.wash} to={colors.muted} />
      <View style={styles.heroRow}>
        <View style={styles.heroInfo}>
          <Txt variant="bold" style={styles.onPink}>{surah.namaLatin}</Txt>
          <Txt variant="caption" style={styles.onPinkSoft}>
            {surah.arti} · {surah.tempatTurun} · {surah.jumlahAyat} ayat
          </Txt>
        </View>
        <Txt style={styles.heroArab}>{surah.nama}</Txt>
      </View>
      {!NO_BASMALAH.has(surah.nomor) && <Txt style={styles.basmalah}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</Txt>}
    </View>
  );
}

export default function SurahScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ nomor: string; ayat?: string }>();
  const nomor = Number(params.nomor);
  const { data, error, retry } = useSurah(nomor);
  const prefs = useReaderPrefs();
  const extra = useTajweed(nomor, prefs.tajweed || prefs.perKata).data;
  const audio = useAyahAudio(nomor, data?.jumlahAyat ?? 0);
  const list = useRef<FlatList<Ayah>>(null);
  const jumpTo = params.ayat ? Number(params.ayat) - 1 : 0;

  // "Lanjut baca" opens at the ayah after the last one read.
  useEffect(() => {
    if (data && jumpTo > 0) list.current?.scrollToIndex({ index: Math.min(jumpTo, data.ayat.length - 1), animated: false });
  }, [data, jumpTo]);

  if (MUSHAF_ENABLED && prefs.mushaf) return <MushafScreen surah={nomor} ayah={jumpTo + 1} />;

  return (
    <View style={styles.screen}>
      <SoftBackdrop />
      <Stack.Screen
        options={{
          title: data?.namaLatin ?? '',
          ...stackHeader(colors),
          headerRight: () => <ReaderSettingsButton />,
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
          ref={list}
          data={data.ayat}
          keyExtractor={(a) => String(a.nomor)}
          extraData={[prefs, extra, audio.playing]}
          renderItem={({ item }) => (
            <AyahRow
              surah={nomor}
              ayah={item}
              extra={extra?.[item.nomor - 1]}
              prefs={prefs}
              playing={audio.playing === item.nomor}
              onPlay={audio.toggle}
            />
          )}
          ListHeaderComponent={
            <>
              <Header surah={data} />
              {prefs.tajweed && (
                <View style={styles.legend}>
                  <TajweedLegend />
                </View>
              )}
            </>
          }
          contentContainerStyle={styles.content}
          initialNumToRender={6}
          windowSize={7}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            // Rows vary in height, so land roughly first, then retry once the rows are measured.
            list.current?.scrollToOffset({ offset: averageItemLength * index, animated: false });
            setTimeout(() => list.current?.scrollToIndex({ index, animated: false }), 100);
          }}
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
    legend: { marginBottom: space.sm },
    hero: {
      alignItems: 'center',
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      marginBottom: space.sm,
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.95)',
    },
    heroRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: space.sm },
    heroInfo: { flex: 1, gap: 2 },
    heroArab: { fontFamily: fonts.arabic, fontSize: 24, lineHeight: 46, color: c.primaryDeep },
    basmalah: { fontFamily: fonts.arabic, fontSize: 19, lineHeight: 40, color: c.foreground },
    onPink: { color: c.foreground },
    onPinkSoft: { color: c.mutedForeground },
  });
