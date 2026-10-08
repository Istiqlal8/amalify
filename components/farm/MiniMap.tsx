import { StyleSheet, View } from 'react-native';

import { bandOf, bandFillOf } from '@/constants/farm';
import { type Palette, radius } from '@/constants/theme';
import { monthSummary } from '@/domain/farmDay';
import { GRID, RING, type WorldField } from '@/domain/farmWorld';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

/** Block pixel size in the mini map; the whole map is 4 of these across. */
const BLOCK = 22;
const GAP = 2;

type Props = {
  fields: WorldField[];
  today: string;
  /** The character's block, from `useCurrentBlock`. */
  block: { bx: number; by: number };
  /** Distance from the safe-area top, so it sits just under the header. */
  top: number;
  /** Distance from the right edge (plus any safe-area inset). */
  right: number;
};

/**
 * A small picture of the village in the corner of Jelajah: the yard in the middle, one tile per
 * month around it, the month you are standing in outlined, and a dot for where you are. It reads at
 * a glance and is deliberately tiny — the world is for walking, this is just a bearing. The dot is
 * per block, not per cell, so it costs nothing to keep updated.
 */
export function MiniMap({ fields, today, block, top, right }: Props) {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const size = GRID * BLOCK + (GRID + 1) * GAP;
  return (
    <View style={[s.card, { width: size + GAP * 2, height: size + GAP * 2, top, right }]} pointerEvents="none" accessibilityLabel="Peta kecil kebun">
      {RING.map(([bx, by], index) => {
        const field = fields.find((f) => f.index === index);
        const summary = field ? monthSummary(field.plots, today) : { counted: 0, average: 0 };
        const band = summary.counted > 0 ? bandOf(summary.average) : 'kosong';
        const isHere = bx === block.bx && by === block.by;
        return (
          <View
            key={index}
            style={[
              s.tile,
              { left: GAP + bx * (BLOCK + GAP), top: GAP + by * (BLOCK + GAP), backgroundColor: bandFillOf(colors)[band] },
              isHere && { borderColor: colors.primary, borderWidth: 2 },
            ]}
          />
        );
      })}
      {/* The yard the fields ring around. */}
      <View style={[s.yard, { left: GAP + BLOCK + GAP, top: GAP + BLOCK + GAP, width: 2 * BLOCK + GAP, height: 2 * BLOCK + GAP }]} />
      <View style={[s.dot, { left: GAP + block.bx * (BLOCK + GAP) + BLOCK / 2 - 3, top: GAP + block.by * (BLOCK + GAP) + BLOCK / 2 - 3, backgroundColor: colors.primaryDeep }]} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      position: 'absolute',
      backgroundColor: c.card,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border,
      boxShadow: c.dark ? 'none' : `0px 2px 6px ${c.shadow}`,
    },
    tile: { position: 'absolute', width: BLOCK, height: BLOCK, borderRadius: 4, borderWidth: 1, borderColor: c.border },
    yard: { position: 'absolute', borderRadius: 4, backgroundColor: c.muted, borderWidth: 1, borderColor: c.border },
    dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  });
