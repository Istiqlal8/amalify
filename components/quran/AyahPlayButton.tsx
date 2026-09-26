import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

type Props = { playing: boolean; onPress: () => void };

/** Small play/stop toggle for one ayah's recitation. */
export function AyahPlayButton({ playing, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Hentikan' : 'Putar ayat'}
      hitSlop={8}
      style={[styles.base, { backgroundColor: playing ? colors.primaryDeep : colors.muted }]}
    >
      <SymbolView
        name={playing ? { ios: 'stop.fill', android: 'stop', web: 'stop' } : { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
        tintColor={playing ? colors.onPrimary : colors.primaryDeep}
        size={20}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
