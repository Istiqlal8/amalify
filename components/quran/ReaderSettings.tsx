import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import { toggleReaderPref, useReaderPrefs, type ReaderPrefs } from '@/hooks/useReaderPrefs';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { TajweedLegend } from './TajweedLegend';

const OPTIONS: { key: keyof ReaderPrefs; label: string }[] = [
  { key: 'tajweed', label: 'Tajwid berwarna' },
  { key: 'perKata', label: 'Arti per kata' },
  { key: 'latin', label: 'Teks latin' },
  { key: 'terjemah', label: 'Terjemahan' },
];

/** Checklist of what the Quran reader shows. */
export function ReaderSettings() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const prefs = useReaderPrefs();
  return (
    <View style={styles.card}>
      {OPTIONS.map((o) => (
        <Pressable
          key={o.key}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: prefs[o.key] }}
          onPress={() => toggleReaderPref(o.key)}
          style={styles.row}
        >
          <View style={[styles.box, prefs[o.key] && styles.boxOn]}>
            {prefs[o.key] && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={colors.onPrimary} size={16} />}
          </View>
          <Txt>{o.label}</Txt>
        </Pressable>
      ))}
      {prefs.tajweed && <TajweedLegend />}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...frostOf(c), borderRadius: radius.md, padding: space.md, gap: space.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
    box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    boxOn: { backgroundColor: c.primary, borderColor: c.primary },
  });
