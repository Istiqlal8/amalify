import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { setAmbience, togglePlayerPref, usePlayerPrefs } from '@/hooks/usePlayerPrefs';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { AMBIENCES } from './ambiences';

const TOGGLES: { key: 'tint' | 'ayahText'; label: string }[] = [
  { key: 'tint', label: 'Nuansa warna' },
  { key: 'ayahText', label: 'Teks ayat' },
];

/** The background sound choice and on/off switches for the colour wash and ayah text. */
export function PlayerOptions() {
  const styles = useStyles(makeStyles);
  const prefs = usePlayerPrefs();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Txt variant="bold">Suara latar</Txt>
      <View style={styles.chips}>
        {AMBIENCES.map((a) => {
          const on = a.id === prefs.ambience;
          return (
            <Pressable
              key={a.id}
              onPress={() => setAmbience(a.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[styles.chip, on && styles.chipOn]}>
              <Txt variant="bold" style={on ? styles.chipTextOn : styles.chipText}>{a.label}</Txt>
            </Pressable>
          );
        })}
      </View>
      {TOGGLES.map((t) => (
        <View key={t.key} style={styles.row}>
          <Txt variant="bold" style={styles.flex}>{t.label}</Txt>
          <Switch
            accessibilityLabel={t.label}
            value={prefs[t.key]}
            onValueChange={() => togglePlayerPref(t.key)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
          />
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    chip: { minHeight: 40, paddingHorizontal: space.md, justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: c.border },
    chipOn: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.foreground },
    chipTextOn: { color: c.onPrimary },
    row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: space.md },
    flex: { flex: 1 },
  });
