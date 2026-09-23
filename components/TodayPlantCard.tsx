import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { STAGE_NAMES, stageFromPercent } from '@/domain/plantStage';
import { useBloomCelebration } from '@/hooks/useBloomCelebration';

import { BURST_MS, PetalBurst } from './plant/PetalBurst';
import { Plant } from './plant/Plant';
import { Txt } from './ui/Txt';

type Props = { percent: number; streakDays: number; loaded: boolean };

export function TodayPlantCard({ percent, streakDays, loaded }: Props) {
  const styles = useStyles(makeStyles);
  const stage = stageFromPercent(percent);
  const bursting = useBloomCelebration(percent, loaded, BURST_MS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const measure = (e: LayoutChangeEvent) => setSize(e.nativeEvent.layout);

  return (
    <View style={styles.card} onLayout={measure}>
      <Plant stage={stage} size={150} label={`Tanaman hari ini: ${STAGE_NAMES[stage]}, ${percent}%`} />
      <View style={styles.info}>
        <Txt variant="caption">Hari ini</Txt>
        <Txt variant="heading">{STAGE_NAMES[stage]}</Txt>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
        <Txt variant="bold">{percent}%</Txt>
        {streakDays > 0 && <Txt variant="caption">{streakDays} hari beruntun</Txt>}
      </View>
      {bursting && (
        <View style={styles.burst} pointerEvents="none">
          <PetalBurst width={size.width} height={size.height} />
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), flexDirection: 'row', alignItems: 'flex-end', padding: space.md, gap: space.md },
    info: { flex: 1, gap: space.xs, paddingBottom: space.sm },
    track: { height: 12, borderRadius: radius.pill, backgroundColor: c.muted, overflow: 'hidden', marginTop: space.xs },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.primary },
    // Clips the petals to the card's rounded shape without clipping the card's own shadow.
    burst: { ...StyleSheet.absoluteFill, borderRadius: radius.lg, overflow: 'hidden' },
  });
