import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Option = { id: string; label: string };

type Props = { options: Option[]; isOn: (id: string) => boolean; onToggle: (id: string) => void };

export function Chips({ options, isOn, onToggle }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const on = isOn(o.id);
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onToggle(o.id)}
            style={[styles.chip, on && styles.on]}>
            <Txt variant="bold" style={{ color: on ? colors.onPrimary : colors.primaryDeep }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    chip: {
      minHeight: 44,
      paddingHorizontal: space.md,
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    on: { backgroundColor: c.primaryDeep, borderColor: c.primary },
  });
