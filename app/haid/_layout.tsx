import { Stack } from 'expo-router';

import { fonts } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function HaidLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDeep,
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
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
