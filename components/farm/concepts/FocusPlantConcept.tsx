import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayDetailSheet } from '@/components/farm/DayDetailSheet';
import { PaperButton, PaperChip, PaperLabel, PaperPanel, PaperTitle } from '@/components/farm/ui/Paper';
import { BAND_FILL, BAND_INK, bandOf, farm, farmRadius, paperOf } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { STATUS_LABEL, dayView, monthSummary, type DayView } from '@/domain/farmDay';
import type { WorldField } from '@/domain/farmWorld';
import { isTree } from '@/domain/flowers';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import { streak } from '@/domain/dayLog';
import { useRewards } from '@/hooks/useRewards';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { PlantGlyph } from './PlantGlyph';

type Props = { fields: WorldField[]; today: string };

/**
 * Satu tanaman — konsep 2. One contemplative plant for the current month, surrounded by
 * the days that feed it. Intimate, not a village. Calendar is a thin strip below.
 */
export function FocusPlantConcept({ fields, today }: Props) {
  const { flowerFor, colors } = useTheme();
  const { todayPercent, todayEntry, todayHaid, logs } = useLogs();
  const { balance } = useRewards();
  const [detail, setDetail] = useState<DayView | null>(null);
  const flower = flowerFor(today);
  const month = fields[0];
  const { average, counted } = monthSummary(month.plots, today);
  const days = streak(logs);
  const tree = isTree(flower);
  const focusStage =
    todayEntry !== undefined && !todayHaid
      ? stageFromPercent(todayPercent)
      : counted > 0
        ? stageFromPercent(average)
        : 0;

  const soilRows = useMemo(() => chunk(month.plots, 7), [month]);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PaperPanel style={styles.focusCard}>
          <PaperLabel>{month.label.toUpperCase()} · TANAMAN FOKUS</PaperLabel>
          <View style={styles.plantStage}>
            <View style={[styles.halo, { borderColor: colors.primary }]} />
            <PlantGlyph stage={focusStage} size={140} petal={colors.petal} />
          </View>
          <Text style={styles.stageName}>
            {todayHaid ? 'Hari khusus' : stageName(focusStage, tree)}
          </Text>
          <Text style={styles.stageHint}>
            {todayEntry === undefined
              ? 'Hari ini belum dicatat — tanaman menunggu.'
              : todayHaid
                ? 'Mengikuti aturan hari khusus'
                : `Hari ini ${todayPercent}% · bulan ${counted > 0 ? average + '%' : 'belum ada data'}`}
          </Text>
          <View style={styles.chips}>
            <PaperChip>
              <Text style={styles.chipText}>{days} hari beruntun</Text>
            </PaperChip>
            <PaperChip>
              <Text style={styles.chipText}>{balance} poin</Text>
            </PaperChip>
          </View>
          <PaperButton label="Isi amal hari ini" tone="accent" onPress={() => router.push('/amal-yaumi')} style={styles.cta} />
        </PaperPanel>

        <PaperPanel style={styles.bedPanel}>
          <PaperTitle>Bed {month.short}</PaperTitle>
          <PaperLabel>Ketuk hari untuk detail · belum ≠ 0%</PaperLabel>
          <View style={styles.bed}>
            {soilRows.map((row, ri) => (
              <View key={ri} style={styles.bedRow}>
                {row.map((plot) => {
                  const view = dayView(plot, today);
                  const isToday = plot.key === today;
                  return (
                    <Pressable
                      key={plot.key}
                      disabled={view.status === 'nanti'}
                      onPress={() => setDetail(view)}
                      accessibilityLabel={dayLabel(view)}
                      style={({ pressed }) => [
                        styles.dayCell,
                        { backgroundColor: BAND_FILL[view.band] },
                        view.status === 'nanti' && { opacity: 0.4 },
                        isToday && { borderColor: colors.primary, borderWidth: 2 },
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.dayNum, { color: BAND_INK[view.band] }]}>{Number(plot.key.slice(8))}</Text>
                      <PlantGlyph
                        stage={view.status === 'tercatat' ? plot.stage : 0}
                        size={22}
                        petal={colors.petal}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </PaperPanel>

        <PaperPanel style={styles.stripPanel}>
          <PaperLabel>BULAN LAIN</PaperLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
            {fields.map((f) => {
              const s = monthSummary(f.plots, today);
              const band = s.counted > 0 ? bandOf(s.average) : 'kosong';
              return (
                <View key={f.label} style={[styles.stripItem, paperOf('sunk'), { backgroundColor: BAND_FILL[band] }]}>
                  <Text style={styles.stripShort}>{f.short}</Text>
                  <Text style={[styles.stripAvg, { color: BAND_INK[band] }]}>{s.counted > 0 ? `${s.average}%` : '–'}</Text>
                </View>
              );
            })}
          </ScrollView>
        </PaperPanel>
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
  focusCard: { alignItems: 'center', gap: space.sm, paddingVertical: space.lg },
  plantStage: { alignItems: 'center', justifyContent: 'center', height: 170, width: '100%' },
  halo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.55,
  },
  stageName: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: farm.ink },
  stageHint: { fontFamily: fonts.body, fontSize: 14, color: farm.muted, textAlign: 'center', paddingHorizontal: space.md },
  chips: { flexDirection: 'row', gap: space.xs },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 13, color: farm.ink },
  cta: { marginTop: space.xs, alignSelf: 'stretch' },
  bedPanel: { gap: space.sm },
  bed: { gap: space.xs },
  bedRow: { flexDirection: 'row', gap: space.xs },
  dayCell: {
    flex: 1,
    minHeight: 48,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  dayNum: { fontFamily: fonts.bodyBold, fontSize: 10 },
  pressed: { opacity: 0.75 },
  stripPanel: { gap: space.sm },
  strip: { gap: space.xs, paddingVertical: space.xs },
  stripItem: {
    width: 64,
    minHeight: 52,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripShort: { fontFamily: fonts.bodyBold, fontSize: 11, color: farm.ink },
  stripAvg: { fontFamily: fonts.bodyBold, fontSize: 13 },
});
