import { Pressable, StyleSheet, View } from 'react-native';

import { PlantArt } from '@/components/plant/PlantArt';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { FLOWERS } from '@/domain/flowers';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

export function FlowerPicker() {
  const styles = useStyles(makeStyles);
  const { flower, setFlower } = useTheme();

  return (
    <View style={styles.card}>
      <Txt variant="bold">Bunga</Txt>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Bunga">
        {FLOWERS.map((f) => {
          const active = f.id === flower;
          return (
            <Pressable
              key={f.id}
              accessibilityRole="radio"
              aria-checked={active}
              accessibilityLabel={f.name}
              onPress={() => setFlower(f.id)}
              style={[styles.option, active && styles.active]}>
              <PlantArt stage={4} size={44} flower={f.id} />
              <Txt variant="bold" numberOfLines={2} style={styles.name}>
                {f.name}
              </Txt>
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
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    active: { borderColor: c.primaryDeep, borderWidth: 3, backgroundColor: c.muted },
    name: { flex: 1, color: c.foreground },
  });
