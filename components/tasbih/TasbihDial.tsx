import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette, radius } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

const SIZE = 260;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

type Props = { count: number; target: number; finished: boolean; onTap: () => void };

/** The big round button: tap anywhere on it to count; the ring fills towards the target. */
export function TasbihDial({ count, target, finished, onTap }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const progress = target > 0 ? Math.min(count / target, 1) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={target > 0 ? `Ketuk untuk menghitung, ${count} dari ${target}` : `Ketuk untuk menghitung, ${count}`}
      onPress={onTap}
      style={({ pressed }) => [styles.dial, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.muted} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.primary}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRC} ${CIRC}`}
          strokeDashoffset={CIRC * (1 - progress)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Txt style={styles.count}>{count}</Txt>
        <Txt variant="caption">{finished ? 'Selesai' : target > 0 ? `dari ${target}` : 'ketuk'}</Txt>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    dial: {
      width: SIZE,
      height: SIZE,
      alignSelf: 'center',
      borderRadius: radius.pill,
      backgroundColor: 'rgba(255,255,255,0.8)',
      boxShadow: `0px 10px 28px ${c.shadow}`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: { alignItems: 'center' },
    count: { fontFamily: fonts.display, fontSize: 88, lineHeight: 96, color: c.foreground },
  });
