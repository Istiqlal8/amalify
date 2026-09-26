import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, fonts, type Palette, radius, space } from '@/constants/theme';
import { SURAH_NAMES } from '@/domain/murottal';
import { useStyles } from '@/hooks/useStyles';
import { useMurottal, useMurottalStatus } from '@/providers/MurottalProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { PlayButton } from './PlayButton';
import { ReciterAvatar } from './ReciterAvatar';

/** Floating now-playing bar; tapping it opens the full player. Hidden until a surah is picked. */
export function MiniPlayer() {
  const { surah } = useMurottal();
  if (surah === null) return null;
  return <Bar surah={surah} />;
}

function Bar({ surah }: { surah: number }) {
  const styles = useStyles(makeStyles);
  const { reciter, close } = useMurottal();
  const { colors } = useTheme();
  const { currentTime, duration } = useMurottalStatus();
  const ratio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => router.push('/murottal/player')}
        accessibilityRole="button"
        accessibilityLabel="Buka pemutar"
        style={styles.bar}>
        <ReciterAvatar reciter={reciter} size={40} square />
        <View style={styles.flex}>
          <Txt numberOfLines={1} style={styles.title}>{SURAH_NAMES[surah - 1].name}</Txt>
          <Txt variant="caption" numberOfLines={1}>{reciter.name}</Txt>
        </View>
        <PlayButton size={40} />
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Tutup pemutar" hitSlop={8} style={styles.close}>
          <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={colors.mutedForeground} size={22} />
        </Pressable>
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { ...clayOf(c), marginHorizontal: space.sm, marginBottom: space.xs, borderRadius: radius.md, overflow: 'hidden' },
    bar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm },
    flex: { flex: 1 },
    close: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 20, color: c.foreground },
    track: { height: 3, backgroundColor: c.muted },
    fill: { height: 3, backgroundColor: c.primaryDeep },
  });
