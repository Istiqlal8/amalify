import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HaidCard, SholatHeader } from '@/components/haid/HaidSection';
import { PlanItemRow } from '@/components/PlanItemRow';
import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { SECTIONS } from '@/domain/amalan';
import { isPausedSection } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

export default function SectionScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { section: id } = useLocalSearchParams<{ section: string }>();
  const { plan, todayEntry, todayHaid, setToday } = useLogs();
  const section = SECTIONS.find((s) => s.id === id);
  const items = plan.items.filter((it) => it.section === id);
  const paused = todayHaid && section !== undefined && isPausedSection(section.id);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: section?.title ?? 'Amalan',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryDeep,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {section?.id === 'sholat' && <SholatHeader title="Hari ini" />}
        {paused ? (
          <HaidCard />
        ) : (
          items.map((it) => <PlanItemRow key={it.id} item={it} entry={todayEntry} onSet={setToday} />)
        )}
        {items.length === 0 && <Txt variant="caption">Belum ada amalan.</Txt>}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: space.md, gap: space.sm, paddingBottom: space.xl },
  });
