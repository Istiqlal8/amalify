import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import Svg, { Path } from 'react-native-svg';

import { ClayButton } from '@/components/ui/ClayButton';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { GENDER_LABEL, type Gender } from '@/domain/profile';
import { useStyles } from '@/hooks/useStyles';
import { useProfile } from '@/providers/ProfileProvider';
import { useTheme } from '@/providers/ThemeProvider';

const OPTIONS: { id: Gender; desc: string }[] = [
  { id: 'laki-laki', desc: 'Tanpa menu Haid.\nFokus sholat & amalan.' },
  { id: 'perempuan', desc: 'Dengan pencatat Haid,\nnifas & qadha.' },
];

/** Pilihan pertama saat buka app; menentukan apakah modul Haid tampil. */
export default function OnboardingScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { gender, setGender } = useProfile();
  const [picked, setPicked] = useState<Gender | null>(gender);

  // Palet Malam ikut otomatis lewat ThemeProvider begitu gender laki-laki tersimpan.
  function lanjut() {
    if (!picked) return;
    setGender(picked);
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.root}>
      <SoftBackdrop />
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Txt variant="title">Assalamu’alaikum</Txt>
            <Txt variant="body">Pilih profil agar Amalify tampil sesuai denganmu.</Txt>
          </View>
          <View style={styles.grid} role="radiogroup">
            {OPTIONS.map((o) => {
              const active = picked === o.id;
              return (
                <Pressable
                  key={o.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={GENDER_LABEL[o.id]}
                  onPress={() => setPicked(o.id)}
                  style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}>
                  <View style={[styles.icon, active && styles.iconActive]}>
                    {o.id === 'laki-laki' ? (
                      <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} tintColor={active ? colors.onPrimary : colors.primaryDeep} size={30} />
                    ) : (
                      <Svg width={30} height={30} viewBox="0 0 24 24">
                        <Path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill={active ? colors.onPrimary : colors.primary} />
                      </Svg>
                    )}
                  </View>
                  <Txt variant="bold">{GENDER_LABEL[o.id]}</Txt>
                  <Txt variant="caption" style={styles.desc}>
                    {o.desc}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.foot}>
            <ClayButton label="Mulai" onPress={lanjut} disabled={!picked} />
            <Txt variant="caption" style={styles.note}>
              Bisa diganti nanti di Pengaturan → Profil.
            </Txt>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.card },
    safe: { flex: 1 },
    content: { flex: 1, padding: space.lg, gap: space.lg, justifyContent: 'center' },
    hero: { gap: space.sm, alignItems: 'center' },
    grid: { flexDirection: 'row', gap: space.md },
    card: {
      ...clayOf(c),
      flex: 1,
      alignItems: 'center',
      gap: space.sm,
      paddingVertical: space.lg,
      paddingHorizontal: space.sm,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.9)',
    },
    active: { borderColor: c.primaryDeep, backgroundColor: c.muted },
    pressed: { opacity: 0.85 },
    icon: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
    },
    iconActive: { backgroundColor: c.primaryDeep },
    desc: { textAlign: 'center' },
    foot: { gap: space.sm },
    note: { textAlign: 'center' },
  });
