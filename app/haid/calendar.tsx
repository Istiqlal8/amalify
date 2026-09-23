import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CycleCard } from '@/components/haid/CycleCard';
import { HaidScroll } from '@/components/haid/HaidScroll';
import { firstOfMonth, MonthGrid } from '@/components/haid/MonthGrid';
import { PeriodForm } from '@/components/haid/PeriodForm';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { useLogs } from '@/providers/LogsProvider';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function shiftMonth(first: string, delta: number): string {
  const [y, m] = first.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function CalendarScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { today } = useLogs();
  const [first, setFirst] = useState(firstOfMonth(today));
  const [y, m] = first.split('-').map(Number);

  return (
    <HaidScroll>
      <View style={[clayOf(colors), styles.card]}>
        <View style={styles.nav}>
          <NavButton label="‹" a11y="Bulan sebelumnya" onPress={() => setFirst(shiftMonth(first, -1))} />
          <Txt variant="heading" style={styles.month}>{`${MONTHS[m - 1]} ${y}`}</Txt>
          <NavButton label="›" a11y="Bulan berikutnya" onPress={() => setFirst(shiftMonth(first, 1))} />
        </View>
        <MonthGrid first={first} />
        <View style={styles.legend}>
          <Legend style={styles.haid} label="Haid" />
          <Legend style={styles.predicted} label="Perkiraan" />
          <Legend style={styles.fertile} label="Subur" />
          <Legend style={styles.ovulation} label="Ovulasi" />
        </View>
      </View>
      <PeriodForm />
      <CycleCard />
    </HaidScroll>
  );
}

function NavButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={styles.navButton}>
      <Txt variant="heading">{label}</Txt>
    </Pressable>
  );
}

function Legend({ style, label }: { style: object; label: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, style]} />
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    nav: { flexDirection: 'row', alignItems: 'center' },
    month: { flex: 1, textAlign: 'center' },
    navButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: c.muted },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
    swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: 'transparent' },
    haid: { backgroundColor: c.primary },
    predicted: { borderColor: c.primary, borderStyle: 'dashed' },
    fertile: { backgroundColor: c.muted },
    ovulation: { backgroundColor: c.secondary },
  });
