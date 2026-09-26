import { router, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { inkOf, mihrabFonts } from '@/constants/mihrab';
import type { Palette } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Entry = { href: Href; label: string; icon: SymbolViewProps['name'] };

const ENTRIES: Entry[] = [
  { href: '/amal-yaumi', label: 'Amal Yaumi', icon: { ios: 'checklist', android: 'checklist', web: 'checklist' } },
  { href: '/quran', label: 'Baca Quran', icon: { ios: 'book', android: 'menu_book', web: 'menu_book' } },
  { href: '/murottal', label: 'Murottal', icon: { ios: 'headphones', android: 'headphones', web: 'headphones' } },
  { href: '/tilawah', label: 'Tilawah', icon: { ios: 'bookmark', android: 'bookmark_added', web: 'bookmark_added' } },
  { href: '/doa', label: 'Doa', icon: { ios: 'hands.sparkles', android: 'front_hand', web: 'front_hand' } },
  { href: '/haid', label: 'Haid', icon: { ios: 'drop', android: 'water_drop', web: 'water_drop' } },
  { href: '/kiblat', label: 'Kiblat', icon: { ios: 'location.north.circle', android: 'explore', web: 'explore' } },
  { href: '/garden', label: 'Kebun', icon: { ios: 'leaf', android: 'potted_plant', web: 'potted_plant' } },
  { href: '/leaderboard', label: 'Peringkat', icon: { ios: 'trophy', android: 'emoji_events', web: 'emoji_events' } },
];

/** Line icons over short labels, four across, no boxes. */
export function HomeMenu() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {ENTRIES.map((e) => (
        <Pressable
          key={e.label}
          onPress={() => router.push(e.href)}
          accessibilityRole="button"
          accessibilityLabel={e.label}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <SymbolView name={e.icon} tintColor={colors.primaryDeep} size={26} weight="light" />
          <Txt numberOfLines={1} adjustsFontSizeToFit style={styles.label}>{e.label}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18 },
    item: { width: '25%', minHeight: 56, alignItems: 'center', gap: 6 },
    pressed: { opacity: 0.55 },
    label: { fontFamily: mihrabFonts.body, fontSize: 12, lineHeight: 16, color: inkOf(c).ink },
  });
