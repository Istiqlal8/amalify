import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HaidCard, SholatHeader } from '@/components/haid/HaidSection';
import { PlanItemRow } from '@/components/PlanItemRow';
import { CadencePlantCard } from '@/components/plan/CadencePlantCard';
import { TodayPlantCard } from '@/components/TodayPlantCard';
import { CountTabs, type CountTab } from '@/components/ui/CountTabs';
import { StackScreen } from '@/components/ui/StackScreen';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { SECTIONS, type SectionId } from '@/domain/amalan';
import { cadenceKey, cadenceLabel, cadenceOf, LONG_CADENCES, type Cadence } from '@/domain/cadence';
import { cadencePercent } from '@/domain/cadenceLog';
import { streak, type DayEntry } from '@/domain/dayLog';
import { isPausedSection } from '@/domain/haid';
import type { PlanItem } from '@/domain/plan';
import { useLogs } from '@/providers/LogsProvider';
import { useProfile } from '@/providers/ProfileProvider';

/** Harian is always offered; a longer cadence appears only once it has an amalan of its own. */
function tabsFor(items: PlanItem[]): CountTab<Cadence>[] {
  const count = (c: Cadence) => items.filter((it) => cadenceOf(it) === c).length;
  return [
    { id: 'harian' as Cadence, label: 'Harian', count: count('harian') },
    ...LONG_CADENCES.filter((c) => count(c) > 0).map((c) => ({ id: c, label: cadenceLabel(c), count: count(c) })),
  ];
}

export default function AmalanScreen() {
  const { plan, logs, loaded, today, todayEntry, todayHaid, todayPercent, setToday, cadenceLogs, setCadence } = useLogs();
  const { isMale } = useProfile();
  const [picked, setPicked] = useState<Cadence>('harian');
  const tabs = tabsFor(plan.items);
  const tab = tabs.some((t) => t.id === picked) ? picked : 'harian';
  const items = plan.items.filter((it) => cadenceOf(it) === tab);
  const daily = tab === 'harian';
  const bucket = cadenceKey(tab, today);
  const entry = daily ? todayEntry : cadenceLogs[bucket];

  const header = (
    <View style={styles.header}>
      {daily ? (
        <TodayPlantCard percent={todayPercent} streakDays={streak(logs)} loaded={loaded} />
      ) : (
        <CadencePlantCard cadence={tab} bucket={bucket} percent={cadencePercent(entry, items)} />
      )}
      {tabs.length > 1 && <CountTabs options={tabs} value={tab} onChange={setPicked} />}
    </View>
  );

  return (
    <StackScreen title="Amalan" header={header}>
      {/* Personal list only; group lists live on their own screen (Grup → Amalan grup). */}
      <Sections
        items={items}
        entry={entry}
        onSet={daily ? setToday : (id, value) => setCadence(tab, id, value)}
        /* Haid pauses the day's sholat and Quran; a longer bucket spans clean days too, so it stands. Laki-laki tidak pernah dijeda. */
        pausedBy={daily && todayHaid && !isMale}
      />
      {items.length === 0 && <Txt variant="caption">Belum ada amalan. Atur di Pengaturan → Atur amalan.</Txt>}
    </StackScreen>
  );
}

type SectionsProps = {
  items: PlanItem[];
  entry: DayEntry | undefined;
  onSet: (id: string, value: number) => void;
  pausedBy: boolean;
};

function Sections({ items, entry, onSet, pausedBy }: SectionsProps) {
  return (
    <>
      {SECTIONS.map((section) => {
        const mine = items.filter((it) => it.section === section.id);
        if (mine.length === 0) return null;
        return (
          <View key={section.id} style={styles.section}>
            <Heading id={section.id} title={section.title} />
            {pausedBy && isPausedSection(section.id) ? (
              <HaidCard />
            ) : (
              mine.map((it) => <PlanItemRow key={it.id} item={it} entry={entry} onSet={onSet} />)
            )}
          </View>
        );
      })}
    </>
  );
}

function Heading({ id, title }: { id: SectionId; title: string }) {
  if (id === 'sholat') return <SholatHeader title={title} />;
  return (
    <Txt variant="heading" accessibilityRole="header">
      {title}
    </Txt>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.sm },
  section: { gap: space.sm },
});
