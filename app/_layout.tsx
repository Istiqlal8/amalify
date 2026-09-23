import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, type ReactNode } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/providers/AuthProvider';
import { LogsProvider } from '@/providers/LogsProvider';
import { PrayerProvider } from '@/providers/PrayerProvider';
import { ReminderProvider } from '@/providers/ReminderProvider';
import { AppThemeProvider, useTheme } from '@/providers/ThemeProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

/** Hands the active palette to React Navigation, so screen backgrounds follow the theme. */
function NavigationTheme({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary, text: colors.foreground },
    }),
    [colors],
  );
  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Amiri_400Regular, Fredoka_600SemiBold, Nunito_400Regular, Nunito_700Bold });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppThemeProvider>
      <NavigationTheme>
      <AuthProvider>
        <LogsProvider>
          <PrayerProvider>
            <ReminderProvider>
              <StatusBar style="dark" />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </ReminderProvider>
          </PrayerProvider>
        </LogsProvider>
      </AuthProvider>
      </NavigationTheme>
    </AppThemeProvider>
  );
}
