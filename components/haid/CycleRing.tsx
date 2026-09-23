import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Txt } from '@/components/ui/Txt';
import { useTheme } from '@/providers/ThemeProvider';

const SIZE = 168;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

type Props = { progress: number; value: string; caption: string };

/** Ring filled by how far the cycle has run, with the headline number in the middle. */
export function CycleRing({ progress, value, caption }: Props) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${value} ${caption}`}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.muted} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={colors.primary}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Txt variant="title">{value}</Txt>
        <Txt variant="caption">{caption}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignSelf: 'center' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
