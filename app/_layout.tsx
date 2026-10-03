import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider, useSegments, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, type ReactNode } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/providers/AuthProvider';
import { LogsProvider } from '@/providers/LogsProvider';
import { ProfileProvider, useProfile } from '@/providers/ProfileProvider';
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

/** Mengarahkan ke onboarding sampai gender dipilih; tetap di dalam Stack agar hook aman. */
function GenderGate() {
  const { gender, loaded, isMale } = useProfile();
  const { name, setTheme } = useTheme();
  const segments = useSegments();
  useEffect(() => {
    if (!loaded) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (gender === null && !onOnboarding) router.replace('/onboarding');
    if (gender !== null && onOnboarding) router.replace('/(tabs)');
  }, [gender, loaded, segments]);
  // Laki-laki tidak pakai pink: pindahkan sekali ke biru (pilihan user selain pink dihormati).
  useEffect(() => {
    if (loaded && isMale && name === 'pink') setTheme('biru');
  }, [loaded, isMale, name, setTheme]);
  return null;
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
      <ProfileProvider>
      <NavigationTheme>
      <AuthProvider>
        <LogsProvider>
          <PrayerProvider>
            <ReminderProvider>
              <MurottalProvider>
                <StatusBar style="dark" />
                <GenderGate />
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
      </ProfileProvider>
    </AppThemeProvider>
  );
}
