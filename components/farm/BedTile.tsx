import { memo, useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { PlantArt } from '@/components/plant/PlantArt';
import { fonts, type Palette } from '@/constants/theme';
import { CELL_ASPECT } from '@/domain/farm';
import { type FlowerId, isTree } from '@/domain/flowers';
import type { PlantStage } from '@/domain/plantStage';
import { useStyles } from '@/hooks/useStyles';

import { BED_BLANK, BED_BOX, PLANT_WIDTH } from './farmSprites';

// PlantArt's canvas is 160 wide with the plant rooted at y≈116 and a pot below; we show only the plant.
const ART_W = 160;
const ART_ROOT = 111; // just above the pot's soil ellipse

type Props = {
  x: number; // scene cell the bed stands on
  y: number;
  cell: number;
  flower: FlowerId;
  stage: PlantStage;
  drawBed?: boolean; // false when the empty bed is already baked into the scene
  label: string;
  highlight?: boolean; // pulsing frame (today / me)
  active?: boolean; // the character is at this bed
  marker?: boolean; // small dot, e.g. a haid day
  name?: string; // shown under the bed
};

/** One garden bed with the chosen flower growing in it; memoised so moving characters don't redraw it. */
export const BedTile = memo(function BedTile({ x, y, cell, flower, stage, drawBed, label, highlight, active, marker, name }: Props) {
  const styles = useStyles(makeStyles);
  const top = (y + 1) * cell * CELL_ASPECT - cell;
  const box = { top: BED_BOX.top * cell, height: (BED_BOX.bottom - BED_BOX.top) * cell };
  return (
    <View accessible accessibilityLabel={label} style={[styles.bed, { left: x * cell, top, width: cell, height: cell }]}>
      {drawBed && <Image source={BED_BLANK} style={{ width: cell, height: cell }} />}
      {stage > 0 && <BedPlant flower={flower} stage={stage} cell={cell} />}
      {marker && <View style={[styles.marker, { top: box.top }]} />}
      {highlight && <PulseFrame box={box} />}
      {active && !highlight && <View style={[styles.frame, styles.active, box]} />}
      {name !== undefined && (
        <Text numberOfLines={1} style={[styles.name, { top: cell, width: cell + 16, fontSize: Math.max(9, cell * 0.22) }]}>
          {name}
        </Text>
      )}
    </View>
  );
});

/** PlantArt clipped just above its pot and rooted in the middle of the bed. */
function BedPlant({ flower, stage, cell }: { flower: FlowerId; stage: PlantStage; cell: number }) {
  const width = cell * (isTree(flower) && stage >= 3 ? PLANT_WIDTH.tree : PLANT_WIDTH.plant);
  const scale = width / ART_W;
  const height = ART_ROOT * scale;
  const style = { left: (cell - width) / 2, top: BED_BOX.root * cell - height, width, height };
  return (
    <View style={[styles.plant, style]}>
      <PlantArt stage={stage} size={width} flower={flower} />
    </View>
  );
}

/** Soft pulsing frame; steady when reduced motion is on. */
function PulseFrame({ box }: { box: { top: number; height: number } }) {
  const styles = useStyles(makeStyles);
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (!reduced) opacity.value = withRepeat(withTiming(0.3, { duration: 700 }), -1, true);
  }, [reduced, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.frame, styles.today, box, style]} />;
}

const styles = StyleSheet.create({
  plant: { position: 'absolute', overflow: 'hidden', pointerEvents: 'none' },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    bed: { position: 'absolute' },
    frame: { position: 'absolute', left: 1, right: 1, borderWidth: 2, borderRadius: 8 },
    marker: { position: 'absolute', right: 2, width: 9, height: 9, borderRadius: 5, backgroundColor: c.primary, borderWidth: 1.5, borderColor: '#fff' },
    today: { borderColor: '#FFF6A8' },
    active: { borderColor: '#FFFFFF' },
    name: { position: 'absolute', left: -8, textAlign: 'center', color: '#FFFFFF', fontFamily: fonts.bodyBold, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 3 },
  });
