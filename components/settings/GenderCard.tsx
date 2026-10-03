import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { GENDER_LABEL, type Gender } from '@/domain/profile';
import { useStyles } from '@/hooks/useStyles';
import { useProfile } from '@/providers/ProfileProvider';
import { useTheme } from '@/providers/ThemeProvider';

const OPTIONS: Gender[] = ['laki-laki', 'perempuan'];

/** Ganti profil gender; data Haid lama tetap tersimpan dan muncul lagi bila kembali perempuan. */
export function GenderCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { gender, effective, setGender } = useProfile();
  const current = gender ?? effective;

  return (
    <View style={styles.card}>
      <Txt variant="bold">Profil</Txt>
      <View style={styles.grid} role="radiogroup">
        {OPTIONS.map((o) => {
          const active = current === o;
          return (
            <Pressable
              key={o}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={GENDER_LABEL[o]}
              onPress={() => setGender(o)}
              style={({ pressed }) => [styles.opt, active && styles.active, pressed && styles.pressed]}>
              <View style={[styles.icon, active && styles.iconActive]}>
                {o === 'laki-laki' ? (
                  <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} tintColor={active ? colors.onPrimary : colors.primaryDeep} size={24} />
                ) : (
                  <Svg width={24} height={24} viewBox="0 0 24 24">
                    <Path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill={active ? colors.onPrimary : colors.primary} />
                  </Svg>
                )}
              </View>
              <Txt variant="bold">{GENDER_LABEL[o]}</Txt>
            </Pressable>
          );
        })}
      </View>
      <Txt variant="caption">
        {current === 'laki-laki'
          ? 'Menu Haid disembunyikan. Sholat dan puasa selalu dinilai penuh.'
          : 'Menu Haid tampil. Sholat dijeda otomatis saat haid.'}
      </Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md },
    grid: { flexDirection: 'row', gap: space.md },
    opt: {
      flex: 1,
      alignItems: 'center',
      gap: space.sm,
      paddingVertical: space.md,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.card,
      minHeight: 96,
      justifyContent: 'center',
    },
    active: { borderColor: c.primaryDeep, backgroundColor: c.muted },
    pressed: { opacity: 0.85 },
    icon: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.muted,
    },
    iconActive: { backgroundColor: c.primaryDeep },
  });
