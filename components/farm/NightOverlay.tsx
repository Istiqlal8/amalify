import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { CELL_ASPECT, type Point } from '@/domain/farm';

// Lantern glow in front of each house door on the group farm, in scene cells (see scripts/build-farm-assets.py).
const GROUP_LANTERNS: Point[] = [
  { x: 2.5, y: 8.4 },
  { x: 6.5, y: 8.4 },
];

type Props = { cell: number; width: number; height: number; lanterns?: Point[] };

/** Dark blue night over the whole scene (scene coordinates) with warm lantern light by the houses. Decorative only. */
export function NightOverlay({ cell, width, height, lanterns = GROUP_LANTERNS }: Props) {
  const r = cell * 1.4;
  return (
    <View style={styles.layer}>
      <View style={[StyleSheet.absoluteFill, styles.night]} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="lantern" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFD27A" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#FFD27A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {lanterns.map((l) => (
          <Circle key={`${l.x},${l.y}`} cx={l.x * cell} cy={l.y * cell * CELL_ASPECT} r={r} fill="url(#lantern)" />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' },
  night: { backgroundColor: 'rgba(22,30,78,0.5)' },
});
