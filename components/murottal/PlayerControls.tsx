import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { space } from '@/constants/theme';
import { useMurottal } from '@/providers/MurottalProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { PlayButton } from './PlayButton';

type Icon = SymbolViewProps['name'];

const REPEAT_LABEL = { off: 'Ulang mati', all: 'Ulang semua', one: 'Ulang surah ini' } as const;

/** Repeat, previous, play/pause, next and a 10-second skip. */
export function PlayerControls({ light = false }: { light?: boolean }) {
  const { colors } = useTheme();
  const ink = light ? '#FFFFFF' : colors.foreground;
  const dim = light ? 'rgba(255, 255, 255, 0.55)' : colors.mutedForeground;
  const on = light ? '#FFFFFF' : colors.primary;
  const { player, repeat, previous, next, cycleRepeat } = useMurottal();

  const button = (icon: Icon, label: string, onPress: () => void, tint = ink) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={10} style={styles.side}>
      <SymbolView name={icon} tintColor={tint} size={30} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {button(
        repeat === 'one'
          ? { ios: 'repeat.1', android: 'repeat_one', web: 'repeat_one' }
          : { ios: 'repeat', android: 'repeat', web: 'repeat' },
        REPEAT_LABEL[repeat],
        cycleRepeat,
        repeat === 'off' ? dim : on,
      )}
      {button({ ios: 'backward.end.fill', android: 'skip_previous', web: 'skip_previous' }, 'Sebelumnya', previous)}
      <PlayButton size={72} light={light} />
      {button({ ios: 'forward.end.fill', android: 'skip_next', web: 'skip_next' }, 'Berikutnya', next)}
      {button({ ios: 'goforward.10', android: 'forward_10', web: 'forward_10' }, 'Maju 10 detik', () =>
        player.seekTo(player.currentTime + 10),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  side: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', gap: space.xs },
});
