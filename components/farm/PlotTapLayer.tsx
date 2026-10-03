import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BAND_FILL, bandOf, farm, farmRadius } from '@/constants/farm';
import { fonts } from '@/constants/theme';
import { CELL_ASPECT } from '@/domain/farm';
import { monthSummary } from '@/domain/farmDay';
import { BLOCK_COLS, BLOCK_ROWS, type WorldField } from '@/domain/farmWorld';

type Props = {
  fields: WorldField[];
  ring: [number, number][];
  cell: number;
  today: string;
  accent: string;
  /** Which field is the user's own, outlined in the accent (group map); -1 for none. */
  mine?: number;
  onPick: (index: number) => void;
};

/**
 * Overview's tap targets: one over each month block, carrying a small paper marker with the
 * month's short name and its recorded average. Tapping opens that month's calendar — in Overview
 * the map is for navigating and reading, not for walking.
 */
export function PlotTapLayer({ fields, ring, cell, today, accent, mine = -1, onPick }: Props) {
  const row = cell * CELL_ASPECT;
  return (
    <>
      {fields.map((field) => {
        const at = ring[field.index];
        if (!at) return null;
        const [bx, by] = at;
        const { average, counted } = monthSummary(field.plots, today);
        const band = counted > 0 ? bandOf(average) : 'kosong';
        return (
          <Pressable
            key={field.label}
            onPress={() => onPick(field.index)}
            accessibilityRole="button"
            accessibilityLabel={`${field.label}, ${counted > 0 ? `${average}%` : 'belum ada data'}, ${counted} hari tercatat`}
            style={({ pressed }) => [
              styles.block,
              {
                left: bx * BLOCK_COLS * cell,
                top: by * BLOCK_ROWS * row,
                width: BLOCK_COLS * cell,
                height: BLOCK_ROWS * row,
              },
              field.index === mine && { borderColor: accent, borderWidth: 2 },
              pressed && styles.pressed,
            ]}>
            <View style={styles.marker}>
              <View style={[styles.dot, { backgroundColor: BAND_FILL[band] }]} />
              <Text style={styles.short} numberOfLines={1}>
                {field.short}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  block: { position: 'absolute', alignItems: 'center', justifyContent: 'flex-end', borderRadius: farmRadius.control, paddingBottom: 4 },
  pressed: { backgroundColor: 'rgba(255,255,255,0.22)' },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: farmRadius.chip,
    backgroundColor: farm.paper,
    borderWidth: 1,
    borderColor: farm.paperEdge,
  },
  dot: { width: 7, height: 7, borderRadius: 4, borderWidth: 0.5, borderColor: farm.paperEdge },
  short: { fontFamily: fonts.bodyBold, fontSize: 9, color: farm.ink },
});
