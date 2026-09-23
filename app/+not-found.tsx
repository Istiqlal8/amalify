import { Link, Stack } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Txt';
import {  } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen title="Halaman tidak ada">
        <Link href="/">
          <Txt variant="bold" style={{ color: colors.primaryDeep }}>
            Kembali ke Beranda
          </Txt>
        </Link>
      </Screen>
    </>
  );
}
