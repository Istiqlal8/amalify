import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import { fonts, type Palette } from '@/constants/theme';
import { ayahFor, type Mood } from '@/domain/mood';
import { useMoodAyah } from '@/hooks/useMoodAyah';
import { useStyles } from '@/hooks/useStyles';

/** Today's ayah for the chosen mood; tapping it opens the surah at that ayah. */
export function MoodVerse({ mood }: { mood: Mood }) {
  const styles = useStyles(makeStyles);
  // Same object for the whole day, so the ayah is fetched once.
  const ref = ayahFor(mood, new Date());
  const { data, error } = useMoodAyah(ref);
  const open = () =>
    router.push({ pathname: '/quran/[nomor]', params: { nomor: String(ref.surah), ayat: String(ref.ayah) } });

  return (
    <Pressable onPress={open} accessibilityRole="button" style={styles.wrap}>
      <Txt style={styles.kicker}>{`Ayat untukmu · ${mood.label}`}</Txt>
      {error && <Txt style={styles.ref}>Ayat belum bisa dimuat. Periksa koneksi.</Txt>}
      {data && (
        <>
          <Txt style={styles.arab}>{data.ayah.arab}</Txt>
          <Txt style={styles.arti}>{`“${data.ayah.arti}”`}</Txt>
          <Txt style={styles.ref}>{`QS ${data.surahName} ${ref.surah}:${ref.ayah} ›`}</Txt>
        </>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    wrap: { gap: 8 },
    kicker: { fontFamily: mihrabFonts.bodyMedium, fontSize: 11, lineHeight: 16, letterSpacing: 1.6, textTransform: 'uppercase', color: k.inkSoft },
    arab: { fontFamily: fonts.arabic, fontSize: 24, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl', color: k.ink },
    arti: { fontFamily: mihrabFonts.displayItalic, fontSize: 17, lineHeight: 25, color: k.ink },
    ref: { fontFamily: mihrabFonts.bodyBold, fontSize: 13, lineHeight: 18, color: k.accent },
  });
};
