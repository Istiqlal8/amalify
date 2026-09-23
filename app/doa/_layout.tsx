import { Stack } from 'expo-router';

import { fonts } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function DoaLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Doa & Dzikir' }} />
      <Stack.Screen name="[kategori]" options={{ title: 'Doa' }} />
    </Stack>
  );
}
