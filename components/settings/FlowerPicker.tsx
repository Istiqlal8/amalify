import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { PlantArt } from '@/components/plant/PlantArt';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { FLOWERS } from '@/domain/flowers';
import { FLOWER_PRICES } from '@/domain/shop';
import { useRewards } from '@/hooks/useRewards';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

export function FlowerPicker() {
  const styles = useStyles(makeStyles);
  const { flower, colors } = useTheme();
  const rewards = useRewards();

  return (
    <View style={styles.card}>
      <Txt variant="bold">Bunga</Txt>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Bunga">
        {FLOWERS.map((f) => {
          const active = f.id === flower;
          const item = { kind: 'flower', id: f.id } as const;
          const locked = !rewards.owns(item);
          return (
            <Pressable
              key={f.id}
              accessibilityRole="radio"
              aria-checked={active}
              accessibilityLabel={locked ? `${f.name}, terkunci, ${FLOWER_PRICES[f.id]} poin` : f.name}
              onPress={() => (locked ? router.push({ pathname: '/shop', params: { tab: 'flower' } }) : rewards.use(item))}
              style={[styles.option, active && styles.active]}>
              <PlantArt stage={4} size={44} flower={f.id} />
              <Txt variant="bold" numberOfLines={2} style={styles.name}>
                {f.name}
              </Txt>
              {locked && (
                <View style={styles.lock}>
                  <SymbolView name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} tintColor={colors.mutedForeground} size={14} />
                  <Txt variant="caption">{FLOWER_PRICES[f.id]}</Txt>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.md },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    option: {
      width: '48%',
      flexGrow: 1,
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingHorizontal: space.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    active: { borderColor: c.primaryDeep, borderWidth: 3, backgroundColor: c.muted },
    name: { flex: 1, color: c.foreground },
    lock: { alignItems: 'center' },
  });
