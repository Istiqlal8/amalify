import { Stack } from 'expo-router';

import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';

export default function DoaLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        ...stackHeader(colors),
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Doa & Dzikir' }} />
      <Stack.Screen name="[kategori]" options={{ title: 'Doa' }} />
      <Stack.Screen name="tasbih" options={{ title: 'Tasbih' }} />
    </Stack>
  );
}
