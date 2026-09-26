import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, type ReactNode } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/providers/AuthProvider';
import { LogsProvider } from '@/providers/LogsProvider';
import { AmbiencePlayer } from '@/components/murottal/AmbiencePlayer';
import { MurottalProvider } from '@/providers/MurottalProvider';
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
      colors: { ...DefaultTheme.colors, background: colors.wash, primary: colors.primary, text: colors.foreground },
    }),
    [colors],
  );
  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Amiri_400Regular,
    InstrumentSerif_400Regular,
    Nunito_400Regular,
    Nunito_700Bold,
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
  });

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
              <MurottalProvider>
                <StatusBar style="dark" />
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="haid" options={{ headerShown: false }} />
                  <Stack.Screen name="doa" options={{ headerShown: false }} />
                  <Stack.Screen name="murottal" options={{ headerShown: false }} />
                </Stack>
                <AmbiencePlayer />
              </MurottalProvider>
            </ReminderProvider>
          </PrayerProvider>
        </LogsProvider>
      </AuthProvider>
      </NavigationTheme>
    </AppThemeProvider>
  );
}
