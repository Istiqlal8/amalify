import { Text, type TextProps } from 'react-native';

import { fonts } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

type Variant = 'title' | 'heading' | 'body' | 'bold' | 'caption';

const VARIANTS = {
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
  heading: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
} as const;

/** Dark "Malam" palette (laki-laki): bold sans instead of serif display, tighter sizes. */
const DARK_VARIANTS = {
  title: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  heading: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, lineHeight: 24 },
  body: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 15, lineHeight: 22 },
  bold: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 18 },
} as const;

export function Txt({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const { colors } = useTheme();
  const color = variant === 'caption' ? colors.mutedForeground : colors.foreground;
  const type = colors.dark ? DARK_VARIANTS[variant] : VARIANTS[variant];
  return <Text style={[{ color }, type, style]} {...rest} />;
}
