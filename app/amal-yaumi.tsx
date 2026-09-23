import { StyleSheet, View } from 'react-native';

import { HaidCard, SholatHeader } from '@/components/haid/HaidSection';
import { PlanItemRow } from '@/components/PlanItemRow';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { SECTIONS } from '@/domain/amalan';
import { isPausedSection } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

export default function AmalYaumiScreen() {
  const { plan, todayEntry, todayHaid, setToday } = useLogs();

  return (
    <StackScreen title="Amal Yaumi">
      {SECTIONS.map((section) => {
        const items = plan.items.filter((it) => it.section === section.id);
        if (items.length === 0) return null;
        const paused = todayHaid && isPausedSection(section.id);
        return (
          <View key={section.id} style={styles.section}>
            {section.id === 'sholat' ? (
              <SholatHeader title={section.title} />
            ) : (
              <Txt variant="heading" accessibilityRole="header">
                {section.title}
              </Txt>
            )}
            {paused ? <HaidCard /> : items.map((it) => <PlanItemRow key={it.id} item={it} entry={todayEntry} onSet={setToday} />)}
          </View>
        );
      })}
      {plan.items.length === 0 && <Txt variant="caption">Belum ada amalan.</Txt>}
    </StackScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.sm },
});
