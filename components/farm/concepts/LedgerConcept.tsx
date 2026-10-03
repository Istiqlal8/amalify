import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayDetailSheet } from '@/components/farm/DayDetailSheet';
import { PaperLabel, PaperPanel } from '@/components/farm/ui/Paper';
import { BAND_FILL, BAND_INK, bandOf, farm, farmRadius } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { STATUS_GLYPH, STATUS_LABEL, dayView, monthSummary, type DayView } from '@/domain/farmDay';
import type { WorldField } from '@/domain/farmWorld';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { fields: WorldField[]; today: string };

/**
 * Ledger / rak — konsep 3. Twelve month rows on paper, each a 7-column week strip.
 * Dense, scannable, paper-app first — the garden as an honest progress ledger.
 */
export function LedgerConcept({ fields, today }: Props) {
  const { colors } = useTheme();
  const { todayPercent, todayEntry, todayHaid } = useLogs();
  const [detail, setDetail] = useState<DayView | null>(null);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PaperPanel style={styles.todayRow}>
          <View style={styles.todayLeft}>
            <PaperLabel>HARI INI</PaperLabel>
            <Text style={styles.todayDate}>{formatDay(today)}</Text>
            <Text style={styles.todayState}>
              {todayHaid ? 'Hari khusus' : todayEntry !== undefined ? `${todayPercent}%` : 'Belum dicatat'}
            </Text>
          </View>
          <View
            style={[
              styles.todaySwatch,
              {
                backgroundColor: todayEntry !== undefined && !todayHaid ? BAND_FILL[bandOf(todayPercent)] : farm.paperSunk,
              },
            ]}>
            <Text style={styles.todaySwatchText}>
              {todayEntry !== undefined && !todayHaid ? `${todayPercent}%` : '–'}
            </Text>
          </View>
        </PaperPanel>

        <View style={styles.legend}>
          {(['tercatat', 'belum', 'khusus', 'nanti'] as const).map((s) => (
            <View key={s} style={styles.legendItem}>
              <Text style={styles.legendGlyph}>{STATUS_GLYPH[s]}</Text>
              <Text style={styles.legendLabel}>{STATUS_LABEL[s]}</Text>
            </View>
          ))}
        </View>

        {fields.map((field) => {
          const { average, counted } = monthSummary(field.plots, today);
          const band = counted > 0 ? bandOf(average) : 'kosong';
          const weeks = chunk(field.plots, 7);
          const isNow = field.index === 0;
          return (
            <PaperPanel
              key={field.label}
              style={[styles.row, isNow && { borderColor: colors.primary, borderWidth: 2 }]}>
              <View style={styles.rowHead}>
                <View style={styles.rowTitles}>
                  <Text style={styles.rowMonth}>{field.short}</Text>
                  <Text style={styles.rowMeta}>
                    {counted > 0 ? `${average}% · ${counted} hari` : 'Belum ada data'}
                  </Text>
                </View>
                <View style={[styles.rowBadge, { backgroundColor: BAND_FILL[band] }]}>
                  <Text style={[styles.rowBadgeText, { color: BAND_INK[band] }]}>
                    {counted > 0 ? `${average}%` : '–'}
                  </Text>
                </View>
              </View>
              <View style={styles.weeks}>
                {weeks.map((week, wi) => (
                  <View key={wi} style={styles.week}>
                    {week.map((plot) => {
                      const view = dayView(plot, today);
                      const isToday = plot.key === today;
                      return (
                        <Pressable
                          key={plot.key}
                          disabled={view.status === 'nanti'}
                          onPress={() => setDetail(view)}
                          accessibilityLabel={dayLabel(view)}
                          style={({ pressed }) => [
                            styles.cell,
                            { backgroundColor: BAND_FILL[view.band] },
                            view.status === 'nanti' && { opacity: 0.4 },
                            isToday && { borderColor: colors.primary, borderWidth: 2 },
                            pressed && styles.pressed,
                          ]}>
                          <Text style={[styles.cellNum, { color: BAND_INK[view.band] }]}>
                            {Number(plot.key.slice(8))}
                          </Text>
                          <Text style={[styles.cellGlyph, { color: BAND_INK[view.band] }]}>{STATUS_GLYPH[view.status]}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </PaperPanel>
          );
        })}
      </ScrollView>
      {detail && <DayDetailSheet view={detail} today={today} onClose={() => setDetail(null)} />}
    </View>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatDay(key: string) {
  const d = new Date(`${key}T00:00`);
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()];
  return `${hari}, ${d.getDate()} ${bulan}`;
}

function dayLabel(view: DayView) {
  const state = view.status === 'tercatat' ? `${view.percent}%` : STATUS_LABEL[view.status];
  return `${formatDay(view.key)}, ${state}${view.onHaid ? ', hari khusus' : ''}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: farm.paper },
  scroll: { padding: space.md, gap: space.sm, paddingBottom: space.xl * 2 },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  todayLeft: { flex: 1, gap: 2 },
  todayDate: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: farm.ink },
  todayState: { fontFamily: fonts.bodyBold, fontSize: 16, color: farm.ink },
  todaySwatch: {
    width: 56,
    height: 56,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todaySwatchText: { fontFamily: fonts.bodyBold, fontSize: 14, color: farm.ink },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: space.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendGlyph: { fontFamily: fonts.bodyBold, fontSize: 12, color: farm.muted },
  legendLabel: { fontFamily: fonts.body, fontSize: 11, color: farm.muted },
  row: { gap: space.sm, padding: space.sm },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowTitles: { flex: 1, gap: 1 },
  rowMonth: { fontFamily: fonts.bodyBold, fontSize: 15, color: farm.ink },
  rowMeta: { fontFamily: fonts.body, fontSize: 12, color: farm.muted },
  rowBadge: {
    minWidth: 48,
    height: 36,
    paddingHorizontal: space.sm,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadgeText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  weeks: { gap: 4 },
  week: { flexDirection: 'row', gap: 4 },
  cell: {
    flex: 1,
    minHeight: 44,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  cellNum: { fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14 },
  cellGlyph: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14 },
  pressed: { opacity: 0.75 },
});
