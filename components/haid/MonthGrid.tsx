import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { careOf, isNaturalCycle } from '@/domain/care';
import { addDays } from '@/domain/cycle';
import { dayMark, forecast, type DayMark } from '@/domain/cyclePhase';
import { dateKey } from '@/domain/dayLog';
import { isHaidDay } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

const WEEKDAY = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

type Cell = { day: string; haid: boolean; mark: DayMark | null; noted: boolean };

/** Days of the month `first` begins, padded to start on Monday. */
function monthDays(first: string): (string | null)[] {
  const [y, m] = first.split('-').map(Number);
  const pad = (new Date(y, m - 1, 1).getDay() + 6) % 7;
  const count = new Date(y, m, 0).getDate();
  return [...Array<null>(pad).fill(null), ...Array.from({ length: count }, (_, i) => addDays(first, i))];
}

export function MonthGrid({ first }: { first: string }) {
  const styles = useStyles(makeStyles);
  const { haid, today } = useLogs();
  const f = forecast(haid);
  const fertility = isNaturalCycle(careOf(haid));
  const cells = monthDays(first).map((day): Cell | null =>
    day === null
      ? null
      : { day, haid: isHaidDay(haid, day) && day <= today, mark: f ? dayMark(f, day, fertility) : null, noted: Boolean(haid.days?.[day]) },
  );
  return (
    <View style={styles.grid}>
      {WEEKDAY.map((w) => (
        <Txt key={w} variant="caption" style={styles.head}>{w}</Txt>
      ))}
      {cells.map((c, i) => (c ? <DayCell key={c.day} cell={c} today={today} /> : <View key={`pad-${i}`} style={styles.cell} />))}
    </View>
  );
}

function DayCell({ cell, today }: { cell: Cell; today: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const future = cell.day > today;
  const mark = cell.haid ? null : cell.mark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${cell.day}${cell.haid ? ', haid' : ''}${mark ? `, ${mark}` : ''}`}
      disabled={future}
      onPress={() => router.push({ pathname: '/haid/day/[date]', params: { date: cell.day } })}
      style={styles.cell}>
      <View
        style={[
          styles.circle,
          cell.haid && styles.haid,
          mark === 'predicted' && styles.predicted,
          mark === 'fertile' && styles.fertile,
          mark === 'ovulation' && styles.ovulation,
          cell.day === today && styles.today,
        ]}>
        <Txt variant={cell.day === today ? 'bold' : 'body'} style={cell.haid && { color: colors.onPrimary }}>
          {Number(cell.day.slice(8))}
        </Txt>
      </View>
      <View style={[styles.dot, cell.noted && { backgroundColor: colors.primaryDeep }]} />
    </Pressable>
  );
}

export function firstOfMonth(day: string = dateKey(new Date())): string {
  return `${day.slice(0, 7)}-01`;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.xs },
    head: { width: `${100 / 7}%`, textAlign: 'center' },
    cell: { width: `${100 / 7}%`, alignItems: 'center', minHeight: 48 },
    circle: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    haid: { backgroundColor: c.primary },
    predicted: { borderColor: c.primary, borderStyle: 'dashed' },
    fertile: { backgroundColor: c.muted },
    ovulation: { backgroundColor: c.secondary },
    today: { borderColor: c.primaryDeep },
    dot: { width: 5, height: 5, borderRadius: 3, marginTop: 1 },
  });
