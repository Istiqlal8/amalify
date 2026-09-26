import { useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MiniPlayer } from '@/components/murottal/MiniPlayer';
import { ReciterAvatar } from '@/components/murottal/ReciterAvatar';
import { ReciterStrip } from '@/components/murottal/ReciterStrip';
import { SurahTrackRow } from '@/components/murottal/SurahTrackRow';
import { ClayButton } from '@/components/ui/ClayButton';
import { PillTabs } from '@/components/ui/PillTabs';
import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { CREDITS_URL, SURAH_NAMES } from '@/domain/murottal';
import { useDownloads } from '@/hooks/useDownloads';
import { useStyles } from '@/hooks/useStyles';
import { useMurottal } from '@/providers/MurottalProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';

const ALL = SURAH_NAMES.map((_, i) => i + 1);

type Show = 'semua' | 'unduhan';

export default function MurottalScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const murottal = useMurottal();
  const [reciter, setReciter] = useState(murottal.reciter);
  const [query, setQuery] = useState('');
  const [onlyDownloaded, setOnlyDownloaded] = useState<Show>('semua');
  const downloads = useDownloads(reciter);
  const surahs = useMemo(
    () => filterSurahs(query).filter((n) => onlyDownloaded === 'semua' || downloads.done.has(n)),
    [query, onlyDownloaded, downloads.done],
  );
  const playing = murottal.reciter.id === reciter.id ? murottal.surah : null;
  const { play } = murottal;
  const onPick = useCallback((n: number) => play(n, reciter), [play, reciter]);

  const header = (
    <View style={styles.header}>
      <ReciterStrip value={reciter} onChange={setReciter} />
      <View style={styles.hero}>
        <ReciterAvatar reciter={reciter} size={96} square />
        <View style={styles.flex}>
          <Txt variant="heading">{reciter.name}</Txt>
          <Txt variant="caption">{reciter.style ?? '114 surah · 30 juz'}</Txt>
        </View>
      </View>
      <ClayButton label={playing === null ? 'Putar dari Al-Fatihah' : 'Putar ulang dari awal'} onPress={() => onPick(1)} />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cari surah atau nomor"
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel="Cari surah"
        style={styles.search}
      />
      <PillTabs
        options={[{ id: 'semua', label: 'Semua' }, { id: 'unduhan', label: `Terunduh (${downloads.done.size})` }]}
        value={onlyDownloaded}
        onChange={setOnlyDownloaded}
      />
      {downloads.error && <Txt style={{ color: colors.destructive }}>{downloads.error}</Txt>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SoftBackdrop />
      <FlatList
        data={surahs}
        keyExtractor={String}
        ListHeaderComponent={header}
        ListFooterComponent={
          <Txt variant="caption" style={styles.credits} onPress={() => Linking.openURL(CREDITS_URL)} accessibilityRole="link">
            Kredit foto & video
          </Txt>
        }
        renderItem={({ item }) => (
          <SurahTrackRow
            surah={item}
            active={item === playing}
            downloaded={downloads.done.has(item)}
            progress={downloads.progress.get(item)}
            onPress={onPick}
            onDownload={downloads.download}
            onRemove={downloads.remove}
          />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
      <MiniPlayer />
    </SafeAreaView>
  );
}

function filterSurahs(query: string): number[] {
  const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!q) return ALL;
  return ALL.filter((n) => String(n) === q || SURAH_NAMES[n - 1].name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q));
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1 },
    list: { paddingHorizontal: space.md, paddingBottom: space.lg },
    header: { gap: space.md, paddingBottom: space.sm },
    hero: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    flex: { flex: 1 },
    credits: { fontSize: 12, lineHeight: 44, textAlign: 'center', textDecorationLine: 'underline', paddingTop: space.md },
    search: {
      minHeight: 44,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      fontFamily: fonts.body,
      fontSize: 16,
      color: c.foreground,
    },
  });
