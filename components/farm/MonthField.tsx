import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { CELL_ASPECT, plotCaption } from '@/domain/farm';
import type { WorldField } from '@/domain/farmWorld';
import type { FlowerId } from '@/domain/flowers';

import { BedTile } from './BedTile';

type Props = { field: WorldField; cell: number; flower: FlowerId; today: string; active: string | null; showBeds: boolean };

/** One month: a wooden sign with its name by the gate and, when near the camera, its beds. */
export const MonthField = memo(function MonthField({ field, cell, flower, today, active, showBeds }: Props) {
  const row = cell * CELL_ASPECT;
  const fontSize = Math.max(10, cell * 0.26);
  return (
    <>
      <View style={[styles.sign, { left: (field.left + 6.1) * cell, top: field.top * row + row * 0.05, height: row * 0.9, paddingHorizontal: cell * 0.15 }]}>
        <Text numberOfLines={1} style={[styles.label, { fontSize }]} accessibilityRole="header">
          {field.label}
        </Text>
      </View>
      {showBeds &&
        field.plots.map((plot) => (
          <BedTile
            key={plot.key}
            x={plot.x}
            y={plot.y}
            cell={cell}
            flower={flower}
            stage={plot.stage}
            drawBed
            label={`${plotCaption(plot.key, plot.percent)}${plot.onHaid ? ', haid' : ''}${plot.key === today ? ', hari ini' : ''}`}
            highlight={plot.key === today}
            active={plot.key === active}
            marker={plot.onHaid}
          />
        ))}
    </>
  );
});

const styles = StyleSheet.create({
  sign: {
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: '#B7793E',
    borderColor: '#7A4A22',
    borderWidth: 2,
    borderRadius: 6,
  },
  label: { color: '#FFF8EC', fontFamily: fonts.bodyBold },
});
