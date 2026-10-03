import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayDetailSheet } from '@/components/farm/DayDetailSheet';
import { PaperButton, PaperLabel, PaperPanel, PaperTitle } from '@/components/farm/ui/Paper';
import { BAND_FILL, BAND_INK, bandOf, farm, farmRadius, paperOf } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { STATUS_GLYPH, STATUS_LABEL, dayView, monthSummary, type DayView } from '@/domain/farmDay';
import type { WorldField, WorldPlot } from '@/domain/farmWorld';
import { isTree } from '@/domain/flowers';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import { useLogs } from '@/providers/LogsProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { PlantGlyph } from './PlantGlyph';

const BAND_GLYPH = { kosong: '–', rendah: '◦', sedang: '◐', tinggi: '●', penuh: '✦' } as const;

type Props = { fields: WorldField[]; today: string };

/**
 * Herbarium — konsep 1. The year as botanical specimen plates on warm paper.
 * No village map: each month is a pressed plant with an honest average.
 */
export function HerbariumConcept({ fields, today }: Props) {
  const { flowerFor, colors } = useTheme();
  const { todayPercent, todayEntry, todayHaid } = useLogs();
  const flower = flowerFor(today);
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const tree = isTree(flower);
  const todayView = useMemo(
    () => dayView({ key: today, percent: todayPercent, onHaid: todayHaid, recorded: todayEntry !== undefined }, today),
    [today, todayPercent, todayEntry, todayHaid],
  );
  const month = openMonth === null ? null : (fields.find((f) => f.index === openMonth) ?? null);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PaperPanel style={styles.hero}>
          <View style={styles.heroText}>
            <PaperLabel>SPESIMEN HARI INI</PaperLabel>
            <Text style={styles.heroDate}>{formatDay(today)}</Text>
            <Text style={styles.heroState}>
              {todayView.onHaid ? 'Hari khusus' : todayView.recorded ? `${todayView.percent}%` : 'Belum dicatat'}
            </Text>
            <Text style={styles.heroStage}>
              {todayView.onHaid ? 'Mengikuti aturan hari khusus' : stageName(stageFromPercent(todayView.percent), tree)}
            </Text>
          </View>
          <View style={[styles.heroPlate, paperOf('sunk')]}>
            <PlantGlyph
              stage={stageFromPercent(todayView.recorded && !todayView.onHaid ? todayView.percent : 0)}
              size={88}
              petal={colors.petal}
            />
            <Text style={styles.heroTag}>{STATUS_GLYPH[todayView.status]}</Text>
          </View>
        </PaperPanel>

        <View style={styles.sectionHead}>
          <PaperTitle>Herbarium tahun ini</PaperTitle>
          <PaperLabel>Dua belas spesimen · rata-rata hanya hari tercatat non-haid</PaperLabel>
        </View>

        {fields.map((field) => {
          const { average, counted } = monthSummary(field.plots, today);
          const band = counted > 0 ? bandOf(average) : 'kosong';
          const isNow = field.index === 0;
          return (
            <Pressable
              key={field.label}
              onPress={() => setOpenMonth(field.index)}
              accessibilityRole="button"
              accessibilityLabel={`${field.label}, ${counted > 0 ? `${average} persen` : 'belum ada data'}, ${counted} hari tercatat`}
              style={({ pressed }) => [
                styles.plate,
                paperOf(),
                isNow && { borderColor: colors.primary, borderWidth: 2 },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.plateArt, { backgroundColor: BAND_FILL[band] }]}>
                <PlantGlyph stage={counted > 0 ? stageFromPercent(average) : 0} size={56} petal={colors.petal} />
              </View>
              <View style={styles.plateMeta}>
                <Text style={styles.plateMonth}>{field.short}</Text>
                <Text style={styles.plateAvg}>{counted > 0 ? `${average}%` : 'Belum ada data'}</Text>
                <Text style={styles.plateCount}>{counted} hari tercatat</Text>
                {isNow && <Text style={[styles.now, { color: colors.primary }]}>Bulan ini</Text>}
              </View>
              <Text style={[styles.plateBand, { color: BAND_INK[band] }]}>{counted > 0 ? BAND_GLYPH[band] : '–'}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {month && (
        <MonthOverlay
          field={month}
          today={today}
          accent={colors.primary}
          petal={colors.petal}
          onClose={() => setOpenMonth(null)}
        />
      )}
    </View>
  );
}

function MonthOverlay({
  field,
  today,
  accent,
  petal,
  onClose,
}: {
  field: WorldField;
  today: string;
  accent: string;
  petal: string;
  onClose: () => void;
}) {
  const { average, counted } = monthSummary(field.plots, today);
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <PaperPanel style={styles.overlayCard}>
        <PaperTitle>{field.label}</PaperTitle>
        <PaperLabel>{counted > 0 ? `Rata-rata ${average}% · ${counted} hari tercatat` : 'Belum ada data'}</PaperLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specimenRow}>
          {field.plots.map((plot) => (
            <Specimen key={plot.key} plot={plot} today={today} accent={accent} petal={petal} />
          ))}
        </ScrollView>
        <PaperButton label="Tutup" onPress={onClose} />
      </PaperPanel>
    </View>
  );
}

function Specimen({ plot, today, accent, petal }: { plot: WorldPlot; today: string; accent: string; petal: string }) {
  const [detail, setDetail] = useState<DayView | null>(null);
  const view = dayView(plot, today);
  return (
    <>
      <Pressable
        disabled={view.status === 'nanti'}
        onPress={() => setDetail(view)}
        accessibilityLabel={dayLabel(view)}
        style={({ pressed }) => [
          styles.specimen,
          paperOf('sunk'),
          view.status === 'tercatat' && { backgroundColor: BAND_FILL[view.band] },
          plot.key === today && { borderColor: accent, borderWidth: 2 },
          pressed && styles.pressed,
        ]}>
        <Text style={styles.specimenDay}>{Number(plot.key.slice(8))}</Text>
        <PlantGlyph stage={view.status === 'tercatat' ? plot.stage : 0} size={40} petal={petal} />
        <Text style={styles.specimenGlyph}>{STATUS_GLYPH[view.status]}</Text>
      </Pressable>
      {detail && <DayDetailSheet view={detail} today={today} onClose={() => setDetail(null)} />}
    </>
  );
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
  hero: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  heroText: { flex: 1, gap: 2 },
  heroDate: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: farm.ink },
  heroState: { fontFamily: fonts.bodyBold, fontSize: 18, color: farm.ink },
  heroStage: { fontFamily: fonts.body, fontSize: 13, color: farm.muted },
  heroPlate: { width: 110, height: 120, borderRadius: farmRadius.panel, alignItems: 'center', justifyContent: 'center', gap: 4 },
  heroTag: { fontFamily: fonts.bodyBold, fontSize: 14, color: farm.muted },
  sectionHead: { gap: 2, marginTop: space.sm },
  plate: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm },
  plateArt: {
    width: 72,
    height: 72,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateMeta: { flex: 1, gap: 1 },
  plateMonth: { fontFamily: fonts.bodyBold, fontSize: 15, color: farm.ink },
  plateAvg: { fontFamily: fonts.bodyBold, fontSize: 14, color: farm.ink },
  plateCount: { fontFamily: fonts.body, fontSize: 12, color: farm.muted },
  now: { fontFamily: fonts.bodyBold, fontSize: 11, marginTop: 2 },
  plateBand: { fontFamily: fonts.bodyBold, fontSize: 18, width: 24, textAlign: 'center' },
  pressed: { opacity: 0.8 },
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', padding: space.md, backgroundColor: 'rgba(48,44,40,0.28)' },
  overlayCard: { gap: space.sm, maxHeight: '70%' },
  specimenRow: { gap: space.xs, paddingVertical: space.xs },
  specimen: {
    width: 52,
    minHeight: 88,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  specimenDay: { fontFamily: fonts.bodyBold, fontSize: 11, color: farm.ink },
  specimenGlyph: { fontFamily: fonts.body, fontSize: 12, color: farm.muted },
});
