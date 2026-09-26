import { router, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { pastels, type Pastel } from '@/constants/pastel';
import { fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

type Entry = { href: Href; label: string; icon: SymbolViewProps['name'] };

const ENTRIES: Entry[] = [
  { href: '/amal-yaumi', label: 'Amal Yaumi', icon: { ios: 'checklist', android: 'checklist', web: 'checklist' } },
  { href: '/quran', label: 'Baca Quran', icon: { ios: 'book', android: 'menu_book', web: 'menu_book' } },
  { href: '/tilawah', label: 'Tilawah', icon: { ios: 'bookmark', android: 'bookmark_added', web: 'bookmark_added' } },
  { href: '/doa', label: 'Doa', icon: { ios: 'hands.sparkles', android: 'front_hand', web: 'front_hand' } },
  { href: '/haid', label: 'Haid', icon: { ios: 'drop', android: 'water_drop', web: 'water_drop' } },
  { href: '/kiblat', label: 'Kiblat', icon: { ios: 'location.north.circle', android: 'explore', web: 'explore' } },
  { href: '/garden', label: 'Kebun', icon: { ios: 'leaf', android: 'potted_plant', web: 'potted_plant' } },
  { href: '/leaderboard', label: 'Peringkat', icon: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' } },
];

const HUES: Pastel[] = [pastels.mint, pastels.sky, pastels.lavender, pastels.rose, pastels.peach, pastels.lemon];

/** Pastel tiles, three across, each its own hue: icon top-left, label bottom-left. */
export function HomeMenu() {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.grid}>
      {ENTRIES.map((e, i) => (
        <Pressable
          key={e.label}
          onPress={() => router.push(e.href)}
          accessibilityRole="button"
          accessibilityLabel={e.label}
          style={({ pressed }) => [styles.tile, { backgroundColor: HUES[i % HUES.length].tint }, pressed && styles.pressed]}>
          <View style={styles.icon}>
            <SymbolView name={e.icon} tintColor={HUES[i % HUES.length].ink} size={22} />
          </View>
          <Txt numberOfLines={1} adjustsFontSizeToFit style={styles.label}>{e.label}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    tile: {
      width: '31.8%',
      aspectRatio: 1.05,
      justifyContent: 'space-between',
      padding: space.md,
      borderRadius: radius.md,
    },
    icon: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.7 },
    label: { fontFamily: fonts.body, fontSize: 15, color: c.foreground },
  });
