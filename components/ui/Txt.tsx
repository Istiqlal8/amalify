import { Text, type TextProps } from 'react-native';

import { fonts } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

type Variant = 'title' | 'heading' | 'body' | 'bold' | 'caption';

const VARIANTS = {
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
} as const;

export function Txt({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const { colors } = useTheme();
  const color = variant === 'caption' ? colors.mutedForeground : colors.foreground;
  return <Text style={[{ color }, VARIANTS[variant], style]} {...rest} />;
}
