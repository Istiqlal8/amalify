import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Txt } from '@/components/ui/Txt';
import { fonts, type Palette } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

/** Number inside a soft eight-point star, the ayah-marker shape redrawn in the app's pink. */
export function NumberBadge({ value, size = 40 }: { value: number; size?: number }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size }} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 40 40" style={StyleSheet.absoluteFill}>
        <Path
          d="M20 2 L25 8 L33 7 L32 15 L38 20 L32 25 L33 33 L25 32 L20 38 L15 32 L7 33 L8 25 L2 20 L8 15 L7 7 L15 8 Z"
          fill={colors.muted}
          stroke={colors.secondary}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.center}>
        <Txt style={[styles.text, { fontSize: value > 99 ? 11 : 13 }]}>{value}</Txt>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
    text: { fontFamily: fonts.bodyBold, color: c.primaryDeep, lineHeight: 16 },
  });
