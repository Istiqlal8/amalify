import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DoaCard } from '@/components/doa/DoaCard';
import { type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { doaCategory } from '@/domain/doa';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';

export default function DoaListScreen() {
  const styles = useStyles(makeStyles);
  const { kategori } = useLocalSearchParams<{ kategori: string }>();
  const category = doaCategory(kategori);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SoftBackdrop />
      <Stack.Screen options={{ title: category?.title ?? 'Doa' }} />
      <FlatList
        data={category?.items ?? []}
        keyExtractor={(d) => d.title}
        renderItem={({ item }) => <DoaCard doa={item} />}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: space.md, gap: space.md, paddingBottom: space.xl },
  });
