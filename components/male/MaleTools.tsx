import { router, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { male, maleFonts, maleKicker, maleRadius } from '@/constants/male';

type Tool = { href: Href; label: string; icon: SymbolViewProps['name'] };

const TOOLS: Tool[] = [
  { href: '/amal-yaumi', label: 'Amalan', icon: { ios: 'checklist', android: 'checklist', web: 'checklist' } },
  { href: '/quran', label: 'Quran', icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' } },
  { href: '/murottal', label: 'Murottal', icon: { ios: 'headphones', android: 'headphones', web: 'headphones' } },
  { href: '/tilawah', label: 'Tilawah', icon: { ios: 'bookmark.fill', android: 'bookmark_added', web: 'bookmark_added' } },
  { href: '/doa', label: 'Doa & dzikir', icon: { ios: 'hands.sparkles.fill', android: 'front_hand', web: 'front_hand' } },
  { href: '/kiblat', label: 'Kiblat', icon: { ios: 'location.north.circle.fill', android: 'explore', web: 'explore' } },
  { href: '/leaderboard', label: 'Peringkat', icon: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' } },
  { href: '/garden', label: 'Kebun', icon: { ios: 'leaf.fill', android: 'potted_plant', web: 'potted_plant' } },
  { href: '/keuangan', label: 'Keuangan', icon: { ios: 'wallet.bifold.fill', android: 'wallet', web: 'wallet' } },
  { href: '/pasangan', label: 'Pasangan', icon: { ios: 'person.2.fill', android: 'group', web: 'group' } },
];

/** Perkakas sebagai daftar dua kolom: ikon kiri, label, panah. Bukan grid ikon. */
export function MaleTools() {
  return (
    <View style={styles.wrap}>
      <Text style={maleKicker}>Perkakas</Text>
      <View style={styles.grid}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.label}
            accessibilityRole="button"
            accessibilityLabel={t.label}
            onPress={() => router.push(t.href)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.icon}>
              <SymbolView name={t.icon} tintColor={male.accent} size={18} weight="semibold" />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {t.label}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 10,
    backgroundColor: male.panel,
    borderRadius: maleRadius.md,
    borderWidth: 1,
    borderColor: male.line,
  },
  pressed: { backgroundColor: male.panelHi },
  icon: { width: 32, height: 32, borderRadius: maleRadius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: male.panelHi },
  label: { flex: 1, fontFamily: maleFonts.bold, fontSize: 14, color: male.ink },
  chevron: { fontFamily: maleFonts.bold, fontSize: 18, color: male.inkSoft },
});
