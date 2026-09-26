import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { stackHeader } from '@/components/ui/stackHeader';
import { pageOf, SURAHS } from '@/domain/tilawah';
import { useReaderPrefs } from '@/hooks/useReaderPrefs';
import { useTheme } from '@/providers/ThemeProvider';
import meta from '@/data/quran/meta.json';

import { MushafView } from './MushafView';
import { ReaderSettingsButton } from './ReaderSettingsButton';

/** Surah opened in mushaf mode: starts on the page holding the requested ayah. */
export function MushafScreen({ surah, ayah }: { surah: number; ayah: number }) {
  const { colors } = useTheme();
  const prefs = useReaderPrefs();
  const [startPage] = useState(() => pageOf({ surah, ayah }));
  const [page, setPage] = useState(startPage);
  const surahOnPage = meta.pageStarts[page - 1][0];

  return (
    <View style={styles.screen}>
      <SoftBackdrop />
      <Stack.Screen
        options={{
          title: `${SURAHS[surahOnPage - 1].name} · ${page}`,
          ...stackHeader(colors),
          headerRight: () => <ReaderSettingsButton />,
        }}
      />
      <MushafView startPage={startPage} colored={prefs.tajweed} onPage={setPage} />
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
