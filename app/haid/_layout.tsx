import { Stack } from 'expo-router';

import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';

export default function HaidLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        ...stackHeader(colors),
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Haid' }} />
      <Stack.Screen name="calendar" options={{ title: 'Kalender' }} />
      <Stack.Screen name="day/[date]" options={{ title: 'Catatan' }} />
      <Stack.Screen name="insights" options={{ title: 'Insight' }} />
      <Stack.Screen name="pad" options={{ title: 'Pembalut' }} />
      <Stack.Screen name="pill" options={{ title: 'Pil KB' }} />
      <Stack.Screen name="kb" options={{ title: 'KB' }} />
    </Stack>
  );
}
