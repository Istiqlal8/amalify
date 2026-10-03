import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/providers/ThemeProvider';
import { useProfile } from '@/providers/ProfileProvider';
import { HaidLockGate } from '@/components/haid/HaidLockGate';
import { stackHeader } from '@/components/ui/stackHeader';

export default function HaidLayout() {
  const { colors } = useTheme();
  const { loaded, isMale } = useProfile();
  // Laki-laki tidak punya modul Haid; deep-link pun dikembalikan ke beranda.
  if (loaded && isMale) return <Redirect href="/(tabs)" />;
  return (
    <HaidLockGate>
      <Stack
        screenOptions={{
          ...stackHeader(colors),
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name='index' options={{ title: 'Haid' }} />
        <Stack.Screen name='calendar' options={{ title: 'Kalender' }} />
        <Stack.Screen name='day/[date]' options={{ title: 'Catatan' }} />
        <Stack.Screen name='insights' options={{ title: 'Insight' }} />
        <Stack.Screen name='pad' options={{ title: 'Pembalut' }} />
        <Stack.Screen name='pill' options={{ title: 'Pil KB' }} />
        <Stack.Screen name='kb' options={{ title: 'KB' }} />
      </Stack>
    </HaidLockGate>
  );
}
