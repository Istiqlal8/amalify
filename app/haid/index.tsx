import { StyleSheet, View } from 'react-native';

import { HaidScroll } from '@/components/haid/HaidScroll';
import { TodayCard } from '@/components/haid/TodayCard';
import { MenuTile } from '@/components/home/MenuTile';
import { space } from '@/constants/theme';
import { useLogs } from '@/providers/LogsProvider';

export default function HaidHome() {
  const { today } = useLogs();
  return (
    <HaidScroll>
      <TodayCard />
      <View style={styles.grid}>
        <MenuTile
          href={{ pathname: '/haid/day/[date]', params: { date: today } }}
          label="Catat hari ini"
          icon={{ ios: 'square.and.pencil', android: 'edit_note', web: 'edit_note' }}
        />
        <MenuTile href="/haid/calendar" label="Kalender" icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} />
        <MenuTile href="/haid/insights" label="Insight" icon={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }} />
        <MenuTile href="/haid/pad" label="Pembalut" icon={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }} />
        <MenuTile href="/haid/pill" label="Pil KB" icon={{ ios: 'pills.fill', android: 'medication', web: 'medication' }} />
        <MenuTile href="/haid/kb" label="KB" icon={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }} />
      </View>
    </HaidScroll>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
