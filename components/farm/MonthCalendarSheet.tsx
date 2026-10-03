import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { farm, farmRadius, touch } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { type DayView, dayView, monthSummary } from '@/domain/farmDay';
import type { WorldField } from '@/domain/farmWorld';
import { useTheme } from '@/providers/ThemeProvider';

import { DayCell } from './DayCell';
import { PaperButton, PaperChip, PaperLabel, PaperTitle } from './ui/Paper';
import { PaperSheet } from './ui/PaperSheet';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const CHEVRON = (dir: 'left' | 'right'): SymbolViewProps['name'] =>
  dir === 'left'
    ? { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }
    : { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' };

type Props = {
  field: WorldField;
  today: string;
  onClose: () => void;
  onPickDay: (view: DayView) => void;
  /** Null when there is no month that way, so the chevron can be disabled rather than hidden. */
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  /** Walks the character to this month's gate and switches to Jelajah. */
  onWalk: () => void;
};

/** A month at full size: one tappable cell per day, today marked by border, label and icon. */
export function MonthCalendarSheet({ field, today, onClose, onPickDay, onPrev, onNext, onWalk }: Props) {
  const { colors } = useTheme();
  const accent = colors.primary;
  const { rows, summary } = useMonth(field, today);

  return (
    <PaperSheet onClose={onClose} label={`Kalender ${field.label}`}>
      <View style={styles.header}>
        <Arrow dir="left" onPress={onPrev} />
        <View style={styles.headerMiddle}>
          <PaperTitle>{field.label}</PaperTitle>
        </View>
        <Arrow dir="right" onPress={onNext} />
      </View>
      <View style={styles.summary}>
        <PaperChip>
          <Text style={styles.badge}>{summary.counted > 0 ? `${summary.average}%` : 'Belum ada data'}</Text>
        </PaperChip>
        <PaperLabel>{summary.counted} hari tercatat</PaperLabel>
      </View>
      <View style={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {rows.map((row, week) => (
          <View key={week} style={styles.row}>
            {row.map((cell, i) =>
              cell ? (
                <DayCell
                  key={cell.view.key}
                  view={cell.view}
                  day={cell.day}
                  isToday={cell.view.key === today}
                  accent={accent}
                  onPress={() => onPickDay(cell.view)}
                />
              ) : (
                <View key={`pad-${week}-${i}`} style={styles.pad} />
              ),
            )}
          </View>
        ))}
      </ScrollView>
      <PaperButton label="Jalan ke petak ini" onPress={onWalk} />
    </PaperSheet>
  );
}

function Arrow({ dir, onPress }: { dir: 'left' | 'right'; onPress: (() => void) | null }) {
  return (
    <Pressable
      onPress={onPress ?? undefined}
      disabled={onPress === null}
      accessibilityRole="button"
      accessibilityLabel={dir === 'left' ? 'Bulan sebelumnya' : 'Bulan berikutnya'}
      accessibilityState={{ disabled: onPress === null }}
      style={[styles.arrow, onPress === null && styles.arrowOff]}>
      <SymbolView name={CHEVRON(dir)} tintColor={farm.ink} size={22} />
    </Pressable>
  );
}

type Cell = { view: DayView; day: number };

/** The month's days laid out Monday-first, with leading blanks, plus its recorded-day summary. */
function useMonth(field: WorldField, today: string) {
  return useMemo(() => {
    const cells: Cell[] = field.plots.map((plot) => ({ view: dayView(plot, today), day: Number(plot.key.slice(8)) }));
    const offset = (new Date(`${field.plots[0]?.key ?? today}T00:00`).getDay() + 6) % 7;
    const slots: (Cell | null)[] = [...Array<null>(offset).fill(null), ...cells];
    const rows: (Cell | null)[][] = [];
    for (let i = 0; i < slots.length; i += 7) rows.push(slots.slice(i, i + 7));
    const last = rows[rows.length - 1];
    if (last) while (last.length < 7) last.push(null);
    return { rows, summary: monthSummary(field.plots, today) };
  }, [field, today]);
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  headerMiddle: { flex: 1, alignItems: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: { fontFamily: fonts.bodyBold, fontSize: 13, color: farm.ink },
  arrow: {
    width: touch.min,
    height: touch.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: farmRadius.control,
  },
  arrowOff: { opacity: 0.3 },
  weekdays: { flexDirection: 'row', gap: space.xs },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 11, color: farm.muted },
  grid: { gap: space.xs, paddingBottom: space.md },
  row: { flexDirection: 'row', gap: space.xs },
  pad: { flex: 1, minWidth: touch.cell.width },
});
