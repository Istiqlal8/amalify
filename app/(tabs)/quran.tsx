import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SurahRow } from '@/components/quran/SurahRow';
import { ClayButton } from '@/components/ui/ClayButton';
import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useSurahList } from '@/hooks/useQuran';
import type { Surah } from '@/services/quranApi';

/** Matches "al baqarah", "Baqarah", "sapi" or "2" alike. */
function matches(s: Surah, query: string): boolean {
  const q = query.trim().toLowerCase().replace(/[-'\s]/g, '');
  if (!q) return true;
  const latin = s.namaLatin.toLowerCase().replace(/[-'\s]/g, '');
  return latin.includes(q) || s.arti.toLowerCase().includes(q) || String(s.nomor) === q;
}

export default function QuranScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { data, error, retry } = useSurahList();
  const [query, setQuery] = useState('');
  const surahs = (data ?? []).filter((s) => matches(s, query));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={surahs}
        keyExtractor={(s) => String(s.nomor)}
        renderItem={({ item }) => <SurahRow surah={item} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Txt variant="title" accessibilityRole="header">Al-Quran</Txt>
            <TextField label="Cari surat" value={query} onChangeText={setQuery} placeholder="Al-Kahf" />
            {error && (
              <>
                <Txt style={{ color: colors.destructive }}>Gagal memuat daftar surat. Periksa koneksi internet.</Txt>
                <ClayButton label="Coba lagi" tone="soft" onPress={retry} />
              </>
            )}
            {!data && !error && <Txt variant="caption">Memuat…</Txt>}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: space.md, gap: space.sm, paddingBottom: space.xl },
    header: { gap: space.md, marginBottom: space.sm },
  });
