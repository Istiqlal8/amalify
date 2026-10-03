import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { FormDialog } from '@/components/ui/FormDialog';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import { cycleStats, daysBetween, formatDay, sortedPeriods } from '@/domain/cycle';
import { dayOfPeriod } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

import { PeriodForm } from './PeriodForm';

function when(today: string, day: string): string {
  const n = daysBetween(today, day);
  if (n > 1) return `${n} hari lagi`;
  if (n === 1) return 'besok';
  if (n === 0) return 'hari ini';
  return `lewat ${-n} hari`;
}

/** Cycle summary and history for the haid calendar; hidden until haid has been marked once. */
export function CycleCard() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { haid, today, removeHaid } = useLogs();
  const [editing, setEditing] = useState<string | null>(null);
  const periods = sortedPeriods(haid);
  if (periods.length === 0) return null;
  const stats = cycleStats(haid);
  const open = periods.some((p) => p.end === undefined);
  const edited = periods.find((p) => p.start === editing);

  function confirmRemove(start: string) {
    Alert.alert(`Hapus catatan ${formatDay(start)}?`, undefined, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => removeHaid(start) },
    ]);
  }

  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">Siklus haid</Txt>
      {stats && !open && (
        <View style={styles.next}>
          <Txt variant="caption">Perkiraan berikutnya</Txt>
          <Txt variant="title">{formatDay(stats.nextStart)}</Txt>
          <Txt style={{ color: colors.primaryDeep }}>{when(today, stats.nextStart)}</Txt>
        </View>
      )}
      {stats ? (
        <View style={styles.stats}>
          <Stat value={`${stats.avgCycle} hari`} label="rata-rata siklus" />
          {stats.avgLength !== null && <Stat value={`${stats.avgLength} hari`} label="rata-rata haid" />}
        </View>
      ) : (
        <Txt variant="caption">Perkiraan muncul setelah 2 kali haid tercatat.</Txt>
      )}
      <View style={styles.history}>
        {periods.slice().reverse().map((p) => (
          <View key={p.start} style={styles.row}>
            <View style={styles.dot} />
            <Txt style={styles.flex}>
              {formatDay(p.start)} – {p.end ? formatDay(p.end) : 'sekarang'}
            </Txt>
            {p.end ? (
              <Txt variant="caption">{daysBetween(p.start, p.end) + 1} hari</Txt>
            ) : (
              <Txt variant="caption">hari ke-{dayOfPeriod(p, today)}</Txt>
            )}
            <Pressable accessibilityRole="button" accessibilityLabel={`Ubah catatan ${formatDay(p.start)}`} onPress={() => setEditing(p.start)} style={styles.remove}>
              <Txt variant="bold">Ubah</Txt>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hapus catatan ${formatDay(p.start)}`}
              onPress={() => confirmRemove(p.start)}
              style={styles.remove}>
              <Txt variant="bold" style={{ color: colors.destructive }}>Hapus</Txt>
            </Pressable>
          </View>
        ))}
      </View>
      {edited && (
        <FormDialog onClose={() => setEditing(null)}>
          <PeriodForm key={edited.start} period={edited} onDone={() => setEditing(null)} />
        </FormDialog>
      )}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <Txt variant="bold">{value}</Txt>
      <Txt variant="caption">{label}</Txt>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.md },
    next: { alignItems: 'center', gap: 2, padding: space.md, borderRadius: radius.md, backgroundColor: c.muted },
    stats: { flexDirection: 'row', gap: space.sm },
    stat: { flex: 1, alignItems: 'center', padding: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: c.border },
    history: { gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary },
    flex: { flex: 1 },
    remove: { minHeight: 44, minWidth: 56, alignItems: 'center', justifyContent: 'center' },
  });
