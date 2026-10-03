import { StyleSheet, View } from 'react-native';

import { Plant } from '@/components/plant/Plant';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { cadenceLabel, cadenceRange, type Cadence } from '@/domain/cadence';
import { formatDay } from '@/domain/cycle';
import { isTree } from '@/domain/flowers';
import { stageFromPercent, stageName } from '@/domain/plantStage';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

/** `bucket` comes from `cadenceKey`; its range is what the plant is growing over. */
type Props = { cadence: Cadence; bucket: string; percent: number };

/** One cadence's own plant: it grows with the bucket, not with the day. */
export function CadencePlantCard({ cadence, bucket, percent }: Props) {
  const styles = useStyles(makeStyles);
  const { flower } = useTheme();
  const stage = stageFromPercent(percent);
  const name = stageName(stage, isTree(flower));
  const { from, to } = cadenceRange(cadence, bucket);

  return (
    <View style={styles.card}>
      <Plant stage={stage} size={110} label={`Tanaman ${cadenceLabel(cadence)}: ${name}, ${percent}%`} />
      <View style={styles.info}>
        <Txt variant="caption">{cadenceLabel(cadence)}</Txt>
        <Txt variant="heading">{name}</Txt>
        <Txt variant="caption">{`${formatDay(from)} – ${formatDay(to)}`}</Txt>
        <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
        <Txt variant="bold">{percent}%</Txt>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md, flexDirection: 'row', alignItems: 'flex-end' },
    info: { flex: 1, gap: space.xs, paddingBottom: space.sm },
    track: { height: 12, borderRadius: radius.pill, backgroundColor: c.muted, overflow: 'hidden', marginTop: space.xs },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.primary },
  });
