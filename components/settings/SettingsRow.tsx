import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Txt } from '@/components/ui/Txt';
import { clayOf, fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { number: number; title: string; summary: string; href: Href };

export function SettingsRow({ number, title, summary, href }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${summary}`}
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.row, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <View style={styles.badge}>
        <Txt style={styles.number}>{number}</Txt>
      </View>
      <View style={styles.flex}>
        <Txt variant="bold">{title}</Txt>
        <Txt variant="caption" numberOfLines={1}>
          {summary}
        </Txt>
      </View>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d="M9 5 L16 12 L9 19" stroke={colors.primaryDeep} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { ...clayOf(c), flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 72, paddingHorizontal: space.md },
    badge: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primaryDeep,
    },
    number: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: c.onPrimary },
    flex: { flex: 1, gap: 2 },
  });
