import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useMurottal, useMurottalStatus } from '@/providers/MurottalProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Round play/pause; shows a spinner while buffering. `light` is a white disc for dark backdrops. */
export function PlayButton({ size, light = false }: { size: number; light?: boolean }) {
  const { colors } = useTheme();
  const disc = light ? '#FFFFFF' : colors.primaryDeep;
  const glyph = light ? '#0B0B0C' : colors.onPrimary;
  const { toggle } = useMurottal();
  const { playing, isBuffering } = useMurottalStatus();
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Jeda' : 'Putar'}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: disc },
        pressed && styles.pressed,
      ]}>
      {playing && isBuffering ? (
        <ActivityIndicator color={glyph} />
      ) : (
        <SymbolView
          name={playing ? { ios: 'pause.fill', android: 'pause', web: 'pause' } : { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
          tintColor={glyph}
          size={size * 0.5}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.94 }] },
});
