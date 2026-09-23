import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';
import type { Bar } from '@/domain/haidInsights';

type Props = { title: string; bars: Bar[]; unit?: string; empty: string };

/** Horizontal bars scaled to the largest value; enough for a handful of rows. */
export function BarChart({ title, bars, unit = '', empty }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const max = Math.max(1, ...bars.map((b) => b.value));
  const hasData = bars.some((b) => b.value > 0);
  return (
    <View style={[clayOf(colors), styles.card]}>
      <Txt variant="heading" accessibilityRole="header">{title}</Txt>
      {!hasData && <Txt variant="caption">{empty}</Txt>}
      {hasData &&
        bars.map((b) => (
          <View key={b.label} style={styles.row} accessible accessibilityLabel={`${b.label}: ${b.value}${unit}`}>
            <Txt variant="caption" style={styles.label} numberOfLines={1}>{b.label}</Txt>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(b.value / max) * 100}%` }]} />
            </View>
            <Txt variant="bold" style={styles.value}>{`${b.value}${unit}`}</Txt>
          </View>
        ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { padding: space.md, gap: space.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    label: { width: 96 },
    track: { flex: 1, height: 12, borderRadius: radius.pill, backgroundColor: c.muted, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.primary },
    value: { minWidth: 40, textAlign: 'right' },
  });
