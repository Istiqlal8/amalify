import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

/** Header gear that opens the reader's display options. */
export function ReaderSettingsButton() {
  const { colors } = useTheme();
  return (
    <Link href="/quran/pengaturan" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel="Pengaturan baca" hitSlop={12}>
        <SymbolView name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} tintColor={colors.primaryDeep} size={24} />
      </Pressable>
    </Link>
  );
}
