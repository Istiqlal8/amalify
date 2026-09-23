import { StyleSheet, View } from 'react-native';

import { CycleCard } from '@/components/haid/CycleCard';
import { PlantArt } from '@/components/plant/PlantArt';
import { Screen } from '@/components/ui/Screen';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';
import { useStyles } from '@/hooks/useStyles';
import { lastDays, pastPercent, streak } from '@/domain/dayLog';
import { isHaidDay, itemsForDay } from '@/domain/haid';
import { stageFromPercent } from '@/domain/plantStage';
import { useLogs } from '@/providers/LogsProvider';

const DAYS = 28;
const WEEKDAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function GardenScreen() {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { logs, plan, haid, today, todayPercent } = useLogs();
  const days = lastDays(DAYS).map((key) => {
    const onHaid = isHaidDay(haid, key);
    const percent = key === today ? todayPercent : pastPercent(logs[key], itemsForDay(plan.items, onHaid));
    return { key, percent, stage: stageFromPercent(percent), onHaid };
  });
  const blooms = days.filter((d) => d.stage === 4).length;

  return (
    <Screen title="Kebunku">
      <View style={styles.stats}>
        <Stat value={streak(logs)} label="hari beruntun" />
        <Stat value={blooms} label="pohon berbunga" />
      </View>
      <View style={[clayOf(colors), styles.grid]}>
        {days.map((d) => (
          <View
            key={d.key}
            style={styles.cell}
            accessible
            accessibilityLabel={`${d.key}: ${d.percent}%${d.onHaid ? ', haid' : ''}`}>
            <PlantArt stage={d.stage} size={40} />
            <Txt variant="caption">{WEEKDAY[new Date(`${d.key}T00:00`).getDay()]}</Txt>
            <View style={[styles.dot, d.onHaid && styles.dotHaid]} />
          </View>
        ))}
      </View>
      <CycleCard />
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={[clayOf(colors), styles.stat]}>
      <Txt variant="title">{value}</Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    stats: { flexDirection: 'row', gap: space.md },
    stat: { flex: 1, padding: space.md, alignItems: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', padding: space.sm, rowGap: space.sm },
    cell: { width: `${100 / 7}%`, alignItems: 'center' },
    // Always rendered so every row keeps the same height; only haid days are filled.
    dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
    dotHaid: { backgroundColor: c.primary },
  });
