import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { pastels } from '@/constants/pastel';
import { useTheme } from '@/providers/ThemeProvider';

/** Multi-hue pastel wash behind every screen: lavender top, rose and sky glows, fading to white. */
export function SoftBackdrop() {
  const { colors } = useTheme();
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={pastels.lavender.tint} />
          <Stop offset="0.45" stopColor={colors.muted} />
          <Stop offset="1" stopColor={colors.card} />
        </LinearGradient>
        <RadialGradient id="rose" cx="90%" cy="12%" r="55%">
          <Stop offset="0" stopColor={pastels.rose.tint} stopOpacity={1} />
          <Stop offset="1" stopColor={pastels.rose.tint} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="sky" cx="0%" cy="45%" r="55%">
          <Stop offset="0" stopColor={pastels.sky.tint} stopOpacity={1} />
          <Stop offset="1" stopColor={pastels.sky.tint} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#wash)" />
      <Rect width="100%" height="100%" fill="url(#rose)" />
      <Rect width="100%" height="100%" fill="url(#sky)" />
    </Svg>
  );
}
