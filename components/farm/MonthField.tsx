import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { farm } from '@/constants/farm';
import { fonts } from '@/constants/theme';
import { CELL_ASPECT, plotCaption } from '@/domain/farm';
import { dayStatus, STATUS_LABEL } from '@/domain/farmDay';
import type { WorldField } from '@/domain/farmWorld';
import type { FlowerId } from '@/domain/flowers';

import { BedTile } from './BedTile';

type Props = {
  field: WorldField;
  cell: number;
  /** Bunga per tanggal: hari tanpa pilihan sendiri ikut default, jadi ganti satu hari tidak ikut semua. */
  flowerFor: (date: string) => FlowerId;
  today: string;
  active: string | null;
  showBeds: boolean;
  /** Overview labels months with its own paper markers, so the wooden sign is a Jelajah thing. */
  showSign?: boolean;
};

/** One month in the world: its wooden gate sign and, when the camera is near, its beds. */
export const MonthField = memo(function MonthField({ field, cell, flowerFor, today, active, showBeds, showSign = true }: Props) {
  const row = cell * CELL_ASPECT;
  const fontSize = Math.max(10, cell * 0.26);
  return (
    <>
      {showSign && (
        <View style={[styles.sign, { left: (field.left + 6.1) * cell, top: field.top * row + row * 0.05, height: row * 0.9, paddingHorizontal: cell * 0.15 }]}>
          <Text numberOfLines={1} style={[styles.label, { fontSize }]} accessibilityRole="header">
            {field.label}
          </Text>
        </View>
      )}
      {showBeds &&
        field.plots.map((plot) => {
          const status = dayStatus(plot, today);
          return (
            <BedTile
              key={plot.key}
              x={plot.x}
              y={plot.y}
              cell={cell}
              flower={flowerFor(plot.key)}
              stage={plot.stage}
              drawBed
              label={`${plotCaption(plot.key, plot.percent).split(' · ')[0]}, ${status === 'tercatat' ? `${plot.percent}%` : STATUS_LABEL[status]}`}
              highlight={plot.key === today}
              active={plot.key === active}
              marker={plot.onHaid}
            />
          );
        })}
    </>
  );
});

const styles = StyleSheet.create({
  sign: {
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: farm.wood,
    borderColor: farm.woodEdge,
    borderWidth: 2,
    borderRadius: 6,
  },
  label: { color: '#FFF8EC', fontFamily: fonts.bodyBold },
});
