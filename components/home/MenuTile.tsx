import { router, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, fonts, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { href: Href; label: string; icon: SymbolViewProps['name'] };

/** Icon over a short label; five fit across a row. */
export function MenuTile({ href, label, icon }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
      <View style={styles.icon}>
        <SymbolView name={icon} tintColor={colors.primaryDeep} size={26} />
      </View>
      <Txt variant="caption" numberOfLines={2} style={styles.label}>
        {label}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tile: { width: '20%', alignItems: 'center', gap: space.xs },
    icon: {
      ...clayOf(c),
      width: 56,
      height: 56,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 15, textAlign: 'center', color: c.foreground },
  });
