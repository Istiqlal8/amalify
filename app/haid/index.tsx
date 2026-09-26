import { StyleSheet, View } from 'react-native';

import { SubScreen } from '@/components/ui/SubScreen';
import { IstihadahNotice, MandiNotice } from '@/components/haid/FiqhNotices';
import { PregnancyCard } from '@/components/haid/PregnancyCard';
import { PrivacyCard } from '@/components/haid/PrivacyCard';
import { QadhaCard } from '@/components/haid/QadhaCard';
import { TodayCard } from '@/components/haid/TodayCard';
import { MenuTile } from '@/components/home/MenuTile';
import { space } from '@/constants/theme';
import { useLogs } from '@/providers/LogsProvider';

export default function HaidHome() {
  const { today, haid } = useLogs();
  return (
    <SubScreen>
      {haid.pregnant ? <PregnancyCard since={haid.pregnant} /> : <TodayCard />}
      <IstihadahNotice />
      <MandiNotice />
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
        <MenuTile href="/doa" label="Doa & Dzikir" icon={{ ios: 'hands.sparkles.fill', android: 'front_hand', web: 'front_hand' }} />
      </View>
      <QadhaCard />
      <PrivacyCard />
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
});
