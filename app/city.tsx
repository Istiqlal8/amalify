import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { City } from '@/domain/prayer';
import { useCitySearch } from '@/hooks/useCitySearch';
import { usePrayer } from '@/providers/PrayerProvider';
import { stackHeader } from '@/components/ui/stackHeader';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';

export default function CityScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { setCity } = usePrayer();
  const [query, setQuery] = useState('');
  const { results, error } = useCitySearch(query);

  function choose(city: City) {
    setCity(city);
    router.back();
  }

  return (
    <View style={styles.screen}>
      <SoftBackdrop />
      <Stack.Screen
        options={{
          title: 'Pilih kota',
          ...stackHeader(colors),
        }}
      />
      <TextField label="Kota atau kabupaten" value={query} onChangeText={setQuery} placeholder="Bandung" autoFocus />
      {error && <Txt style={{ color: colors.destructive }}>{error}</Txt>}
      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => choose(item)} style={styles.row}>
            <Txt variant="bold">{item.name}</Txt>
          </Pressable>
        )}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, padding: space.md, gap: space.md },
    list: { gap: space.sm, paddingBottom: space.xl },
    row: {
      minHeight: 52,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
  });
