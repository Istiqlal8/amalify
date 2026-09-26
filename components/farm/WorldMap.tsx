import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { Txt } from '@/components/ui/Txt';
import { frostOf, type Palette, radius, space } from '@/constants/theme';
import type { Point } from '@/domain/farm';
import { BLOCK_COLS, BLOCK_ROWS, GRID, type Layout, monthAverage, RING, type WorldField } from '@/domain/farmWorld';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const TILE = 76; // dp per block on the overview, less when a tall group map has to fit

type ControlsProps = { top: number; onMap: () => void; soundOn: boolean; onSound: () => void };

/** Frosted "Peta" pill that opens the overview, and the farm sound on/off pill beside it. */
export function MapControls({ top, onMap, soundOn, onSound }: ControlsProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const icon = soundOn ? { ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' } : { ios: 'speaker.slash.fill', android: 'volume_off', web: 'volume_off' };
  return (
    <View style={[styles.controls, { top }]}>
      <Pressable onPress={onMap} accessibilityRole="button" style={styles.button}>
        <Txt variant="bold">Peta</Txt>
      </Pressable>
      <Pressable
        onPress={onSound}
        accessibilityRole="switch"
        accessibilityLabel="Suara kebun"
        accessibilityState={{ checked: soundOn }}
        style={styles.button}>
        <SymbolView name={icon as SymbolViewProps['name']} tintColor={colors.primaryDeep} size={20} />
      </Pressable>
    </View>
  );
}

type Props = {
  fields: WorldField[];
  today: string;
  pos: SharedValue<Point>;
  onPick: (index: number) => void;
  onClose: () => void;
  layout?: Layout; // default: Kebunku's 4×4 map
};

const KEBUNKU: Layout = { ring: RING, blockRows: GRID };

/** The whole map at a glance: each field a tile coloured by its average, the yard in the middle, a dot for you. */
export function WorldMap({ fields, today, pos, onPick, onClose, layout = KEBUNKU }: Props) {
  const styles = useStyles(makeStyles);
  const tile = Math.min(TILE, (useWindowDimensions().height * 0.6) / layout.blockRows);
  const dot = useAnimatedStyle(() => ({
    left: (pos.value.x / BLOCK_COLS) * tile - 6,
    top: (pos.value.y / BLOCK_ROWS) * tile - 6,
  }));
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Txt variant="heading">Peta kebun</Txt>
        <View style={{ width: GRID * tile, height: layout.blockRows * tile }}>
          <View style={[styles.yard, { left: tile, top: tile, width: tile * 2, height: tile * 2 }]}>
            <Txt variant="bold">Rumah</Txt>
          </View>
          {fields.map((f) => (
            <MonthTile key={f.index} field={f} at={layout.ring[f.index]} size={tile} average={monthAverage(f, today)} onPress={() => onPick(f.index)} />
          ))}
          <Animated.View style={[styles.dot, dot]} />
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.close}>
          <Txt variant="bold">Tutup</Txt>
        </Pressable>
      </View>
    </View>
  );
}

// Pale earth for empty months up to a deep leaf green at 100%.
const shade = (pct: number) => `hsl(${35 + pct * 0.75}, ${40 + pct * 0.2}%, ${80 - pct * 0.35}%)`;

type TileProps = { field: WorldField; at: [number, number]; size: number; average: number; onPress: () => void };

function MonthTile({ field, at: [bx, by], size, average, onPress }: TileProps) {
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${field.label}, rata-rata ${average}%`}
      style={[styles.tile, { left: bx * size, top: by * size, width: size, height: size, backgroundColor: shade(average) }]}>
      <Txt variant="bold" numberOfLines={1} style={styles.tileText}>{field.short}</Txt>
      <Txt variant="caption" style={styles.tileText}>{average}%</Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    controls: { position: 'absolute', left: space.md, flexDirection: 'row', gap: space.sm },
    button: { ...frostOf(c), minHeight: 40, justifyContent: 'center', borderRadius: radius.pill, paddingHorizontal: space.md },
    backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(40,20,40,0.35)', alignItems: 'center', justifyContent: 'center' },
    card: { ...frostOf(c), borderRadius: radius.lg, padding: space.md, gap: space.md, alignItems: 'center' },
    yard: { position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: '#B9DFA0', borderRadius: radius.sm },
    tile: { position: 'absolute', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', borderRadius: radius.sm },
    tileText: { color: '#3B2A1A' },
    dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: c.primary, borderWidth: 2, borderColor: '#FFFFFF' },
    close: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.pill, backgroundColor: c.muted },
  });
