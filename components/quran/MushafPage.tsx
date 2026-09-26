import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, space } from '@/constants/theme';
import { isCenteredLine } from '@/domain/mushaf';
import { SURAHS } from '@/domain/tilawah';
import { useMushafPage } from '@/hooks/useQuran';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { fontName, loadPageFont, type MushafFont } from '@/services/mushafFont';

type Props = { page: number; colored: boolean; onAyah: (surah: number, ayah: number) => void };

const BASMALAH = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ';
// At-Taubah opens without the basmalah, and Al-Fatihah carries it as its first ayah.
const NO_BASMALAH = new Set([1, 9]);

/** Loads the page's QCF font; `null` until it is ready. */
function usePageFont(v: MushafFont, page: number): { family: string | null; failed: boolean; retry: () => void } {
  const [state, setState] = useState<{ key: string; ok: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${fontName(v, page)}#${attempt}`;
  useEffect(() => {
    let live = true;
    loadPageFont(v, page).then(
      () => live && setState({ key, ok: true }),
      () => live && setState({ key, ok: false }),
    );
    return () => {
      live = false;
    };
  }, [v, page, key]);
  const current = state?.key === key ? state : null;
  return { family: current?.ok ? fontName(v, page) : null, failed: current?.ok === false, retry: () => setAttempt((n) => n + 1) };
}

/** One Madani page drawn with its own mushaf font, so every line matches the printed copy. */
function MushafPageBase({ page, colored, onAyah }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Colour glyphs need COLRv1, which iOS text rendering lacks.
  const v: MushafFont = colored && Platform.OS === 'android' ? 'v4' : 'v1';
  const words = useMushafPage(page);
  const font = usePageFont(v, page);
  // v4 glyphs are drawn wider than v1, so it needs a smaller size for the same line width.
  const fontSize = Math.min(30, (width - space.sm * 2) / (v === 'v4' ? 22.5 : 19.8));
  const failed = words.error !== null || font.failed;
  const retry = () => (words.error ? words.retry() : font.retry());

  return (
    <ScrollView style={{ width }} contentContainerStyle={styles.page}>
      {failed && (
        <Txt style={{ color: colors.destructive }} onPress={retry}>
          Gagal memuat halaman. Ketuk untuk coba lagi.
        </Txt>
      )}
      {!failed && (!words.data || !font.family) && <ActivityIndicator color={colors.primary} />}
      {font.family &&
        words.data?.map((line) => (
          <View key={line.line}>
            {line.surahStart !== null && (
              <View style={styles.banner}>
                <Txt variant="heading" style={styles.bannerText}>{SURAHS[line.surahStart - 1].name}</Txt>
                {!NO_BASMALAH.has(line.surahStart) && <Txt style={styles.basmalah}>{BASMALAH}</Txt>}
              </View>
            )}
            {/* Each word is a whole glyph, so words can be spread apart to justify the line.
                QCF glyphs overhang their advance width and Android clips text to its content box,
                so a space (in the system font, which has one) on each side gives the ink room. */}
            <View style={[styles.line, isCenteredLine(page, line.line) && styles.centered]}>
              {line.words.map((w, i) => (
                <Text
                  key={i}
                  onPress={() => onAyah(w.surah, w.ayah)}
                  suppressHighlighting
                  style={[styles.word, { fontSize, lineHeight: fontSize * 1.9 }]}
                >
                  {w.end ? '  ' : ' '}
                  <Text style={{ fontFamily: font.family ?? undefined }}>{v === 'v1' ? w.code1 : w.code2}</Text>
                  {w.end ? '  ' : ' '}
                </Text>
              ))}
            </View>
          </View>
        ))}
      <Txt variant="caption" style={styles.number}>{page}</Txt>
    </ScrollView>
  );
}

export const MushafPage = memo(MushafPageBase);

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    page: { paddingHorizontal: space.sm, paddingVertical: space.md },
    line: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
    centered: { justifyContent: 'center', columnGap: space.xs },
    word: { color: c.foreground },
    banner: { alignItems: 'center', paddingVertical: space.sm, marginVertical: space.xs, borderRadius: 12, backgroundColor: c.muted },
    bannerText: { color: c.primaryDeep },
    basmalah: { fontFamily: fonts.arabic, fontSize: 24, lineHeight: 52, color: c.foreground },
    number: { textAlign: 'center', marginTop: space.md },
  });
