import { StyleSheet, View } from 'react-native';

import { BarChart } from '@/components/haid/BarChart';
import { HaidScroll } from '@/components/haid/HaidScroll';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { cycleStats, formatDay } from '@/domain/cycle';
import { cycleLengths, flowCounts, painCounts, periodLengths, topSymptoms, type Bar } from '@/domain/haidInsights';
import { useLogs } from '@/providers/LogsProvider';

const TOP = 5;

const byStart = (bars: Bar[]): Bar[] => bars.map((b) => ({ ...b, label: formatDay(b.label) }));

export default function InsightsScreen() {
  const styles = useStyles(makeStyles);
  const { haid } = useLogs();
  const stats = cycleStats(haid);
  const cycles = cycleLengths(haid);
  const spread = cycles.length > 1 ? Math.max(...cycles.map((c) => c.value)) - Math.min(...cycles.map((c) => c.value)) : null;

  return (
    <HaidScroll>
      <View style={styles.stats}>
        <Stat value={stats ? `${stats.avgCycle}` : '–'} label="hari siklus" />
        <Stat value={stats?.avgLength ? `${stats.avgLength}` : '–'} label="hari haid" />
        <Stat value={spread !== null ? `±${spread}` : '–'} label="selisih siklus" />
      </View>
      <BarChart title="Panjang siklus" bars={byStart(cycles)} unit=" h" empty="Butuh minimal 2 kali haid." />
      <BarChart title="Lama haid" bars={byStart(periodLengths(haid))} unit=" h" empty="Belum ada haid yang selesai." />
      <BarChart title="Aliran" bars={flowCounts(haid)} empty="Belum ada catatan aliran." />
      <BarChart title="Nyeri" bars={painCounts(haid)} empty="Belum ada catatan nyeri." />
      <BarChart title="Gejala tersering" bars={topSymptoms(haid, TOP)} empty="Belum ada catatan gejala." />
    </HaidScroll>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={[clayOf(colors), styles.stat]}>
      <Txt variant="title">{value}</Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const makeStyles = (_: Palette) =>
  StyleSheet.create({
    stats: { flexDirection: 'row', gap: space.sm },
    stat: { flex: 1, padding: space.md, alignItems: 'center' },
  });
