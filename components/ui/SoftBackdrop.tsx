import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { pastels } from '@/constants/pastel';
import { useTheme } from '@/providers/ThemeProvider';

type Blob = { id: string; cx: string; cy: string; r: string; color: string; strength: number };

/**
 * Pastel wash behind every screen: the theme's pale top, its muted and a sky glow, fading to white. Over
 * it sit a few large soft colour blobs, so frosted and glass cards have something to bend; over a
 * flat gradient the glass barely shows. The blobs stay put while the content scrolls over them.
 */
export function SoftBackdrop() {
  const { colors } = useTheme();
  const blobs: Blob[] = [
    { id: 'b1', cx: '95%', cy: '18%', r: '45%', color: colors.primary, strength: 0.35 },
    { id: 'b2', cx: '5%', cy: '42%', r: '50%', color: '#8B5CF6', strength: 0.25 },
    { id: 'b3', cx: '90%', cy: '68%', r: '45%', color: '#38BDF8', strength: 0.28 },
    { id: 'b4', cx: '15%', cy: '92%', r: '45%', color: '#FACC15', strength: 0.25 },
  ];

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.wash} />
          <Stop offset="0.45" stopColor={colors.muted} />
          <Stop offset="1" stopColor={colors.card} />
        </LinearGradient>
        <RadialGradient id="rose" cx="90%" cy="12%" r="55%">
          <Stop offset="0" stopColor={colors.muted} stopOpacity={1} />
          <Stop offset="1" stopColor={colors.muted} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="sky" cx="0%" cy="45%" r="55%">
          <Stop offset="0" stopColor={pastels.sky.tint} stopOpacity={1} />
          <Stop offset="1" stopColor={pastels.sky.tint} stopOpacity={0} />
        </RadialGradient>
        {blobs.map((b) => (
          <RadialGradient key={b.id} id={b.id} cx={b.cx} cy={b.cy} r={b.r}>
            <Stop offset="0" stopColor={b.color} stopOpacity={b.strength} />
            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      <Rect width="100%" height="100%" fill="url(#wash)" />
      <Rect width="100%" height="100%" fill="url(#rose)" />
      <Rect width="100%" height="100%" fill="url(#sky)" />
      {blobs.map((b) => (
        <Rect key={b.id} width="100%" height="100%" fill={`url(#${b.id})`} />
      ))}
    </Svg>
  );
}
