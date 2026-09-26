import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ReaderSettings } from '@/components/quran/ReaderSettings';
import { SoftBackdrop } from '@/components/ui/SoftBackdrop';
import { stackHeader } from '@/components/ui/stackHeader';
import { space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function ReaderSettingsScreen() {
  const { colors } = useTheme();
  return (
    <View style={styles.screen}>
      <SoftBackdrop />
      <Stack.Screen options={{ title: 'Pengaturan baca', ...stackHeader(colors) }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ReaderSettings />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: space.md, paddingBottom: space.xl },
});
