import { Stack, useLocalSearchParams } from 'expo-router';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PrayerSettings } from '@/components/prayer/PrayerSettings';
import { AccountCard } from '@/components/settings/AccountCard';
import { EveningReminderCard } from '@/components/settings/EveningReminderCard';
import { FlowerPicker } from '@/components/settings/FlowerPicker';
import { ThemePicker } from '@/components/ThemePicker';
import { Txt } from '@/components/ui/Txt';
import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';

const PAGES: Record<string, { title: string; render: () => ReactElement }> = {
  akun: { title: 'Akun & sinkron', render: () => <AccountCard /> },
  tampilan: {
    title: 'Tampilan',
    render: () => (
      <>
        <ThemePicker />
        <FlowerPicker />
      </>
    ),
  },
  sholat: { title: 'Sholat & adzan', render: () => <PrayerSettings /> },
  pengingat: { title: 'Pengingat', render: () => <EveningReminderCard /> },
};

export default function SettingsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const page = PAGES[id];

  return (
    <View style={styles.screen}>
      <SoftBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen
          options={{
            title: page?.title ?? 'Pengaturan',
            ...stackHeader(colors),
          }}
        />
        {page ? page.render() : <Txt>Halaman tidak ditemukan.</Txt>}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  });
