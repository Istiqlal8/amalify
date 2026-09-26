import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import type { Palette } from '@/constants/theme';
import { formatRef, nextStart, pageOf, TOTAL_PAGES } from '@/domain/tilawah';
import { useStyles } from '@/hooks/useStyles';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** A ruled row that jumps back to where the last tilawah sitting stopped. */
export function ContinueReading() {
  const styles = useStyles(makeStyles);
  const k = inkOf(useTheme().colors);
  const { tilawah } = useLogs();
  const next = nextStart(tilawah);
  const open = () =>
    router.push({ pathname: '/quran/[nomor]', params: { nomor: String(next.surah), ayat: String(next.ayah) } });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lanjut baca ${formatRef(next)}`}
      onPress={open}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <SymbolView name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }} tintColor={k.accent} size={26} />
      <View style={styles.flex}>
        <Txt style={styles.kicker}>Lanjut baca</Txt>
        <Txt style={styles.ref}>{formatRef(next)}</Txt>
      </View>
      <Txt style={styles.kicker}>{`hlm ${pageOf(next)}/${TOTAL_PAGES}`}</Txt>
      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} tintColor={k.ink} size={20} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) => {
  const k = inkOf(c);
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, borderTopWidth: 1, borderBottomWidth: 1, borderColor: k.rule },
    pressed: { opacity: 0.6 },
    flex: { flex: 1 },
    kicker: { fontFamily: mihrabFonts.body, fontSize: 12, lineHeight: 16, color: k.inkSoft },
    ref: { fontFamily: mihrabFonts.display, fontSize: 20, lineHeight: 26, color: k.ink },
  });
};
