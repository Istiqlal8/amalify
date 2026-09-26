import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, palettes, radius, space, THEME_NAMES } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemePicker() {
  const { name, setTheme } = useTheme();
  const s = useStyles(makeStyles);

  return (
    <View style={s.card}>
      <Txt variant="bold">Warna aplikasi</Txt>
      <View style={s.row} accessibilityRole="radiogroup" accessibilityLabel="Warna aplikasi">
        {THEME_NAMES.map((t) => {
          const p = palettes[t.id];
          const active = t.id === name;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="radio"
              aria-checked={active}
              accessibilityLabel={t.label}
              onPress={() => setTheme(t.id)}
              style={[s.option, { borderColor: active ? p.primaryDeep : p.border, backgroundColor: p.background }]}>
              <View style={s.swatches}>
                {[p.primaryDeep, p.primary, p.secondary].map((c) => (
                  <View key={c} style={[s.swatch, { backgroundColor: c }]} />
                ))}
              </View>
              <Txt variant="bold" style={{ color: p.foreground }}>
                {t.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md },
    row: { flexDirection: 'row', gap: space.sm },
    option: {
      flex: 1,
      minHeight: 72,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.xs,
      borderRadius: radius.md,
      borderWidth: 3,
    },
    swatches: { flexDirection: 'row', gap: 4 },
    swatch: { width: 14, height: 14, borderRadius: 7 },
  });
