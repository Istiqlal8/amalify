import { Stack } from 'expo-router';

import { useTheme } from '@/providers/ThemeProvider';
import { stackHeader } from '@/components/ui/stackHeader';

export default function MurottalLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        ...stackHeader(colors),
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Murottal' }} />
      <Stack.Screen name="player" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
