import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { CELL_ASPECT, type Point } from '@/domain/farm';
import { darknessOf } from '@/domain/dayPhase';

// Lantern glow in front of each house door on the group farm, in scene cells (see scripts/build-farm-assets.py).
const GROUP_LANTERNS: Point[] = [
  { x: 2.5, y: 8.4 },
  { x: 6.5, y: 8.4 },
];

type Props = { cell: number; width: number; height: number; lanterns?: Point[]; phaseDarkness: number; tint: string };

/**
 * Time-of-day light over the whole scene: a soft coloured wash whose strength follows the clock,
 * plus warm lantern halos that fade in as it darkens. Decorative only; never catches taps.
 */
export function DayNightOverlay({ cell, width, height, lanterns = GROUP_LANTERNS, phaseDarkness, tint }: Props) {
  const r = cell * 1.4;
  // Lanterns appear from dusk onward, and reach full warmth late at night.
  const glow = Math.max(0, (phaseDarkness - 0.35) / 0.65) * 0.55;
  if (phaseDarkness <= 0 && !tint) return null;
  return (
    <View style={styles.layer}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      {glow > 0 && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="lantern" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFD27A" stopOpacity={glow} />
              <Stop offset="1" stopColor="#FFD27A" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {lanterns.map((l) => (
            <Circle key={`${l.x},${l.y}`} cx={l.x * cell} cy={l.y * cell * CELL_ASPECT} r={r} fill="url(#lantern)" />
          ))}
        </Svg>
      )}
    </View>
  );
}

/** True when the phase is dark enough that house window light should be shown. */
export const isNightDark = (darkness: number) => darkness >= darknessOf('senja');

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' },
});
