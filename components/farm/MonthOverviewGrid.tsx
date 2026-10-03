import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BAND_FILL, BAND_INK, bandOf, farm, farmRadius } from '@/constants/farm';
import { fonts, space } from '@/constants/theme';
import { monthSummary } from '@/domain/farmDay';
import type { WorldField } from '@/domain/farmWorld';
import { useTheme } from '@/providers/ThemeProvider';

import { PaperButton, PaperLabel, PaperTitle } from './ui/Paper';
import { PaperSheet } from './ui/PaperSheet';

type Props = { fields: WorldField[]; today: string; onPick: (index: number) => void; onClose: () => void };

/**
 * The garden's months as readable cards rather than an HSL heatmap: each carries its name, the
 * average of its recorded days and how many there were, so an empty month is not a dark tile.
 */
export function MonthOverviewGrid({ fields, today, onPick, onClose }: Props) {
  const { colors } = useTheme();
  return (
    <PaperSheet onClose={onClose} label="Kalender kebun">
      <PaperTitle>Kalender kebun</PaperTitle>
      <PaperLabel>Pilih bulan untuk melihat harinya</PaperLabel>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {fields.map((field, i) => (
          <MonthTile key={field.label} field={field} today={today} current={i === 0} accent={colors.primary} onPress={() => onPick(field.index)} />
        ))}
      </ScrollView>
      <PaperButton label="Tutup" onPress={onClose} />
    </PaperSheet>
  );
}

type TileProps = { field: WorldField; today: string; current: boolean; accent: string; onPress: () => void };

function MonthTile({ field, today, current, accent, onPress }: TileProps) {
  const { average, counted } = monthSummary(field.plots, today);
  const band = counted > 0 ? bandOf(average) : 'kosong';
  const ink = BAND_INK[band];
  const state = counted > 0 ? `${average}%` : 'Belum ada data';
  return (
    <PaperButton
      label=""
      onPress={onPress}
      accessibilityLabel={`${field.label}, ${state}, ${counted} hari tercatat${current ? ', bulan ini' : ''}`}
      style={[styles.tile, current && { borderColor: accent, borderWidth: 2.5 }]}>
      <View style={styles.tileBody}>
        <View style={[styles.swatch, { backgroundColor: BAND_FILL[band] }]}>
          <Text style={[styles.swatchText, { color: ink }]}>{counted > 0 ? `${average}%` : '–'}</Text>
        </View>
        <View style={styles.tileText}>
          <Text style={styles.month} numberOfLines={1}>
            {field.label}
          </Text>
          <Text style={styles.meta}>{counted} hari tercatat</Text>
        </View>
        {current && <Text style={[styles.now, { color: accent }]}>Bulan ini</Text>}
      </View>
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  grid: { gap: space.sm, paddingBottom: space.md },
  tile: { justifyContent: 'flex-start', paddingHorizontal: space.sm, paddingVertical: space.sm },
  tileBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  swatch: {
    width: 46,
    height: 46,
    borderRadius: farmRadius.chip,
    borderWidth: 1,
    borderColor: farm.paperEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  tileText: { flex: 1, gap: 1 },
  month: { fontFamily: fonts.bodyBold, fontSize: 15, color: farm.ink },
  meta: { fontFamily: fonts.body, fontSize: 12, color: farm.muted },
  now: { fontFamily: fonts.bodyBold, fontSize: 11 },
});
