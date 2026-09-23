import { router, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = { href: Href; label: string; icon: SymbolViewProps['name'] };

export function MenuTile({ href, label, icon }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <View style={styles.icon}>
        <SymbolView name={icon} tintColor={colors.primaryDeep} size={26} />
      </View>
      <Txt variant="bold" numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tile: { ...clayOf(c), flexBasis: '47%', flexGrow: 1, padding: space.md, gap: space.sm },
    icon: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: c.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
