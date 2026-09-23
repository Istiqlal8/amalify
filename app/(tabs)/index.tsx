import type { SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { MenuTile } from '@/components/home/MenuTile';
import { PrayerCard } from '@/components/prayer/PrayerCard';
import { TodayPlantCard } from '@/components/TodayPlantCard';
import { Screen } from '@/components/ui/Screen';
import { space } from '@/constants/theme';
import { SECTIONS, type SectionId } from '@/domain/amalan';
import { streak } from '@/domain/dayLog';
import { useLogs } from '@/providers/LogsProvider';

type IconName = SymbolViewProps['name'];

const SECTION_ICONS: Record<SectionId, IconName> = {
  sholat: { ios: 'moon.stars.fill', android: 'mosque', web: 'mosque' },
  quran: { ios: 'book.closed.fill', android: 'auto_stories', web: 'auto_stories' },
  kebaikan: { ios: 'heart.fill', android: 'volunteer_activism', web: 'volunteer_activism' },
};

export default function HomeScreen() {
  const { logs, plan, loaded, todayPercent } = useLogs();

  return (
    <Screen title="Assalamu'alaikum">
      <TodayPlantCard percent={todayPercent} streakDays={streak(logs)} loaded={loaded} />
      <PrayerCard />
      <View style={styles.grid}>
        {SECTIONS.map((section) => {
          if (!plan.items.some((it) => it.section === section.id)) return null;
          return (
            <MenuTile
              key={section.id}
              href={{ pathname: '/amalan/[section]', params: { section: section.id } }}
              label={section.title}
              icon={SECTION_ICONS[section.id]}
            />
          );
        })}
        <MenuTile href="/quran" label="Baca Quran" icon={{ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }} />
        <MenuTile href="/haid" label="Haid" icon={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }} />
        <MenuTile href="/kiblat" label="Kiblat" icon={{ ios: 'location.north.circle.fill', android: 'explore', web: 'explore' }} />
        <MenuTile href="/garden" label="Kebun" icon={{ ios: 'leaf.fill', android: 'potted_plant', web: 'potted_plant' }} />
        <MenuTile href="/leaderboard" label="Leaderboard" icon={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }} />
        <MenuTile href="/group" label="Grup" icon={{ ios: 'person.3.fill', android: 'group', web: 'group' }} />
        <MenuTile href="/plan" label="Atur amalan" icon={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
