import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { fonts } from '@/constants/theme';
import { turnTo } from '@/domain/qibla';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { size: number; heading: number; qibla: number; aligned: boolean };

const C = 150;
const R = 132;
const LETTERS = [
  { deg: 0, label: 'U' },
  { deg: 90, label: 'T' },
  { deg: 180, label: 'S' },
  { deg: 270, label: 'B' },
];

function polar(deg: number, r: number): { x: number; y: number } {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

/** A dial that turns against the phone's heading, so "U" always points north. */
export function CompassDial({ size, heading, qibla, aligned }: Props) {
  const { colors } = useTheme();
  // Accumulated rotation, so crossing north turns a few degrees instead of spinning a full circle.
  const angle = useSharedValue(-heading);
  const last = useRef(heading);

  useEffect(() => {
    const step = turnTo(heading, last.current);
    last.current = heading;
    angle.value = withTiming(angle.value - step, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [heading, angle]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  const kaaba = polar(qibla, R - 34);

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, spin]}>
        <Svg width={size} height={size} viewBox="0 0 300 300">
          <Circle cx={C} cy={C} r={R + 8} fill={colors.card} stroke={colors.border} strokeWidth={4} />
          {Array.from({ length: 72 }, (_, i) => {
            const major = i % 18 === 0;
            const a = polar(i * 5, R);
            const b = polar(i * 5, R - (major ? 16 : i % 2 === 0 ? 9 : 5));
            return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={major ? colors.primaryDeep : colors.secondary} strokeWidth={major ? 3 : 1.5} />;
          })}
          {LETTERS.map((l) => {
            const p = polar(l.deg, R - 30);
            return (
              <SvgText key={l.label} x={p.x} y={p.y + 7} fontSize={20} fontFamily={fonts.display} textAnchor="middle" fill={l.deg === 0 ? colors.destructive : colors.foreground}>
                {l.label}
              </SvgText>
            );
          })}
          <Line x1={C} y1={C} x2={kaaba.x} y2={kaaba.y} stroke={colors.primary} strokeWidth={3} strokeDasharray="6 6" />
          <G transform={`translate(${kaaba.x - 14} ${kaaba.y - 14})`}>
            <Rect width={28} height={28} rx={4} fill="#1F1F1F" />
            <Rect y={8} width={28} height={5} fill="#E6B422" />
          </G>
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 300 300" style={{ position: 'absolute' }}>
        <Path d={`M${C} 2 L${C - 12} 26 L${C + 12} 26 Z`} fill={aligned ? colors.primary : colors.primaryDeep} />
        <Circle cx={C} cy={C} r={10} fill={aligned ? colors.primary : colors.primaryDeep} />
        <Circle cx={C} cy={C} r={4} fill={colors.card} />
      </Svg>
    </View>
  );
}
