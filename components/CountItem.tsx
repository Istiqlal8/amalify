import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

import { Txt } from './ui/Txt';

type Props = { label: string; count: number; target: number; unit: string; onChange: (value: number) => void };

/** Big targets (istighfar 100×) step by 10 so they are not a hundred taps. */
export function stepFor(target: number): number {
  return target >= 30 ? 10 : 1;
}

export function CountItem({ label, count, target, unit, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const complete = count >= target;
  const fill = Math.min(count / target, 1) * 100;
  const size = stepFor(target);

  function step(delta: number) {
    const next = Math.max(0, count + delta);
    const justCompleted = next >= target && count < target;
    Haptics.impactAsync(justCompleted ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
    onChange(next);
  }

  return (
    <View style={[styles.row, complete && styles.rowDone]}>
      <View style={styles.text}>
        <Txt variant={complete ? 'bold' : 'body'}>{label}</Txt>
        <Txt variant="caption" accessibilityLiveRegion="polite">
          {count} / {target} {unit}
        </Txt>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fill}%` }]} />
        </View>
      </View>
      <StepButton symbol={size > 1 ? `−${size}` : '−'} label={`Kurangi ${size} ${label}`} disabled={count === 0} onPress={() => step(-size)} />
      <StepButton symbol={size > 1 ? `+${size}` : '+'} label={`Tambah ${size} ${label}`} onPress={() => step(size)} />
    </View>
  );
}

type StepProps = { symbol: string; label: string; onPress: () => void; disabled?: boolean };

function StepButton({ symbol, label, onPress, disabled = false }: StepProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.step, { opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] }]}>
      <Txt variant="heading" style={{ color: colors.primaryDeep }}>
        {symbol}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      minHeight: 64,
      paddingHorizontal: space.md,
      paddingVertical: space.sm,
      borderRadius: radius.md,
      backgroundColor: c.card,
      borderWidth: 2,
      borderColor: c.border,
    },
    rowDone: { backgroundColor: c.muted, borderColor: c.secondary },
    text: { flex: 1, gap: 2 },
    track: { height: 6, borderRadius: radius.pill, backgroundColor: c.muted, overflow: 'hidden', marginTop: 2 },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.primary },
    step: {
      minWidth: 44,
      paddingHorizontal: space.xs,
      height: 44,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.muted,
      borderWidth: 2,
      borderColor: c.border,
    },
  });
